import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  fetchMe: vi.fn(),
}))

async function mountHeader(path = '/') {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/founder', component: { template: '<div />' } },
      { path: '/investor', component: { template: '<div />' } },
      { path: '/login', component: { template: '<div />' } },
    ],
  })
  await router.push(path)
  await router.isReady()
  return mount(AppHeader, {
    global: { plugins: [router, pinia] },
  })
}

describe('AppHeader', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('keeps Submit proof visible and opens mobile nav', async () => {
    const wrapper = await mountHeader('/')
    expect(wrapper.text()).toContain('Submit proof')
    expect(wrapper.text()).toContain('Sign in')

    const btn = wrapper.get('button[aria-controls="app-mobile-nav"]')
    await btn.trigger('click')
    expect(wrapper.get('#app-mobile-nav').text()).toContain('Queue')
    expect(wrapper.get('#app-mobile-nav').text()).toContain('Sign in')
  })

  it('shows Home in mobile nav off the landing page', async () => {
    const wrapper = await mountHeader('/founder')
    await wrapper.get('button[aria-controls="app-mobile-nav"]').trigger('click')
    expect(wrapper.get('#app-mobile-nav').text()).toContain('Home')
    expect(wrapper.get('#app-mobile-nav').text()).not.toContain('Protocol')
  })
})
