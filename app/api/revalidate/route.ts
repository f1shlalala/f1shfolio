import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const token = req.headers.get("x-revalidate-token");
  if (!token || token !== process.env.REVALIDATE_SECRET) return new Response("nope", { status: 401 });
  revalidateTag("moodboard", { expire: 0 }); // ponytail: Next 16 requires a profile; expire:0 matches the old immediate-purge behavior this route needs.
  return Response.json({ revalidated: true });
}
