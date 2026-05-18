import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const feedbackSchema = z.object({
  interet:        z.number().int().min(1).max(5),
  coup_de_coeur:  z.boolean().optional().default(false),
  notes:          z.string().max(500).optional(),
})

type Params = { params: { token: string } }

/** GET /api/feedback/[token] — infos de la visite pour le rendu côté client */
export async function GET(_req: NextRequest, { params }: Params) {
  const admin = createAdminClient()

  const { data, error } = await admin.rpc('get_visite_by_feedback_token', {
    p_token: params.token,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const visiteData = data as Record<string, unknown> | null
  if (visiteData?.error) {
    return NextResponse.json(data, { status: 404 })
  }

  return NextResponse.json(data)
}

/** POST /api/feedback/[token] — soumettre un avis (sans authentification) */
export async function POST(req: NextRequest, { params }: Params) {
  const body = await req.json().catch(() => null)
  const parsed = feedbackSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { interet, coup_de_coeur, notes } = parsed.data
  const admin = createAdminClient()

  const { data, error } = await admin.rpc('submit_feedback_by_token', {
    p_token:         params.token,
    p_interet:       interet,
    p_coup_de_coeur: coup_de_coeur ?? false,
    p_notes:         notes ?? null,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const result = data as unknown as { success: boolean; error?: string }

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 422 })
  }

  return NextResponse.json({ success: true })
}
