import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
} from "crypto";

export const SEED = process.env.NEXT_PUBLIC_SEED || "8l.wtf";

export function encrypt(data: string, token: string) {
  const key = Buffer.from(token, "hex");
  const hash = createHash("sha256").update(token).digest();
  const iv = hash.subarray(0, 16);

  const cipher = createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

export function generateDeterministicIV(token: string): Buffer {
  return createHash("sha256").update(token).digest().subarray(0, 16);
}

export function decrypt(encryptedData: string, token: string) {
  const key = Buffer.from(token, "hex");

  const [ivHex, encryptedHex] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");

  const decipher = createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export function generateSignature(data: string, token: string): string {
  const hmac = createHmac("sha256", token);
  hmac.update(data);
  return hmac.digest("hex");
}

export function verifySignature(
  data: string,
  signature: string,
  token: string
): boolean {
  const expectedSignature = generateSignature(data, token);
  return expectedSignature === signature;
}

// Helper function to sign and combine data with signature
export function signData(data: string, token: string): string {
  const signature = generateSignature(data, token);
  return `${data}.${signature}`;
}

// Helper function to verify and extract signed data
export function verifyAndExtractData(
  signedData: string,
  token: string
): string | null {
  const [data, signature] = signedData.split(".");

  if (!data || !signature) {
    return null;
  }

  if (!verifySignature(data, signature, token)) {
    return null;
  }

  return data;
}

export function generateShortIdentifier(
  data: string,
  token: string,
  length: number = 8
): string {
  const hmac = createHmac("sha256", token);
  hmac.update(data);
  // Get first n characters of base64 hash, replace URL-unsafe chars
  return hmac
    .digest("base64")
    .substring(0, length)
    .replace(/[+/=_]/g, (x) => ({ "+": "-", "/": "-", "=": "", "_": "-" }[x] || x));
}
