export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analysis_sessions: {
        Row: {
          created_at: string
          description: string | null
          file_count: number
          id: string
          name: string
          relationship_count: number
          sheet_count: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_count?: number
          id?: string
          name: string
          relationship_count?: number
          sheet_count?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_count?: number
          id?: string
          name?: string
          relationship_count?: number
          sheet_count?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_filters: {
        Row: {
          created_at: string
          dashboard_id: string
          filters: Json
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dashboard_id: string
          filters?: Json
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dashboard_id?: string
          filters?: Json
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_filters_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "saved_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_tiles: {
        Row: {
          created_at: string
          dashboard_id: string
          id: string
          position: Json
          size: Json
          tile_data: Json
        }
        Insert: {
          created_at?: string
          dashboard_id: string
          id?: string
          position: Json
          size: Json
          tile_data: Json
        }
        Update: {
          created_at?: string
          dashboard_id?: string
          id?: string
          position?: Json
          size?: Json
          tile_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_tiles_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "saved_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      export_history: {
        Row: {
          confidence_threshold: number
          created_at: string
          export_format: string
          file_name: string
          id: string
          relationship_count: number
          session_id: string
          user_id: string
        }
        Insert: {
          confidence_threshold?: number
          created_at?: string
          export_format: string
          file_name: string
          id?: string
          relationship_count?: number
          session_id: string
          user_id: string
        }
        Update: {
          confidence_threshold?: number
          created_at?: string
          export_format?: string
          file_name?: string
          id?: string
          relationship_count?: number
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "export_history_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "analysis_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "export_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_dashboards: {
        Row: {
          created_at: string
          dataset_id: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dataset_id?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dataset_id?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_dashboards_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "saved_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_datasets: {
        Row: {
          columns: Json
          created_at: string
          data: Json
          description: string | null
          file_name: string
          id: string
          name: string
          row_count: number
          updated_at: string
          user_id: string
          worksheet_name: string | null
        }
        Insert: {
          columns: Json
          created_at?: string
          data: Json
          description?: string | null
          file_name: string
          id?: string
          name: string
          row_count?: number
          updated_at?: string
          user_id: string
          worksheet_name?: string | null
        }
        Update: {
          columns?: Json
          created_at?: string
          data?: Json
          description?: string | null
          file_name?: string
          id?: string
          name?: string
          row_count?: number
          updated_at?: string
          user_id?: string
          worksheet_name?: string | null
        }
        Relationships: []
      }
      session_files: {
        Row: {
          created_at: string
          id: string
          name: string
          session_id: string
          sheets_count: number
          size: number
          upload_path: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          session_id: string
          sheets_count?: number
          size: number
          upload_path?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          session_id?: string
          sheets_count?: number
          size?: number
          upload_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_files_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "analysis_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_relationships: {
        Row: {
          confidence: number
          created_at: string
          id: string
          is_cross_file: boolean
          is_intra_table: boolean
          relationship_type: string
          session_id: string
          source_column: string
          source_sheet_id: string
          target_column: string
          target_sheet_id: string
        }
        Insert: {
          confidence: number
          created_at?: string
          id?: string
          is_cross_file?: boolean
          is_intra_table?: boolean
          relationship_type: string
          session_id: string
          source_column: string
          source_sheet_id: string
          target_column: string
          target_sheet_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          id?: string
          is_cross_file?: boolean
          is_intra_table?: boolean
          relationship_type?: string
          session_id?: string
          source_column?: string
          source_sheet_id?: string
          target_column?: string
          target_sheet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_relationships_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "analysis_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_relationships_source_sheet_id_fkey"
            columns: ["source_sheet_id"]
            isOneToOne: false
            referencedRelation: "session_sheets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_relationships_target_sheet_id_fkey"
            columns: ["target_sheet_id"]
            isOneToOne: false
            referencedRelation: "session_sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      session_sheets: {
        Row: {
          column_count: number
          columns: Json
          created_at: string
          file_id: string
          file_name: string
          id: string
          name: string
          row_count: number
          sample_data: Json
          session_id: string
        }
        Insert: {
          column_count?: number
          columns?: Json
          created_at?: string
          file_id: string
          file_name: string
          id?: string
          name: string
          row_count?: number
          sample_data?: Json
          session_id: string
        }
        Update: {
          column_count?: number
          columns?: Json
          created_at?: string
          file_id?: string
          file_name?: string
          id?: string
          name?: string
          row_count?: number
          sample_data?: Json
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_sheets_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "session_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_sheets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "analysis_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          user_id: string
          would_pay: boolean
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          user_id: string
          would_pay: boolean
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          user_id?: string
          would_pay?: boolean
        }
        Relationships: []
      }
      user_usage_tracking: {
        Row: {
          created_at: string
          id: string
          total_uses: number
          updated_at: string
          user_id: string
          uses_remaining: number
        }
        Insert: {
          created_at?: string
          id?: string
          total_uses?: number
          updated_at?: string
          user_id: string
          uses_remaining?: number
        }
        Update: {
          created_at?: string
          id?: string
          total_uses?: number
          updated_at?: string
          user_id?: string
          uses_remaining?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
