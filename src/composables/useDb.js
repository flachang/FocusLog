// ── Database singleton ─────────────────────────────────────────
import { ref } from 'vue';
import Database from '@tauri-apps/plugin-sql';

export const db = ref(null);

export async function openDb() {
  if (db.value) return db.value;
  db.value = await Database.load('sqlite:focus_log.db');
  return db.value;
}
