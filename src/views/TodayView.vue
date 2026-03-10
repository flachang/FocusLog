<template>
  <div class="w-full max-w-2xl px-6">
    <header class="mb-8">
      <h1 class="text-3xl font-semibold text-white mb-2 tracking-tight">Focus.</h1>
      <p class="text-gray-500 text-sm font-light">今天是 {{ todayStr }}</p>
    </header>

    <!-- 贡献热力图（过去一年） -->
    <section class="mb-8">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] uppercase tracking-wide text-gray-500">
          过去一年的完成记录
          <span v-if="activeTagFilterId" class="text-purple-400/90 font-normal normal-case">
            （仅「{{ (tags.find(t => t.id === activeTagFilterId) || {}).name || '' }}」）
          </span>
        </span>
        <span v-if="!heatmapLoading && heatmapWeeks.length" class="text-[11px] text-gray-600">最近 52 周</span>
      </div>
      <div class="relative">
        <div class="overflow-x-auto pb-1" ref="heatmapScrollEl">
          <div class="inline-flex space-x-1 min-h-[52px]">
            <div v-for="(week, wIndex) in heatmapWeeks" :key="wIndex" class="flex flex-col space-y-1">
              <div
                v-for="day in week" :key="day.date"
                class="w-3 h-3 rounded-sm transition-colors duration-150"
                :class="[
                  day.isFuture ? 'bg-transparent' : getHeatmapCellClass(day),
                  (heatmapSelectedDate === day.date && !day.isFuture) ? 'ring-1 ring-white/50 ring-inset' : '',
                  !day.isFuture ? 'cursor-pointer' : ''
                ]"
                @mouseenter="!day.isFuture && showHeatmapTooltip(day, $event)"
                @mouseleave="hideHeatmapTooltip"
                @click="!day.isFuture && selectHeatmapDate(day.date)"
              ></div>
            </div>
          </div>
        </div>
        <!-- Tooltip -->
        <div
          v-if="heatmapTooltip.visible"
          class="fixed z-40 px-2 py-1 rounded-md bg-black/80 border border-white/10 text-[11px] text-gray-100 shadow-lg pointer-events-none"
          :style="{ left: heatmapTooltip.x + 'px', top: heatmapTooltip.y + 'px' }"
        >
          <div class="font-medium">{{ heatmapTooltip.date }}</div>
          <div class="text-gray-400">完成 {{ heatmapTooltip.count }} 个任务</div>
        </div>
      </div>
    </section>

    <!-- 只读模式 banner -->
    <div
      v-if="heatmapSelectedDate"
      class="mb-4 flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10"
    >
      <span class="text-[11px] text-gray-400">
        正在查看 <span class="text-gray-200">{{ heatmapSelectedDate }}</span> 的历史记录（只读模式）
      </span>
      <button type="button" class="text-[11px] text-gray-500 hover:text-purple-400" @click="clearHeatmapDate">
        退出只读模式 · 查看今日
      </button>
    </div>

    <!-- Input -->
    <div v-if="!heatmapSelectedDate" class="relative mb-3 group">
      <div class="absolute inset-y-0 left-4 flex items-center text-gray-500">
        <Plus :size="18" />
      </div>
      <input
        ref="newTodoInput"
        type="text"
        v-model="newTodoText"
        @input="handleTodoInput"
        @keydown="handleTodoKeydown"
        placeholder="添加一项任务... (支持 #标签名 快捷选择，Enter 保存)"
        class="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-12 pr-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 transition-all shadow-2xl"
      />

      <!-- Tag mention dropdown -->
      <div
        v-if="mentionState.visible"
        class="absolute left-4 top-full mt-2 w-48 bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-30 py-2"
        @mousedown.prevent
      >
        <div v-if="filteredMentionTags.length === 0" class="px-3 py-1 text-[11px] text-gray-500">
          按 Enter 回车可直接新建名为 "{{ mentionState.query }}" 的标签
        </div>
        <div v-else class="space-y-0.5 max-h-48 overflow-y-auto px-1.5">
          <button
            v-for="(tag, index) in filteredMentionTags" :key="tag.id"
            type="button"
            class="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-xs transition-colors"
            :class="mentionState.selectedIndex === index ? 'bg-purple-600/30 text-white' : 'text-gray-300 hover:bg-white/[0.06]'"
            @mousedown.prevent="selectMentionTag(tag)"
          >
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: tag.color }"></span>
            <span>{{ tag.name }}</span>
          </button>
        </div>
      </div>

      <!-- Tag picker button -->
      <button
        type="button"
        class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-200 transition-colors"
        @click.stop="createTagPopoverOpen = !createTagPopoverOpen"
      >
        <div class="relative flex items-center">
          <Tags :size="18" />
          <span v-if="selectedTagsForNewTodo.length" class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500"></span>
        </div>
      </button>

      <!-- Tag picker popover -->
      <div
        v-if="createTagPopoverOpen"
        class="absolute right-0 top-full mt-2 w-60 bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-30 p-3"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] text-gray-400">为新任务选择标签</span>
          <div class="flex items-center space-x-2">
            <button type="button" class="text-[11px] text-gray-500 hover:text-purple-400" @click.stop="$emit('openTagManager'); createTagPopoverOpen = false">设置</button>
            <button type="button" class="text-[11px] text-gray-500 hover:text-gray-300" @click.stop="createTagPopoverOpen = false">关闭</button>
          </div>
        </div>
        <div v-if="tags.length === 0" class="text-[11px] text-gray-600 py-2">还没有标签，可以点击右上角「设置」先创建。</div>
        <div v-else class="space-y-1 max-h-52 overflow-y-auto">
          <button
            v-for="tag in tags" :key="tag.id"
            type="button"
            class="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/[0.06] text-xs text-gray-200"
            @click.stop="toggleNewTodoTag(tag.id)"
          >
            <div class="flex items-center space-x-2">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: tag.color }"></span>
              <span>{{ tag.name }}</span>
            </div>
            <span v-if="newTodoSelectedTagIds.includes(tag.id)" class="text-[10px] text-purple-400">已选</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Selected tags preview -->
    <div v-if="selectedTagsForNewTodo.length" class="mb-6 flex items-center space-x-2 text-[11px] text-gray-500">
      <span>已选中：</span>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="tag in selectedTagsForNewTodo" :key="tag.id"
          type="button"
          class="px-2 py-0.5 rounded-full border text-[10px] bg-white/[0.02] hover:bg-white/10 transition-colors flex items-center group cursor-pointer"
          :style="{ borderColor: tag.color, color: tag.color }"
          @click="toggleNewTodoTag(tag.id)"
          title="点击移除标签"
        >
          <span>{{ tag.name }}</span>
          <span class="ml-1 opacity-40 group-hover:opacity-100">&times;</span>
        </button>
      </div>
    </div>

    <!-- Active todos -->
    <div class="space-y-3">
      <div
        v-for="todo in displayedActiveTodos" :key="todo.id"
        class="group flex items-center space-x-4 bg-white/[0.01] border border-white/[0.05] p-4 rounded-xl hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer"
      >
        <div
          @click.stop="toggleTodo(todo)"
          class="w-5 h-5 border-2 border-white/20 rounded-md group-hover:border-purple-500/50 flex items-center justify-center transition-all bg-transparent"
        >
          <Check v-if="todo.completed" :size="12" class="text-white" />
        </div>
        <div class="flex-1">
          <input
            v-if="editingTodoId === todo.id"
            v-model="editingText"
            @keyup.enter="saveEdit(todo)"
            @blur="saveEdit(todo)"
            @keydown.esc="cancelEdit"
            class="w-full bg-transparent border-b border-white/20 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
          />
          <div v-else class="space-y-1">
            <span class="text-gray-300 text-sm" @dblclick.stop="startEdit(todo)">{{ todo.text }}</span>
            <div v-if="getTagsForTodo(todo).length" class="flex flex-wrap gap-1 mt-0.5">
              <span
                v-for="tag in getTagsForTodo(todo)" :key="tag.id"
                class="px-1.5 py-0.5 rounded-full text-[10px] bg-white/[0.03] border"
                :style="{ borderColor: tag.color, color: tag.color }"
              >{{ tag.name }}</span>
            </div>
          </div>
        </div>
        <span v-if="todo.from_yesterday" class="text-[10px] text-orange-500/70 px-2 py-0.5 bg-orange-500/5 border border-orange-500/10 rounded italic font-light">昨日延宕</span>
        <span v-if="(todo.rolled_count || 0) > 3" class="inline-flex items-center text-amber-500/60 hover:text-amber-500/90 transition-colors cursor-help" :title="`该任务已拖延 ${todo.rolled_count} 天`">
          <Flame :size="14" class="opacity-70" />
        </span>
        <div class="opacity-0 group-hover:opacity-100 flex items-center space-x-2 transition-all">
          <!-- Snooze -->
          <div class="relative flex items-center">
            <button @click.stop="toggleSnoozePopoverForTodo(todo.id)" class="text-gray-500 hover:text-orange-400 transition-colors p-1" title="推迟任务">
              <Clock :size="15" />
            </button>
            <div v-if="activeTodoSnoozePopoverId === todo.id" class="absolute right-0 top-full mt-2 w-40 bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-30 py-2">
              <div class="px-3 pb-2 mb-2 border-b border-white/10 flex items-center justify-between">
                <span class="text-[11px] text-gray-400">推迟至...</span>
                <button @click.stop="activeTodoSnoozePopoverId = null" class="text-[11px] text-gray-500 hover:text-gray-300">关闭</button>
              </div>
              <div class="space-y-1 px-1.5">
                <button type="button" class="w-full flex items-center px-2 py-1.5 rounded-lg hover:bg-white/[0.06] text-xs text-gray-200" @click.stop="snoozeTodo(todo, 1, snoozeToastMessage, snoozeToastVisible)">🌞 明天</button>
                <button type="button" class="w-full flex items-center px-2 py-1.5 rounded-lg hover:bg-white/[0.06] text-xs text-gray-200" @click.stop="snoozeTodo(todo, 7, snoozeToastMessage, snoozeToastVisible)">📆 下周</button>
              </div>
            </div>
          </div>
          <!-- Tag edit -->
          <div class="relative flex items-center">
            <button @click.stop="toggleTagPopoverForTodo(todo.id)" class="text-gray-500 hover:text-purple-400 transition-colors p-1" title="修改标签">
              <Tags :size="15" />
            </button>
            <div v-if="activeTodoTagPopoverId === todo.id" class="absolute right-0 top-full mt-2 w-52 bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-30 py-2">
              <div class="px-3 pb-2 mb-2 border-b border-white/10 flex items-center justify-between">
                <span class="text-[11px] text-gray-400">修改标签</span>
                <button @click.stop="activeTodoTagPopoverId = null" class="text-[11px] text-gray-500 hover:text-gray-300">关闭</button>
              </div>
              <div v-if="tags.length === 0" class="px-3 text-[11px] text-gray-600">暂无标签项</div>
              <div v-else class="space-y-1 max-h-48 overflow-y-auto px-1.5">
                <button
                  v-for="tag in tags" :key="tag.id"
                  type="button"
                  class="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/[0.06] text-xs text-gray-200"
                  @click.stop="toggleExistingTodoTag(todo, tag.id)"
                >
                  <div class="flex items-center space-x-2">
                    <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: tag.color }"></span>
                    <span>{{ tag.name }}</span>
                  </div>
                  <Check v-if="(todoTagsByTodoId[todo.id] || []).includes(tag.id)" :size="12" class="text-purple-400" />
                </button>
              </div>
            </div>
          </div>
          <button @click.stop="startEdit(todo)" class="text-gray-500 hover:text-blue-400 transition-colors p-1" title="编辑任务"><Pencil :size="15" /></button>
          <button @click.stop="deleteTodo(todo.id)" class="text-gray-500 hover:text-red-400 transition-colors p-1" title="删除"><Trash2 :size="15" /></button>
        </div>
      </div>

      <!-- Completed separator -->
      <div v-if="displayedCompletedTodos.length > 0" class="flex items-center py-8">
        <div class="flex-1 h-[1px] bg-white/5"></div>
        <span class="px-4 text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold">已完成</span>
        <div class="flex-1 h-[1px] bg-white/5"></div>
      </div>

      <!-- Completed todos -->
      <div
        v-for="todo in displayedCompletedTodos" :key="todo.id"
        class="flex items-center space-x-4 opacity-40 px-4 group"
      >
        <div @click="toggleTodo(todo)" class="w-5 h-5 bg-purple-600/80 rounded flex items-center justify-center cursor-pointer">
          <Check :size="12" class="text-white" />
        </div>
        <div class="flex-1">
          <input
            v-if="editingTodoId === todo.id"
            v-model="editingText"
            @keyup.enter="saveEdit(todo)"
            @blur="saveEdit(todo)"
            @keydown.esc="cancelEdit"
            class="w-full bg-transparent border-b border-white/20 text-sm text-gray-400 line-through focus:outline-none focus:border-purple-500"
          />
          <div v-else class="space-y-1">
            <span class="flex-1 line-through text-gray-400 text-sm font-light" @dblclick.stop="startEdit(todo)">{{ todo.text }}</span>
            <div v-if="getTagsForTodo(todo).length" class="flex flex-wrap gap-1 mt-0.5">
              <span
                v-for="tag in getTagsForTodo(todo)" :key="tag.id"
                class="px-1.5 py-0.5 rounded-full text-[10px] bg-white/[0.03] border"
                :style="{ borderColor: tag.color, color: tag.color }"
              >{{ tag.name }}</span>
            </div>
          </div>
        </div>
        <button @click.stop="deleteTodo(todo.id)" class="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all">
          <Trash2 :size="15" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { Plus, Check, Trash2, Tags, Flame, Pencil, Clock } from 'lucide-vue-next';
import { todayStr } from '../composables/useDateHelpers.js';
import {
  todos, todoTagsByTodoId, newTodoSelectedTagIds, selectedTagsForNewTodo,
  displayedActiveTodos, displayedCompletedTodos,
  activeTagFilterId, activeTodoTagPopoverId, activeTodoSnoozePopoverId,
  editingTodoId, editingText,
  heatmapSelectedDate, selectHeatmapDate, clearHeatmapDate,
  getTodoTagIds, getTagsForTodo, toggleNewTodoTag,
  toggleTagPopoverForTodo, toggleSnoozePopoverForTodo,
  addTodo, deleteTodo, toggleTodo, startEdit, cancelEdit, saveEdit,
  snoozeTodo, toggleExistingTodoTag,
} from '../composables/useTodos.js';
import { tags, tagColorPresets } from '../composables/useTags.js';
import {
  heatmapWeeks, heatmapLoading, heatmapTooltip, heatmapScrollEl,
  getHeatmapCellClass, showHeatmapTooltip, hideHeatmapTooltip,
} from '../composables/useHeatmap.js';
import { db } from '../composables/useDb.js';

const emit = defineEmits(['openTagManager']);

// Local input state
const newTodoText = ref('');
const createTagPopoverOpen = ref(false);
const newTodoInput = ref(null);
const snoozeToastMessage = ref('');
const snoozeToastVisible = ref(false);

// Mention state
const mentionState = ref({ visible: false, query: '', startIndex: -1, selectedIndex: 0 });

const filteredMentionTags = computed(() => {
  if (!mentionState.value.query) return tags.value;
  const q = mentionState.value.query.toLowerCase();
  return tags.value.filter(t => t.name.toLowerCase().includes(q));
});

function handleTodoInput(e) {
  const text = newTodoText.value;
  const cursor = e.target.selectionStart;
  const lastHash = text.lastIndexOf('#', cursor - 1);
  if (lastHash !== -1 && (lastHash === 0 || text[lastHash - 1] === ' ')) {
    const query = text.substring(lastHash + 1, cursor);
    if (!query.includes(' ')) {
      mentionState.value = { visible: true, query, startIndex: lastHash, selectedIndex: 0 };
      return;
    }
  }
  mentionState.value.visible = false;
}

function handleTodoKeydown(e) {
  if (e.isComposing || e.keyCode === 229) return;
  if (mentionState.value.visible) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const max = filteredMentionTags.value.length;
      if (max > 0) mentionState.value.selectedIndex = (mentionState.value.selectedIndex + 1) % max;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const max = filteredMentionTags.value.length;
      if (max > 0) mentionState.value.selectedIndex = (mentionState.value.selectedIndex - 1 + max) % max;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredMentionTags.value.length > 0) {
        selectMentionTag(filteredMentionTags.value[mentionState.value.selectedIndex]);
      } else if (mentionState.value.query) {
        createNewMentionTag(mentionState.value.query);
      }
    } else if (e.key === 'Escape') {
      mentionState.value.visible = false;
    }
  } else {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitTodo();
    }
  }
}

async function createNewMentionTag(tagName) {
  if (!db.value) return;
  try {
    const color = tagColorPresets[Math.floor(Math.random() * tagColorPresets.length)];
    const result = await db.value.execute('INSERT INTO tags (name, color) VALUES (?, ?)', [tagName, color]);
    const newTag = { id: result.lastInsertId, name: tagName, color };
    tags.value.unshift(newTag);
    selectMentionTag(newTag);
  } catch (e) {
    console.error('createNewMentionTag failed:', e);
  }
}

function selectMentionTag(tag) {
  const text = newTodoText.value;
  const start = mentionState.value.startIndex;
  newTodoText.value = text.substring(0, start) + text.substring(start + 1 + mentionState.value.query.length);
  if (!newTodoSelectedTagIds.value.includes(tag.id)) newTodoSelectedTagIds.value.push(tag.id);
  mentionState.value.visible = false;
  nextTick(() => newTodoInput.value?.focus());
}

async function submitTodo() {
  const ok = await addTodo(newTodoText.value, [...newTodoSelectedTagIds.value], createTagPopoverOpen);
  if (ok) newTodoText.value = '';
}

defineExpose({ focus: () => newTodoInput.value?.focus() });
</script>
