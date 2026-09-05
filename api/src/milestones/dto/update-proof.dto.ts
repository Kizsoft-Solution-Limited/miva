import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { IsPublicHttpUrl } from './is-public-http-url.js';

/** Update proof after more-info / before a re-check. */
export class UpdateProofDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  claim?: string;

  @IsOptional()
  @IsIn(['url', 'pdf', 'repo', 'text', 'metric'])
  proofType?: string;

  @IsOptional()
  @IsString()
  @IsPublicHttpUrl()
  proofUrl?: string;

  @IsOptional()
  @IsString()
  proofText?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  clearFile?: boolean;
}
