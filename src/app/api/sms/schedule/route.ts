import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const scheduleSchema = z.object({
  visite_id: z.string().uuid(),
  /** force=true décale terminee_at pour un envoi immédiat (tests / cas manuels) */
  force: z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = scheduleSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { visite_id, force } = parsed.data

  // Vérifier que l'agent appartient bien à l'agence de la visite
  const { data: agent } = await supabase
    .from('agents')
    .select('id, agence_id')
    .eq('user_id', user.id)
    .single()

  if (!agent) {
    return NextResponse.json({ error: 'Profil agent introuvable' }, { status: 403 })
  }

  const { data: visite, error: visiteErr } = await supabase
    .from('visites')
    .select('id, statut, terminee_at, sms_envoye_at')
    .eq('id', visite_id)
    .eq('agence_id', agent.agence_id)
    .single()

  if (visiteErr || !visite) {
    return NextResponse.json({ error: 'Visite introuvable' }, { status: 404 })
  }

  if (visite.statut !== 'TERMINEE') {
    return NextResponse.json(
      { error: 'La visite doit être au statut TERMINEE pour programmer un SMS' },
      { status: 422 },
    )
  }

  // En mode force : décaler terminee_at pour que la file le traite immédiatement
  if (force && !visite.sms_envoye_at) {
    const admin = createAdminClient()
    const twoHoursPlusOneMin = new Date(Date.now() - (2 * 3600 + 60) * 1000).toISOString()
    await admin
      .from('visites')
      .update({ terminee_at: twoHoursPlusOneMin })
      .eq('id', visite_id)
  }

  // Appeler l'Edge Function pour traiter la file immédiatement
  const edgeFnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-sms-queue`
  const fnRes = await fetch(edgeFnUrl, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: '{}',
  })

  const fnData = await fnRes.json().catch(() => ({}))

  return NextResponse.json({
    success: true,
    message: force
      ? 'SMS programmé pour envoi immédiat via la file'
      : 'SMS sera envoyé automatiquement 2h après la clôture de la visite',
    queue_stats: fnData,
  })
}
