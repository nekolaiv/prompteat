import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in Client Components
 * Uses browser storage for session management
 */
export function createClientComponentClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
