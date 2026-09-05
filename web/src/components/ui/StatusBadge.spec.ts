import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from '@/components/ui/StatusBadge.vue'

describe('StatusBadge', () => {
  it('renders the label', () => {
    const wrapper = mount(StatusBadge, {
      props: { label: 'approve', tone: 'good' },
    })
    expect(wrapper.text()).toContain('approve')
  })

  it('defaults to neutral tone classes', () => {
    const wrapper = mount(StatusBadge, {
      props: { label: 'pending' },
    })
    expect(wrapper.classes().join(' ')).toContain('bg-[var(--paper-2)]')
  })
})
