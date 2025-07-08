export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agent_activity_log: {
        Row: {
          activity_type: string
          agent_id: string
          created_at: string
          description: string | null
          id: string
          metadata: Json
        }
        Insert: {
          activity_type: string
          agent_id: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          activity_type?: string
          agent_id?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "agent_activity_log_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_alert_configs: {
        Row: {
          agent_id: string
          alert_type: string
          cooldown_minutes: number
          created_at: string
          email_address: string | null
          email_enabled: boolean
          id: string
          is_enabled: boolean
          severity_threshold: string
          thresholds: Json
          updated_at: string
          webhook_enabled: boolean
          webhook_url: string | null
        }
        Insert: {
          agent_id: string
          alert_type: string
          cooldown_minutes?: number
          created_at?: string
          email_address?: string | null
          email_enabled?: boolean
          id?: string
          is_enabled?: boolean
          severity_threshold?: string
          thresholds?: Json
          updated_at?: string
          webhook_enabled?: boolean
          webhook_url?: string | null
        }
        Update: {
          agent_id?: string
          alert_type?: string
          cooldown_minutes?: number
          created_at?: string
          email_address?: string | null
          email_enabled?: boolean
          id?: string
          is_enabled?: boolean
          severity_threshold?: string
          thresholds?: Json
          updated_at?: string
          webhook_enabled?: boolean
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_alert_configs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_insights: {
        Row: {
          agent_id: string
          confidence_score: number
          created_at: string
          data: Json
          dataset_id: string | null
          description: string
          id: string
          insight_type: string
          is_archived: boolean
          is_read: boolean
          priority: number
          task_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          confidence_score?: number
          created_at?: string
          data?: Json
          dataset_id?: string | null
          description: string
          id?: string
          insight_type: string
          is_archived?: boolean
          is_read?: boolean
          priority?: number
          task_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          confidence_score?: number
          created_at?: string
          data?: Json
          dataset_id?: string | null
          description?: string
          id?: string
          insight_type?: string
          is_archived?: boolean
          is_read?: boolean
          priority?: number
          task_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_insights_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_insights_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "saved_datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_insights_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "agent_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_tasks: {
        Row: {
          agent_id: string
          completed_at: string | null
          created_at: string
          dataset_id: string | null
          error_message: string | null
          id: string
          parameters: Json
          result: Json | null
          scheduled_at: string
          started_at: string | null
          status: string
          task_type: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          created_at?: string
          dataset_id?: string | null
          error_message?: string | null
          id?: string
          parameters?: Json
          result?: Json | null
          scheduled_at?: string
          started_at?: string | null
          status?: string
          task_type: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          created_at?: string
          dataset_id?: string | null
          error_message?: string | null
          id?: string
          parameters?: Json
          result?: Json | null
          scheduled_at?: string
          started_at?: string | null
          status?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_tasks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_tasks_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "saved_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          capabilities: Json
          configuration: Json
          created_at: string
          description: string | null
          id: string
          last_active: string | null
          name: string
          priority: number
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capabilities?: Json
          configuration?: Json
          created_at?: string
          description?: string | null
          id?: string
          last_active?: string | null
          name: string
          priority?: number
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capabilities?: Json
          configuration?: Json
          created_at?: string
          description?: string | null
          id?: string
          last_active?: string | null
          name?: string
          priority?: number
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      alert_notifications: {
        Row: {
          agent_id: string
          alert_type: string
          created_at: string
          delivered_at: string | null
          delivery_status: Json
          id: string
          insight_id: string | null
          message: string
          notification_channels: Json
          severity: string
          title: string
        }
        Insert: {
          agent_id: string
          alert_type: string
          created_at?: string
          delivered_at?: string | null
          delivery_status?: Json
          id?: string
          insight_id?: string | null
          message: string
          notification_channels?: Json
          severity: string
          title: string
        }
        Update: {
          agent_id?: string
          alert_type?: string
          created_at?: string
          delivered_at?: string | null
          delivery_status?: Json
          id?: string
          insight_id?: string | null
          message?: string
          notification_channels?: Json
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_notifications_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_notifications_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "agent_insights"
            referencedColumns: ["id"]
          },
        ]
      }
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
      dataset_relationships: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          discovered: boolean | null
          evidence: Json | null
          evidence_type: string | null
          id: string
          relationship_type: string
          source_column: string
          source_dataset_id: string
          target_column: string
          target_dataset_id: string
          updated_at: string | null
          validated: boolean | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          discovered?: boolean | null
          evidence?: Json | null
          evidence_type?: string | null
          id?: string
          relationship_type: string
          source_column: string
          source_dataset_id: string
          target_column: string
          target_dataset_id: string
          updated_at?: string | null
          validated?: boolean | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          discovered?: boolean | null
          evidence?: Json | null
          evidence_type?: string | null
          id?: string
          relationship_type?: string
          source_column?: string
          source_dataset_id?: string
          target_column?: string
          target_dataset_id?: string
          updated_at?: string | null
          validated?: boolean | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dataset_relationships_source_dataset_id_fkey"
            columns: ["source_dataset_id"]
            isOneToOne: false
            referencedRelation: "enhanced_datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dataset_relationships_target_dataset_id_fkey"
            columns: ["target_dataset_id"]
            isOneToOne: false
            referencedRelation: "enhanced_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      dataset_versions: {
        Row: {
          changes: string[] | null
          checksum: string
          created_at: string | null
          created_by: string
          enhanced_dataset_id: string
          id: string
          row_count: number | null
          schema_snapshot: Json
          version_number: number
        }
        Insert: {
          changes?: string[] | null
          checksum: string
          created_at?: string | null
          created_by: string
          enhanced_dataset_id: string
          id?: string
          row_count?: number | null
          schema_snapshot: Json
          version_number: number
        }
        Update: {
          changes?: string[] | null
          checksum?: string
          created_at?: string | null
          created_by?: string
          enhanced_dataset_id?: string
          id?: string
          row_count?: number | null
          schema_snapshot?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "dataset_versions_enhanced_dataset_id_fkey"
            columns: ["enhanced_dataset_id"]
            isOneToOne: false
            referencedRelation: "enhanced_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_columns: {
        Row: {
          column_name: string
          column_version: number | null
          constraints: Json | null
          created_at: string | null
          description: string | null
          display_name: string | null
          enhanced_dataset_id: string
          format_pattern: string | null
          id: string
          last_modified: string | null
          max_value: number | null
          mean_value: number | null
          median_value: number | null
          min_value: number | null
          mode_value: string | null
          null_count: number | null
          outlier_count: number | null
          quality_issues: string[] | null
          quality_score: number | null
          semantic_type: Database["public"]["Enums"]["semantic_type"] | null
          unique_count: number | null
          unit: string | null
          updated_at: string | null
          value_distribution: Json | null
        }
        Insert: {
          column_name: string
          column_version?: number | null
          constraints?: Json | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          enhanced_dataset_id: string
          format_pattern?: string | null
          id?: string
          last_modified?: string | null
          max_value?: number | null
          mean_value?: number | null
          median_value?: number | null
          min_value?: number | null
          mode_value?: string | null
          null_count?: number | null
          outlier_count?: number | null
          quality_issues?: string[] | null
          quality_score?: number | null
          semantic_type?: Database["public"]["Enums"]["semantic_type"] | null
          unique_count?: number | null
          unit?: string | null
          updated_at?: string | null
          value_distribution?: Json | null
        }
        Update: {
          column_name?: string
          column_version?: number | null
          constraints?: Json | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          enhanced_dataset_id?: string
          format_pattern?: string | null
          id?: string
          last_modified?: string | null
          max_value?: number | null
          mean_value?: number | null
          median_value?: number | null
          min_value?: number | null
          mode_value?: string | null
          null_count?: number | null
          outlier_count?: number | null
          quality_issues?: string[] | null
          quality_score?: number | null
          semantic_type?: Database["public"]["Enums"]["semantic_type"] | null
          unique_count?: number | null
          unit?: string | null
          updated_at?: string | null
          value_distribution?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "enhanced_columns_enhanced_dataset_id_fkey"
            columns: ["enhanced_dataset_id"]
            isOneToOne: false
            referencedRelation: "enhanced_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_datasets: {
        Row: {
          access_count: number | null
          access_pattern: Database["public"]["Enums"]["access_pattern"] | null
          accuracy_score: number | null
          base_dataset_id: string
          completeness_score: number | null
          compression_level: number | null
          consistency_score: number | null
          created_at: string | null
          id: string
          indexed_columns: string[] | null
          last_accessed: string | null
          last_quality_assessment: string | null
          overall_quality_score: number | null
          quality_issues: Json | null
          quality_recommendations: Json | null
          schema_checksum: string
          schema_version: number | null
          storage_type: Database["public"]["Enums"]["storage_type"] | null
          updated_at: string | null
          user_id: string
          validity_score: number | null
        }
        Insert: {
          access_count?: number | null
          access_pattern?: Database["public"]["Enums"]["access_pattern"] | null
          accuracy_score?: number | null
          base_dataset_id: string
          completeness_score?: number | null
          compression_level?: number | null
          consistency_score?: number | null
          created_at?: string | null
          id?: string
          indexed_columns?: string[] | null
          last_accessed?: string | null
          last_quality_assessment?: string | null
          overall_quality_score?: number | null
          quality_issues?: Json | null
          quality_recommendations?: Json | null
          schema_checksum: string
          schema_version?: number | null
          storage_type?: Database["public"]["Enums"]["storage_type"] | null
          updated_at?: string | null
          user_id: string
          validity_score?: number | null
        }
        Update: {
          access_count?: number | null
          access_pattern?: Database["public"]["Enums"]["access_pattern"] | null
          accuracy_score?: number | null
          base_dataset_id?: string
          completeness_score?: number | null
          compression_level?: number | null
          consistency_score?: number | null
          created_at?: string | null
          id?: string
          indexed_columns?: string[] | null
          last_accessed?: string | null
          last_quality_assessment?: string | null
          overall_quality_score?: number | null
          quality_issues?: Json | null
          quality_recommendations?: Json | null
          schema_checksum?: string
          schema_version?: number | null
          storage_type?: Database["public"]["Enums"]["storage_type"] | null
          updated_at?: string | null
          user_id?: string
          validity_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enhanced_datasets_base_dataset_id_fkey"
            columns: ["base_dataset_id"]
            isOneToOne: false
            referencedRelation: "saved_datasets"
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
      oauth_provider_configs: {
        Row: {
          auth_url: string
          client_id: string
          client_secret: string
          created_at: string
          id: string
          is_enabled: boolean
          provider: string
          redirect_uri: string
          scope: string
          token_url: string
          updated_at: string
        }
        Insert: {
          auth_url: string
          client_id: string
          client_secret: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          provider: string
          redirect_uri: string
          scope: string
          token_url: string
          updated_at?: string
        }
        Update: {
          auth_url?: string
          client_id?: string
          client_secret?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          provider?: string
          redirect_uri?: string
          scope?: string
          token_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      oauth_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: string
          provider: string
          provider_user_id: string | null
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          id?: string
          provider: string
          provider_user_id?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string
          provider_user_id?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_alert_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          email_frequency: string
          id: string
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          email_frequency?: string
          id?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          email_frequency?: string
          id?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_usage_tracking: {
        Row: {
          active_agents: number
          agents_enabled: boolean
          created_at: string
          id: string
          max_agents: number
          total_uses: number
          updated_at: string
          user_id: string
          uses_remaining: number
        }
        Insert: {
          active_agents?: number
          agents_enabled?: boolean
          created_at?: string
          id?: string
          max_agents?: number
          total_uses?: number
          updated_at?: string
          user_id: string
          uses_remaining?: number
        }
        Update: {
          active_agents?: number
          agents_enabled?: boolean
          created_at?: string
          id?: string
          max_agents?: number
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      access_pattern: "hot" | "warm" | "cold"
      app_role: "user" | "admin"
      semantic_type:
        | "identifier"
        | "measure"
        | "dimension"
        | "temporal"
        | "geospatial"
      storage_type: "jsonb" | "columnar" | "hybrid"
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
      access_pattern: ["hot", "warm", "cold"],
      app_role: ["user", "admin"],
      semantic_type: [
        "identifier",
        "measure",
        "dimension",
        "temporal",
        "geospatial",
      ],
      storage_type: ["jsonb", "columnar", "hybrid"],
    },
  },
} as const
