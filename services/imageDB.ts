const DB_NAME = 'EcoEatsImages';
const STORE_NAME = 'pantryImages';
const DB_VERSION = 1;

let db: IDBDatabase;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const storeImage = async (id: string, base64: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, base64 });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getImage = async (id: string): Promise<string | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result ? request.result.base64 : null);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteImage = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const deleteImages = async (ids: string[]): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        let completed = 0;
        const total = ids.length;

        if (total === 0) {
            return resolve();
        }

        const checkCompletion = () => {
            completed++;
            if (completed === total) {
                resolve();
            }
        };

        ids.forEach(id => {
            const request = store.delete(id);
            request.onsuccess = checkCompletion;
            request.onerror = () => {
                console.error(`Failed to delete image with id ${id}`, request.error);
                checkCompletion(); // Still count it as completed to not block the promise
            };
        });

        transaction.onerror = () => reject(transaction.error);
    });
};
