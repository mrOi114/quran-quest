/**
 * Supabase Database types for Feature 001 auth.
 * Regenerate with `supabase gen types typescript` when the remote schema changes.
 */
export type Json =
  string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProfileRole = 'adult' | 'parent' | 'child';

export type Profile = {
  id: string;
  role: ProfileRole;
  email: string | null;
  display_name: string;
  age: number | null;
  avatar_key: string;
  country_code: string;
  preferred_language: string;
  parent_id: string | null;
  pin_hash: string | null;
  pin_failed_attempts: number;
  pin_locked_until: string | null;
  created_at: string;
  updated_at: string;
};

export type ApprovedDevice = {
  id: string;
  parent_id: string;
  device_key: string;
  label: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id?: string;
          role: ProfileRole;
          email?: string | null;
          display_name: string;
          age?: number | null;
          avatar_key?: string;
          country_code?: string;
          preferred_language?: string;
          parent_id?: string | null;
          pin_hash?: string | null;
          pin_failed_attempts?: number;
          pin_locked_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: ProfileRole;
          email?: string | null;
          display_name?: string;
          age?: number | null;
          avatar_key?: string;
          country_code?: string;
          preferred_language?: string;
          parent_id?: string | null;
          pin_hash?: string | null;
          pin_failed_attempts?: number;
          pin_locked_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      approved_devices: {
        Row: ApprovedDevice;
        Insert: {
          id?: string;
          parent_id: string;
          device_key: string;
          label?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string;
          device_key?: string;
          label?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      set_child_pin_hash: {
        Args: { p_child_id: string; p_pin_hash: string };
        Returns: undefined;
      };
      record_pin_failure: {
        Args: {
          p_child_id: string;
          p_max_attempts?: number;
          p_lock_minutes?: number;
        };
        Returns: { failed_attempts: number; locked_until: string | null }[];
      };
      clear_pin_failures: {
        Args: { p_child_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      profile_role: ProfileRole;
    };
  };
};
