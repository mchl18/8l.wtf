type StorageAdapter = {
  get: (key: string, storeName?: string) => Promise<any>;
  set: (key: string, value: any, storeName?: string) => Promise<void>;
  remove: (key: string, storeName?: string) => Promise<void>;
  getAll: (storeName?: string) => Promise<any[]> | any[];
  type: "indexed-db" | "local-storage";
};

class IndexedDBAdapter implements StorageAdapter {
  private dbName = "8lwtf_storage";
  private storeNames = ["keyval", "token"];
  private db: IDBDatabase | null = null;
  type: "indexed-db" = "indexed-db";

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 2);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.storeNames.forEach((storeName) => {
          if (db.objectStoreNames.contains(storeName)) {
            db.deleteObjectStore(storeName);
          }
          db.createObjectStore(storeName);
        });
      };
    });
  }

  async get(key: string, storeName: string = "keyval"): Promise<any> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result);
        // try {
        //   if (typeof request.result === "string") {
        //     resolve(JSON.parse(request.result));
        //   } else {
        //   }
        // } catch (e) {
        //   resolve(request.result);
        // }
      };
    });
  }

  async getAll(storeName: string = "keyval"): Promise<any[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async set(
    key: string,
    value: any,
    storeName: string = "keyval"
  ): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(value, key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async remove(key: string, storeName: string = "keyval"): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

class LocalStorageAdapter implements StorageAdapter {
  type: "local-storage" = "local-storage";
  get(key: string, storeName: string = "keyval") {
    if (typeof window === "undefined") return null;
    const value = localStorage.getItem(`${storeName}_${key}`);
    if (value === null) return null;
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  getAll(storeName: string = "keyval"): any[] {
    if (typeof window === "undefined") return [];
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(`${storeName}_`)
    );
    debugger;
    return keys.map((key) => this.get(key.split("_")[1], storeName));
  }

  async set(
    key: string,
    value: any,
    storeName: string = "keyval"
  ): Promise<void> {
    if (typeof window === "undefined") return;
    const valueToStore =
      typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(`${storeName}_${key}`, valueToStore);
  }

  async remove(key: string, storeName: string = "keyval"): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`${storeName}_${key}`);
  }
}

const storage: StorageAdapter = (() => {
  try {
    if (typeof window !== "undefined" && "indexedDB" in window) {
      return new IndexedDBAdapter();
    }
  } catch (e) {
    console.warn("IndexedDB not available, falling back to localStorage");
  }
  return new LocalStorageAdapter();
})();

export default storage;
