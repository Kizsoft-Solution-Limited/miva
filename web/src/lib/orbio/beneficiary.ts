import { getAddress, isAddress, pad, type Address, type Hex } from 'viem'

export function toBeneficiary(wallet: string): Hex {
  const trimmed = wallet.trim()
  if (!isAddress(trimmed)) {
    throw new Error('Founder wallet must be a valid 0x address.')
  }
  return pad(getAddress(trimmed) as Address, { size: 32 })
}

export function shortAddress(wallet: string): string {
  const w = wallet.trim()
  if (w.length < 14) return w
  return `${w.slice(0, 8)}…${w.slice(-6)}`
}
