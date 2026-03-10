<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center" @click.self="closeTagManager">
    <div class="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 w-[440px] shadow-2xl">
      <h2 class="text-lg font-bold text-white mb-6 flex items-center space-x-2">
        <Tags :size="18" class="text-purple-500" />
        <span>管理标签</span>
      </h2>

      <div class="space-y-5">
        <div class="space-y-2">
          <label class="text-xs text-gray-400 block">标签名称</label>
          <input
            type="text"
            v-model="tagNameInput"
            placeholder="例如：工作、学习、Side Project..."
            class="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all text-sm"
          />
        </div>

        <div class="space-y-2">
          <label class="text-xs text-gray-400 block">标签颜色</label>
          <div class="flex items-center space-x-2">
            <button
              v-for="color in tagColorPresets" :key="color"
              type="button"
              @click="tagColorInput = color"
              class="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center transition-all"
              :style="{ backgroundColor: color }"
            >
              <div v-if="tagColorInput === color" class="w-3 h-3 rounded-full border border-white bg-white/70"></div>
            </button>
          </div>
        </div>

        <div class="flex justify-end">
          <button
            type="button"
            @click="addTag"
            class="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
            :disabled="!tagNameInput.trim()"
          >
            添加标签
          </button>
        </div>

        <div class="border-t border-white/10 pt-4 mt-2 max-h-60 overflow-y-auto">
          <p class="text-xs text-gray-500 mb-3">已有标签</p>
          <div v-if="tags.length === 0" class="text-xs text-gray-600 py-2">暂无标签，请先在上方添加。</div>
          <div v-else class="space-y-2">
            <div
              v-for="tag in tags" :key="tag.id"
              class="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06]"
            >
              <div class="flex items-center space-x-2">
                <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: tag.color }"></span>
                <span class="text-sm text-gray-200">{{ tag.name }}</span>
              </div>
              <button
                type="button"
                @click="handleDeleteTag(tag.id)"
                class="text-[11px] text-gray-500 hover:text-red-400 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button type="button" @click="closeTagManager" class="px-4 py-2.5 text-gray-400 hover:text-white text-sm transition-colors">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Tags } from 'lucide-vue-next';
import {
  tags, tagNameInput, tagColorInput, tagColorPresets,
  isTagManagerOpen, closeTagManager, addTag, deleteTagItem,
} from '../../composables/useTags.js';
import { newTodoSelectedTagIds, todoTagsByTodoId, loadTodoTags } from '../../composables/useTodos.js';

async function handleDeleteTag(id) {
  await deleteTagItem(id, newTodoSelectedTagIds, todoTagsByTodoId);
  await loadTodoTags();
}
</script>
