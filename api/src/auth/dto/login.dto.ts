import { IsIn, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsIn(['founder', 'investor'])
  role!: 'founder' | 'investor';

  @IsString()
  @MinLength(1)
  password!: string;
}
