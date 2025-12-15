import { NextRequest } from "next/server";

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { auth } = await import("@/lib/auth");
  const { toNextJsHandler } = await import("better-auth/next-js");
  const { GET } = toNextJsHandler(auth);
  return GET(req);
}

export async function POST(req: NextRequest) {
  const { auth } = await import("@/lib/auth");
  const { toNextJsHandler } = await import("better-auth/next-js");
  const { POST } = toNextJsHandler(auth);
  return POST(req);
}
