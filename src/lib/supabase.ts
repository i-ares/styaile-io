import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name?: string;
          avatar?: string;
          preferences: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string;
          avatar?: string;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar?: string;
          preferences?: any;
          updated_at?: string;
        };
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          products: any;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          products?: any;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          products?: any;
          is_public?: boolean;
          updated_at?: string;
        };
      };
      shopping_sessions: {
        Row: {
          id: string;
          user_id?: string;
          current_product?: any;
          browsed_products: any;
          recommendations: any;
          start_time: string;
          platform: string;
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          current_product?: any;
          browsed_products?: any;
          recommendations?: any;
          start_time?: string;
          platform: string;
          url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_product?: any;
          browsed_products?: any;
          recommendations?: any;
          start_time?: string;
          platform?: string;
          url?: string;
        };
      };
    };
  };
}