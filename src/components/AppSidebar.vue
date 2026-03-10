<template>
  <aside class="w-64 border-r border-white/5 flex flex-col p-6 space-y-8 bg-[#0B0B0B]">
    <!-- Logo -->
    <div class="flex items-center space-x-2 px-2">
      <img src="../assets/logo_simple_padded.png" alt="FocusLog Logo" class="w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.3)] object-cover" />
      <span class="font-bold tracking-tight text-white text-lg">FocusLog</span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 space-y-1">
      <div
        v-for="tab in tabs" :key="tab.id"
        @click="$emit('update:currentView', tab.id)"
        :class="currentView === tab.id ? 'bg-white/5 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-white'"
        class="flex items-center space-x-3 px-3 py-2 rounded-lg transition-all cursor-pointer"
      >
        <component :is="tab.icon" :size="18" />
        <span class="text-sm">{{ tab.label }}</span>
      </div>
    </nav>

    <!-- Tag filter -->
    <div class="mt-4 px-2 space-y-2">
      <div class="flex items-center justify-between text-[11px] text-gray-500 uppercase tracking-wide">
        <span>标签</span>
        <button v-if="activeTagFilterId" type="button" class="text-[10px] text-gray-500 hover:text-purple-400" @click="clearTagFilter">清除筛选</button>
      </div>
      <div v-if="tags.length === 0" class="text-[11px] text-gray-600">暂无标签，可在任务输入框标签弹窗中点击「设置」添加。</div>
      <div v-else class="space-y-1">
        <button
          v-for="tag in tags" :key="tag.id"
          type="button"
          class="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors"
          :class="activeTagFilterId === tag.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'"
          @click="toggleTagFilter(tag.id)"
        >
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: tag.color }"></span>
            <span>{{ tag.name }}</span>
          </div>
          <span class="text-[10px] text-gray-500">{{ tagIncompleteCount[tag.id] || 0 }}</span>
        </button>
      </div>
    </div>

    <!-- DB status -->
    <div class="px-3 py-4 text-[10px] text-gray-600 border-t border-white/5 space-y-2">
      <div class="flex items-center space-x-2">
        <div :class="dbReady ? 'bg-green-500' : 'bg-yellow-500'" class="w-1.5 h-1.5 rounded-full animate-pulse"></div>
        <span>{{ dbReady ? 'SQLite 已连接: focus_log.db' : '正在连接数据库...' }}</span>
      </div>
      <p v-if="initError" class="text-red-400 break-all">{{ initError }}</p>
    </div>
  </aside>
</template>

<script setup>
import { LayoutDashboard, Calendar, Archive, Sparkles, Settings, CalendarClock } from 'lucide-vue-next';
import { tags, tagColorPresets } from '../composables/useTags.js';
import { activeTagFilterId, tagIncompleteCount, toggleTagFilter, clearTagFilter } from '../composables/useTodos.js';

defineProps({
  currentView: { type: String, required: true },
  dbReady: { type: Boolean, default: false },
  initError: { type: String, default: '' },
});

defineEmits(['update:currentView']);

const tabs = [
  { id: 'today',    label: '今日待办', icon: LayoutDashboard },
  { id: 'upcoming', label: '未来规划', icon: CalendarClock },
  { id: 'history',  label: '历史回顾', icon: Calendar },
  { id: 'review',   label: '回顾中心', icon: Sparkles },
  { id: 'archive',  label: '总结存档', icon: Archive },
  { id: 'settings', label: '设置',     icon: Settings },
];
</script>
