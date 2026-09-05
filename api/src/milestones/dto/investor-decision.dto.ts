import { IsIn, IsOptional, IsString } from 'class-validator';

export class InvestorDecisionDto {
  @IsIn(['approved', 'rejected', 'more_info_requested'])
  decision!: 'approved' | 'rejected' | 'more_info_requested';

  @IsOptional()
  @IsString()
  note?: string;
}
