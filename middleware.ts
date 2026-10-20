import { NextRequest, NextResponse } from "next/server";
import { verifySessionEdge } from "@/lib/auth-edge";

const FONT_PRELOADS = [
  '</fonts/IRANYekanXFaNum-Regular.woff2>; rel=preload; as=font; type="font/woff2"; crossorigin',
  '</fonts/IRANYekanXFaNum-Bold.woff2>; rel=preload; as=font; type="font/woff2"; crossorigin',
].join(", ");

function isMarkdownRequest(req: NextRequest) {
  return req.method === "GET" && /\btext\/markdown\b/i.test(req.headers.get("accept") || "");
}

function isDocumentRequest(req: NextRequest) {
  if (req.method !== "GET" && req.method !== "HEAD") return false;
  const accept = req.headers.get("accept") || "";
  return accept.includes("text/html") || req.headers.get("rsc") === "1" || req.nextUrl.searchParams.has("_rsc");
}

function appendVary(res: NextResponse, values: string[]) {
  const current = (res.headers.get("Vary") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const merged = Array.from(new Set([...current, ...values]));
  res.headers.set("Vary", merged.join(", "));
}

function withSecurityHeaders(res: NextResponse, req: NextRequest) {
  const pathname = req.nextUrl.pathname;
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
  if (!pathname.startsWith("/api")) {
    res.headers.set("Content-Language", "fa-IR");
    if (isDocumentRequest(req)) {
      // Next marks dynamic HTML "private, no-store", but Cloudflare ignored it and
      // cached the shared HTML. These explicit CDN headers keep Cloudflare out.
      res.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
      res.headers.set("CDN-Cache-Control", "no-store");
      res.headers.set("Cloudflare-CDN-Cache-Control", "no-store");
      appendVary(res, ["Accept", "RSC", "Next-Router-State-Tree", "Next-Router-Prefetch"]);
      const existingLink = res.headers.get("Link");
      res.headers.set("Link", existingLink ? `${existingLink}, ${FONT_PRELOADS}` : FONT_PRELOADS);
    } else if (isMarkdownRequest(req)) {
      appendVary(res, ["Accept"]);
    }
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
  const hasFileExtension = /\.[a-z0-9]+$/i.test(pathname);

  // In production, redirect plain HTTP to HTTPS (unless behind a TLS-terminating
  // proxy that already handles this — detected via x-forwarded-proto header).
  if (process.env.NODE_ENV === "production") {
    const proto = req.headers.get("x-forwarded-proto");
    const isBehindCloudflare = !!req.headers.get("cf-connecting-ip");
    if (proto && proto === "http" && !isBehindCloudflare && pathname !== "/api/health") {
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host;
      const url = new URL(`https://${host}${pathname}${req.nextUrl.search}`);
      return withSecurityHeaders(NextResponse.redirect(url), req);
    }
  }

  if (!isSameOriginMutation(req)) {
    return withSecurityHeaders(
      NextResponse.json({ ok: false, error: "Cross-origin request rejected" }, { status: 403 }),
      req
    );
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get("ss_admin")?.value;
    const session = token ? await verifySessionEdge(token) : null;
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return withSecurityHeaders(NextResponse.redirect(url), req);
    }
  }

  // One canonical slug casing: /Podcasts/Foo → 301 /podcasts/foo.
  if (
    pathname !== pathname.toLowerCase() &&
    !hasFileExtension &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next")
  ) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return withSecurityHeaders(NextResponse.redirect(url, 301), req);
  }

  // Markdown for agents: same URL, text/markdown body.
  if (isMarkdownRequest(req) && !pathname.startsWith("/md") && !pathname.startsWith("/api") && !pathname.startsWith("/admin") && !hasFileExtension) {
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? "/md" : `/md${pathname}`;
    return withSecurityHeaders(NextResponse.rewrite(url), req);
  }

  return withSecurityHeaders(NextResponse.next(), req);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|audio-sample).*)"],
};
