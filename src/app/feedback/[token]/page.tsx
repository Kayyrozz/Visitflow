import { createAdminClient } from '@/lib/supabase/server'
import FeedbackForm from './FeedbackForm'

interface PageProps {
  params: { token: string }
}

interface VisiteData {
  id:            string
  date_visite:   string
  feedback_recu: boolean
  bien:    { titre: string; adresse: string; ville: string; type: string }
  prospect: { prenom: string; nom: string }
  error?:  string
}

export default async function FeedbackPage({ params }: PageProps) {
  const admin = createAdminClient()

  const { data, error } = await admin.rpc('get_visite_by_feedback_token', {
    p_token: params.token,
  })

  const visite = data as unknown as VisiteData | null

  if (error || !visite || visite.error) {
    return <ErrorCard message="Ce lien de feedback n'est plus valide ou a expiré." />
  }

  if (visite.feedback_recu) {
    return (
      <PageShell>
        <div className="text-center py-8">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Merci !</h2>
          <p className="text-gray-500 text-sm">Votre avis a déjà été enregistré.</p>
        </div>
      </PageShell>
    )
  }

  const visitDate = new Date(visite.date_visite).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
  })

  return (
    <PageShell>
      {/* En-tête coloré */}
      <div className="bg-blue-600 px-6 py-7 text-white">
        <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-2">
          VisitFlow
        </p>
        <h1 className="text-2xl font-bold mb-1">
          Bonjour {visite.prospect.prenom}&nbsp;👋
        </h1>
        <p className="text-blue-100 text-sm">
          Comment s'est passée votre visite du {visitDate}&nbsp;?
        </p>
      </div>

      {/* Corps */}
      <div className="px-6 py-6">
        <div className="bg-gray-50 rounded-xl px-4 py-4 mb-6">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Bien visité
          </p>
          <p className="font-semibold text-gray-900">{visite.bien.adresse}</p>
          <p className="text-sm text-gray-500">{visite.bien.ville}</p>
        </div>

        <FeedbackForm token={params.token} />
      </div>
    </PageShell>
  )
}

// ── Composants utilitaires ─────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-md overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function ErrorCard({ message }: { message: string }) {
  return (
    <PageShell>
      <div className="px-6 py-10 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Lien invalide</h1>
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
    </PageShell>
  )
}
