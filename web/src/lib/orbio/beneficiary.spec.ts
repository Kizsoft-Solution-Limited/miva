import { describe, expect, it } from 'vitest'
import { shortAddress, toBeneficiary } from './beneficiary'

describe('toBeneficiary', () => {
  it('pads a wallet to bytes32', () => {
    const out = toBeneficiary('0xf9370bf1431be75e97a26ec7d74b7a477b58dd32')
    expect(out.toLowerCase()).toBe(
      '0x000000000000000000000000f9370bf1431be75e97a26ec7d74b7a477b58dd32',
    )
    expect(out.startsWith('0x')).toBe(true)
    expect(out.length).toBe(66)
  })

  it('rejects junk', () => {
    expect(() => toBeneficiary('not-an-address')).toThrow(/valid 0x/)
  })
})

describe('shortAddress', () => {
  it('truncates long addresses', () => {
    expect(shortAddress('0xf9370bf1431be75e97a26ec7d74b7a477b58dd32')).toBe(
      '0xf9370b…58dd32',
    )
  })
})
