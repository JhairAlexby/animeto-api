import { IsNotEmpty, IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Contenido del comentario',
    example: 'Me encanta este manga, muy buena historia',
    maxLength: 1000,
  })
  @IsNotEmpty({ message: 'El contenido del comentario es obligatorio' })
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  @MaxLength(1000, { message: 'El comentario no puede exceder 1000 caracteres' })
  content: string;

  @ApiProperty({
    description: 'ID del post al que pertenece el comentario',
    example: 'uuid-del-post',
  })
  @IsNotEmpty({ message: 'El ID del post es obligatorio' })
  @IsUUID('4', { message: 'El ID del post debe ser un UUID válido' })
  postId: string;

  @ApiPropertyOptional({
    description: 'ID del comentario padre (para respuestas)',
    example: 'uuid-del-comentario-padre',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del comentario padre debe ser un UUID válido' })
  parentId?: string;
}