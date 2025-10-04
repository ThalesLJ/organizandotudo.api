import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Username',
    example: 'thaleslj',
    minLength: 3,
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username?: string;

  @ApiProperty({
    description: 'User email',
    example: 'thales@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Current password for authentication',
    example: 'currentpassword123',
    minLength: 6,
    required: true,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
