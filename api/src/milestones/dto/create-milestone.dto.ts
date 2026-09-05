import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { IsPublicHttpUrl } from './is-public-http-url.js';

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
  @IsPublicHttpUrl()
  proofUrl?: string;

  @IsOptional()
  @IsString()
  proofText?: string;
}
