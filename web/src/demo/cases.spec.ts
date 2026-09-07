import { describe, expect, it } from 'vitest'
import { demoCases } from '@/demo/cases'

describe('demoCases', () => {
  it('leads with Hard repo, then on-chain, then weak / thin / strong', () => {
    expect(demoCases.map((c) => c.id)).toEqual([
      'repo',
      'onchain',
      'weak',
      'thin',
      'strong',
    ])
    expect(demoCases[0]?.payload.founderName).toBe('NestJS')
  })

  it('onchain case points at a mainnet contract on etherscan', () => {
    const onchain = demoCases.find((c) => c.id === 'onchain')
    expect(onchain?.payload.proofType).toBe('onchain')
    expect(onchain?.payload.proofUrl).toMatch(/etherscan\.io\/address\/0x/i)
    expect(onchain?.payload.claim.toLowerCase()).toMatch(/smart contract|ethereum/)
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
