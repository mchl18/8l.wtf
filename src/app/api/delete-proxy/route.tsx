import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { id } = await request.json();
  const url = await kv.get<string>(id);
  if (!url) {
    return NextResponse.json({ error: "URL not found" }, { status: 404 });
  }
  const res = await fetch(url);
  return NextResponse.json({
    status: res.status,
    statusText: res.statusText,
    url,
    id
  });
}
