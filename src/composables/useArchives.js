// ── Archives composable ────────────────────────────────────────
import { ref } from 'vue';
import { db } from './useDb.js';
import { localNow, todayDate, todayStr, pad, getIsoWeek } from './useDateHelpers.js';
import { writeTextFile, mkdir } from '@tauri-apps/plugin-fs';
import { documentDir, join } from '@tauri-apps/api/path';

export const archives = ref([]);

export async function loadArchives() {
  const rows = await db.value.select('SELECT * FROM archives ORDER BY created_at DESC');
  archives.value = rows;
}

export async function saveArchive(content, showToast) {
  if (!db.value || !content) return;
  try {
    const ts = localNow();
    const result = await db.value.execute(
      'INSERT INTO archives (date, content, created_at) VALUES (?, ?, ?)',
      [todayStr, content, ts]
    );
    archives.value.unshift({
      id: result.lastInsertId, date: todayStr, content, created_at: ts,
    });
    const docs = await documentDir();
    const folder = await join(docs, 'FocusLog_Archive');
    await mkdir(folder, { recursive: true });
    const filePath = await join(folder, `${todayDate}.md`);
    await writeTextFile(filePath, content);
    showToast(`已保存到文稿目录 FocusLog_Archive/${todayDate}.md`, 2500);
    return true;
  } catch (e) {
    console.error('saveArchive failed:', e);
    return false;
  }
}

export async function saveReviewReport(reviewContent, reviewStartDate, reviewFileName, showToast, reviewError) {
  if (!reviewContent) return;
  try {
    const docs = await documentDir();
    const folder = await join(docs, 'FocusLog_Archive');
    await mkdir(folder, { recursive: true });
    let name = (reviewFileName || '').trim();
    if (!name) {
      const { year, week } = getIsoWeek(reviewStartDate || todayDate);
      name = `Weekly_${year}_W${pad(week)}`;
    }
    if (!name.toLowerCase().endsWith('.md')) name += '.md';
    const filePath = await join(folder, name);
    await writeTextFile(filePath, reviewContent);
    showToast(`已保存回顾到文稿目录 FocusLog_Archive/${name}`, 2500);
  } catch (e) {
    console.error('saveReviewReport failed:', e);
    reviewError.value = e.message || '保存回顾失败';
  }
}

export async function deleteArchive(id) {
  if (!db.value) return;
  await db.value.execute('DELETE FROM archives WHERE id = ?', [id]);
  archives.value = archives.value.filter(a => a.id !== id);
}
