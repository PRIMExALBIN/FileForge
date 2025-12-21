import { openDB } from "idb";
import type { DBSchema } from "idb";

interface HistoryDB extends DBSchema {
  conversions: {
    key: string;
    value: {
      id: string;
      inputName: string;
      inputFormat: string;
      outputFormat: string;
      timestamp: number;
      fileSize: number;
      success: boolean;
      error?: string;
    };
    indexes: { "by-date": number };
  };
}

const dbPromise = openDB<HistoryDB>("fileforge-history", 1, {
  upgrade(db) {
    const store = db.createObjectStore("conversions", { keyPath: "id" });
    store.createIndex("by-date", "timestamp");
  },
});

export async function addToHistory(
  conversion: HistoryDB["conversions"]["value"],
) {
  const db = await dbPromise;
  await db.add("conversions", conversion);
}

export async function getHistory(limit = 50) {
  const db = await dbPromise;
  const items = await db.getAllFromIndex("conversions", "by-date");
  // return newest first
  return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

export async function clearHistory() {
  const db = await dbPromise;
  await db.clear("conversions");
}
