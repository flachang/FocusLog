<template>
  <div class="w-full max-w-2xl px-6">
    <header class="mb-12">
      <h1 class="text-3xl font-semibold text-white mb-2 tracking-tight">总结存档</h1>
      <p class="text-gray-500 text-sm font-light">AI 生成的工作日志存档</p>
    </header>

    <div v-if="archives.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-600">
      <Sparkles :size="40" class="mb-4 opacity-30" />
      <p class="text-sm">暂无存档，请先生成今日总结并保存</p>
    </div>

    <div
      v-for="arc in archives" :key="arc.id"
      class="mb-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 hover:border-white/10 transition-all"
    >
      <div class="flex justify-between items-center mb-4">
        <span class="text-sm text-purple-400 font-medium">{{ arc.date }}</span>
        <button @click="deleteArchive(arc.id)" class="text-gray-600 hover:text-red-400 transition-all">
          <Trash2 :size="14" />
        </button>
      </div>
      <div class="whitespace-pre-wrap text-sm text-gray-400 font-mono leading-relaxed">{{ arc.content }}</div>
    </div>
  </div>
</template>

<script setup>
import { Sparkles, Trash2 } from 'lucide-vue-next';
import { archives, deleteArchive } from '../composables/useArchives.js';
</script>
