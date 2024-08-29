// app/[shortId]/page.js
import { kv } from "@vercel/kv";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

export default async function RedirectPage({
  params,
}: {
  params: { shortId: string };
}) {
  const { shortId } = params;
  const url = await kv.get<string>(shortId);

  if (!url) {
    notFound();
  }

  redirect(url);
}
