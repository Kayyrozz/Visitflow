-- ============================================================
-- VisitFlow — Schéma Supabase complet
-- Exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. Extensions
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- recherche full-text


-- ────────────────────────────────────────────────────────────
-- 1. Enums
-- ────────────────────────────────────────────────────────────
CREATE TYPE agent_role       AS ENUM ('AGENT', 'MANAGER', 'ADMIN');
CREATE TYPE bien_type        AS ENUM ('APPARTEMENT', 'MAISON', 'TERRAIN', 'COMMERCIAL', 'AUTRE');
CREATE TYPE bien_statut      AS ENUM ('DISPONIBLE', 'SOUS_COMPROMIS', 'VENDU', 'RETIRE');
CREATE TYPE prospect_statut  AS ENUM ('ACTIF', 'INACTIF', 'CONVERTI', 'PERDU');
CREATE TYPE visite_statut    AS ENUM ('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE', 'NO_SHOW');


-- ────────────────────────────────────────────────────────────
-- 2. Trigger updated_at (réutilisé sur toutes les tables)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ────────────────────────────────────────────────────────────
-- 3. Tables
-- ────────────────────────────────────────────────────────────

-- 3.1 agences
CREATE TABLE agences (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom          TEXT NOT NULL,
  adresse      TEXT,
  ville        TEXT,
  code_postal  TEXT,
  telephone    TEXT,
  email        TEXT UNIQUE,
  logo_url     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_agences_updated_at
  BEFORE UPDATE ON agences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- 3.2 agents (profils liés à auth.users)
CREATE TABLE agents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  agence_id  UUID NOT NULL REFERENCES agences(id) ON DELETE CASCADE,
  nom        TEXT NOT NULL,
  prenom     TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  telephone  TEXT,
  role       agent_role NOT NULL DEFAULT 'AGENT',
  actif      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agents_agence_id ON agents(agence_id);
CREATE INDEX idx_agents_user_id   ON agents(user_id);

CREATE TRIGGER trg_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- 3.3 biens immobiliers
CREATE TABLE biens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agence_id   UUID NOT NULL REFERENCES agences(id) ON DELETE CASCADE,
  agent_id    UUID NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  titre       TEXT NOT NULL,
  adresse     TEXT NOT NULL,
  ville       TEXT NOT NULL,
  code_postal TEXT NOT NULL,
  type        bien_type NOT NULL,
  surface     NUMERIC(8, 2),
  prix        NUMERIC(12, 2),
  description TEXT,
  statut      bien_statut NOT NULL DEFAULT 'DISPONIBLE',
  photos      TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT prix_positif    CHECK (prix    IS NULL OR prix    > 0),
  CONSTRAINT surface_positive CHECK (surface IS NULL OR surface > 0)
);

CREATE INDEX idx_biens_agence_id ON biens(agence_id);
CREATE INDEX idx_biens_agent_id  ON biens(agent_id);
CREATE INDEX idx_biens_statut    ON biens(statut);
CREATE INDEX idx_biens_ville     ON biens USING gin(ville gin_trgm_ops);

CREATE TRIGGER trg_biens_updated_at
  BEFORE UPDATE ON biens
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- 3.4 prospects
CREATE TABLE prospects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agence_id   UUID NOT NULL REFERENCES agences(id) ON DELETE CASCADE,
  agent_id    UUID NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  nom         TEXT NOT NULL,
  prenom      TEXT NOT NULL,
  email       TEXT,
  telephone   TEXT,
  budget_min  NUMERIC(12, 2),
  budget_max  NUMERIC(12, 2),
  notes       TEXT,
  statut      prospect_statut NOT NULL DEFAULT 'ACTIF',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT budget_coherent CHECK (
    budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max
  )
);

CREATE INDEX idx_prospects_agence_id ON prospects(agence_id);
CREATE INDEX idx_prospects_agent_id  ON prospects(agent_id);
CREATE INDEX idx_prospects_statut    ON prospects(statut);
CREATE INDEX idx_prospects_nom       ON prospects USING gin((nom || ' ' || prenom) gin_trgm_ops);

CREATE TRIGGER trg_prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- 3.5 visites
CREATE TABLE visites (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agence_id      UUID NOT NULL REFERENCES agences(id) ON DELETE CASCADE,
  agent_id       UUID NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  bien_id        UUID NOT NULL REFERENCES biens(id) ON DELETE CASCADE,
  prospect_id    UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  date_visite    TIMESTAMPTZ NOT NULL,
  statut         visite_statut NOT NULL DEFAULT 'PLANIFIEE',
  notes          TEXT,
  duree_minutes  INTEGER NOT NULL DEFAULT 60,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT duree_positive CHECK (duree_minutes > 0)
);

CREATE INDEX idx_visites_agence_id   ON visites(agence_id);
CREATE INDEX idx_visites_agent_id    ON visites(agent_id);
CREATE INDEX idx_visites_bien_id     ON visites(bien_id);
CREATE INDEX idx_visites_prospect_id ON visites(prospect_id);
CREATE INDEX idx_visites_date        ON visites(date_visite);
CREATE INDEX idx_visites_statut      ON visites(statut);

CREATE TRIGGER trg_visites_updated_at
  BEFORE UPDATE ON visites
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- 3.6 scores (feedback post-visite)
CREATE TABLE scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visite_id       UUID NOT NULL UNIQUE REFERENCES visites(id) ON DELETE CASCADE,
  prospect_id     UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  bien_id         UUID NOT NULL REFERENCES biens(id) ON DELETE CASCADE,
  interet         SMALLINT CHECK (interet BETWEEN 1 AND 5),
  coup_de_coeur   BOOLEAN NOT NULL DEFAULT FALSE,
  notes           TEXT,
  recommandation  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scores_visite_id    ON scores(visite_id);
CREATE INDEX idx_scores_prospect_id  ON scores(prospect_id);
CREATE INDEX idx_scores_bien_id      ON scores(bien_id);
CREATE INDEX idx_scores_coup_coeur   ON scores(coup_de_coeur) WHERE coup_de_coeur = TRUE;

CREATE TRIGGER trg_scores_updated_at
  BEFORE UPDATE ON scores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ────────────────────────────────────────────────────────────
-- 4. Fonctions helper pour RLS
-- ────────────────────────────────────────────────────────────

-- Retourne l'id de l'agent correspondant à l'utilisateur connecté
CREATE OR REPLACE FUNCTION get_current_agent_id()
RETURNS UUID AS $$
  SELECT id FROM agents WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Retourne l'agence_id de l'agent connecté
CREATE OR REPLACE FUNCTION get_current_agent_agence_id()
RETURNS UUID AS $$
  SELECT agence_id FROM agents WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Retourne le rôle de l'agent connecté
CREATE OR REPLACE FUNCTION get_current_agent_role()
RETURNS agent_role AS $$
  SELECT role FROM agents WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Retourne TRUE si l'agent connecté est MANAGER ou ADMIN
CREATE OR REPLACE FUNCTION is_manager_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM agents
    WHERE user_id = auth.uid()
      AND role IN ('MANAGER', 'ADMIN')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;


-- ────────────────────────────────────────────────────────────
-- 5. Row Level Security
-- ────────────────────────────────────────────────────────────

ALTER TABLE agences   ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE biens     ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE visites   ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores    ENABLE ROW LEVEL SECURITY;


-- ── agences ──────────────────────────────────────────────────

-- Lecture : chaque agent voit uniquement son agence
CREATE POLICY "agences_select_own"
  ON agences FOR SELECT
  USING (id = get_current_agent_agence_id());

-- Modification : ADMIN uniquement
CREATE POLICY "agences_insert_admin"
  ON agences FOR INSERT
  WITH CHECK (get_current_agent_role() = 'ADMIN');

CREATE POLICY "agences_update_admin"
  ON agences FOR UPDATE
  USING (id = get_current_agent_agence_id() AND get_current_agent_role() = 'ADMIN');

CREATE POLICY "agences_delete_admin"
  ON agences FOR DELETE
  USING (id = get_current_agent_agence_id() AND get_current_agent_role() = 'ADMIN');


-- ── agents ───────────────────────────────────────────────────

-- Lecture : voir tous les agents de la même agence
CREATE POLICY "agents_select_same_agence"
  ON agents FOR SELECT
  USING (agence_id = get_current_agent_agence_id());

-- Insertion : MANAGER ou ADMIN peuvent créer des agents dans leur agence
CREATE POLICY "agents_insert_manager"
  ON agents FOR INSERT
  WITH CHECK (
    agence_id = get_current_agent_agence_id()
    AND is_manager_or_admin()
  );

-- Mise à jour : agent peut modifier son propre profil ; MANAGER/ADMIN gèrent leur agence
CREATE POLICY "agents_update_own"
  ON agents FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "agents_update_manager"
  ON agents FOR UPDATE
  USING (
    agence_id = get_current_agent_agence_id()
    AND is_manager_or_admin()
  );

-- Suppression : ADMIN uniquement
CREATE POLICY "agents_delete_admin"
  ON agents FOR DELETE
  USING (
    agence_id = get_current_agent_agence_id()
    AND get_current_agent_role() = 'ADMIN'
  );


-- ── biens ────────────────────────────────────────────────────

-- Lecture : tous les agents de l'agence voient tous les biens
CREATE POLICY "biens_select_agence"
  ON biens FOR SELECT
  USING (agence_id = get_current_agent_agence_id());

-- Insertion : tout agent actif de l'agence
CREATE POLICY "biens_insert_agence"
  ON biens FOR INSERT
  WITH CHECK (agence_id = get_current_agent_agence_id());

-- Mise à jour : propriétaire du bien OU manager/admin de l'agence
CREATE POLICY "biens_update_owner_or_manager"
  ON biens FOR UPDATE
  USING (
    agence_id = get_current_agent_agence_id()
    AND (
      agent_id = get_current_agent_id()
      OR is_manager_or_admin()
    )
  );

-- Suppression : propriétaire OU manager/admin
CREATE POLICY "biens_delete_owner_or_manager"
  ON biens FOR DELETE
  USING (
    agence_id = get_current_agent_agence_id()
    AND (
      agent_id = get_current_agent_id()
      OR is_manager_or_admin()
    )
  );


-- ── prospects ────────────────────────────────────────────────

-- Lecture : tous les agents de l'agence voient tous les prospects
CREATE POLICY "prospects_select_agence"
  ON prospects FOR SELECT
  USING (agence_id = get_current_agent_agence_id());

-- Insertion : tout agent actif
CREATE POLICY "prospects_insert_agence"
  ON prospects FOR INSERT
  WITH CHECK (agence_id = get_current_agent_agence_id());

-- Mise à jour : propriétaire OU manager/admin
CREATE POLICY "prospects_update_owner_or_manager"
  ON prospects FOR UPDATE
  USING (
    agence_id = get_current_agent_agence_id()
    AND (
      agent_id = get_current_agent_id()
      OR is_manager_or_admin()
    )
  );

-- Suppression : propriétaire OU manager/admin
CREATE POLICY "prospects_delete_owner_or_manager"
  ON prospects FOR DELETE
  USING (
    agence_id = get_current_agent_agence_id()
    AND (
      agent_id = get_current_agent_id()
      OR is_manager_or_admin()
    )
  );


-- ── visites ──────────────────────────────────────────────────

-- Lecture : tous les agents de l'agence
CREATE POLICY "visites_select_agence"
  ON visites FOR SELECT
  USING (agence_id = get_current_agent_agence_id());

-- Insertion : tout agent de l'agence
CREATE POLICY "visites_insert_agence"
  ON visites FOR INSERT
  WITH CHECK (agence_id = get_current_agent_agence_id());

-- Mise à jour : agent responsable OU manager/admin
CREATE POLICY "visites_update_owner_or_manager"
  ON visites FOR UPDATE
  USING (
    agence_id = get_current_agent_agence_id()
    AND (
      agent_id = get_current_agent_id()
      OR is_manager_or_admin()
    )
  );

-- Suppression : agent responsable OU manager/admin
CREATE POLICY "visites_delete_owner_or_manager"
  ON visites FOR DELETE
  USING (
    agence_id = get_current_agent_agence_id()
    AND (
      agent_id = get_current_agent_id()
      OR is_manager_or_admin()
    )
  );


-- ── scores ───────────────────────────────────────────────────

-- Lecture : tous les agents de l'agence (via la visite associée)
CREATE POLICY "scores_select_agence"
  ON scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM visites v
      WHERE v.id = scores.visite_id
        AND v.agence_id = get_current_agent_agence_id()
    )
  );

-- Insertion & mise à jour : agent responsable de la visite OU manager/admin
CREATE POLICY "scores_insert_owner_or_manager"
  ON scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM visites v
      WHERE v.id = scores.visite_id
        AND v.agence_id = get_current_agent_agence_id()
        AND (v.agent_id = get_current_agent_id() OR is_manager_or_admin())
    )
  );

CREATE POLICY "scores_update_owner_or_manager"
  ON scores FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM visites v
      WHERE v.id = scores.visite_id
        AND (v.agent_id = get_current_agent_id() OR is_manager_or_admin())
    )
  );

-- Suppression : manager/admin uniquement
CREATE POLICY "scores_delete_manager"
  ON scores FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM visites v
      WHERE v.id = scores.visite_id
        AND v.agence_id = get_current_agent_agence_id()
        AND is_manager_or_admin()
    )
  );


-- ────────────────────────────────────────────────────────────
-- 6. Trigger : création automatique du profil agent
--    après inscription via Supabase Auth
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Le profil agent est créé manuellement (avec agence_id)
  -- Ce trigger peut être étendu pour gérer les invitations
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ────────────────────────────────────────────────────────────
-- 7. Vues utiles
-- ────────────────────────────────────────────────────────────

-- Vue : dashboard stats par agent
CREATE OR REPLACE VIEW vue_stats_agent AS
SELECT
  a.id                                             AS agent_id,
  a.agence_id,
  COUNT(v.id)                                      AS total_visites,
  COUNT(v.id) FILTER (WHERE v.statut = 'TERMINEE') AS visites_terminees,
  COUNT(v.id) FILTER (WHERE v.statut = 'PLANIFIEE' AND v.date_visite >= NOW()) AS visites_a_venir,
  COUNT(DISTINCT v.prospect_id)                    AS prospects_actifs,
  ROUND(
    COUNT(v.id) FILTER (WHERE v.statut = 'TERMINEE')::NUMERIC
    / NULLIF(COUNT(v.id), 0) * 100, 1
  )                                                AS taux_completion,
  AVG(s.interet) FILTER (WHERE s.interet IS NOT NULL) AS interet_moyen
FROM agents a
LEFT JOIN visites v  ON v.agent_id = a.id
LEFT JOIN scores  s  ON s.visite_id = v.id
GROUP BY a.id, a.agence_id;


-- Vue : visites enrichies (pour les listes)
CREATE OR REPLACE VIEW vue_visites AS
SELECT
  v.*,
  b.titre        AS bien_titre,
  b.adresse      AS bien_adresse,
  b.ville        AS bien_ville,
  b.type         AS bien_type,
  b.prix         AS bien_prix,
  p.nom          AS prospect_nom,
  p.prenom       AS prospect_prenom,
  p.email        AS prospect_email,
  p.telephone    AS prospect_telephone,
  a.nom          AS agent_nom,
  a.prenom       AS agent_prenom,
  s.interet      AS score_interet,
  s.coup_de_coeur AS score_coup_de_coeur
FROM visites v
JOIN biens     b ON b.id = v.bien_id
JOIN prospects p ON p.id = v.prospect_id
JOIN agents    a ON a.id = v.agent_id
LEFT JOIN scores s ON s.visite_id = v.id;


-- ────────────────────────────────────────────────────────────
-- 8. Données de démonstration
-- ────────────────────────────────────────────────────────────

-- Décommentez ce bloc pour insérer des données de test
/*
INSERT INTO agences (id, nom, ville, email) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Agence Horizon', 'Paris', 'contact@horizon-immo.fr');

-- Les agents doivent d'abord exister dans auth.users.
-- Exemple après inscription :
-- UPDATE agents SET agence_id = 'a1000000-...', role = 'MANAGER'
-- WHERE user_id = auth.uid();
*/
