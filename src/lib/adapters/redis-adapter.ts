import { DbAdapter } from "@/types";
import { Redis } from "ioredis";

export const createRedisAdapter = ({
  connectionString = process.env.REDIS_URL,
}: {
  connectionString?: string;
} = {}): DbAdapter => {
  if (!connectionString) {
    throw new Error("REDIS_URL is not set");
  }

  const redis = new Redis(connectionString);

  return {
    smembers: async (key) => await redis.smembers(key),

    get: async <T = string>(key: string): Promise<T | null> => {
      const value = await redis.get(key);
      return value ? (value as T) : null;
    },

    set: async (key, value, options) => {
      if (options?.ex) {
        await redis.set(key, value, "EX", options.ex);
      } else {
        await redis.set(key, value);
      }
    },

    sadd: async (key, value) => {
      await redis.sadd(key, value);
    },

    srem: async (key, value) => {
      await redis.srem(key, value);
    },

    del: async (key) => {
      await redis.del(key);
    },

    sismember: async (key, value) => {
      return (await redis.sismember(key, value)) === 1;
    },
  };
};
