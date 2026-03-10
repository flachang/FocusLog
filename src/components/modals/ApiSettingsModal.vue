<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center" @click.self="isApiSettingsOpen = false">
    <div class="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 w-[440px] shadow-2xl">
      <h2 class="text-lg font-bold text-white mb-6 flex items-center space-x-2">
        <KeyRound :size="18" class="text-purple-500" />
        <span>API 设置</span>
      </h2>
      <div class="space-y-4">
        <div>
          <label class="text-xs text-gray-400 mb-2 block">API 供应商</label>
          <select v-model="apiProviderInput" @change="onProviderChange" class="w-full bg-[#1F1F1F] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 transition-all text-sm">
            <option v-for="p in providers" :key="p.id" :value="p.id" class="bg-[#1F1F1F]">{{ p.label }}</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-2 block">API 密钥 (API Key)</label>
          <input type="password" v-model="apiKeyInput" placeholder="sk-..." class="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all text-sm font-mono" />
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-2 block">接口地址 (Base URL)</label>
          <input type="text" v-model="apiBaseUrlInput" placeholder="https://..." class="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm font-mono" />
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-2 block">模型名称 (Model)</label>
          <input type="text" v-model="apiModelInput" placeholder="deepseek-chat" class="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm font-mono" />
        </div>
        <p class="text-[11px] text-gray-600">密钥仅加密保存在本地 SQLite 数据库中。</p>
      </div>
      <div class="flex justify-end space-x-3 mt-8">
        <button @click="isApiSettingsOpen = false" class="px-5 py-2.5 text-gray-400 hover:text-white text-sm transition-colors">取消</button>
        <button @click="saveApiSettings(showToast)" class="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">保存配置</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { KeyRound } from 'lucide-vue-next';
import {
  isApiSettingsOpen, apiKeyInput, apiProviderInput, apiBaseUrlInput, apiModelInput,
  providers, onProviderChange, saveApiSettings,
} from '../../composables/useSettings.js';

const props = defineProps({ showToast: { type: Function, required: true } });
</script>
