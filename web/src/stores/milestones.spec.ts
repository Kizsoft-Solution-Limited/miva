import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMilestoneStore } from '@/stores/milestones'

vi.mock('@/api/milestones', () => ({
  listMilestones: vi.fn(async () => [
    {
      id: '1',
      title: 'A',
      claim: 'c',
      founderName: 'f',
      proofType: 'url',
      proofUrl: null,
      proofText: null,
      proofFileName: null,
      hasProofFile: false,
      createdAt: '',
      updatedAt: '',
      verdict: null,
      verdictHistory: [],
    },
  ]),
  getMilestone: vi.fn(),
  createMilestone: vi.fn(async (payload: { title: string }) => ({
    id: 'new',
    title: payload.title,
    claim: 'c',
    founderName: 'f',
    proofType: 'url',
    proofUrl: 'https://billspot.co',
    proofText: null,
    proofFileName: null,
    hasProofFile: false,
    createdAt: '',
    updatedAt: '',
    verdict: null,
    verdictHistory: [],
  })),
  decideMilestone: vi.fn(),
  recheckMilestone: vi.fn(),
}))

describe('useMilestoneStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetchAll loads items', async () => {
    const store = useMilestoneStore()
    await store.fetchAll()
    expect(store.items).toHaveLength(1)
    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('submit prepends created milestone', async () => {
    const store = useMilestoneStore()
    const created = await store.submit({
      title: 'Public site live',
      claim: 'live',
      founderName: 'Ada',
      proofType: 'url',
      proofUrl: 'https://billspot.co',
    })
    expect(created.id).toBe('new')
    expect(store.current?.id).toBe('new')
    expect(store.items[0]?.id).toBe('new')
  })
})
