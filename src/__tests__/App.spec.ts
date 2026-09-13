// App.spec.ts — is the router shell wired up correctly?
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'

describe('App', () => {
  it('renders the shell and the matched route', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: { template: '<div class="stub-home">home</div>' } }],
    })
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: { plugins: [router] },
    })

    expect(wrapper.find('.app-shell').exists()).toBe(true)
    expect(wrapper.find('.stub-home').exists()).toBe(true) // confirms router-view actually rendered something
  })
})