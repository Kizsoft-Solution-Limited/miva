import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import { useRoleStore } from '@/stores/role'

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  fetchMe: vi.fn(),
  logout: vi.fn(),
}))

describe('LoginView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  async function mountLogin() {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', component: LoginView },
        { path: '/', component: { template: '<div />' } },
        { path: '/founder', component: { template: '<div />' } },
        { path: '/investor', component: { template: '<div />' } },
      ],
    })
    await router.push('/login')
    await router.isReady()
    const wrapper = mount(LoginView, { global: { plugins: [router, pinia] } })
    return { wrapper, router, pinia }
  }

  it('shows sign in and create account', async () => {
    const { wrapper } = await mountLogin()
    expect(wrapper.text()).toContain('Sign in')
    expect(wrapper.text()).toContain('Create account')
    expect(wrapper.find('input[name="email"]').exists()).toBe(true)
    expect(wrapper.find('input[name="password"]').exists()).toBe(true)
    expect(wrapper.find('input[name="password"]').attributes('type')).toBe('password')
    await wrapper.get('button[aria-label="Show password"]').trigger('click')
    expect(wrapper.find('input[name="password"]').attributes('type')).toBe('text')
  })

  it('redirects signed-in founders away from login', async () => {
    const { router, pinia } = await mountLogin()
    const store = useRoleStore(pinia)
    store.role = 'founder'
    store.email = 'founder@example.com'
    store.hydrated = true
    await router.push('/login')
    const wrapper = mount(LoginView, { global: { plugins: [router, pinia] } })
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/founder')
    wrapper.unmount()
  })

  it('keeps login when next is set for role switch', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useRoleStore(pinia)
    store.role = 'founder'
    store.email = 'founder@example.com'
    store.hydrated = true
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', component: LoginView },
        { path: '/', component: { template: '<div />' } },
        { path: '/founder', component: { template: '<div />' } },
        { path: '/investor/:id', component: { template: '<div />' } },
      ],
    })
    await router.push('/login?next=/investor/abc')
    await router.isReady()
    mount(LoginView, { global: { plugins: [router, pinia] } })
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toContain('/login')
    expect(router.currentRoute.value.query.next).toBe('/investor/abc')
  })
})
