import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class UpdateNoteDto {
  @ApiProperty({
    description: 'Note title',
    example: 'Minha Nota Atualizada',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    description: 'Note content',
    example: 'Este é o conteúdo atualizado da minha nota...',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Whether the note is public',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
