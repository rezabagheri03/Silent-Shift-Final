import { NextRequest, NextResponse } from "next/server";
import { verifySessionEdge } from "@/lib/auth-edge";

function withSecurityHeaders(res: NextResponse, pathname: string) {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  const development = process.env.NODE_ENV !== "production";
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "media-src 'self' data: blob: https:",
      `connect-src 'self' https:${development ? " ws: wss:" : ""}`,
      "worker-src 'self' blob:",
    ].join("; ")
  );
  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return res;
}

function isSameOriginMutation(req: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return true;
  const protectedMutation =
    req.nextUrl.pathname.startsWith("/api/admin") ||
    req.nextUrl.pathname === "/api/uploads" ||
    req.nextUrl.pathname.startsWith("/api/auth/");
  if (!protectedMutation) return true;

  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const requestHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host;
    return new URL(origin).host === requestHost;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // In production, redirect plain HTTP to HTTPS (unless behind a TLS-terminating
  // proxy that already handles this — detected via x-forwarded-proto header).
  if (process.env.NODE_ENV === "production") {
    const proto = req.headers.get("x-forwarded-proto");
    const isBehindCloudflare = !!req.headers.get("cf-connecting-ip");
    if (proto && proto === "http" && !isBehindCloudflare) {
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host;
      const url = new URL(`https://${host}${pathname}${req.nextUrl.search}`);
      return withSecurityHeaders(NextResponse.redirect(url), pathname);
    }
  }

  if (!isSameOriginMutation(req)) {
    return withSecurityHeaders(
      NextResponse.json({ ok: false, error: "Cross-origin request rejected" }, { status: 403 }),
      pathname
    );
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get("ss_admin")?.value;
    const session = token ? await verifySessionEdge(token) : null;
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return withSecurityHeaders(NextResponse.redirect(url), pathname);
    }
  }

  return withSecurityHeaders(NextResponse.next(), pathname);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|audio-sample).*)"],
};
