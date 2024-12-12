import { kv } from "@vercel/kv";
import { redirect, notFound } from "next/navigation";

export default async function RedirectPage({
  params,
}: {
  params: { shortId: string };
}) {
  const { shortId } = params;
  const url = await kv.get<string>(shortId);
  return <Redirect url={url || ""} />;
}

const Redirect = ({ url }: { url: string }) => {
  return url ? redirect(url) : notFound();
};
