import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({
    description: 'Note title',
    example: 'Minha Nota Importante',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Note content',
    example: 'Este é o conteúdo da minha nota...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Whether the note is public',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
