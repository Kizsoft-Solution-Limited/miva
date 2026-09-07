import { describe, expect, it, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import VerifyProgressPopover from '@/components/ui/VerifyProgressPopover.vue'

describe('VerifyProgressPopover', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows percent while busy', async () => {
    vi.useFakeTimers()
    const wrapper = mount(VerifyProgressPopover, {
      props: { busy: true },
      attachTo: document.body,
    })
    await nextTick()
    expect(document.body.textContent).toContain('%')
    expect(document.body.textContent).toContain('Running check')
    vi.advanceTimersByTime(600)
    await flushPromises()
    expect(document.body.textContent).toMatch(/\d+%/)
    wrapper.unmount()
  })

  it('hides after busy ends', async () => {
    vi.useFakeTimers()
    const wrapper = mount(VerifyProgressPopover, {
      props: { busy: true },
      attachTo: document.body,
    })
    await nextTick()
    await wrapper.setProps({ busy: false })
    expect(document.body.textContent).toContain('100%')
    vi.advanceTimersByTime(500)
    await nextTick()
    expect(document.body.querySelector('.verify-pop')).toBeNull()
    wrapper.unmount()
  })
})
