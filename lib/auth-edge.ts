import { jwtVerify } from "jose/jwt/verify";

export type Session = { sub: string; uid: number };

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

export async function verifySessionEdge(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (!payload.sub || typeof payload.uid !== "number") return null;
    return { sub: String(payload.sub), uid: payload.uid };
  } catch {
    return null;
  }
}
