import { describe, expect, it } from 'vitest'
import { walletErrorMessage } from './wallet-error'

describe('walletErrorMessage', () => {
  it('maps user rejection to a short line', () => {
    const err = new Error(
      [
        'User rejected the request.',
        '',
        'Request Arguments:',
        '  from:  0xabc',
        '  to:    0xdef',
        'Contract Call:',
        '  function: buyAndActivate(...)',
        'Docs: https://viem.sh/docs/contract/writeContract',
      ].join('\n'),
    )
    expect(walletErrorMessage(err, 'fallback')).toBe('Cancelled in wallet.')
  })

  it('maps MetaMask 4001', () => {
    expect(
      walletErrorMessage({ code: 4001, message: 'denied' }, 'fallback'),
    ).toBe('Cancelled in wallet.')
  })

  it('prefers viem shortMessage when not a reject', () => {
    expect(
      walletErrorMessage(
        {
          shortMessage: 'Insufficient funds for gas.',
          message: 'Insufficient funds for gas.\n\nDetails…',
        },
        'fallback',
      ),
    ).toBe('Insufficient funds for gas.')
  })

  it('falls back when unknown', () => {
    expect(walletErrorMessage(null, 'Transaction failed.')).toBe(
      'Transaction failed.',
    )
  })
})
