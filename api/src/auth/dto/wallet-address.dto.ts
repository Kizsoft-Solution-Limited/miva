import { IsString, Matches, MaxLength } from 'class-validator';

export class WalletAddressDto {
  @IsString()
  @MaxLength(42)
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Wallet must be a 0x address (40 hex chars).',
  })
  address!: string;
}
