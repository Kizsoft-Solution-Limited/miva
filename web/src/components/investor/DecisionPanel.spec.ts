import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DecisionPanel from '@/components/investor/DecisionPanel.vue'

describe('DecisionPanel', () => {
  it('stacks actions full-width on mobile', () => {
    const wrapper = mount(DecisionPanel)
    const row = wrapper.find('.grid.grid-cols-1')
    expect(row.exists()).toBe(true)
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
    for (const btn of buttons) {
      const cls = btn.classes().join(' ')
      expect(cls).toContain('w-full')
      expect(cls).toContain('flex')
    }
  })

  it('emits approve with optional note', async () => {
    const wrapper = mount(DecisionPanel)
    await wrapper.find('textarea').setValue('Ship it')
    await wrapper.findAll('button')[0]!.trigger('click')
    expect(wrapper.emitted('decide')?.[0]).toEqual(['approved', 'Ship it'])
  })

  it('emits more_info_requested and rejected', async () => {
    const wrapper = mount(DecisionPanel)
    const buttons = wrapper.findAll('button')
    await buttons[1]!.trigger('click')
    await buttons[2]!.trigger('click')
    expect(wrapper.emitted('decide')?.[0]?.[0]).toBe('more_info_requested')
    expect(wrapper.emitted('decide')?.[1]?.[0]).toBe('rejected')
  })
})
