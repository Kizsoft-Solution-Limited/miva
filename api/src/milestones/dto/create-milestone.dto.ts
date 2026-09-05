import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMilestoneDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(5)
  claim!: string;

  @IsString()
  @MinLength(1)
  founderName!: string;

  @IsIn(['url', 'pdf', 'repo', 'text', 'metric'])
  proofType!: string;

  @IsOptional()
  @IsString()
  proofUrl?: string;

  @IsOptional()
  @IsString()
  proofText?: string;
}
