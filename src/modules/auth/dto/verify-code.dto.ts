import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class VerifyCodeDto {
  @IsString({ message: 'Code must be a string' })
  @IsNotEmpty({ message: 'Code is required' })
  @Length(6, 6, { message: 'Code must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'Code must contain only numbers' })
  code: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 50, { message: 'Password must be between 6 and 50 characters' })
  password: string;
}
