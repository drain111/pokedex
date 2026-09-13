import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { createPiniaFavoritesRepository } from './adapters/PiniaFavoritesRepository'
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.provide('favoritesRepository', createPiniaFavoritesRepository())  // 2. now safe to call useFavoriteStore()
app.mount('#app')
