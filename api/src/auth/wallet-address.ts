import { BadRequestException } from '@nestjs/common';

const ETH_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export function normalizeWalletAddress(raw: string): string {
  const trimmed = raw.trim();
  if (!ETH_ADDRESS.test(trimmed)) {
    throw new BadRequestException(
      'Wallet must be a 0x address (40 hex chars).',
    );
  }
  return trimmed;
}
