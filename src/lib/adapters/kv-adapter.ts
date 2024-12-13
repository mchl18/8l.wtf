import { DbAdapter } from "@/types";
import { kv } from "@vercel/kv";

export const createKvAdapter = (): DbAdapter => {
  return {
    smembers: async (key) => await kv.smembers(key),
    get: async (key) => await kv.get(key),
    set: async (key, value, options) => {
      if (options?.ex) {
        await kv.set(key, value, { ex: options.ex });
      } else {
        await kv.set(key, value);
      }
    },
    sadd: async (key, value) => {
      await kv.sadd(key, value);
    },
    srem: async (key, value) => {
      await kv.srem(key, value);
    },
    del: async (key) => {
      await kv.del(key);
    },
    sismember: async (key, value) => {
      return (await kv.sismember(key, value)) === 1;
    },
  };
};
