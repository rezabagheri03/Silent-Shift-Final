import { getPodcastBySlug, getRelatedPodcasts } from "@/lib/repos/podcasts";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const podcast = getPodcastBySlug((await params).slug);
  if (!podcast) return fail("پادکست پیدا نشد", 404);
  const related = getRelatedPodcasts(podcast.id, 4);
  return ok({ podcast, related });
}
