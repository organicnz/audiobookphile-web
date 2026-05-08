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
      audio_files: {
        Row: {
          id: string
          library_item_id: string
          episode_id: string | null
          storage_path: string
          filename: string
          mime_type: string
          size: number
          duration: number
          track_index: number
          bit_rate: number | null
          codec: string | null
          channels: number | null
          channel_layout: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          library_item_id: string
          episode_id?: string | null
          storage_path: string
          filename: string
          mime_type: string
          size: number
          duration: number
          track_index?: number
          bit_rate?: number | null
          codec?: string | null
          channels?: number | null
          channel_layout?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          library_item_id?: string
          episode_id?: string | null
          storage_path?: string
          filename?: string
          mime_type?: string
          size?: number
          duration?: number
          track_index?: number
          bit_rate?: number | null
          codec?: string | null
          channels?: number | null
          channel_layout?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_files_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_files_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "podcast_episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          id: string
          library_id: string
          name: string
          name_lf: string | null
          description: string | null
          image_path: string | null
          asin: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          library_id: string
          name: string
          name_lf?: string | null
          description?: string | null
          image_path?: string | null
          asin?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          library_id?: string
          name?: string
          name_lf?: string | null
          description?: string | null
          image_path?: string | null
          asin?: string | null
          created_at?: string | null
          updated_at?: string | null
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
          book_id: string
          author_id: string
        }
        Insert: {
          book_id: string
          author_id: string
        }
        Update: {
          book_id?: string
          author_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_authors_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      book_narrators: {
        Row: {
          book_id: string
          narrator_id: string
        }
        Insert: {
          book_id: string
          narrator_id: string
        }
        Update: {
          book_id?: string
          narrator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_narrators_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_narrators_narrator_id_fkey"
            columns: ["narrator_id"]
            isOneToOne: false
            referencedRelation: "narrators"
            referencedColumns: ["id"]
          },
        ]
      }
      book_series: {
        Row: {
          book_id: string
          series_id: string
          sequence: string | null
        }
        Insert: {
          book_id: string
          series_id: string
          sequence?: string | null
        }
        Update: {
          book_id?: string
          series_id?: string
          sequence?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_series_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_items"
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
      bookmarks: {
        Row: {
          id: string
          user_id: string
          library_item_id: string
          time_pos: number
          title: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          library_item_id: string
          time_pos: number
          title?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          library_item_id?: string
          time_pos?: number
          title?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          id: string
          library_item_id: string
          audio_file_id: string | null
          chapter_index: number
          title: string
          start_time: number
          end_time: number
        }
        Insert: {
          id?: string
          library_item_id: string
          audio_file_id?: string | null
          chapter_index: number
          title: string
          start_time: number
          end_time: number
        }
        Update: {
          id?: string
          library_item_id?: string
          audio_file_id?: string | null
          chapter_index?: number
          title?: string
          start_time?: number
          end_time?: number
        }
        Relationships: [
          {
            foreignKeyName: "chapters_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapters_audio_file_id_fkey"
            columns: ["audio_file_id"]
            isOneToOne: false
            referencedRelation: "audio_files"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_items: {
        Row: {
          collection_id: string
          book_id: string
          display_order: number
        }
        Insert: {
          collection_id: string
          book_id: string
          display_order?: number
        }
        Update: {
          collection_id?: string
          book_id?: string
          display_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          id: string
          library_id: string
          name: string
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          library_id: string
          name: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          library_id?: string
          name?: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      libraries: {
        Row: {
          id: string
          name: string
          media_type: string
          icon: string
          display_order: number
          settings: Json
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          media_type: string
          icon?: string
          display_order?: number
          settings?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          media_type?: string
          icon?: string
          display_order?: number
          settings?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      library_items: {
        Row: {
          id: string
          library_id: string
          media_type: string
          title: string
          subtitle: string | null
          description: string | null
          cover_path: string | null
          tags: string[]
          genres: string[]
          language: string | null
          explicit: boolean
          publisher: string | null
          published_year: string | null
          published_date: string | null
          isbn: string | null
          asin: string | null
          abridged: boolean | null
          feed_url: string | null
          image_url: string | null
          itunes_id: string | null
          auto_download_episodes: boolean | null
          auto_download_schedule: string | null
          max_episodes_to_keep: number | null
          duration: number | null
          size: number | null
          num_files: number | null
          added_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          library_id: string
          media_type: string
          title: string
          subtitle?: string | null
          description?: string | null
          cover_path?: string | null
          tags?: string[]
          genres?: string[]
          language?: string | null
          explicit?: boolean
          publisher?: string | null
          published_year?: string | null
          published_date?: string | null
          isbn?: string | null
          asin?: string | null
          abridged?: boolean | null
          feed_url?: string | null
          image_url?: string | null
          itunes_id?: string | null
          auto_download_episodes?: boolean | null
          auto_download_schedule?: string | null
          max_episodes_to_keep?: number | null
          duration?: number | null
          size?: number | null
          num_files?: number | null
          added_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          library_id?: string
          media_type?: string
          title?: string
          subtitle?: string | null
          description?: string | null
          cover_path?: string | null
          tags?: string[]
          genres?: string[]
          language?: string | null
          explicit?: boolean
          publisher?: string | null
          published_year?: string | null
          published_date?: string | null
          isbn?: string | null
          asin?: string | null
          abridged?: boolean | null
          feed_url?: string | null
          image_url?: string | null
          itunes_id?: string | null
          auto_download_episodes?: boolean | null
          auto_download_schedule?: string | null
          max_episodes_to_keep?: number | null
          duration?: number | null
          size?: number | null
          num_files?: number | null
          added_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_items_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      media_progress: {
        Row: {
          id: string
          user_id: string
          library_item_id: string
          episode_id: string | null
          current_time_pos: number
          duration: number | null
          progress: number | null
          is_finished: boolean
          last_update: string | null
        }
        Insert: {
          id?: string
          user_id: string
          library_item_id: string
          episode_id?: string | null
          current_time_pos?: number
          duration?: number | null
          progress?: number | null
          is_finished?: boolean
          last_update?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          library_item_id?: string
          episode_id?: string | null
          current_time_pos?: number
          duration?: number | null
          progress?: number | null
          is_finished?: boolean
          last_update?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_progress_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_progress_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "podcast_episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      narrators: {
        Row: {
          id: string
          library_id: string
          name: string
        }
        Insert: {
          id?: string
          library_id: string
          name: string
        }
        Update: {
          id?: string
          library_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "narrators_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_items: {
        Row: {
          id: string
          playlist_id: string
          library_item_id: string
          episode_id: string | null
          display_order: number
        }
        Insert: {
          id?: string
          playlist_id: string
          library_item_id: string
          episode_id?: string | null
          display_order?: number
        }
        Update: {
          id?: string
          playlist_id?: string
          library_item_id?: string
          episode_id?: string | null
          display_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "podcast_episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          id: string
          user_id: string
          library_id: string
          name: string
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          library_id: string
          name: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          library_id?: string
          name?: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlists_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_episodes: {
        Row: {
          id: string
          library_item_id: string
          episode_index: number | null
          season: string | null
          episode: string | null
          episode_type: string | null
          title: string
          subtitle: string | null
          description: string | null
          pub_date: string | null
          published_at: string | null
          guid: string | null
          enclosure_url: string | null
          enclosure_type: string | null
          duration: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          library_item_id: string
          episode_index?: number | null
          season?: string | null
          episode?: string | null
          episode_type?: string | null
          title: string
          subtitle?: string | null
          description?: string | null
          pub_date?: string | null
          published_at?: string | null
          guid?: string | null
          enclosure_url?: string | null
          enclosure_type?: string | null
          duration?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          library_item_id?: string
          episode_index?: number | null
          season?: string | null
          episode?: string | null
          episode_type?: string | null
          title?: string
          subtitle?: string | null
          description?: string | null
          pub_date?: string | null
          published_at?: string | null
          guid?: string | null
          enclosure_url?: string | null
          enclosure_type?: string | null
          duration?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_episodes_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          user_type: string
          language: string
          theme: string
          default_library_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          user_type?: string
          language?: string
          theme?: string
          default_library_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          user_type?: string
          language?: string
          theme?: string
          default_library_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_library_id_fkey"
            columns: ["default_library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      series: {
        Row: {
          id: string
          library_id: string
          name: string
          name_ignore_prefix: string | null
          description: string | null
          cover_path: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          library_id: string
          name: string
          name_ignore_prefix?: string | null
          description?: string | null
          cover_path?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          library_id?: string
          name?: string
          name_ignore_prefix?: string | null
          description?: string | null
          cover_path?: string | null
          created_at?: string | null
          updated_at?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_library_items: {
        Args: {
          p_library_id: string
          p_query: string
          p_limit?: number
        }
        Returns: {
          id: string
          title: string
          media_type: string
          cover_path: string | null
          author_names: string[] | null
          series_names: string[] | null
          rank: number
        }[]
      }
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
