import { NextRequest } from "next/server";
import { ok, fail, parsePagination } from "@/lib/http";
import { isAdmin } from "@/lib/auth";
import { listContactMessages } from "@/lib/repos/contact";
import { listSubscribers } from "@/lib/repos/newsletter";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await isAdmin();
  if (!session) return fail("Unauthorized", 401);

  const { searchParams } = req.nextUrl;
  const { page, limit } = parsePagination(searchParams);
  // Cap at 200 per page to prevent memory exhaustion
  const safeLimit = Math.min(limit, 200);

  const contact = listContactMessages(safeLimit);
  const subscribers = listSubscribers(safeLimit);

  const contactTotal = (db.prepare("SELECT COUNT(*) AS n FROM contact_messages").get() as { n: number }).n;
  const subscriberTotal = (db.prepare("SELECT COUNT(*) AS n FROM newsletter_subscribers").get() as { n: number }).n;

  return ok({
    contact,
    subscribers,
    pagination: {
      page,
      limit: safeLimit,
      contact_total: contactTotal,
      subscriber_total: subscriberTotal,
    },
  });
}
