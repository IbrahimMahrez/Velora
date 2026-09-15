// ======================================================
// OFFLINE SNAPSHOT CACHE (IndexedDB)
// Stores the last successful GET responses for read-only
// endpoints so pages render their last synced data when
// offline. localStorage is too small/fragile for this.
// ======================================================

const DB_NAME = "velora-cache";
const STORE_NAME = "api-cache";
const MAX_ENTRIES = 60;
const TS_KEY = "velora-cache-ts";

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(request.error || new Error("idb open failed"));
    } catch (err) {
      reject(err);
    }
  });

  return dbPromise;
}

function withStore(mode, fn) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        let settled = false;
        const done = (value) => {
          if (!settled) {
            settled = true;
            resolve(value);
          }
        };
        const fail = (err) => {
          if (!settled) {
            settled = true;
            reject(err);
          }
        };

        try {
          const tx = db.transaction(STORE_NAME, mode);
          tx.oncomplete = () => done();
          tx.onerror = () => fail(tx.error);
          tx.onabort = () => fail(tx.error);

          const store = tx.objectStore(STORE_NAME);
          fn(store, done, fail);
        } catch (err) {
          fail(err);
        }
      })
  );
}

export async function saveSnapshot(key, data) {
  try {
    await withStore("readwrite", (store, done, fail) => {
      const req = store.put({
        key,
        data,
        savedAt: Date.now(),
      });
      req.onsuccess = () => {
        // LRU trim (best-effort, never blocks)
        try {
          const cursorReq = store.openCursor();
          const keys = [];
          cursorReq.onsuccess = () => {
            const cursor = cursorReq.result;
            if (cursor) {
              keys.push({
                key: cursor.primaryKey,
                savedAt: cursor.value?.savedAt || 0,
              });
              cursor.continue();
            } else if (keys.length > MAX_ENTRIES) {
              keys
                .sort((a, b) => a.savedAt - b.savedAt)
                .slice(0, keys.length - MAX_ENTRIES)
                .forEach((k) => {
                  try {
                    store.delete(k.key);
                  } catch {
                    // ignore
                  }
                });
            }
          };
        } catch {
          // ignore trim failures
        }
        done();
      };
      req.onerror = () => fail(req.error);
    });

    try {
      localStorage.setItem(TS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  } catch {
    // cache is best-effort — never break the app
  }
}

export async function readSnapshot(key) {
  try {
    const entry = await withStore("readonly", (store, done, fail) => {
      const req = store.get(key);
      req.onsuccess = () => done(req.result || null);
      req.onerror = () => fail(req.error);
    });
    return entry;
  } catch {
    return null;
  }
}

export function lastSyncAt() {
  try {
    const raw = localStorage.getItem(TS_KEY);
    const ts = Number(raw);
    return Number.isFinite(ts) && ts > 0 ? ts : null;
  } catch {
    return null;
  }
}
