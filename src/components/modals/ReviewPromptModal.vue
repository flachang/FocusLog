<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center" @click.self="isReviewPromptOpen = false">
    <div class="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 w-[500px] shadow-2xl">
      <h2 class="text-lg font-bold text-white mb-4 flex items-center space-x-2">
        <Archive :size="18" class="text-cyan-400" />
        <span>AI 归档提示词</span>
      </h2>
      <p class="text-[12px] text-gray-400 mb-4 leading-relaxed">
        自定义生成「阶段性回顾报告」时的系统提示词。留空则使用默认范本。
      </p>
      <textarea
        v-model="customReviewPromptInput"
        placeholder="留空以使用预设提示词..."
        class="w-full min-h-[180px] bg-white/[0.03] border border-white/10 rounded-lg p-4 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all font-mono leading-relaxed resize-y"
      ></textarea>
      <div class="flex justify-end space-x-3 mt-6">
        <button @click="isReviewPromptOpen = false" class="px-5 py-2.5 text-gray-400 hover:text-white text-sm transition-colors">取消</button>
        <button @click="saveReviewPrompt(showToast)" class="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Archive } from 'lucide-vue-next';
import { isReviewPromptOpen, customReviewPromptInput, saveReviewPrompt } from '../../composables/useSettings.js';

defineProps({ showToast: { type: Function, required: true } });
</script>
