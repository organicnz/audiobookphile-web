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
      authors: {
        Row: {
          asin: string | null
          created_at: string
          description: string | null
          id: string
          image_path: string | null
          last_first: string | null
          library_id: string | null
          name: string | null
          updated_at: string
        }
        Insert: {
          asin?: string | null
          created_at?: string
          description?: string | null
          id: string
          image_path?: string | null
          last_first?: string | null
          library_id?: string | null
          name?: string | null
          updated_at?: string
        }
        Update: {
          asin?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          last_first?: string | null
          library_id?: string | null
          name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "authors_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      book_authors: {
        Row: {
          author_id: string
          book_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          author_id: string
          book_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          author_id?: string
          book_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_authors_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_series: {
        Row: {
          book_id: string
          created_at: string | null
          id: string
          sequence: string | null
          series_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          id?: string
          sequence?: string | null
          series_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          id?: string
          sequence?: string | null
          series_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_series_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_series_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          abridged: boolean | null
          asin: string | null
          audio_files: Json | null
          chapters: Json | null
          cover_path: string | null
          created_at: string
          description: string | null
          duration: number | null
          ebook_file: Json | null
          explicit: boolean | null
          genres: Json | null
          id: string
          isbn: string | null
          language: string | null
          narrators: Json | null
          published_date: string | null
          published_year: string | null
          publisher: string | null
          subtitle: string | null
          tags: Json | null
          title: string | null
          updated_at: string
        }
        Insert: {
          abridged?: boolean | null
          asin?: string | null
          audio_files?: Json | null
          chapters?: Json | null
          cover_path?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          ebook_file?: Json | null
          explicit?: boolean | null
          genres?: Json | null
          id: string
          isbn?: string | null
          language?: string | null
          narrators?: Json | null
          published_date?: string | null
          published_year?: string | null
          publisher?: string | null
          subtitle?: string | null
          tags?: Json | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          abridged?: boolean | null
          asin?: string | null
          audio_files?: Json | null
          chapters?: Json | null
          cover_path?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          ebook_file?: Json | null
          explicit?: boolean | null
          genres?: Json | null
          id?: string
          isbn?: string | null
          language?: string | null
          narrators?: Json | null
          published_date?: string | null
          published_year?: string | null
          publisher?: string | null
          subtitle?: string | null
          tags?: Json | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      legacy_users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          permissions: Json | null
          updated_at: string
          user_type: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          is_active?: boolean | null
          permissions?: Json | null
          updated_at?: string
          user_type?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          updated_at?: string
          user_type?: string | null
          username?: string | null
        }
        Relationships: []
      }
      libraries: {
        Row: {
          created_at: string
          display_order: number | null
          extra_data: Json | null
          icon: string | null
          id: string
          media_type: string | null
          name: string
          provider: string | null
          settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          extra_data?: Json | null
          icon?: string | null
          id: string
          media_type?: string | null
          name: string
          provider?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          extra_data?: Json | null
          icon?: string | null
          id?: string
          media_type?: string | null
          name?: string
          provider?: string | null
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      library_items: {
        Row: {
          author_names_first_last: string | null
          author_names_last_first: string | null
          birthtime: string | null
          created_at: string
          ctime: string | null
          extra_data: Json | null
          id: string
          ino: string | null
          is_file: boolean | null
          is_invalid: boolean | null
          is_missing: boolean | null
          last_scan: string | null
          last_scan_version: string | null
          library_files: Json | null
          library_id: string | null
          media_id: string | null
          media_type: string | null
          mtime: string | null
          path: string | null
          rel_path: string | null
          size: number | null
          title: string | null
          title_ignore_prefix: string | null
          updated_at: string
        }
        Insert: {
          author_names_first_last?: string | null
          author_names_last_first?: string | null
          birthtime?: string | null
          created_at?: string
          ctime?: string | null
          extra_data?: Json | null
          id: string
          ino?: string | null
          is_file?: boolean | null
          is_invalid?: boolean | null
          is_missing?: boolean | null
          last_scan?: string | null
          last_scan_version?: string | null
          library_files?: Json | null
          library_id?: string | null
          media_id?: string | null
          media_type?: string | null
          mtime?: string | null
          path?: string | null
          rel_path?: string | null
          size?: number | null
          title?: string | null
          title_ignore_prefix?: string | null
          updated_at?: string
        }
        Update: {
          author_names_first_last?: string | null
          author_names_last_first?: string | null
          birthtime?: string | null
          created_at?: string
          ctime?: string | null
          extra_data?: Json | null
          id?: string
          ino?: string | null
          is_file?: boolean | null
          is_invalid?: boolean | null
          is_missing?: boolean | null
          last_scan?: string | null
          last_scan_version?: string | null
          library_files?: Json | null
          library_id?: string | null
          media_id?: string | null
          media_type?: string | null
          mtime?: string | null
          path?: string | null
          rel_path?: string | null
          size?: number | null
          title?: string | null
          title_ignore_prefix?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_items_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_items_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      media_progress: {
        Row: {
          current_time_pos: number | null
          duration: number | null
          episode_id: string | null
          id: string
          is_finished: boolean | null
          last_update: string | null
          library_item_id: string
          progress: number | null
          user_id: string
        }
        Insert: {
          current_time_pos?: number | null
          duration?: number | null
          episode_id?: string | null
          id?: string
          is_finished?: boolean | null
          last_update?: string | null
          library_item_id: string
          progress?: number | null
          user_id: string
        }
        Update: {
          current_time_pos?: number | null
          duration?: number | null
          episode_id?: string | null
          id?: string
          is_finished?: boolean | null
          last_update?: string | null
          library_item_id?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: []
      }
      playback_sessions: {
        Row: {
          cover_path: string | null
          created_at: string
          current_time_pos: number | null
          day_of_week: string | null
          display_author: string | null
          display_title: string | null
          duration: number | null
          extra_data: Json | null
          id: string
          library_id: string | null
          media_item_id: string | null
          media_item_type: string | null
          media_metadata: Json | null
          media_player: string | null
          play_method: number | null
          server_version: string | null
          session_date: string | null
          start_time_pos: number | null
          time_listening: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cover_path?: string | null
          created_at?: string
          current_time_pos?: number | null
          day_of_week?: string | null
          display_author?: string | null
          display_title?: string | null
          duration?: number | null
          extra_data?: Json | null
          id: string
          library_id?: string | null
          media_item_id?: string | null
          media_item_type?: string | null
          media_metadata?: Json | null
          media_player?: string | null
          play_method?: number | null
          server_version?: string | null
          session_date?: string | null
          start_time_pos?: number | null
          time_listening?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cover_path?: string | null
          created_at?: string
          current_time_pos?: number | null
          day_of_week?: string | null
          display_author?: string | null
          display_title?: string | null
          duration?: number | null
          extra_data?: Json | null
          id?: string
          library_id?: string | null
          media_item_id?: string | null
          media_item_type?: string | null
          media_metadata?: Json | null
          media_player?: string | null
          play_method?: number | null
          server_version?: string | null
          session_date?: string | null
          start_time_pos?: number | null
          time_listening?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playback_sessions_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_type: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          updated_at?: string | null
          user_type?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_type?: string | null
          username?: string | null
        }
        Relationships: []
      }
      series: {
        Row: {
          created_at: string
          description: string | null
          id: string
          library_id: string | null
          name: string | null
          name_ignore_prefix: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          library_id?: string | null
          name?: string | null
          name_ignore_prefix?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          library_id?: string | null
          name?: string | null
          name_ignore_prefix?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      server_settings: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: Json | null
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
    Enums: {},
  },
} as const
