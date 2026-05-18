-- ============================================================
-- Migration : suivi SMS feedback post-visite
-- Exécuter dans l'éditeur SQL Supabase
-- ============================================================

-- ── 1. Colonnes de suivi SMS sur visites ───────────────────

ALTER TABLE visites
  ADD COLUMN IF NOT EXISTS feedback_token   UUID        NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS terminee_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sms_envoye_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sms_relance_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS feedback_recu_at TIMESTAMPTZ;

-- Lookup rapide par token (page feedback sans auth)
CREATE UNIQUE INDEX IF NOT EXISTS idx_visites_feedback_token
  ON visites (feedback_token);

-- File initiale : visites terminées sans SMS envoyé
CREATE INDEX IF NOT EXISTS idx_visites_sms_initial
  ON visites (terminee_at)
  WHERE statut = 'TERMINEE' AND sms_envoye_at IS NULL;

-- File relance : SMS envoyé, pas de feedback reçu, pas de relance
CREATE INDEX IF NOT EXISTS idx_visites_sms_relance
  ON visites (sms_envoye_at)
  WHERE statut = 'TERMINEE' AND feedback_recu_at IS NULL AND sms_relance_at IS NULL;


-- ── 2. Trigger : horodatage automatique à la clôture ───────

CREATE OR REPLACE FUNCTION public.set_terminee_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.statut = 'TERMINEE'
     AND (OLD.statut IS DISTINCT FROM 'TERMINEE')
     AND NEW.terminee_at IS NULL
  THEN
    NEW.terminee_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_visites_terminee_at ON visites;
CREATE TRIGGER trg_visites_terminee_at
  BEFORE UPDATE ON visites
  FOR EACH ROW EXECUTE FUNCTION public.set_terminee_at();


-- ── 3. Fonction publique : info visite par token ────────────
-- Accessible sans auth pour le rendu server-side de la page feedback

CREATE OR REPLACE FUNCTION public.get_visite_by_feedback_token(p_token UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_result JSON;
BEGIN
  SELECT json_build_object(
    'id',            v.id,
    'date_visite',   v.date_visite,
    'feedback_recu', v.feedback_recu_at IS NOT NULL,
    'bien', json_build_object(
      'titre',   b.titre,
      'adresse', b.adresse,
      'ville',   b.ville,
      'type',    b.type
    ),
    'prospect', json_build_object(
      'prenom', p.prenom,
      'nom',    p.nom
    )
  ) INTO v_result
  FROM visites    v
  JOIN biens      b ON b.id = v.bien_id
  JOIN prospects  p ON p.id = v.prospect_id
  WHERE v.feedback_token = p_token AND v.statut = 'TERMINEE';

  RETURN COALESCE(v_result, json_build_object('error', 'Lien invalide ou expiré'));
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_visite_by_feedback_token TO anon;


-- ── 4. Fonction publique : soumettre un feedback via token ──

CREATE OR REPLACE FUNCTION public.submit_feedback_by_token(
  p_token         UUID,
  p_interet       SMALLINT,
  p_coup_de_coeur BOOLEAN DEFAULT FALSE,
  p_notes         TEXT    DEFAULT NULL
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_visite   visites%ROWTYPE;
  v_score_id UUID;
BEGIN
  SELECT * INTO v_visite
  FROM visites
  WHERE feedback_token = p_token
    AND statut = 'TERMINEE'
    AND feedback_recu_at IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error',   'Token invalide ou feedback déjà soumis'
    );
  END IF;

  IF p_interet NOT BETWEEN 1 AND 5 THEN
    RETURN json_build_object(
      'success', false,
      'error',   'La note doit être comprise entre 1 et 5'
    );
  END IF;

  INSERT INTO scores (visite_id, prospect_id, bien_id, interet, coup_de_coeur, notes)
  VALUES (v_visite.id, v_visite.prospect_id, v_visite.bien_id,
          p_interet, p_coup_de_coeur, p_notes)
  ON CONFLICT (visite_id) DO UPDATE
    SET interet       = EXCLUDED.interet,
        coup_de_coeur = EXCLUDED.coup_de_coeur,
        notes         = EXCLUDED.notes,
        updated_at    = NOW()
  RETURNING id INTO v_score_id;

  UPDATE visites
     SET feedback_recu_at = NOW(), updated_at = NOW()
   WHERE id = v_visite.id;

  RETURN json_build_object('success', true, 'score_id', v_score_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_feedback_by_token TO anon;


-- ══════════════════════════════════════════════════════════════
-- ÉTAPE 2 — À exécuter séparément après déploiement de
--           l'Edge Function (remplacer les placeholders)
-- ══════════════════════════════════════════════════════════════
--
-- Prérequis : activer pg_cron et pg_net via
--   Dashboard → Database → Extensions
--
-- SELECT cron.schedule(
--   'process-sms-queue',
--   '*/5 * * * *',
--   $$
--   SELECT net.http_post(
--     url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/process-sms-queue',
--     headers := jsonb_build_object(
--       'Content-Type',  'application/json',
--       'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
--     ),
--     body    := '{}'::jsonb
--   ) AS request_id;
--   $$
-- );
--
-- Pour vérifier : SELECT * FROM cron.job;
-- Pour supprimer : SELECT cron.unschedule('process-sms-queue');
