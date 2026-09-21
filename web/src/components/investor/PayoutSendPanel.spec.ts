import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PayoutSendPanel from '@/components/investor/PayoutSendPanel.vue'
import {
  buyAndActivateForFounder,
  connectOrbioWallet,
  quoteBuyAndActivate,
} from '@/lib/orbio/activate'

vi.mock('@/lib/orbio/activate', () => ({
  connectOrbioWallet: vi.fn(),
  quoteBuyAndActivate: vi.fn(),
  buyAndActivateForFounder: vi.fn(),
  activateCreditForFounder: vi.fn(),
  explorerTxUrl: (hash: string) => `https://robin.etherscan.io/tx/${hash}`,
}))

describe('PayoutSendPanel', () => {
  beforeEach(() => {
    vi.mocked(connectOrbioWallet).mockReset()
    vi.mocked(quoteBuyAndActivate).mockReset()
    vi.mocked(buyAndActivateForFounder).mockReset()
  })

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

  it('shows a short line when the wallet rejects the tx', async () => {
    const wallet = '0xAa07A0e9209e16aC99708C3EC70159c6eF3128A3'
    vi.mocked(connectOrbioWallet).mockResolvedValue(
      '0x4840612d7e70aa93abd31973924ca2cf6fd78547',
    )
    vi.mocked(quoteBuyAndActivate).mockResolvedValue({
      creditOut: 6148685n,
      usdgSpent: 5000000n,
      creditedAtoms: 5841250n,
      activationFeeAtoms: 307435n,
      maxFills: 64n,
      creditOutLabel: '6.148685',
      creditedLabel: '5.84125',
    })
    vi.mocked(buyAndActivateForFounder).mockRejectedValue(
      new Error(
        'User rejected the request.\n\nRequest Arguments:\n  from: 0xabc\nDocs: https://viem.sh',
      ),
    )

    const wrapper = mount(PayoutSendPanel, {
      props: { wallet, approved: true },
    })

    const connect = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Connect wallet'))
    await connect!.trigger('click')
    await flushPromises()

    const send = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Buy & activate'))
    await send!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Cancelled in wallet.')
    expect(wrapper.text()).not.toContain('Request Arguments')
    expect(wrapper.text()).not.toContain('viem.sh')
  })
})
