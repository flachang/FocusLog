// ── Heatmap composable ─────────────────────────────────────────
import { ref, nextTick } from 'vue';
import { db } from './useDb.js';
import { pad } from './useDateHelpers.js';

export const heatmapWeeks = ref([]);
export const heatmapLoading = ref(false);
export const heatmapTooltip = ref({ visible: false, x: 0, y: 0, date: '', count: 0 });
export const heatmapScrollEl = ref(null);

async function getCompletedCountsLastYear(tagId = null) {
  if (!db.value) return [];
  const formatDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const end = new Date(); end.setDate(end.getDate() + 14);
  const start = new Date(); start.setDate(start.getDate() - 400);
  const startDateStr = formatDate(start);
  const endDateStr = formatDate(end);

  let rows;
  if (tagId != null) {
    rows = await db.value.select(
      `SELECT substr(t.created_at, 1, 10) AS date, COUNT(*) AS count
       FROM todos t
       INNER JOIN todo_tags tt ON t.id = tt.todo_id AND tt.tag_id = ?
       WHERE t.completed = 1
         AND date(t.created_at, 'localtime') BETWEEN date(?, 'localtime') AND date(?, 'localtime')
       GROUP BY date ORDER BY date ASC`,
      [tagId, startDateStr, endDateStr]
    );
  } else {
    rows = await db.value.select(
      `SELECT substr(created_at, 1, 10) AS date, COUNT(*) AS count
       FROM todos WHERE completed = 1
         AND date(created_at, 'localtime') BETWEEN date(?, 'localtime') AND date(?, 'localtime')
       GROUP BY date ORDER BY date ASC`,
      [startDateStr, endDateStr]
    );
  }
  return rows.map(r => ({ date: r.date, count: Number(r.count) || 0 }));
}

export async function loadHeatmap(tagId = null) {
  if (!db.value) return;
  heatmapLoading.value = true;
  try {
    const data = await getCompletedCountsLastYear(tagId);
    const countMap = {};
    for (const item of data) countMap[item.date] = item.count;

    const weeksToDisplay = 52;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayDayOfWeek = today.getDay();
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - todayDayOfWeek);
    const startOfGrid = new Date(startOfCurrentWeek);
    startOfGrid.setDate(startOfCurrentWeek.getDate() - (weeksToDisplay - 1) * 7);

    const cells = [];
    for (let i = 0; i < weeksToDisplay * 7; i++) {
      const d = new Date(startOfGrid); d.setDate(startOfGrid.getDate() + i);
      const isFuture = d.getTime() > today.getTime();
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      cells.push({ date: dateStr, count: isFuture ? 0 : (countMap[dateStr] || 0), isFuture });
    }

    const result = [];
    for (let w = 0; w < weeksToDisplay; w++) {
      result.push(cells.slice(w * 7, w * 7 + 7));
    }
    heatmapWeeks.value = result;

    nextTick(() => {
      setTimeout(() => {
        if (heatmapScrollEl.value) {
          heatmapScrollEl.value.scrollLeft = heatmapScrollEl.value.scrollWidth;
        }
      }, 150);
    });
  } catch (e) {
    console.error('loadHeatmap failed:', e);
    heatmapWeeks.value = [];
  } finally {
    heatmapLoading.value = false;
  }
}

export function getHeatmapCellClass(day) {
  const c = day.count || 0;
  if (c === 0) return 'bg-white/5';
  if (c <= 2) return 'bg-purple-900/40';
  if (c <= 5) return 'bg-purple-700/60';
  return 'bg-purple-500';
}

export function showHeatmapTooltip(day, event) {
  const rect = event.currentTarget.getBoundingClientRect();
  heatmapTooltip.value = {
    visible: true, x: rect.left + rect.width / 2, y: rect.top - 8,
    date: day.date, count: day.count,
  };
}

export function hideHeatmapTooltip() {
  heatmapTooltip.value.visible = false;
}
