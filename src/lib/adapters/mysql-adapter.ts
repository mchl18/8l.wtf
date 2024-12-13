import { DbAdapter } from "@/types";
import mysql from "mysql2/promise";

export const createMysqlAdapter = ({
  connectionString,
}: {
  connectionString: string;
}): DbAdapter => {
  let pool: mysql.Pool;

  const getPool = () => {
    if (!pool) {
      pool = mysql.createPool(connectionString);
    }
    return pool;
  };

  return {
    smembers: async (key) => {
      const pool = getPool();
      const [rows] = await pool.query(
        "SELECT value FROM set_members WHERE set_key = ?",
        [key]
      );
      return (rows as any[]).map((row) => row.value);
    },

    get: async (key) => {
      const pool = getPool();
      const [rows] = await pool.query(
        "SELECT value FROM key_values WHERE key_name = ? AND (expires_at IS NULL OR expires_at > NOW())",
        [key]
      );
      const row = (rows as any[])[0];
      return row ? row.value : null;
    },

    set: async (key, value, options) => {
      const pool = getPool();
      const expiresAt = options?.ex
        ? new Date(Date.now() + options.ex * 1000)
        : null;

      await pool.query(
        "INSERT INTO key_values (key_name, value, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?, expires_at = ?",
        [key, value, expiresAt, value, expiresAt]
      );
    },

    sadd: async (key, value) => {
      const pool = getPool();
      await pool.query(
        "INSERT IGNORE INTO set_members (set_key, value) VALUES (?, ?)",
        [key, value]
      );
    },

    srem: async (key, value) => {
      const pool = getPool();
      await pool.query(
        "DELETE FROM set_members WHERE set_key = ? AND value = ?",
        [key, value]
      );
    },

    del: async (key) => {
      const pool = getPool();
      await pool.query("DELETE FROM key_values WHERE key_name = ?", [key]);
    },

    sismember: async (key, value) => {
      const pool = getPool();
      const [rows] = await pool.query(
        "SELECT 1 FROM set_members WHERE set_key = ? AND value = ? LIMIT 1",
        [key, value]
      );
      return (rows as any[]).length > 0;
    },
  };
};
