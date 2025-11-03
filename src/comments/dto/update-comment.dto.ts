import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Contenido actualizado del comentario',
    example: 'Comentario actualizado con nueva información',
    maxLength: 1000,
  })
  @IsNotEmpty({ message: 'El contenido del comentario es obligatorio' })
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  @MaxLength(1000, {
    message: 'El comentario no puede exceder 1000 caracteres',
  })
  content: string;
}
