<template>
  <div class="w-full max-w-2xl px-6">
    <header class="mb-12">
      <h1 class="text-3xl font-semibold text-white mb-2 tracking-tight">历史回顾</h1>
      <p class="text-gray-500 text-sm font-light">查看所有已完成的任务</p>
    </header>

    <div v-if="historyGroups.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-600">
      <Archive :size="40" class="mb-4 opacity-30" />
      <p class="text-sm">暂无历史记录</p>
    </div>

    <div v-for="group in historyGroups" :key="group.date" class="mb-10">
      <div class="flex items-center mb-4">
        <div class="flex-1 h-[1px] bg-white/5"></div>
        <span class="px-4 text-xs text-gray-500 font-medium">{{ group.label }}</span>
        <div class="flex-1 h-[1px] bg-white/5"></div>
      </div>
      <div class="space-y-2">
        <div
          v-for="todo in group.todos" :key="todo.id"
          class="flex items-center space-x-4 px-4 py-3 rounded-xl"
          :class="todo.completed ? 'opacity-40' : 'bg-white/[0.02] border border-white/[0.05]'"
        >
          <div
            class="w-5 h-5 rounded flex items-center justify-center"
            :class="todo.completed ? 'bg-purple-600/80' : 'border-2 border-white/20'"
          >
            <Check v-if="todo.completed" :size="12" class="text-white" />
          </div>
          <span class="flex-1 text-sm" :class="todo.completed ? 'line-through text-gray-400 font-light' : 'text-gray-300'">{{ todo.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Archive, Check } from 'lucide-vue-next';
import { todos } from '../composables/useTodos.js';
import { formatDateLabel } from '../composables/useDateHelpers.js';

const historyGroups = computed(() => {
  const groups = {};
  for (const t of todos.value) {
    const date = t.created_at.slice(0, 10);
    if (!groups[date]) groups[date] = [];
    groups[date].push(t);
  }
  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map(date => ({ date, label: formatDateLabel(date), todos: groups[date] }));
});
</script>
