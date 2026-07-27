import { ok } from "@/lib/http";

export async function GET() {
  return ok({ status: "healthy", time: new Date().toISOString() });
}
