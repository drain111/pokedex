import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto', // Automatically injects the registration script into index.html      
      devOptions: {
        enabled: true // <--- THIS enables virtual:vite-pwa/register-sw in dev mode
      },
      manifest: {
        name: 'Vue Pokedex',
        short_name: 'Pokedex',
        description: 'An offline-capable Pokémon application',
        theme_color: '#ffffff',
        
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      }
    }),
  ],
  base: mode === 'production' ? '/pokedex/' : '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))