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
    description: 'User password',
    example: 'newpassword123',
    minLength: 6,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
