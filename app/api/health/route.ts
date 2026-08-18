import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { db } = await import("@/lib/db");
    db.prepare("SELECT 1").get();
    return ok({ status: "healthy", db: true, time: new Date().toISOString() });
  } catch {
    return fail("unhealthy", 503, { db: false });
  }
}
