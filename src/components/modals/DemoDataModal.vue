<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center" @click.self="isDemoDataModalOpen = false">
    <div class="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 w-[400px] shadow-2xl">
      <h2 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
        <LayoutDashboard :size="18" class="text-green-500" />
        <span>体验数据</span>
      </h2>
      <p class="text-[12px] text-gray-400 mb-6 leading-relaxed">一键生成过去半年的 PM 示例任务与存档。</p>

      <div class="space-y-4">
        <button
          type="button"
          :disabled="seedDemoLoading || clearDemoLoading"
          @click="seedDemoData"
          class="w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20"
        >
          {{ seedDemoLoading ? '生成中...' : '生成示例数据' }}
        </button>

        <button
          type="button"
          :disabled="seedDemoLoading || clearDemoLoading"
          @click="clearDemoData"
          class="w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20"
        >
          {{ clearDemoLoading ? '清除中...' : '一键清除体验数据' }}
        </button>

        <p v-if="seedDemoMessage" class="mt-2 text-[11px] text-center" :class="seedDemoMessage.includes('失败') ? 'text-amber-400' : 'text-green-400'">{{ seedDemoMessage }}</p>
      </div>

      <div class="flex justify-end mt-6">
        <button @click="isDemoDataModalOpen = false" class="px-5 py-2.5 text-gray-400 hover:text-white text-sm transition-colors w-full bg-white/5 hover:bg-white/10 rounded-lg">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { LayoutDashboard } from 'lucide-vue-next';
import { isDemoDataModalOpen, seedDemoLoading, clearDemoLoading, seedDemoMessage, seedDemoData, clearDemoData } from '../../composables/useDemoData.js';
</script>
