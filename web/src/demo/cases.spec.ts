import { describe, expect, it } from 'vitest'
import { demoCases } from '@/demo/cases'

describe('demoCases', () => {
  it('leads with Hard (repo), then weak / thin / strong', () => {
    expect(demoCases.map((c) => c.id)).toEqual(['repo', 'weak', 'thin', 'strong'])
    expect(demoCases[0]?.payload.founderName).toBe('NestJS')
  })

  it('strong case has a public proof URL', () => {
    const strong = demoCases.find((c) => c.id === 'strong')
    expect(strong?.payload.proofUrl).toMatch(/^https:\/\//)
    expect(strong?.payload.proofType).toBe('url')
  })

  it('repo case points at a public GitHub repo', () => {
    const repo = demoCases.find((c) => c.id === 'repo')
    expect(repo?.payload.proofType).toBe('repo')
    expect(repo?.payload.proofUrl).toMatch(/^https:\/\/github\.com\//)
    expect(repo?.payload.claim.toLowerCase()).toMatch(/release/)
  })

  it('weak case has no proof URL', () => {
    const weak = demoCases.find((c) => c.id === 'weak')
    expect(weak?.payload.proofUrl).toBeUndefined()
  })
})
