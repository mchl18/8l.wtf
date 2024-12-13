import { createKvAdapter } from "@/lib/adapters/kv-adapter";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { id } = await request.json();
  const db = createKvAdapter();
  const url = await db.get(id);
  if (!url) {
    return NextResponse.json({ error: "URL not found" }, { status: 404 });
  }
  const res = await fetch(url, {
    method: "DELETE",
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to call delete proxy" },
      { status: 500 }
    );
  }
  return NextResponse.json({
    status: res.status,
    statusText: res.statusText,
    url,
    id,
  });
}
