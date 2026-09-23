import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { createPiniaFavoritesRepository } from './adapters/PiniaFavoritesRepository'
import { createidbCacheRepository } from './adapters/idbCacheRepository'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.provide('favoritesRepository', createPiniaFavoritesRepository())  // 2. now safe to call useFavoriteStore()
app.provide('cacheRepository', createidbCacheRepository()) 
app.mount('#app')
