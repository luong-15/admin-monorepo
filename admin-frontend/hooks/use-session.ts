import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useSupabaseSessionContext() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      setIsLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  return {
    data: {
      session,
      isLoading,
    },
  };
}
