<template>
  <div class="w-full max-w-2xl px-6">
    <header class="mb-12">
      <h1 class="text-3xl font-semibold text-white mb-2 tracking-tight">未来规划</h1>
      <p class="text-gray-500 text-sm font-light">查看已经推迟或预定在未来的任务</p>
    </header>

    <div v-if="upcomingGroups.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-600">
      <CalendarClock :size="40" class="mb-4 opacity-30" />
      <p class="text-sm">暂无未来规划的任务</p>
    </div>

    <div v-for="group in upcomingGroups" :key="group.date" class="mb-10">
      <div class="flex items-center mb-4">
        <div class="flex-1 h-[1px] bg-white/5"></div>
        <span class="px-4 text-xs text-gray-500 font-medium">{{ group.label }}</span>
        <div class="flex-1 h-[1px] bg-white/5"></div>
      </div>
      <div class="space-y-2">
        <div
          v-for="todo in group.todos" :key="todo.id"
          class="group flex items-center space-x-4 bg-white/[0.01] border border-white/[0.05] p-4 rounded-xl hover:bg-white/[0.03] hover:border-white/10 transition-all"
        >
          <button
            @click.stop="moveToToday(todo)"
            class="flex-shrink-0 text-[11px] px-2 py-1 rounded border border-white/20 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            title="移回今日"
          >
            移至今日
          </button>
          <div class="flex-1 space-y-1">
            <span class="text-sm text-gray-300">{{ todo.text }}</span>
            <div v-if="getTagsForTodo(todo).length" class="flex flex-wrap gap-1 mt-0.5">
              <span
                v-for="tag in getTagsForTodo(todo)" :key="tag.id"
                class="px-1.5 py-0.5 rounded-full text-[10px] bg-white/[0.03] border"
                :style="{ borderColor: tag.color, color: tag.color }"
              >{{ tag.name }}</span>
            </div>
          </div>
          <button @click.stop="deleteTodo(todo.id)" class="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1">
            <Trash2 :size="15" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Trash2, CalendarClock } from 'lucide-vue-next';
import { upcomingGroups, deleteTodo, moveToToday, getTagsForTodo } from '../composables/useTodos.js';
</script>
