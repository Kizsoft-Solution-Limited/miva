/** Prisma where for milestones owned by this founder (or stamped with their old wallet). */
export function milestonesForFounderWalletSync(
  userId: string,
  previousWallet: string | null,
) {
  if (previousWallet) {
    return {
      OR: [
        { founderUserId: userId },
        { founderUserId: null, payoutWallet: previousWallet },
      ],
    };
  }
  return { founderUserId: userId };
}
