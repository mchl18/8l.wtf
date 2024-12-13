import { decrypt } from "@/lib/crypto";

self.onmessage = (e) => {
  const { urls, token } = e.data;

  const decryptedUrls = urls.map((url: any) => ({
    ...url,
    url: decrypt(url.url, token),
  }));

  self.postMessage(decryptedUrls);
};
