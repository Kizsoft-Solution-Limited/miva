import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class OrbioKeyDto {
  @IsString()
  @MinLength(12)
  @MaxLength(200)
  @Matches(/^sk-(orbio|or-v1)-/i, {
    message: 'Use an Orbio key (sk-orbio-…) from orbio.so',
  })
  apiKey!: string;
}
