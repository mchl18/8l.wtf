import { DbAdapter } from "@/types";
import { MongoClient } from "mongodb";

export const createMongoAdapter = ({
  connectionString,
}: {
  connectionString: string;
}): DbAdapter => {
  const client = new MongoClient(connectionString);
  const db = client.db();
  const keyValueCollection = db.collection("keyValue");
  const setMembersCollection = db.collection("setMembers");

  return {
    smembers: async (key) => {
      const results = await setMembersCollection.find({ key }).toArray();
      return results.map((doc) => doc.value);
    },

    get: async (key) => {
      const doc = await keyValueCollection.findOne({ key });
      if (!doc) return null;
      if (doc.expiresAt && new Date() > doc.expiresAt) {
        await keyValueCollection.deleteOne({ key });
        return null;
      }
      return doc.value;
    },

    set: async (key, value, options) => {
      const doc = {
        key,
        value,
        expiresAt: options?.ex
          ? new Date(Date.now() + options.ex * 1000)
          : null,
      };
      await keyValueCollection.updateOne(
        { key },
        { $set: doc },
        { upsert: true }
      );
    },

    sadd: async (key, value) => {
      await setMembersCollection.updateOne(
        { key, value },
        { $set: { key, value } },
        { upsert: true }
      );
    },

    srem: async (key, value) => {
      await setMembersCollection.deleteOne({ key, value });
    },

    del: async (key) => {
      await keyValueCollection.deleteOne({ key });
      await setMembersCollection.deleteMany({ key });
    },

    sismember: async (key, value) => {
      const doc = await setMembersCollection.findOne({ key, value });
      return !!doc;
    },
  };
};
