import { IsOptional, IsEnum, IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ContentType } from '../entities/post.entity';

export class FilterPostsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por tipo de contenido',
    enum: ContentType,
    example: ContentType.MANGA,
  })
  @IsOptional()
  @IsEnum(ContentType, { message: 'El tipo debe ser anime, manga o manhwa' })
  type?: ContentType;

  @ApiPropertyOptional({
    description: 'Filtrar por etiquetas',
    example: ['acción', 'aventura'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Las etiquetas deben ser un array' })
  @IsString({ each: true, message: 'Cada etiqueta debe ser una cadena de texto' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Buscar en descripción',
    example: 'manga favorito',
  })
  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser una cadena de texto' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por autor (ID del usuario)',
    example: 'uuid-del-autor',
  })
  @IsOptional()
  @IsString({ message: 'El ID del autor debe ser una cadena de texto' })
  authorId?: string;

  @ApiPropertyOptional({
    description: 'Ordenar por',
    enum: ['createdAt', 'likesCount', 'commentsCount'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'likesCount' | 'commentsCount' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Orden de clasificación',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}