import { DbAdapter } from "@/types";
import { Pool } from "pg";

export const createPostgresAdapter = ({
  connectionString,
}: {
  connectionString: string;
}): DbAdapter => {
  const pool = new Pool({
    connectionString,
  });
  return {
    smembers: async (key) => {
      const result = await pool.query(
        "SELECT value FROM set_members WHERE key = $1",
        [key]
      );
      return result.rows.map((row) => row.value);
    },

    get: async (key) => {
      const result = await pool.query(
        "SELECT value FROM key_value WHERE key = $1 AND (expires_at IS NULL OR expires_at > NOW())",
        [key]
      );
      return result.rows[0]?.value || null;
    },

    set: async (key, value, options) => {
      if (options?.ex) {
        await pool.query(
          "INSERT INTO key_value (key, value, expires_at) VALUES ($1, $2, NOW() + interval '1 second' * $3) ON CONFLICT (key) DO UPDATE SET value = $2, expires_at = NOW() + interval '1 second' * $3",
          [key, value, options.ex]
        );
      } else {
        await pool.query(
          "INSERT INTO key_value (key, value, expires_at) VALUES ($1, $2, NULL) ON CONFLICT (key) DO UPDATE SET value = $2, expires_at = NULL",
          [key, value]
        );
      }
    },

    sadd: async (key, value) => {
      await pool.query(
        "INSERT INTO set_members (key, value) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [key, value]
      );
    },

    srem: async (key, value) => {
      await pool.query(
        "DELETE FROM set_members WHERE key = $1 AND value = $2",
        [key, value]
      );
    },

    del: async (key) => {
      await pool.query("DELETE FROM key_value WHERE key = $1", [key]);
      await pool.query("DELETE FROM set_members WHERE key = $1", [key]);
    },

    sismember: async (key, value) => {
      const result = await pool.query(
        "SELECT 1 FROM set_members WHERE key = $1 AND value = $2",
        [key, value]
      );
      return result.rows.length > 0;
    },
  };
};
