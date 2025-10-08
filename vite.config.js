import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // 关键：不拆分 CSS，所有资源都内联
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,     // 提高内联阈值
    rollupOptions: {
      output: { manualChunks: undefined } // 禁止分包
    }
  }
})
