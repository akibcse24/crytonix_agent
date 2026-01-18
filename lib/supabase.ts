/**
 * Supabase Client Configuration
 * Works with both server and client components
 */

import { createClient } from '@supabase/supabase-js';

// Singleton pattern for server-side
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
    if (supabaseInstance) {
        return supabaseInstance;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    });

    return supabaseInstance;
}

// Export for convenience
export const supabase = getSupabaseClient();
