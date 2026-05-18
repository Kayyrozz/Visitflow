import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const BREVO_API_KEY             = Deno.env.get('BREVO_API_KEY')!
const APP_URL                   = Deno.env.get('APP_URL') ?? 'https://visitflow.fr'

const TWO_HOURS_MS        = 2  * 60 * 60 * 1000
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000

// ── Types ────────────────────────────────────────────────────

type SmsType = 'initial' | 'relance'

interface Bien     { titre: string; adresse: string; ville: string }
interface Prospect { prenom: string; telephone: string | null }

interface VisiteRecord {
  id:             string
  feedback_token: string
  bien:           Bien     | null
  prospect:       Prospect | null
}

// ── Helpers ──────────────────────────────────────────────────

/** Normalise un numéro français vers le format E.164 (+33…) */
function normalizePhone(raw: string): string {
  const n = raw.replace(/[\s\-\.()]/g, '')
  if (n.startsWith('0') && n.length === 10) return '+33' + n.slice(1)
  if (n.startsWith('+'))                     return n
  if (n.length === 9)                        return '+33' + n
  return n
}

/** Construit le message SMS (≤ 160 caractères) */
function buildSmsContent(type: SmsType, prenom: string, link: string): string {
  if (type === 'initial') {
    return `Bonjour ${prenom} ! Merci pour votre visite. Donnez votre avis en 30 sec : ${link}`
  }
  return `Bonjour ${prenom}, votre avis de visite nous manque encore. Toujours disponible : ${link}`
}

/** Appelle l'API Brevo pour envoyer un SMS transactionnel */
async function sendBrevoSms(
  recipient: string,
  content: string,
): Promise<{ ok: boolean; errorMsg?: string }> {
  const res = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender:    'VisitFlow',
      recipient: normalizePhone(recipient),
      content,
      type:      'transactional',
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    return { ok: false, errorMsg: text }
  }
  return { ok: true }
}

// ── Handler principal ─────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  }

  // Sécurité : seul le service role peut appeler cette fonction
  const auth = req.headers.get('Authorization') ?? ''
  if (auth !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const stats = { initial_sent: 0, relance_sent: 0, skipped: 0, errors: 0 }

  try {
    // ── File initiale : TERMINEE il y a ≥ 2h, pas encore de SMS ──────────

    const twoHoursAgo = new Date(Date.now() - TWO_HOURS_MS).toISOString()

    const { data: initialQueue, error: err1 } = await supabase
      .from('visites')
      .select(`
        id, feedback_token,
        bien:biens(titre, adresse, ville),
        prospect:prospects(prenom, telephone)
      `)
      .eq('statut', 'TERMINEE')
      .is('sms_envoye_at', null)
      .not('terminee_at', 'is', null)
      .lt('terminee_at', twoHoursAgo)

    if (err1) throw err1

    for (const row of (initialQueue ?? []) as unknown as VisiteRecord[]) {
      if (!row.prospect?.telephone || !row.bien) { stats.skipped++; continue }

      const link    = `${APP_URL}/feedback/${row.feedback_token}`
      const content = buildSmsContent('initial', row.prospect.prenom, link)
      const result  = await sendBrevoSms(row.prospect.telephone, content)

      if (result.ok) {
        await supabase
          .from('visites')
          .update({ sms_envoye_at: new Date().toISOString() })
          .eq('id', row.id)
        stats.initial_sent++
      } else {
        console.error(`[SMS initial] visite=${row.id}`, result.errorMsg)
        stats.errors++
      }
    }

    // ── File relance : SMS envoyé il y a ≥ 48h, pas de feedback, pas de relance ──

    const fortyEightHoursAgo = new Date(Date.now() - FORTY_EIGHT_HOURS_MS).toISOString()

    const { data: relanceQueue, error: err2 } = await supabase
      .from('visites')
      .select(`
        id, feedback_token,
        bien:biens(titre, adresse, ville),
        prospect:prospects(prenom, telephone)
      `)
      .eq('statut', 'TERMINEE')
      .is('feedback_recu_at', null)
      .is('sms_relance_at', null)
      .not('sms_envoye_at', 'is', null)
      .lt('sms_envoye_at', fortyEightHoursAgo)

    if (err2) throw err2

    for (const row of (relanceQueue ?? []) as unknown as VisiteRecord[]) {
      if (!row.prospect?.telephone || !row.bien) { stats.skipped++; continue }

      const link    = `${APP_URL}/feedback/${row.feedback_token}`
      const content = buildSmsContent('relance', row.prospect.prenom, link)
      const result  = await sendBrevoSms(row.prospect.telephone, content)

      if (result.ok) {
        await supabase
          .from('visites')
          .update({ sms_relance_at: new Date().toISOString() })
          .eq('id', row.id)
        stats.relance_sent++
      } else {
        console.error(`[SMS relance] visite=${row.id}`, result.errorMsg)
        stats.errors++
      }
    }

    return json({ success: true, ...stats })
  } catch (err) {
    console.error('process-sms-queue fatal:', err)
    return json({ success: false, error: String(err) }, 500)
  }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
