export type Json =
  | string
  | number
  | boolean
  | null
  | {[key: string]: Json | undefined}
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'admin' | 'editor';
          created_at: string;
        };
        Insert: {
          id: string;
          role: 'admin' | 'editor';
          created_at?: string;
        };
        Update: {
          role?: 'admin' | 'editor';
          created_at?: string;
        };
        Relationships: [];
      };
      assets: {
        Row: {
          id: string;
          entity_type: 'model' | 'creator' | 'influencer';
          document_id: string;
          title: string;
          description: string | null;
          category: string | null;
          model_type: string | null;
          creator_direction: string | null;
          influencer_topic: string | null;
          influencer_platforms: string | null;
          license_type: string | null;
          status: string | null;
          measurements: Json | null;
          details: Json | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_type?: 'model' | 'creator' | 'influencer';
          document_id: string;
          title: string;
          description?: string | null;
          category?: string | null;
          model_type?: string | null;
          creator_direction?: string | null;
          influencer_topic?: string | null;
          influencer_platforms?: string | null;
          license_type?: string | null;
          status?: string | null;
          measurements?: Json | null;
          details?: Json | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          entity_type?: 'model' | 'creator' | 'influencer';
          document_id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          model_type?: string | null;
          creator_direction?: string | null;
          influencer_topic?: string | null;
          influencer_platforms?: string | null;
          license_type?: string | null;
          status?: string | null;
          measurements?: Json | null;
          details?: Json | null;
          is_published?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      asset_media: {
        Row: {
          id: string;
          asset_id: string;
          path: string;
          kind: 'hero' | 'gallery';
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          asset_id: string;
          path: string;
          kind: 'hero' | 'gallery';
          order_index?: number;
          created_at?: string;
        };
        Update: {
          path?: string;
          kind?: 'hero' | 'gallery';
          order_index?: number;
        };
        Relationships: [];
      };
      settings_marquee: {
        Row: {
          id: number;
          enabled: boolean;
          text_ru: string;
          text_en: string;
          speed: number | null;
          direction: string | null;
        };
        Insert: {
          id: number;
          enabled?: boolean;
          text_ru?: string;
          text_en?: string;
          speed?: number | null;
          direction?: string | null;
        };
        Update: {
          enabled?: boolean;
          text_ru?: string;
          text_en?: string;
          speed?: number | null;
          direction?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
