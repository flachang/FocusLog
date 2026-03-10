// ── Demo Data composable ───────────────────────────────────────
import { ref } from 'vue';
import { db } from './useDb.js';
import { tags } from './useTags.js';
import { loadTodos, loadTodoTags } from './useTodos.js';
import { loadHeatmap } from './useHeatmap.js';
import { loadArchives } from './useArchives.js';
import { localNow, getDateNDaysAgo, pad } from './useDateHelpers.js';
import { activeTagFilterId } from './useTodos.js';

export const seedDemoLoading = ref(false);
export const clearDemoLoading = ref(false);
export const seedDemoMessage = ref('');
export const isDemoDataModalOpen = ref(false);

export async function seedDemoData() {
  if (!db.value) return;
  seedDemoLoading.value = true;
  seedDemoMessage.value = '';
  try {
    let tagIds = [...tags.value.map(t => t.id)];
    if (tagIds.length === 0) {
      const tagList = [
        { name: '需求', color: '#3B82F6' },
        { name: '研发', color: '#8B5CF6' },
        { name: '数据', color: '#10B981' },
        { name: '会议', color: '#F59E0B' },
        { name: '规划', color: '#EF4444' },
      ];
      for (const { name, color } of tagList) {
        const res = await db.value.execute('INSERT INTO tags (name, color, is_demo) VALUES (?, ?, 1)', [name, color]);
        tagIds.push(res.lastInsertId);
      }
      const rows = await db.value.select('SELECT * FROM tags ORDER BY id DESC');
      tags.value = rows;
    }

    const taskTemplates = [
      '撰写新版本 PRD', '需求评审会议', '梳理核心指标埋点', '竞品体验与分析', '周报总结与核心数据盘点',
      '与开发评审技术方案', '跟进前端联调进度', '验收提测版本', '参加每日站会', '制定下个版本架构与 backlog',
      '查看 AB 实验打点数据', '写用户反馈分析报告', '处理客诉与沟通工单', '跟进线上紧急 Bug 修复',
      '与设计对齐高保真交互图', '运营活动配置与上线复盘', '输出产品路线图 (Roadmap)',
    ];

    for (let d = 180; d >= 0; d--) {
      const dateStr = getDateNDaysAgo(d);
      const day = new Date(dateStr).getDay();
      const isWeekend = day === 0 || day === 6;
      const maxTasks = isWeekend ? 3 : 8;
      const minTasks = isWeekend ? 0 : 3;
      const nTasks = minTasks + Math.floor(Math.random() * (maxTasks - minTasks + 1));
      for (let i = 0; i < nTasks; i++) {
        const text = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
        const completed = Math.random() < 0.8;
        const h1 = 9 + Math.floor(Math.random() * 3);
        const m1 = Math.floor(Math.random() * 60);
        const created = `${dateStr} ${pad(h1)}:${pad(m1)}:00`;
        const updated = completed
          ? `${dateStr} ${pad(14 + Math.floor(Math.random() * 6))}:${pad(Math.floor(Math.random() * 60))}:00`
          : created;
        const tagId = tagIds.length > 0 ? tagIds[Math.floor(Math.random() * tagIds.length)] : null;
        const rolled_count = (!completed && d > 0 && Math.random() < 0.3) ? Math.floor(Math.random() * 3) + 1 : 0;
        const res = await db.value.execute(
          'INSERT INTO todos (text, completed, from_yesterday, created_at, updated_at, tag_id, rolled_count, target_date, is_demo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
          [text, completed ? 1 : 0, rolled_count > 0 ? 1 : 0, created, updated, tagId, rolled_count, dateStr]
        );
        if (tagId != null) {
          await db.value.execute('INSERT INTO todo_tags (todo_id, tag_id) VALUES (?, ?)', [res.lastInsertId, tagId]);
        }
      }
    }

    const ts = localNow();
    const archiveContents = [
      `# ${getDateNDaysAgo(2)} 工作小结\n\n- 完成需求评审与排期。\n- 与设计对齐交互细节。\n- 推进接口联调，测试环境已就绪。`,
      `# ${getDateNDaysAgo(5)} 日报\n\n- 站会同步进度。\n- 修复 2 个 Bug，补充单测。\n- 阅读 Vue 3 文档一节。`,
    ];
    const archiveDates = [getDateNDaysAgo(2), getDateNDaysAgo(5)];
    for (let i = 0; i < archiveContents.length; i++) {
      await db.value.execute(
        'INSERT INTO archives (date, content, created_at, is_demo) VALUES (?, ?, ?, 1)',
        [archiveDates[i], archiveContents[i], ts]
      );
    }

    await loadTodos();
    await loadTodoTags();
    await loadHeatmap(activeTagFilterId.value ?? null);
    await loadArchives();
    seedDemoMessage.value = '已生成近半年 PM 示例数据，热力图与历史已更新。';
  } catch (e) {
    console.error('seedDemoData failed:', e);
    seedDemoMessage.value = '生成失败: ' + (e.message || String(e));
  } finally {
    seedDemoLoading.value = false;
  }
}

export async function clearDemoData() {
  if (!db.value) return;
  clearDemoLoading.value = true;
  seedDemoMessage.value = '';
  try {
    await db.value.execute('DELETE FROM todo_tags WHERE todo_id IN (SELECT id FROM todos WHERE is_demo = 1)');
    await db.value.execute('DELETE FROM todos WHERE is_demo = 1');
    await db.value.execute('DELETE FROM tags WHERE is_demo = 1');
    await db.value.execute('DELETE FROM archives WHERE is_demo = 1');
    await loadTodos();
    await loadTodoTags();
    await loadHeatmap(activeTagFilterId.value ?? null);
    await loadArchives();
    seedDemoMessage.value = '体验数据已全部清理完成。';
  } catch (e) {
    console.error('clearDemoData failed:', e);
    seedDemoMessage.value = '清理失败，请查看控制台。';
  } finally {
    clearDemoLoading.value = false;
  }
}
