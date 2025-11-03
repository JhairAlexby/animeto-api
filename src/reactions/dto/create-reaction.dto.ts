import { IsNotEmpty, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReactionType, ReactionTarget } from '../entities/reaction.entity';

export class CreateReactionDto {
  @ApiProperty({
    description: 'Tipo de reacción',
    enum: ReactionType,
    example: ReactionType.LIKE,
  })
  @IsNotEmpty({ message: 'El tipo de reacción es obligatorio' })
  @IsEnum(ReactionType, {
    message: 'El tipo de reacción debe ser like o dislike',
  })
  type: ReactionType;

  @ApiProperty({
    description: 'Objetivo de la reacción',
    enum: ReactionTarget,
    example: ReactionTarget.POST,
  })
  @IsNotEmpty({ message: 'El objetivo de la reacción es obligatorio' })
  @IsEnum(ReactionTarget, { message: 'El objetivo debe ser post o comment' })
  target: ReactionTarget;

  @ApiPropertyOptional({
    description: 'ID del post (requerido si target es post)',
    example: 'uuid-del-post',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del post debe ser un UUID válido' })
  postId?: string;

  @ApiPropertyOptional({
    description: 'ID del comentario (requerido si target es comment)',
    example: 'uuid-del-comentario',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del comentario debe ser un UUID válido' })
  commentId?: string;
}
