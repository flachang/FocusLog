<template>
  <div class="flex h-screen bg-[#0B0B0B] text-gray-200 font-sans selection:bg-purple-500/30 overflow-hidden">

    <!-- ── Sidebar ── -->
    <AppSidebar
      :currentView="currentView"
      :dbReady="dbReady"
      :initError="initError"
      @update:currentView="currentView = $event"
    />

    <!-- ── Main content ── -->
    <main class="flex-1 flex flex-col items-center overflow-y-auto pt-20 pb-20 relative">

      <TodayView    v-show="currentView === 'today'"    ref="todayViewRef" @openTagManager="openTagManager" />
      <UpcomingView v-show="currentView === 'upcoming'" />
      <HistoryView  v-show="currentView === 'history'" />
      <ReviewView   v-show="currentView === 'review'"  @saveReview="handleSaveReview" />
      <ArchiveView  v-show="currentView === 'archive'" />
      <SettingsView v-show="currentView === 'settings'" />

      <!-- Floating action button -->
      <button
        v-if="currentView === 'today'"
        @click="generateSummary"
        class="fixed bottom-10 right-10 bg-white text-black px-6 py-3 rounded-full font-bold flex items-center space-x-2 shadow-[0_10px_40px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all"
      >
        <Sparkles :size="16" />
        <span class="text-sm">生成今日总结</span>
      </button>

      <!-- Toast -->
      <div
        v-if="archiveToastVisible"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/10 border border-white/20 text-xs text-gray-100 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm z-50"
      >
        {{ archiveToastMessage }}
      </div>

      <!-- Snooze toast -->
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform -translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-2 opacity-0"
      >
        <div
          v-if="snoozeToastVisible"
          class="fixed top-64 left-1/2 -translate-x-1/2 bg-[#22C55E]/90 text-white border border-green-400/50 px-5 py-2.5 rounded-full shadow-[0_4px_20px_rgba(34,197,94,0.3)] backdrop-blur-md z-50 flex items-center text-sm font-medium"
        >
          <Check :size="16" class="mr-2" />
          <span>{{ snoozeToastMessage }}</span>
        </div>
      </transition>
    </main>

    <!-- ── Drawers & Modals ── -->
    <SummaryDrawer @saveArchive="handleSaveArchive" @goToSettings="currentView = 'settings'; isSummaryOpen = false" />

    <ApiSettingsModal  v-if="isApiSettingsOpen"  :showToast="showToast" />
    <DemoDataModal     v-if="isDemoDataModalOpen" />
    <DailyPromptModal  v-if="isDailyPromptOpen"  :showToast="showToast" />
    <ReviewPromptModal v-if="isReviewPromptOpen" :showToast="showToast" />
    <TagManagerModal   v-if="isTagManagerOpen" />
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { Sparkles, Check } from 'lucide-vue-next';

// ── Components ──────────────────────────────────────────────
import AppSidebar      from './components/AppSidebar.vue';
import SummaryDrawer   from './components/SummaryDrawer.vue';
import ApiSettingsModal  from './components/modals/ApiSettingsModal.vue';
import DemoDataModal     from './components/modals/DemoDataModal.vue';
import DailyPromptModal  from './components/modals/DailyPromptModal.vue';
import ReviewPromptModal from './components/modals/ReviewPromptModal.vue';
import TagManagerModal   from './components/modals/TagManagerModal.vue';

import TodayView    from './views/TodayView.vue';
import UpcomingView from './views/UpcomingView.vue';
import HistoryView  from './views/HistoryView.vue';
import ReviewView   from './views/ReviewView.vue';
import ArchiveView  from './views/ArchiveView.vue';
import SettingsView from './views/SettingsView.vue';

// ── Composables ─────────────────────────────────────────────
import { db, openDb } from './composables/useDb.js';
import { loadTodos, loadTodoTags, rolloverTodos, activeTodoTagPopoverId, activeTodoSnoozePopoverId } from './composables/useTodos.js';
import { loadTags, isTagManagerOpen, openTagManager } from './composables/useTags.js';
import { loadHeatmap } from './composables/useHeatmap.js';
import { loadArchives, saveArchive, saveReviewReport } from './composables/useArchives.js';
import { loadSettings, isApiSettingsOpen, isDailyPromptOpen, isReviewPromptOpen } from './composables/useSettings.js';
import { isDemoDataModalOpen } from './composables/useDemoData.js';
import { isSummaryOpen, summaryContent, generateSummary, reviewContent, reviewStartDate, reviewFileName } from './composables/useAI.js';
import { activeTagFilterId } from './composables/useTodos.js';

// ── Local state ──────────────────────────────────────────────
const currentView = ref('today');
const dbReady = ref(false);
const initError = ref('');
const todayViewRef = ref(null);

const archiveToastVisible = ref(false);
const archiveToastMessage = ref('');
const snoozeToastVisible = ref(false);
const snoozeToastMessage = ref('');

// ── Toast helper ─────────────────────────────────────────────
function showToast(msg, duration = 2000) {
  archiveToastMessage.value = msg;
  archiveToastVisible.value = true;
  setTimeout(() => { archiveToastVisible.value = false; }, duration);
}

// ── DB init ──────────────────────────────────────────────────
async function initDB() {
  try {
    await openDb();
    const d = db.value;

    await d.execute(`CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0, from_yesterday INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, is_demo INTEGER NOT NULL DEFAULT 0)`);
    await d.execute(`CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY DEFAULT 1, api_key TEXT DEFAULT '', api_provider TEXT DEFAULT 'deepseek', api_base_url TEXT DEFAULT 'https://api.deepseek.com', api_model TEXT DEFAULT 'deepseek-chat', custom_daily_prompt TEXT DEFAULT '', custom_review_prompt TEXT DEFAULT '')`);
    await d.execute(`CREATE TABLE IF NOT EXISTS archives (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL, is_demo INTEGER NOT NULL DEFAULT 0)`);
    await d.execute(`CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT NOT NULL, is_demo INTEGER NOT NULL DEFAULT 0)`);
    await d.execute(`CREATE TABLE IF NOT EXISTS todo_tags (todo_id INTEGER NOT NULL, tag_id INTEGER NOT NULL)`);
    await d.execute(`CREATE INDEX IF NOT EXISTS idx_todo_tags_todo_id ON todo_tags(todo_id)`);
    await d.execute(`CREATE INDEX IF NOT EXISTS idx_todo_tags_tag_id ON todo_tags(tag_id)`);

    // Migrations
    const migrations = [
      `ALTER TABLE todos ADD COLUMN from_yesterday INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE todos ADD COLUMN tag_id INTEGER`,
      `ALTER TABLE todos ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE todos ADD COLUMN rolled_count INTEGER DEFAULT 0`,
      `ALTER TABLE todos ADD COLUMN target_date TEXT`,
      `ALTER TABLE tags   ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE archives ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE settings ADD COLUMN api_provider TEXT DEFAULT 'deepseek'`,
      `ALTER TABLE settings ADD COLUMN api_base_url TEXT DEFAULT 'https://api.deepseek.com'`,
      `ALTER TABLE settings ADD COLUMN api_model TEXT DEFAULT 'deepseek-chat'`,
      `ALTER TABLE settings ADD COLUMN custom_daily_prompt TEXT DEFAULT ''`,
      `ALTER TABLE settings ADD COLUMN custom_review_prompt TEXT DEFAULT ''`,
    ];
    for (const sql of migrations) {
      try { await d.execute(sql); } catch (_) { /* column/table already exists */ }
    }

    dbReady.value = true;
    await rolloverTodos();
    await loadTodos();
    await loadTodoTags();
    await loadSettings();
    await loadArchives();
    await loadTags();
    await loadHeatmap(activeTagFilterId.value ?? null);
  } catch (e) {
    console.error('initDB failed:', e);
    initError.value = `数据库初始化失败: ${e.message || e}`;
  }
}

// ── Archive & Review save handlers ──────────────────────────
async function handleSaveArchive() {
  const ok = await saveArchive(summaryContent.value, showToast);
  if (ok) isSummaryOpen.value = false;
}

async function handleSaveReview() {
  const reviewError = ref('');
  await saveReviewReport(
    reviewContent.value,
    reviewStartDate.value,
    reviewFileName.value,
    showToast,
    reviewError
  );
}

// ── Watchers ─────────────────────────────────────────────────
watch(activeTagFilterId, (tagId) => {
  if (db.value) loadHeatmap(tagId ?? null);
});

watch(currentView, (val) => {
  if (val === 'today') nextTick(() => todayViewRef.value?.focus());
});

// ── Lifecycle ─────────────────────────────────────────────────
onMounted(() => {
  initDB();
  document.addEventListener('click', () => {
    activeTodoTagPopoverId.value = null;
    activeTodoSnoozePopoverId.value = null;
  });
  nextTick(() => todayViewRef.value?.focus());
});
</script>

<style>
::-webkit-scrollbar { display: none; }
body { margin: 0; -webkit-font-smoothing: antialiased; }
</style>
