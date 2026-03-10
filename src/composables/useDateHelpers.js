// ── Date utility helpers ──────────────────────────────────────
export const pad = (n) => String(n).padStart(2, '0');

const now = new Date();
export const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

export const todayStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 · ${weekDays[now.getDay()]}`;
export const todayDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

export function localNow() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function getDateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDateLabel(dateStr) {
  if (dateStr === todayDate) return '今天';
  const d = new Date(dateStr + 'T00:00:00');
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 1) return '昨天';
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · ${weekDays[d.getDay()]}`;
}

export function getIsoWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return { year: now.getFullYear(), week: 1 };
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const week = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return { year: target.getFullYear(), week };
}

export function getDateRangeDates(startStr, endStr) {
  const dates = [];
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return dates;
  let cur = start;
  while (cur.getTime() <= end.getTime()) {
    dates.push(`${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}
