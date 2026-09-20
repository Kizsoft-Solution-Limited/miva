import { describe, expect, it } from 'vitest';
import { milestonesForFounderWalletSync } from './milestone-wallet-sync.js';

describe('milestonesForFounderWalletSync', () => {
  it('targets founder milestones when no previous wallet', () => {
    expect(milestonesForFounderWalletSync('u1', null)).toEqual({
      founderUserId: 'u1',
    });
  });

  it('also claims orphan milestones stamped with the old wallet', () => {
    expect(milestonesForFounderWalletSync('u1', '0xabc')).toEqual({
      OR: [
        { founderUserId: 'u1' },
        { founderUserId: null, payoutWallet: '0xabc' },
      ],
    });
  });
});
