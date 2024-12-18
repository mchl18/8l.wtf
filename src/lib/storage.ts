type StorageAdapter = {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  remove: (key: string) => Promise<void>;
};

class IndexedDBAdapter implements StorageAdapter {
  private dbName = "8lwtf_storage";
  private storeName = "keyval";
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(this.storeName);
      };
    });
  }

  async get(key: string): Promise<any> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        try {
          if (typeof request.result === "string") {
            resolve(JSON.parse(request.result));
          } else {
            resolve(request.result);
          }
        } catch (e) {
          resolve(request.result);
        }
      };
    });
  }

  async set(key: string, value: any): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const valueToStore =
        typeof value === "string" ? value : JSON.stringify(value);
      const request = store.put(valueToStore, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async remove(key: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

class LocalStorageAdapter implements StorageAdapter {
  async get(key: string): Promise<any> {
    const value = localStorage.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  async set(key: string, value: any): Promise<void> {
    const valueToStore =
      typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, valueToStore);
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}

const storage: StorageAdapter = (() => {
  try {
    if ("indexedDB" in window) {
      return new IndexedDBAdapter();
    }
  } catch (e) {
    console.warn("IndexedDB not available, falling back to localStorage");
  }
  return new LocalStorageAdapter();
})();

export default storage;
