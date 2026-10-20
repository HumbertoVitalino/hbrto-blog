import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * A Supabase client that acts as the signed-in user, so row level security sees who is asking.
 * The private tables (the habit tracker) only answer to this, never to the anonymous client.
 */
export function clientForToken(accessToken: string): SupabaseClient {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: { headers: { Authorization: `Bearer ${accessToken}` } },
            auth: { persistSession: false, autoRefreshToken: false },
        },
    );
}
