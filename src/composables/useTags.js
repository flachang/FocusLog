// ── Tags composable ────────────────────────────────────────────
import { ref } from 'vue';
import { db } from './useDb.js';

export const tags = ref([]);
export const tagNameInput = ref('');
export const tagColorInput = ref('#F97316');

export const tagColorPresets = [
  '#F97316', '#3B82F6', '#22C55E',
  '#E11D48', '#A855F7', '#FACC15',
];

export const isTagManagerOpen = ref(false);

export async function loadTags() {
  if (!db.value) return;
  const rows = await db.value.select('SELECT * FROM tags ORDER BY id DESC');
  tags.value = rows;
}

export function openTagManager() {
  tagNameInput.value = '';
  if (!tagColorPresets.includes(tagColorInput.value)) {
    tagColorInput.value = tagColorPresets[0];
  }
  isTagManagerOpen.value = true;
}

export function closeTagManager() {
  isTagManagerOpen.value = false;
}

export async function addTag() {
  if (!db.value) return;
  const name = tagNameInput.value.trim();
  const color = tagColorInput.value;
  if (!name) return;
  try {
    const result = await db.value.execute(
      'INSERT INTO tags (name, color) VALUES (?, ?)',
      [name, color]
    );
    tags.value.unshift({ id: result.lastInsertId, name, color });
    tagNameInput.value = '';
  } catch (e) {
    console.error('addTag failed:', e);
  }
}

export async function deleteTagItem(id, newTodoSelectedTagIds, todoTagsByTodoId) {
  if (!db.value) return;
  try {
    await db.value.execute('UPDATE todos SET tag_id = NULL WHERE tag_id = ?', [id]);
    await db.value.execute('DELETE FROM todo_tags WHERE tag_id = ?', [id]);
    await db.value.execute('DELETE FROM tags WHERE id = ?', [id]);
    tags.value = tags.value.filter(t => t.id !== id);
    newTodoSelectedTagIds.value = newTodoSelectedTagIds.value.filter(tId => tId !== id);
    // reload todo_tags is handled by caller
  } catch (e) {
    console.error('deleteTagItem failed:', e);
  }
}
