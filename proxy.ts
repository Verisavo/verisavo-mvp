import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { authCookieOptions, supabaseConfigured } from "@/lib/server/auth-cookies";

// Pages for signed-in users only
const PRIVATE = ["/assistant", "/dashboard", "/admin"];

// Runs before matching requests. It refreshes the Supabase session cookie when the access token has expired,
// and sends signed-out visitors away from private pages. This is only a first, optimistic check:
// every page, route and action checks the session again itself.
export async function proxy(request: NextRequest) {
  if (!supabaseConfigured()) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    cookieOptions: authCookieOptions,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      }
    }
  });

  const { data } = await supabase.auth.getClaims();
  const { pathname } = request.nextUrl;
  if (!data?.claims && PRIVATE.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/platform#signin", request.url));
  }
  return response;
}

export const config = {
  // everything except static files and the webhooks, which never carry a user session
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health|api/stripe/webhook|api/whatsapp/webhook|.*\\.(?:mp3|png|jpg|jpeg|gif|svg|webp|ico)$).*)"]
};
