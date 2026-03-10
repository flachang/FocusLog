<template>
  <div class="w-full max-w-2xl px-6">
    <header class="mb-12">
      <h1 class="text-3xl font-semibold text-white mb-2 tracking-tight">回顾中心</h1>
      <p class="text-gray-500 text-sm font-light">选择时间范围，基于任务与日记生成周报 / 月报回顾</p>
    </header>

    <div class="space-y-6">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-500 mb-1">开始日期</label>
          <input type="date" v-model="reviewStartDate" class="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">结束日期</label>
          <input type="date" v-model="reviewEndDate" class="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10" />
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <button @click="generateReviewReport" class="inline-flex items-center px-4 py-2 rounded-xl bg-white text-black text-sm font-medium shadow-[0_10px_40px_rgba(255,255,255,0.18)] hover:scale-105 active:scale-95 transition-all">
          <Sparkles :size="16" class="mr-2" />
          生成回顾报告
        </button>
        <span v-if="reviewStatsText" class="text-[11px] text-gray-600">{{ reviewStatsText }}</span>
      </div>

      <div class="bg-white/[0.03] border border-white/5 rounded-2xl p-5 min-h-[220px] text-sm">
        <div v-if="reviewLoading" class="flex flex-col items-center justify-center h-full space-y-3">
          <Loader2 :size="22" class="text-purple-500 animate-spin" />
          <p class="text-gray-500">AI 正在生成阶段性回顾...</p>
        </div>
        <div v-else-if="reviewError" class="text-red-400 whitespace-pre-wrap leading-relaxed">{{ reviewError }}</div>
        <div v-else-if="reviewContent" class="whitespace-pre-wrap leading-relaxed text-gray-300 font-mono">{{ reviewContent }}</div>
        <div v-else class="flex items-center justify-center h-full">
          <p class="text-gray-600 text-sm">请选择日期范围并点击「生成回顾报告」。</p>
        </div>
      </div>

      <div v-if="reviewContent" class="flex items-end space-x-3">
        <div class="flex-1">
          <label class="block text-xs text-gray-500 mb-1">保存为文件名</label>
          <input
            type="text"
            v-model="reviewFileName"
            placeholder="例如：Weekly_2024_W43.md（留空则自动生成周报文件名）"
            class="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10"
          />
        </div>
        <button @click="$emit('saveReview')" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors">
          保存为 Markdown
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Sparkles, Loader2 } from 'lucide-vue-next';
import {
  reviewStartDate, reviewEndDate, reviewLoading, reviewError,
  reviewContent, reviewFileName, reviewStatsText,
  generateReviewReport,
} from '../composables/useAI.js';

defineEmits(['saveReview']);
</script>
