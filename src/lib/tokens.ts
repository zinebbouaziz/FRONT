import { supabase } from '@/lib/supabaseClient';

let cachedToken: string | null = null;
let fetching: Promise<string | null> | null = null;

/**
 * Returns the current Supabase JWT.
 * Reuses a cached token if available, otherwise calls getSession() once.
 * Multiple concurrent calls will share the same underlying promise.
 */
export async function getAccessToken(): Promise<string | null> {
  // If we already have a valid token, return it immediately.
  // (You can also add an expiration check here.)
  if (cachedToken) return cachedToken;

  // If a fetch is already in progress, wait for it. 
  if (fetching) return fetching;

  fetching = (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? null;
    cachedToken = token;
    fetching = null;
    return token;
  })();

  return fetching;
}

/** Clears the cached token (e.g., on sign out). */
export function clearCachedToken(): void {
  cachedToken = null;
}