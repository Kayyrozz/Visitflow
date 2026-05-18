export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      support_messages: {
        Row: {
          id: string
          agent_id: string
          agent_name: string
          agent_email: string
          sender: string
          content: string
          read_by_admin: boolean
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          agent_name: string
          agent_email: string
          sender: string
          content: string
          read_by_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          agent_name?: string
          agent_email?: string
          sender?: string
          content?: string
          read_by_admin?: boolean
          created_at?: string
        }
        Relationships: []
      }
      agences: {
        Row: {
          adresse: string | null
          code_postal: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          nom: string
          telephone: string | null
          updated_at: string
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          code_postal?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          nom: string
          telephone?: string | null
          updated_at?: string
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          code_postal?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          nom?: string
          telephone?: string | null
          updated_at?: string
          ville?: string | null
        }
        Relationships: []
      }
      agents: {
        Row: {
          actif: boolean
          agence_id: string | null
          created_at: string
          email: string
          id: string
          nom: string
          prenom: string
          role: Database["public"]["Enums"]["agent_role"]
          telephone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          actif?: boolean
          agence_id?: string | null
          created_at?: string
          email: string
          id?: string
          nom: string
          prenom: string
          role?: Database["public"]["Enums"]["agent_role"]
          telephone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          actif?: boolean
          agence_id?: string | null
          created_at?: string
          email?: string
          id?: string
          nom?: string
          prenom?: string
          role?: Database["public"]["Enums"]["agent_role"]
          telephone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_agence_id_fkey"
            columns: ["agence_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
        ]
      }
      biens: {
        Row: {
          adresse: string
          agence_id: string
          agent_id: string
          code_postal: string
          created_at: string
          description: string | null
          id: string
          photos: string[]
          prix: number | null
          statut: Database["public"]["Enums"]["bien_statut"]
          surface: number | null
          titre: string
          type: Database["public"]["Enums"]["bien_type"]
          updated_at: string
          ville: string
        }
        Insert: {
          adresse: string
          agence_id: string
          agent_id: string
          code_postal: string
          created_at?: string
          description?: string | null
          id?: string
          photos?: string[]
          prix?: number | null
          statut?: Database["public"]["Enums"]["bien_statut"]
          surface?: number | null
          titre: string
          type: Database["public"]["Enums"]["bien_type"]
          updated_at?: string
          ville: string
        }
        Update: {
          adresse?: string
          agence_id?: string
          agent_id?: string
          code_postal?: string
          created_at?: string
          description?: string | null
          id?: string
          photos?: string[]
          prix?: number | null
          statut?: Database["public"]["Enums"]["bien_statut"]
          surface?: number | null
          titre?: string
          type?: Database["public"]["Enums"]["bien_type"]
          updated_at?: string
          ville?: string
        }
        Relationships: [
          {
            foreignKeyName: "biens_agence_id_fkey"
            columns: ["agence_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biens_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biens_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "vue_stats_agent"
            referencedColumns: ["agent_id"]
          },
        ]
      }
      evenements: {
        Row: {
          agence_id: string
          agent_id: string
          created_at: string
          date_debut: string
          duree_minutes: number
          id: string
          notes: string | null
          prospect_id: string | null
          titre: string
          type: Database["public"]["Enums"]["evenement_type"]
          updated_at: string
        }
        Insert: {
          agence_id: string
          agent_id: string
          created_at?: string
          date_debut: string
          duree_minutes?: number
          id?: string
          notes?: string | null
          prospect_id?: string | null
          titre: string
          type: Database["public"]["Enums"]["evenement_type"]
          updated_at?: string
        }
        Update: {
          agence_id?: string
          agent_id?: string
          created_at?: string
          date_debut?: string
          duree_minutes?: number
          id?: string
          notes?: string | null
          prospect_id?: string | null
          titre?: string
          type?: Database["public"]["Enums"]["evenement_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evenements_agence_id_fkey"
            columns: ["agence_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evenements_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evenements_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "vue_stats_agent"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "evenements_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          agence_id: string
          agent_id: string
          budget_max: number | null
          budget_min: number | null
          created_at: string
          email: string | null
          id: string
          nom: string
          notes: string | null
          prenom: string
          statut: Database["public"]["Enums"]["prospect_statut"]
          telephone: string | null
          updated_at: string
        }
        Insert: {
          agence_id: string
          agent_id: string
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          email?: string | null
          id?: string
          nom: string
          notes?: string | null
          prenom: string
          statut?: Database["public"]["Enums"]["prospect_statut"]
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          agence_id?: string
          agent_id?: string
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          email?: string | null
          id?: string
          nom?: string
          notes?: string | null
          prenom?: string
          statut?: Database["public"]["Enums"]["prospect_statut"]
          telephone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospects_agence_id_fkey"
            columns: ["agence_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospects_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospects_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "vue_stats_agent"
            referencedColumns: ["agent_id"]
          },
        ]
      }
      scores: {
        Row: {
          bien_id: string
          coup_de_coeur: boolean
          created_at: string
          id: string
          interet: number | null
          notes: string | null
          prospect_id: string
          recommandation: string | null
          updated_at: string
          visite_id: string
        }
        Insert: {
          bien_id: string
          coup_de_coeur?: boolean
          created_at?: string
          id?: string
          interet?: number | null
          notes?: string | null
          prospect_id: string
          recommandation?: string | null
          updated_at?: string
          visite_id: string
        }
        Update: {
          bien_id?: string
          coup_de_coeur?: boolean
          created_at?: string
          id?: string
          interet?: number | null
          notes?: string | null
          prospect_id?: string
          recommandation?: string | null
          updated_at?: string
          visite_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_bien_id_fkey"
            columns: ["bien_id"]
            isOneToOne: false
            referencedRelation: "biens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_visite_id_fkey"
            columns: ["visite_id"]
            isOneToOne: true
            referencedRelation: "visites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_visite_id_fkey"
            columns: ["visite_id"]
            isOneToOne: true
            referencedRelation: "vue_visites"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          agent_id: string
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          id: string
          onboarded: boolean
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          onboarded?: boolean
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          onboarded?: boolean
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "vue_stats_agent"
            referencedColumns: ["agent_id"]
          },
        ]
      }
      visites: {
        Row: {
          agence_id: string
          agent_id: string
          bien_id: string
          created_at: string
          date_visite: string
          duree_minutes: number
          feedback_recu_at: string | null
          feedback_token: string
          id: string
          notes: string | null
          prospect_id: string
          sms_envoye_at: string | null
          sms_relance_at: string | null
          statut: Database["public"]["Enums"]["visite_statut"]
          terminee_at: string | null
          updated_at: string
        }
        Insert: {
          agence_id: string
          agent_id: string
          bien_id: string
          created_at?: string
          date_visite: string
          duree_minutes?: number
          feedback_recu_at?: string | null
          feedback_token?: string
          id?: string
          notes?: string | null
          prospect_id: string
          sms_envoye_at?: string | null
          sms_relance_at?: string | null
          statut?: Database["public"]["Enums"]["visite_statut"]
          terminee_at?: string | null
          updated_at?: string
        }
        Update: {
          agence_id?: string
          agent_id?: string
          bien_id?: string
          created_at?: string
          date_visite?: string
          duree_minutes?: number
          feedback_recu_at?: string | null
          feedback_token?: string
          id?: string
          notes?: string | null
          prospect_id?: string
          sms_envoye_at?: string | null
          sms_relance_at?: string | null
          statut?: Database["public"]["Enums"]["visite_statut"]
          terminee_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visites_agence_id_fkey"
            columns: ["agence_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visites_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visites_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "vue_stats_agent"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "visites_bien_id_fkey"
            columns: ["bien_id"]
            isOneToOne: false
            referencedRelation: "biens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visites_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vue_stats_agent: {
        Row: {
          agence_id: string | null
          agent_id: string | null
          interet_moyen: number | null
          prospects_actifs: number | null
          taux_completion: number | null
          total_visites: number | null
          visites_a_venir: number | null
          visites_terminees: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_agence_id_fkey"
            columns: ["agence_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
        ]
      }
      vue_visites: {
        Row: {
          agence_id: string | null
          agent_id: string | null
          agent_nom: string | null
          agent_prenom: string | null
          bien_adresse: string | null
          bien_id: string | null
          bien_prix: number | null
          bien_titre: string | null
          bien_type: Database["public"]["Enums"]["bien_type"] | null
          bien_ville: string | null
          created_at: string | null
          date_visite: string | null
          duree_minutes: number | null
          id: string | null
          notes: string | null
          prospect_email: string | null
          prospect_id: string | null
          prospect_nom: string | null
          prospect_prenom: string | null
          prospect_telephone: string | null
          score_coup_de_coeur: boolean | null
          score_interet: number | null
          statut: Database["public"]["Enums"]["visite_statut"] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visites_agence_id_fkey"
            columns: ["agence_id"]
            isOneToOne: false
            referencedRelation: "agences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visites_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visites_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "vue_stats_agent"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "visites_bien_id_fkey"
            columns: ["bien_id"]
            isOneToOne: false
            referencedRelation: "biens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visites_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_current_agent_agence_id: { Args: never; Returns: string }
      get_current_agent_id: { Args: never; Returns: string }
      get_current_agent_role: {
        Args: never
        Returns: Database["public"]["Enums"]["agent_role"]
      }
      get_visite_by_feedback_token: { Args: { p_token: string }; Returns: Json }
      is_manager_or_admin: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      submit_feedback_by_token: {
        Args: {
          p_coup_de_coeur?: boolean
          p_interet: number
          p_notes?: string
          p_token: string
        }
        Returns: Json
      }
    }
    Enums: {
      agent_role: "AGENT" | "MANAGER" | "ADMIN"
      bien_statut: "DISPONIBLE" | "SOUS_COMPROMIS" | "VENDU" | "RETIRE"
      bien_type: "APPARTEMENT" | "MAISON" | "TERRAIN" | "COMMERCIAL" | "AUTRE"
      evenement_type: "REUNION" | "RENDEZ_VOUS"
      prospect_statut: "ACTIF" | "INACTIF" | "CONVERTI" | "PERDU"
      visite_statut:
        | "PLANIFIEE"
        | "EN_COURS"
        | "TERMINEE"
        | "ANNULEE"
        | "NO_SHOW"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_role: ["AGENT", "MANAGER", "ADMIN"],
      bien_statut: ["DISPONIBLE", "SOUS_COMPROMIS", "VENDU", "RETIRE"],
      bien_type: ["APPARTEMENT", "MAISON", "TERRAIN", "COMMERCIAL", "AUTRE"],
      evenement_type: ["REUNION", "RENDEZ_VOUS"],
      prospect_statut: ["ACTIF", "INACTIF", "CONVERTI", "PERDU"],
      visite_statut: [
        "PLANIFIEE",
        "EN_COURS",
        "TERMINEE",
        "ANNULEE",
        "NO_SHOW",
      ],
    },
  },
} as const

// Convenience type aliases used across the codebase
export type Bien = Tables<"biens">
export type BienInsert = TablesInsert<"biens">
export type BienUpdate = TablesUpdate<"biens">
export type BienType = Database["public"]["Enums"]["bien_type"]
export type ProspectInsert = TablesInsert<"prospects">
export type ProspectUpdate = TablesUpdate<"prospects">
export type ProspectStatut = Database["public"]["Enums"]["prospect_statut"]
export type VisiteInsert = TablesInsert<"visites">
export type VisiteUpdate = TablesUpdate<"visites">
export type VisiteStatut = Database["public"]["Enums"]["visite_statut"]
