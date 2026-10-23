import { z } from "zod";
import { search } from "@/lib/search";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const Body = z.object({ q: z.string().trim().min(2).max(300), locale: z.enum(["hu", "en"]) });

/** FAQ assistant: keyword retrieval over the site's own content (no LLM, no cost, no data leaves the site). */
export async function POST(req: Request) {
  const limited = await rateLimit(await clientKey("chat"), 30, 60);
  if (!limited.ok) return Response.json({ error: "rate_limited" }, { status: 429 });
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  const results = search(body.locale, body.q, 3);
  return Response.json({ results }, { headers: { "Cache-Control": "no-store" } });
}
