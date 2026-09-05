import { describe, expect, it } from 'vitest'
import { demoCases } from '@/demo/cases'

describe('demoCases', () => {
  it('ships strong / weak / thin for the cold demo', () => {
    expect(demoCases.map((c) => c.id).sort()).toEqual(['strong', 'thin', 'weak'])
  })

  it('strong case has a public proof URL', () => {
    const strong = demoCases.find((c) => c.id === 'strong')
    expect(strong?.payload.proofUrl).toMatch(/^https:\/\//)
    expect(strong?.payload.proofType).toBe('url')
  })

  it('weak case has no proof URL', () => {
    const weak = demoCases.find((c) => c.id === 'weak')
    expect(weak?.payload.proofUrl).toBeUndefined()
  })
})
