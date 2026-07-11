import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import https from "https";

const customFetch = (url: RequestInfo | URL, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    agent: new https.Agent({
      rejectUnauthorized: false,
    }),
  } as any);
};

export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: customFetch,
      },
      auth: {
        persistSession: true,
        detectSessionInUrl: false,
      },
    },
  );
}

export function createClient() {
  return createBrowserClient();
}
