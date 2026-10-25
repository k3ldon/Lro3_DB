import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";
import { existsSync } from "node:fs";

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!db) {
    const path = join(process.cwd(), "ro3.db");
    if (!existsSync(path)) throw new Error("ro3.db not found — run `node scripts/build-db.mjs` first.");
    db = new DatabaseSync(path, { readOnly: true });
    db.exec("PRAGMA journal_mode = WAL");
  }
  return db;
}
