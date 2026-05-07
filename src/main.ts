import { createApp } from 'vue'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import { router } from './router'
import './lib/firebase'
import './style.css'

if (import.meta.env.PROD) {
  registerSW({ immediate: true })
}

createApp(App).use(router).mount('#app')
