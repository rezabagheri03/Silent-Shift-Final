import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { cookies } from "next/headers";

const COOKIE_NAME = "ss_admin";
const COOKIE_MAX_AGE = 60 * 60 * 8;
const ISSUER = "silent-shift";
const AUDIENCE = "silent-shift-admin";

function getSecret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error(
      "AUTH_SECRET environment variable is required. Generate one with: openssl rand -base64 48"
    );
  }
  if (value.length < 32) throw new Error("AUTH_SECRET must be at least 32 characters");
  return new TextEncoder().encode(value);
}

export type Session = { sub: string; uid: number };

export async function signSession(session: Session): Promise<string> {
  return new SignJWT({ uid: session.uid })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (!payload.sub || typeof payload.uid !== "number") return null;

    // Check if this session was issued before a revocation timestamp
    const { db } = await import("@/lib/db");
    const row = db
      .prepare("SELECT revoked_before FROM session_revocations WHERE admin_id = ?")
      .get(payload.uid) as { revoked_before: string } | undefined;
    if (row?.revoked_before && payload.iat) {
      const revokedAt = Math.floor(new Date(row.revoked_before).getTime() / 1000);
      // Use <= so tokens issued in the same second as revocation are also rejected
      // (JWT iat has only second-level precision)
      if (payload.iat <= revokedAt) return null;
    }

    return { sub: String(payload.sub), uid: payload.uid };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // Expire immediately — more reliable than delete() across browsers/proxies
  });
}

/**
 * Record a revocation timestamp for the given admin.
 * All JWTs issued before this moment become invalid.
 */
export async function revokeSession(adminId: number): Promise<void> {
  const { db } = await import("@/lib/db");
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO session_revocations (admin_id, revoked_before) VALUES (@id, @now)
     ON CONFLICT(admin_id) DO UPDATE SET revoked_before = @now`
  ).run({ id: adminId, now });
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return value ? verifySession(value) : null;
}

export async function isAdmin(): Promise<Session | null> {
  return getSession();
}

export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<{ uid: number; username: string } | null> {
  const { db } = await import("@/lib/db");
  const bcrypt = (await import("bcryptjs")).default;
  const row = db
    .prepare("SELECT id, username, password_hash FROM admins WHERE username = ?")
    .get(username.trim().toLowerCase()) as
    | { id: number; username: string; password_hash: string }
    | undefined;
  if (!row) return null;
  const valid = await bcrypt.compare(password, row.password_hash);
  return valid ? { uid: row.id, username: row.username } : null;
}

export async function ensureBootstrapAdmin(): Promise<void> {
  const { db } = await import("@/lib/db");
  const count = (db.prepare("SELECT COUNT(*) AS n FROM admins").get() as { n: number }).n;
  if (count > 0) return;

  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "ADMIN_USERNAME and ADMIN_PASSWORD environment variables are required to create the initial admin account"
    );
  }

  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters");
  }

  const bcrypt = (await import("bcryptjs")).default;
  const hash = await bcrypt.hash(password, 12);
  db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run(username, hash);
  console.log(`[auth] bootstrap admin created: ${username}`);
}
