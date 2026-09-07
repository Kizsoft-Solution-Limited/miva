import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'

async function mountHeader(path = '/') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/founder', component: { template: '<div />' } },
      { path: '/investor', component: { template: '<div />' } },
    ],
  })
  await router.push(path)
  await router.isReady()
  return mount(AppHeader, {
    global: { plugins: [router] },
  })
}

describe('AppHeader', () => {
  it('keeps Submit proof visible and opens mobile nav', async () => {
    const wrapper = await mountHeader('/')
    expect(wrapper.text()).toContain('Submit proof')

    const btn = wrapper.get('button[aria-controls="app-mobile-nav"]')
    expect(btn.attributes('aria-expanded')).toBe('false')
    await btn.trigger('click')
    expect(btn.attributes('aria-expanded')).toBe('true')

    const mobile = wrapper.get('#app-mobile-nav')
    expect(mobile.text()).toContain('Protocol')
    expect(mobile.text()).toContain('Try')
    expect(mobile.text()).toContain('Founder')
    expect(mobile.text()).toContain('Investor')
  })

  it('shows Home in mobile nav off the landing page', async () => {
    const wrapper = await mountHeader('/founder')
    await wrapper.get('button[aria-controls="app-mobile-nav"]').trigger('click')
    expect(wrapper.get('#app-mobile-nav').text()).toContain('Home')
    expect(wrapper.get('#app-mobile-nav').text()).not.toContain('Protocol')
  })
})
