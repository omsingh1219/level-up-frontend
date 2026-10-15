import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LevelUpData } from '@/types/levelup';

let client: SupabaseClient | null = null;

export const getSupabaseClient = (url?: string, anonKey?: string): SupabaseClient | null => {
  if (client) return client;
  if (!url || !anonKey) return null;

  try {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
      },
    });
    return client;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
};

export const resetSupabaseClient = (url?: string, anonKey?: string): SupabaseClient | null => {
  client = null;
  return getSupabaseClient(url, anonKey);
};

export const testSupabaseConnection = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
  try {
    const tempClient = createClient(url, key);
    // Simple query to verify connection
    const { error } = await tempClient.from('levelup_backups').select('id').limit(1);
    
    // If the table doesn't exist yet, that's fine - connection itself succeeded
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation') && !error.message.includes('does not exist')) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected to Supabase PostgreSQL successfully!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown connection error';
    return { success: false, message: msg };
  }
};

export const syncToSupabase = async (
  data: LevelUpData,
  url: string,
  key: string
): Promise<{ success: boolean; message: string; timestamp?: string }> => {
  try {
    const sb = getSupabaseClient(url, key);
    if (!sb) return { success: false, message: 'Invalid Supabase client credentials' };

    const timestamp = new Date().toISOString();
    const payload = {
      user_id: data.profile.id,
      profile_name: data.profile.name,
      updated_at: timestamp,
      payload: data,
    };

    // Upsert into backup store
    const { error } = await sb
      .from('levelup_backups')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      // Check if table needs to be created
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'Table "levelup_backups" does not exist in your Supabase schema yet. Create it via the SQL snippet in Settings.',
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Cloud synchronization complete!', timestamp };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Cloud sync error';
    return { success: false, message: msg };
  }
};
