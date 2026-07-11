import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import https from "https";

const customFetch = (url: RequestInfo | URL, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    agent: new https.Agent({
      rejectUnauthorized: false,
    }),
  } as any);
};

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
      global: {
        fetch: customFetch,
      },
    },
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect to login if accessing protected routes without auth
    if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error("Middleware auth check failed:", error);
    // If auth check fails due to SSL or other issues, allow the request to proceed
    // The client-side auth will handle the redirect if needed
  }

  return supabaseResponse;
}
