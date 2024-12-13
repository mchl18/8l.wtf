export type DbAdapter = {
  smembers: (key: string) => Promise<string[]>;
  get: <T = string>(key: string) => Promise<T | null>;
  set: (key: string, value: any, options?: { ex?: number }) => Promise<void>;
  sadd: (key: string, value: string) => Promise<void>;
  srem: (key: string, value: string) => Promise<void>;
  del: (key: string) => Promise<void>;
  sismember: (key: string, value: string) => Promise<boolean>;
};

export type DbType = "kv" | "redis" | "mongo" | "postgres" | "mysql" | "sqlite";
export type ShortenedUrl = {
  shortId: string;
  url: string;
  fullUrl: string;
  createdAt?: string;
  expiresAt?: string;
  isEncrypted?: boolean;
};

export type GetUrlsResponse = {
  urls: ShortenedUrl[];
};
