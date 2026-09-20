import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import OrbioSetupPanel from '@/components/founder/OrbioSetupPanel.vue'
import { useRoleStore } from '@/stores/role'

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  fetchMe: vi.fn(),
  setOrbioKey: vi.fn(async () => ({ hasOrbioKey: true })),
  clearOrbioKey: vi.fn(async () => ({ hasOrbioKey: false })),
  setWallet: vi.fn(async () => ({
    walletAddress: '0xAa07A0e9209e16aC99708C3EC70159c6eF3128A3',
  })),
  clearWallet: vi.fn(async () => ({ walletAddress: null })),
}))

describe('OrbioSetupPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('saves key and wallet from one panel', async () => {
    const store = useRoleStore()
    store.role = 'founder'
    store.email = 'f@example.com'
    const wrapper = mount(OrbioSetupPanel)
    const inputs = wrapper.findAll('input')
    expect(inputs).toHaveLength(2)

    await inputs[0].setValue('sk-orbio-PwkA1GhWDxZ3')
    const saveKey = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Save key')
    expect(saveKey).toBeTruthy()
    await saveKey!.trigger('click')
    await flushPromises()
    expect(store.hasOrbioKey).toBe(true)

    await inputs[1].setValue('0xAa07A0e9209e16aC99708C3EC70159c6eF3128A3')
    const saveWallet = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Save wallet')
    await saveWallet!.trigger('click')
    await flushPromises()
    expect(store.walletAddress).toBe(
      '0xAa07A0e9209e16aC99708C3EC70159c6eF3128A3',
    )
  })
})
