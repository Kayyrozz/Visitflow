'use client'

import { useState } from 'react'

const STAR_LABELS = ['Très décevante', 'Décevante', 'Correcte', 'Bonne', 'Excellente']

interface Props {
  token: string
}

export default function FeedbackForm({ token }: Props) {
  const [interet,      setInteret]      = useState<number | null>(null)
  const [hover,        setHover]        = useState<number | null>(null)
  const [coupDeCoeur,  setCoupDeCoeur]  = useState(false)
  const [notes,        setNotes]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [submitted,    setSubmitted]    = useState(false)
  const [errorMsg,     setErrorMsg]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!interet) { setErrorMsg('Veuillez sélectionner une note.'); return }

    setLoading(true)
    setErrorMsg(null)

    try {
      const res = await fetch(`/api/feedback/${token}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          interet,
          coup_de_coeur: coupDeCoeur,
          notes:         notes.trim() || undefined,
        }),
      })

      const json = await res.json()

      if (!res.ok) throw new Error(json.error ?? 'Erreur lors de la soumission')
      setSubmitted(true)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Merci beaucoup !</h2>
        <p className="text-sm text-gray-500">
          Votre avis nous aide à mieux vous accompagner dans votre recherche.
        </p>
      </div>
    )
  }

  const activeRating = hover ?? interet

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Note en étoiles */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
          Votre note globale
        </label>
        <div
          className="flex gap-1 justify-center"
          onMouseLeave={() => setHover(null)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={STAR_LABELS[star - 1]}
              onMouseEnter={() => setHover(star)}
              onClick={() => setInteret(star)}
              className={`text-3xl transition-all duration-100 hover:scale-125 active:scale-110 ${
                activeRating !== null && star <= activeRating
                  ? 'opacity-100'
                  : 'opacity-25'
              }`}
            >
              ⭐
            </button>
          ))}
        </div>
        {activeRating && (
          <p className="text-center text-xs font-medium text-blue-600 mt-2">
            {STAR_LABELS[activeRating - 1]}
          </p>
        )}
      </div>

      {/* Coup de cœur */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={coupDeCoeur}
          onChange={(e) => setCoupDeCoeur(e.target.checked)}
          className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-400"
        />
        <span className="text-sm font-medium text-gray-700">
          ❤️ Coup de cœur — ce bien m'a vraiment séduit(e)
        </span>
      </label>

      {/* Commentaire */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Commentaire <span className="font-normal text-gray-400">(optionnel)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Points positifs, points à améliorer…"
          maxLength={500}
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-right text-xs text-gray-400 mt-1">{notes.length}/500</p>
      </div>

      {/* Message d'erreur */}
      {errorMsg && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          {errorMsg}
        </p>
      )}

      {/* Bouton */}
      <button
        type="submit"
        disabled={loading || !interet}
        className="w-full bg-blue-600 text-white rounded-xl py-3.5 text-sm font-semibold
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-blue-700 active:bg-blue-800 transition-colors"
      >
        {loading ? 'Envoi en cours…' : 'Envoyer mon avis'}
      </button>

      <p className="text-center text-xs text-gray-400">
        Vos réponses restent confidentielles.
      </p>
    </form>
  )
}
