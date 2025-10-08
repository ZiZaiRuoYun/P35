import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './app.css';

const app = createApp(App)
const pinia = createPinia()

// 全局错误可视化
app.config.errorHandler = (err, instance, info) => {
  console.error('🔥 Vue error:', err, info)
}
window.addEventListener('error', e => console.error('🔥 Window error:', e.error || e.message))
window.addEventListener('unhandledrejection', e => console.error('🔥 Promise rejection:', e.reason))

app.use(pinia)

app.mount('#app')

window.$pinia = pinia
import { useDocStore } from './stores/doc'
window.$doc = useDocStore()
