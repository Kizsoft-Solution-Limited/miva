import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MilestoneSubmitForm from '@/components/founder/MilestoneSubmitForm.vue'

describe('MilestoneSubmitForm', () => {
  it('fills from preset', async () => {
    const wrapper = mount(MilestoneSubmitForm, {
      props: {
        preset: {
          founderName: 'Demo Founder',
          title: 'Public site live',
          claim: 'BillSpot is live at billspot.co',
          proofType: 'url',
          proofUrl: 'https://billspot.co',
        },
      },
    })
    await wrapper.vm.$nextTick()
    expect((wrapper.find('input[name="founderName"]').element as HTMLInputElement).value).toBe(
      'Demo Founder',
    )
    expect((wrapper.find('input[name="title"]').element as HTMLInputElement).value).toBe(
      'Public site live',
    )
  })

  it('blocks invalid proof URL', async () => {
    const wrapper = mount(MilestoneSubmitForm)
    await wrapper.find('input[name="founderName"]').setValue('Ada')
    await wrapper.find('input[name="title"]').setValue('Site live')
    await wrapper.find('textarea[name="claim"]').setValue('Site should be live now')
    await wrapper.find('input[name="proofUrl"]').setValue('not-a-url')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Proof URL is not a valid link.')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('emits submit for a valid URL proof', async () => {
    const wrapper = mount(MilestoneSubmitForm)
    await wrapper.find('input[name="founderName"]').setValue('Ada')
    await wrapper.find('input[name="title"]').setValue('Site live')
    await wrapper.find('textarea[name="claim"]').setValue('Site should be live now')
    await wrapper.find('input[name="proofUrl"]').setValue('https://billspot.co')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({
      founderName: 'Ada',
      title: 'Site live',
      proofType: 'url',
      proofUrl: 'https://billspot.co',
    })
  })
})
