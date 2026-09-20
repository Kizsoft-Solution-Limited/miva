import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PayoutSendPanel from '@/components/investor/PayoutSendPanel.vue'

vi.mock('@/lib/orbio/activate', () => ({
  connectOrbioWallet: vi.fn(),
  quoteBuyAndActivate: vi.fn(),
  buyAndActivateForFounder: vi.fn(),
  activateCreditForFounder: vi.fn(),
  explorerTxUrl: (hash: string) => `https://robin.etherscan.io/tx/${hash}`,
}))

describe('PayoutSendPanel', () => {
  it('shows founder wallet and buy & activate controls', () => {
    const wallet = '0xAa07A0e9209e16aC99708C3EC70159c6eF3128A3'
    const wrapper = mount(PayoutSendPanel, {
      props: { wallet, approved: true },
    })
    expect(wrapper.text()).toContain(wallet)
    expect(wrapper.text()).toContain('Activate for founder')
    expect(wrapper.text()).toContain('Buy & activate')
    expect(wrapper.text()).toContain('Connect wallet')
  })
})
