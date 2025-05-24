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
      bowlerprofiles: {
        Row: {
          created_at: string
          email_address: string | null
          first_name: string | null
          id: number
          last_name: string | null
          phone_number: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_address?: string | null
          first_name?: string | null
          id?: number
          last_name?: string | null
          phone_number?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_address?: string | null
          first_name?: string | null
          id?: number
          last_name?: string | null
          phone_number?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      bowling_frames: {
        Row: {
          ball1_pins: number | null
          ball2_pins: number | null
          ball3_pins: number | null
          created_at: string
          frame_number: number
          game_id: string
          id: string
          score: number | null
          updated_at: string
        }
        Insert: {
          ball1_pins?: number | null
          ball2_pins?: number | null
          ball3_pins?: number | null
          created_at?: string
          frame_number: number
          game_id: string
          id?: string
          score?: number | null
          updated_at?: string
        }
        Update: {
          ball1_pins?: number | null
          ball2_pins?: number | null
          ball3_pins?: number | null
          created_at?: string
          frame_number?: number
          game_id?: string
          id?: string
          score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bowling_frames_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "bowling_games"
            referencedColumns: ["id"]
          },
        ]
      }
      bowling_game_sessions: {
        Row: {
          created_at: string
          id: string
          title: string
          total_games: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          total_games: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          total_games?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bowling_games: {
        Row: {
          created_at: string
          game_number: number
          id: string
          is_complete: boolean
          session_id: string
          total_score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          game_number: number
          id?: string
          is_complete?: boolean
          session_id: string
          total_score?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          game_number?: number
          id?: string
          is_complete?: boolean
          session_id?: string
          total_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bowling_games_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "bowling_game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bowling_stats: {
        Row: {
          average_score: number
          games_played: number
          highest_score: number | null
          id: string
          lowest_score: number | null
          total_spares: number
          total_strikes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_score?: number
          games_played?: number
          highest_score?: number | null
          id?: string
          lowest_score?: number | null
          total_spares?: number
          total_strikes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_score?: number
          games_played?: number
          highest_score?: number | null
          id?: string
          lowest_score?: number | null
          total_spares?: number
          total_strikes?: number
          updated_at?: string
          user_id?: string
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
