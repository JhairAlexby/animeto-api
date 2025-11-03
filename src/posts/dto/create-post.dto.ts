import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType } from '../entities/post.entity';

export class CreatePostDto {
  @ApiProperty({
    description: 'Descripción del post',
    example: 'Mi manga favorito de la temporada',
    maxLength: 2000,
  })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(2000, {
    message: 'La descripción no puede exceder 2000 caracteres',
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Número de capítulos actuales',
    example: 25,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El número de capítulos debe ser un entero' })
  @Min(0, { message: 'El número de capítulos no puede ser negativo' })
  currentChapters?: number = 0;

  @ApiProperty({
    description: 'Tipo de contenido',
    enum: ContentType,
    example: ContentType.MANGA,
  })
  @IsNotEmpty({ message: 'El tipo de contenido es obligatorio' })
  @IsEnum(ContentType, {
    message: 'El tipo de contenido debe ser anime, manga o manhwa',
  })
  type: ContentType;

  @ApiPropertyOptional({
    description: 'Etiquetas del post',
    example: ['acción', 'aventura', 'shonen'],
    type: [String],
    maxItems: 10,
  })
  @IsOptional()
  @IsArray({ message: 'Las etiquetas deben ser un array' })
  @IsString({
    each: true,
    message: 'Cada etiqueta debe ser una cadena de texto',
  })
  @ArrayMaxSize(10, { message: 'No se pueden agregar más de 10 etiquetas' })
  tags?: string[] = [];
}
