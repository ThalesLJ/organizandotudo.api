import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Username',
    example: 'thaleslj',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    description: 'User email',
    example: 'thales@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
