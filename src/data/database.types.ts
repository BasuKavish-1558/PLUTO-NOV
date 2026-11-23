export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      body_vitals: {
        Row: {
          created_at: string
          height_cm: number | null
          id: string
          measured_on: string
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          height_cm?: number | null
          id?: string
          measured_on: string
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          height_cm?: number | null
          id?: string
          measured_on?: string
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          dedupe_key: string | null
          id: string
          payload: NonNullable<Json>
          received_at: string
          type: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          created_at: string
          dedupe_key?: string | null
          id?: string
          payload?: NonNullable<Json>
          received_at?: string
          type: string
          user_id?: string
        }
        Update: {
          created_at?: string
          dedupe_key?: string | null
          id?: string
          payload?: NonNullable<Json>
          received_at?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          archived_at: string | null
          created_at: string
          equipment: string
          id: string
          is_custom: boolean | null
          muscle_group_id: string
          name: string
          secondary_muscles: string[]
          slug: string | null
          updated_at: string
          user_id: string | null
        }
        ComputedFields: never
        Insert: {
          archived_at?: string | null
          created_at?: string
          equipment: string
          id?: string
          is_custom?: never
          muscle_group_id: string
          name: string
          secondary_muscles?: string[]
          slug?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          equipment?: string
          id?: string
          is_custom?: never
          muscle_group_id?: string
          name?: string
          secondary_muscles?: string[]
          slug?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'exercises_muscle_group_id_fkey'
            columns: ['muscle_group_id']
            isOneToOne: false
            referencedRelation: 'muscle_groups'
            referencedColumns: ['id']
          },
        ]
      }
      muscle_groups: {
        Row: {
          id: string
          name: string
          sort_order: number
        }
        ComputedFields: never
        Insert: {
          id: string
          name: string
          sort_order: number
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      nutrition_entries: {
        Row: {
          amount: number
          created_at: string
          entry_date: string
          id: string
          label: string | null
          nutrient: string
          updated_at: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          amount: number
          created_at?: string
          entry_date: string
          id?: string
          label?: string | null
          nutrient: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          entry_date?: string
          id?: string
          label?: string | null
          nutrient?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrition_goals: {
        Row: {
          created_at: string
          effective_from: string
          goal_type: string | null
          id: string
          multiplier: number | null
          nutrient: string
          target: number | null
          updated_at: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          effective_from: string
          goal_type?: string | null
          id?: string
          multiplier?: number | null
          nutrient: string
          target?: number | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          effective_from?: string
          goal_type?: string | null
          id?: string
          multiplier?: number | null
          nutrient?: string
          target?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          logged_at: string
          logged_on: string
          note: string | null
          photo_path: string | null
          pr_type: string
          reps: number
          updated_at: string
          user_id: string
          weight_kg: number
          workout_id: string | null
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          logged_at: string
          logged_on: string
          note?: string | null
          photo_path?: string | null
          pr_type: string
          reps: number
          updated_at?: string
          user_id?: string
          weight_kg: number
          workout_id?: string | null
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          logged_at?: string
          logged_on?: string
          note?: string | null
          photo_path?: string | null
          pr_type?: string
          reps?: number
          updated_at?: string
          user_id?: string
          weight_kg?: number
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'personal_records_exercise_id_fkey'
            columns: ['exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'personal_records_workout_id_user_id_fkey'
            columns: ['workout_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'workouts'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_path: string | null
          created_at: string
          display_name: string | null
          height_unit: string
          id: string
          onboarded_at: string | null
          show_bmi: boolean
          theme_pref: string
          updated_at: string
          weight_unit: string
        }
        ComputedFields: never
        Insert: {
          age?: number | null
          avatar_path?: string | null
          created_at?: string
          display_name?: string | null
          height_unit?: string
          id: string
          onboarded_at?: string | null
          show_bmi?: boolean
          theme_pref?: string
          updated_at?: string
          weight_unit?: string
        }
        Update: {
          age?: number | null
          avatar_path?: string | null
          created_at?: string
          display_name?: string | null
          height_unit?: string
          id?: string
          onboarded_at?: string | null
          show_bmi?: boolean
          theme_pref?: string
          updated_at?: string
          weight_unit?: string
        }
        Relationships: []
      }
      set_logs: {
        Row: {
          created_at: string
          id: string
          is_warmup: boolean
          logged_at: string
          reps: number
          set_number: number
          updated_at: string
          user_id: string
          weight_kg: number
          workout_exercise_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          id?: string
          is_warmup?: boolean
          logged_at?: string
          reps: number
          set_number: number
          updated_at?: string
          user_id?: string
          weight_kg: number
          workout_exercise_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_warmup?: boolean
          logged_at?: string
          reps?: number
          set_number?: number
          updated_at?: string
          user_id?: string
          weight_kg?: number
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'set_logs_workout_exercise_id_user_id_fkey'
            columns: ['workout_exercise_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'workout_exercises'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      split_day_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          position: number
          split_day_id: string
          target_reps_max: number | null
          target_reps_min: number | null
          target_sets: number | null
          updated_at: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          position: number
          split_day_id: string
          target_reps_max?: number | null
          target_reps_min?: number | null
          target_sets?: number | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          position?: number
          split_day_id?: string
          target_reps_max?: number | null
          target_reps_min?: number | null
          target_sets?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'split_day_exercises_exercise_id_fkey'
            columns: ['exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'split_day_exercises_split_day_id_user_id_fkey'
            columns: ['split_day_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'split_days'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      split_days: {
        Row: {
          created_at: string
          id: string
          is_rest: boolean
          label: string | null
          split_id: string
          updated_at: string
          user_id: string
          weekday: number
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          id?: string
          is_rest?: boolean
          label?: string | null
          split_id: string
          updated_at?: string
          user_id?: string
          weekday: number
        }
        Update: {
          created_at?: string
          id?: string
          is_rest?: boolean
          label?: string | null
          split_id?: string
          updated_at?: string
          user_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: 'split_days_split_id_user_id_fkey'
            columns: ['split_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'splits'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      splits: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          preset_key: string | null
          updated_at: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          preset_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          preset_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sync_tombstones: {
        Row: {
          deleted_at: string
          id: number
          row_id: string
          table_name: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          deleted_at?: string
          id?: never
          row_id: string
          table_name: string
          user_id: string
        }
        Update: {
          deleted_at?: string
          id?: never
          row_id?: string
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          position: number
          updated_at: string
          user_id: string
          workout_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          position: number
          updated_at?: string
          user_id?: string
          workout_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          position?: number
          updated_at?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'workout_exercises_exercise_id_fkey'
            columns: ['exercise_id']
            isOneToOne: false
            referencedRelation: 'exercises'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'workout_exercises_workout_id_user_id_fkey'
            columns: ['workout_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'workouts'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      workout_photos: {
        Row: {
          created_at: string
          id: string
          storage_path: string
          user_id: string
          workout_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          id?: string
          storage_path: string
          user_id?: string
          workout_id: string
        }
        Update: {
          created_at?: string
          id?: string
          storage_path?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'workout_photos_workout_id_user_id_fkey'
            columns: ['workout_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'workouts'
            referencedColumns: ['id', 'user_id']
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          notes: string | null
          split_day_id: string | null
          split_day_label: string | null
          started_at: string
          updated_at: string
          user_id: string
          workout_date: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          split_day_id?: string | null
          split_day_label?: string | null
          started_at: string
          updated_at?: string
          user_id?: string
          workout_date: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          split_day_id?: string | null
          split_day_label?: string | null
          started_at?: string
          updated_at?: string
          user_id?: string
          workout_date?: string
        }
        Relationships: [
          {
            foreignKeyName: 'workouts_split_day_id_user_id_fkey'
            columns: ['split_day_id', 'user_id']
            isOneToOne: false
            referencedRelation: 'split_days'
            referencedColumns: ['id', 'user_id']
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
