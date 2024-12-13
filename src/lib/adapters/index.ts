import { createKvAdapter } from "./kv-adapter";
import { createPostgresAdapter } from "./postgres-adapter";
import { createMongoAdapter } from "./mongo-adapter";
import { DbAdapter } from "@/types";
export const getDatabase = ({
  type,
}: {
  type?: "kv" | "mongo" | "postgres" | "mysql" | "sqlite";
} = {}): DbAdapter => {
  if (type === "kv") {
    if (!process.env.KV_URL) {
      throw new Error("KV_URL is not set");
    }
    return createKvAdapter();
  }
  if (type === "mongo") {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not set");
    }
    return createMongoAdapter({
      connectionString: process.env.MONGO_URL!,
    });
  }
  if (type === "postgres") {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    return createPostgresAdapter({
      connectionString: process.env.DATABASE_URL!,
    });
  }
  const envType = process.env.NEXT_PUBLIC_DB_TYPE;
  if (!type && envType) {
    if (["kv", "mongo", "postgres", "mysql", "sqlite"].includes(envType)) {
      return getDatabase({
        type: envType as "kv" | "mongo" | "postgres" | "mysql" | "sqlite",
      });
    }
    throw new Error("Invalid database type");
  }
  throw new Error("Invalid database type");
};
