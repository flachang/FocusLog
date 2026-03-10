<template>
  <div class="max-w-3xl px-6">
    <header class="mb-12">
      <h1 class="text-3xl font-semibold text-white mb-2 tracking-tight">设置</h1>
      <p class="text-gray-500 text-sm font-light">配置 API 供应商及自定义 AI 提示词</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div @click="isApiSettingsOpen = true" class="group bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 hover:border-purple-500/30 hover:bg-white/[0.04] transition-all cursor-pointer">
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
          <KeyRound :size="20" class="text-purple-400" />
        </div>
        <h3 class="text-sm font-bold text-white mb-1">API 设置</h3>
        <p class="text-[11px] text-gray-500 leading-relaxed">配置供应商、密钥及模型名称</p>
      </div>

      <div @click="openDailyPrompt" class="group bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 hover:border-orange-500/30 hover:bg-white/[0.04] transition-all cursor-pointer">
        <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
          <Sparkles :size="20" class="text-orange-400" />
        </div>
        <h3 class="text-sm font-bold text-white mb-1">AI 日志提示词</h3>
        <p class="text-[11px] text-gray-500 leading-relaxed">自定义每日总结的系统 Prompt</p>
      </div>

      <div @click="openReviewPrompt" class="group bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all cursor-pointer">
        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
          <Archive :size="20" class="text-cyan-400" />
        </div>
        <h3 class="text-sm font-bold text-white mb-1">AI 归档提示词</h3>
        <p class="text-[11px] text-gray-500 leading-relaxed">自定义回顾报告的系统 Prompt</p>
      </div>

      <div @click="isDemoDataModalOpen = true" class="group bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 hover:border-green-500/30 hover:bg-white/[0.04] transition-all cursor-pointer">
        <div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
          <LayoutDashboard :size="20" class="text-green-400" />
        </div>
        <h3 class="text-sm font-bold text-white mb-1">体验数据</h3>
        <p class="text-[11px] text-gray-500 leading-relaxed">一键生成示例任务与存档体验完整的应用工作流</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { KeyRound, Sparkles, Archive, LayoutDashboard } from 'lucide-vue-next';
import { isApiSettingsOpen, openDailyPrompt, openReviewPrompt } from '../composables/useSettings.js';
import { isDemoDataModalOpen } from '../composables/useDemoData.js';
</script>
