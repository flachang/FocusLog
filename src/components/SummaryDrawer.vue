<template>
  <!-- Overlay -->
  <div v-if="isSummaryOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" @click="isSummaryOpen = false"></div>

  <!-- Drawer -->
  <div
    :class="isSummaryOpen ? 'translate-x-0' : 'translate-x-full'"
    class="fixed right-0 top-0 h-full w-[450px] bg-[#121212] border-l border-white/10 z-50 transition-transform duration-500 p-8 flex flex-col"
  >
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-xl font-bold text-white flex items-center space-x-2">
        <Sparkles :size="20" class="text-purple-500" />
        <span>AI 日志生成</span>
      </h2>
      <button @click="isSummaryOpen = false" class="text-gray-500 hover:text-white">✕</button>
    </div>

    <div class="flex-1 bg-white/[0.03] rounded-2xl p-6 text-sm border border-white/5 overflow-y-auto">
      <div v-if="summaryLoading" class="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 :size="24" class="text-purple-500 animate-spin" />
        <p class="text-gray-500">AI 正在生成工作日志...</p>
      </div>
      <div v-else-if="summaryError" class="flex flex-col items-center justify-center h-full space-y-4">
        <p class="text-red-400 text-center leading-relaxed">{{ summaryError }}</p>
        <button v-if="!apiKey" @click="$emit('goToSettings')" class="text-purple-400 hover:text-purple-300 underline text-xs">前往设置</button>
      </div>
      <div v-else-if="summaryContent" class="whitespace-pre-wrap leading-relaxed text-gray-300 font-mono">{{ summaryContent }}</div>
      <div v-else class="flex items-center justify-center h-full">
        <p class="text-gray-600">点击下方按钮生成今日总结</p>
      </div>
    </div>

    <button
      v-if="summaryContent && !summaryLoading"
      @click="$emit('saveArchive')"
      class="w-full mt-6 bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center space-x-2"
    >
      <span>保存为 Markdown 存档</span>
    </button>
  </div>
</template>

<script setup>
import { Sparkles, Loader2 } from 'lucide-vue-next';
import { isSummaryOpen, summaryContent, summaryLoading, summaryError } from '../composables/useAI.js';
import { apiKey } from '../composables/useSettings.js';

defineEmits(['saveArchive', 'goToSettings']);
</script>
