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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      assignment_notifications: {
        Row: {
          assignment_id: string
          created_at: string
          email_sent: boolean | null
          id: string
          in_app_read: boolean | null
          notification_type: string
          sent_at: string | null
        }
        Insert: {
          assignment_id: string
          created_at?: string
          email_sent?: boolean | null
          id?: string
          in_app_read?: boolean | null
          notification_type: string
          sent_at?: string | null
        }
        Update: {
          assignment_id?: string
          created_at?: string
          email_sent?: boolean | null
          id?: string
          in_app_read?: boolean | null
          notification_type?: string
          sent_at?: string | null
        }
        Relationships: []
      }
      assignment_templates: {
        Row: {
          created_at: string
          created_by: string
          department: string | null
          description: string | null
          id: string
          is_active: boolean | null
          job_title: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          department?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          department?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          created_at: string
          criteria_type: string
          criteria_value: number
          description: string | null
          icon_color: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria_type: string
          criteria_value: number
          description?: string | null
          icon_color?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria_type?: string
          criteria_value?: number
          description?: string | null
          icon_color?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_url: string | null
          course_id: string
          id: string
          issued_at: string | null
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          course_id: string
          id?: string
          issued_at?: string | null
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          course_id?: string
          id?: string
          issued_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      company_presentation: {
        Row: {
          company_name: string
          created_at: string
          history: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          mission: string | null
          requires_acknowledgment: boolean | null
          updated_at: string
          values: Json | null
          video_url: string | null
          vision: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          history?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          mission?: string | null
          requires_acknowledgment?: boolean | null
          updated_at?: string
          values?: Json | null
          video_url?: string | null
          vision?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          history?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          mission?: string | null
          requires_acknowledgment?: boolean | null
          updated_at?: string
          values?: Json | null
          video_url?: string | null
          vision?: string | null
        }
        Relationships: []
      }
      course_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          completed_at: string | null
          content_id: string
          content_type: string
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          priority: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          completed_at?: string | null
          content_id: string
          content_type?: string
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          priority?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          completed_at?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          priority?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_certificates: {
        Row: {
          certificate_url: string | null
          course_id: string
          enrollment_id: string
          id: string
          issued_at: string
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          course_id: string
          enrollment_id: string
          id?: string
          issued_at?: string
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          course_id?: string
          enrollment_id?: string
          id?: string
          issued_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "video_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          assigned_by: string | null
          completed_at: string | null
          course_id: string
          due_date: string | null
          enrolled_at: string
          id: string
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          completed_at?: string | null
          course_id: string
          due_date?: string | null
          enrolled_at?: string
          id?: string
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          completed_at?: string | null
          course_id?: string
          due_date?: string | null
          enrolled_at?: string
          id?: string
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "video_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          duration_hours: number | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          manager_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      email_logs: {
        Row: {
          content: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          opened_at: string | null
          provider_message_id: string | null
          recipient_email: string
          recipient_name: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          provider_message_id?: string | null
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          provider_message_id?: string | null
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          max_retries: number | null
          recipient_email: string
          recipient_name: string | null
          retry_count: number | null
          scheduled_for: string
          status: string
          template_id: string | null
          updated_at: string
          variables: Json | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          max_retries?: number | null
          recipient_email: string
          recipient_name?: string | null
          retry_count?: number | null
          scheduled_for?: string
          status?: string
          template_id?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          max_retries?: number | null
          recipient_email?: string
          recipient_name?: string | null
          retry_count?: number | null
          scheduled_for?: string
          status?: string
          template_id?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      gamification_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          enrollment_id: string
          id: string
          is_completed: boolean | null
          last_position_seconds: number | null
          lesson_id: string
          updated_at: string
          user_id: string
          watched_seconds: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          enrollment_id: string
          id?: string
          is_completed?: boolean | null
          last_position_seconds?: number | null
          lesson_id: string
          updated_at?: string
          user_id: string
          watched_seconds?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          enrollment_id?: string
          id?: string
          is_completed?: boolean | null
          last_position_seconds?: number | null
          lesson_id?: string
          updated_at?: string
          user_id?: string
          watched_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "video_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      opcoes_resposta: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean | null
          option_text: string
          order_number: number
          questao_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean | null
          option_text: string
          order_number: number
          questao_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean | null
          option_text?: string
          order_number?: number
          questao_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opcoes_resposta_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      organizational_chart: {
        Row: {
          bio: string | null
          created_at: string
          department: string | null
          id: string
          is_active: boolean | null
          name: string
          order_position: number | null
          parent_id: string | null
          photo_url: string | null
          position: string
          show_in_presentation: boolean | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          department?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_position?: number | null
          parent_id?: string | null
          photo_url?: string | null
          position: string
          show_in_presentation?: boolean | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          department?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_position?: number | null
          parent_id?: string | null
          photo_url?: string | null
          position?: string
          show_in_presentation?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizational_chart_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "organizational_chart"
            referencedColumns: ["id"]
          },
        ]
      }
      presentation_views: {
        Row: {
          completed_at: string | null
          first_login_presentation_shown: boolean | null
          id: string
          is_mandatory_completed: boolean | null
          user_id: string
          viewed_at: string
        }
        Insert: {
          completed_at?: string | null
          first_login_presentation_shown?: boolean | null
          id?: string
          is_mandatory_completed?: boolean | null
          user_id: string
          viewed_at?: string
        }
        Update: {
          completed_at?: string | null
          first_login_presentation_shown?: boolean | null
          id?: string
          is_mandatory_completed?: boolean | null
          user_id?: string
          viewed_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string | null
          created_at: string | null
          created_by: string | null
          department: string | null
          email: string | null
          employee_id: string | null
          id: string
          is_active: boolean | null
          job_position: string | null
          last_login: string | null
          manager_id: string | null
          name: string
          phone: string | null
          photo_url: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          email?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          job_position?: string | null
          last_login?: string | null
          manager_id?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          email?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          job_position?: string | null
          last_login?: string | null
          manager_id?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      questoes: {
        Row: {
          created_at: string
          explanation: string | null
          id: string
          order_number: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          simulado_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          explanation?: string | null
          id?: string
          order_number: number
          question_text: string
          question_type?: Database["public"]["Enums"]["question_type"]
          simulado_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          explanation?: string | null
          id?: string
          order_number?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          simulado_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questoes_simulado_id_fkey"
            columns: ["simulado_id"]
            isOneToOne: false
            referencedRelation: "simulados"
            referencedColumns: ["id"]
          },
        ]
      }
      simulado_attempts: {
        Row: {
          completed_at: string | null
          correct_answers: number | null
          id: string
          score: number | null
          simulado_id: string | null
          started_at: string
          status: string | null
          total_questions: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number | null
          id?: string
          score?: number | null
          simulado_id?: string | null
          started_at?: string
          status?: string | null
          total_questions?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number | null
          id?: string
          score?: number | null
          simulado_id?: string | null
          started_at?: string
          status?: string | null
          total_questions?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulado_attempts_simulado_id_fkey"
            columns: ["simulado_id"]
            isOneToOne: false
            referencedRelation: "simulados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulado_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      simulado_certificates: {
        Row: {
          attempt_id: string
          certificate_url: string | null
          id: string
          issued_at: string
          pass_score: number
          score: number | null
          simulado_id: string
          user_id: string
        }
        Insert: {
          attempt_id: string
          certificate_url?: string | null
          id?: string
          issued_at?: string
          pass_score?: number
          score?: number | null
          simulado_id: string
          user_id: string
        }
        Update: {
          attempt_id?: string
          certificate_url?: string | null
          id?: string
          issued_at?: string
          pass_score?: number
          score?: number | null
          simulado_id?: string
          user_id?: string
        }
        Relationships: []
      }
      simulados: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          title: string
          total_questions: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          title: string
          total_questions?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          title?: string
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulados_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      template_courses: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          default_due_days: number | null
          id: string
          is_mandatory: boolean | null
          priority: string
          template_id: string
        }
        Insert: {
          content_id: string
          content_type?: string
          created_at?: string
          default_due_days?: number | null
          id?: string
          is_mandatory?: boolean | null
          priority?: string
          template_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          default_due_days?: number | null
          id?: string
          is_mandatory?: boolean | null
          priority?: string
          template_id?: string
        }
        Relationships: []
      }
      temporary_passwords: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_used: boolean | null
          password_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_used?: boolean | null
          password_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean | null
          password_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_answers: {
        Row: {
          answer_text: string | null
          attempt_id: string | null
          created_at: string
          id: string
          is_correct: boolean | null
          opcao_resposta_id: string | null
          questao_id: string | null
        }
        Insert: {
          answer_text?: string | null
          attempt_id?: string | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          opcao_resposta_id?: string | null
          questao_id?: string | null
        }
        Update: {
          answer_text?: string | null
          attempt_id?: string | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          opcao_resposta_id?: string | null
          questao_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "simulado_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_answers_opcao_resposta_id_fkey"
            columns: ["opcao_resposta_id"]
            isOneToOne: false
            referencedRelation: "opcoes_resposta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_answers_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_courses: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string | null
          id: string
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_levels: {
        Row: {
          courses_completed: number | null
          created_at: string
          current_level: number | null
          current_streak_days: number | null
          id: string
          last_activity_date: string | null
          longest_streak_days: number | null
          points_to_next_level: number | null
          simulados_completed: number | null
          total_points: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          courses_completed?: number | null
          created_at?: string
          current_level?: number | null
          current_streak_days?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak_days?: number | null
          points_to_next_level?: number | null
          simulados_completed?: number | null
          total_points?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          courses_completed?: number | null
          created_at?: string
          current_level?: number | null
          current_streak_days?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak_days?: number | null
          points_to_next_level?: number | null
          simulados_completed?: number | null
          total_points?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          multiplier: number | null
          points: number
          source_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          multiplier?: number | null
          points?: number
          source_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          multiplier?: number | null
          points?: number
          source_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      video_courses: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      video_lessons: {
        Row: {
          cloudflare_account_id: string | null
          cloudflare_stream_id: string | null
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_required: boolean | null
          min_watch_time_seconds: number | null
          order_number: number
          title: string
          updated_at: string
          video_type: Database["public"]["Enums"]["video_type_enum"]
          video_url: string
        }
        Insert: {
          cloudflare_account_id?: string | null
          cloudflare_stream_id?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_required?: boolean | null
          min_watch_time_seconds?: number | null
          order_number: number
          title: string
          updated_at?: string
          video_type?: Database["public"]["Enums"]["video_type_enum"]
          video_url: string
        }
        Update: {
          cloudflare_account_id?: string | null
          cloudflare_stream_id?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_required?: boolean | null
          min_watch_time_seconds?: number | null
          order_number?: number
          title?: string
          updated_at?: string
          video_type?: Database["public"]["Enums"]["video_type_enum"]
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "video_courses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_points: {
        Args: {
          p_user_id: string
          p_points: number
          p_activity_type: string
          p_source_id?: string
          p_description?: string
          p_multiplier?: number
        }
        Returns: string
      }
      apply_template_to_user: {
        Args: { p_template_id: string; p_user_id: string }
        Returns: number
      }
      can_user_take_exam: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      check_and_award_badges: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      create_user_with_profile: {
        Args:
          | {
              p_email: string
              p_password: string
              p_name: string
              p_phone?: string
              p_role?: Database["public"]["Enums"]["user_role"]
              p_department?: string
              p_job_position?: string
              p_manager_id?: string
              p_employee_id?: string
              p_start_date?: string
            }
          | {
              p_email: string
              p_password: string
              p_name: string
              p_phone?: string
              p_role?: Database["public"]["Enums"]["user_role"]
              p_department?: string
              p_job_position?: string
              p_manager_id?: string
              p_employee_id?: string
              p_start_date?: string
              p_birth_date?: string
            }
        Returns: Json
      }
      generate_demo_questions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_temporary_password: {
        Args: { p_user_id: string; p_expires_hours?: number }
        Returns: string
      }
      get_admin_users_with_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          name: string
          email: string
          phone: string
          photo_url: string
          plan_type: string
          role: string
          attempts_left: number
          created_at: string
          updated_at: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_exam_rating_stats: {
        Args: { exam_uuid: string }
        Returns: {
          average_rating: number
          total_ratings: number
          rating_distribution: Json
        }[]
      }
      get_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          name: string
          email: string
          total_points: number
          current_level: number
          courses_completed: number
          simulados_completed: number
          badge_count: number
        }[]
      }
      get_level_from_points: {
        Args: { points: number }
        Returns: number
      }
      get_moderation_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          pending_reviews: number
          pending_ratings: number
          approved_reviews: number
          approved_ratings: number
          rejected_reviews: number
          rejected_ratings: number
          flagged_reviews: number
          flagged_ratings: number
        }[]
      }
      get_pending_policies: {
        Args: { user_uuid: string }
        Returns: {
          id: string
          policy_type: string
          title: string
          content: string
          version: string
          effective_date: string
        }[]
      }
      get_points_for_level: {
        Args: { level_number: number }
        Returns: number
      }
      get_public_site_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          setting_key: string
          setting_value: Json
        }[]
      }
      get_upcoming_birthdays: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          name: string
          email: string
          department: string
          job_position: string
          birth_date: string
          photo_url: string
          days_until_birthday: number
          is_today: boolean
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_users_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          name: string
          email: string
          phone: string
          role: string
          department: string
          job_position: string
          manager_name: string
          employee_id: string
          start_date: string
          is_active: boolean
          last_login: string
          created_at: string
        }[]
      }
      has_active_subscription: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      log_audit_action: {
        Args: {
          p_action: string
          p_table_name?: string
          p_record_id?: string
          p_old_values?: Json
          p_new_values?: Json
        }
        Returns: string
      }
      process_email_template: {
        Args: { template_content: string; variables: Json }
        Returns: string
      }
      user_has_accepted_required_policies: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      user_needs_presentation: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      validate_temporary_password: {
        Args: { p_user_id: string; p_password: string }
        Returns: boolean
      }
    }
    Enums: {
      difficulty_level: "facil" | "medio" | "dificil"
      question_type:
        | "multiple_choice"
        | "multiple_answers"
        | "single_answer"
        | "drag_drop"
        | "network_topology"
        | "fill_blanks"
      user_role: "super_admin" | "admin" | "funcionario"
      video_type_enum: "youtube" | "local" | "cloudflare"
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
      difficulty_level: ["facil", "medio", "dificil"],
      question_type: [
        "multiple_choice",
        "multiple_answers",
        "single_answer",
        "drag_drop",
        "network_topology",
        "fill_blanks",
      ],
      user_role: ["super_admin", "admin", "funcionario"],
      video_type_enum: ["youtube", "local", "cloudflare"],
    },
  },
} as const
