import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser } from '../common/decorators/file-validation.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Reacciones')
@Controller('api/reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear o actualizar reacción',
    description:
      'Crea una nueva reacción o actualiza una existente (like/dislike toggle)',
  })
  @ApiResponse({
    status: 201,
    description: 'Reacción creada/actualizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Reacción creada exitosamente' },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            },
            type: {
              type: 'string',
              enum: ['like', 'dislike'],
              example: 'like',
            },
            target: {
              type: 'string',
              enum: ['post', 'comment'],
              example: 'post',
            },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'user-uuid' },
                name: { type: 'string', example: 'Juan Pérez' },
              },
            },
            post: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string', example: 'post-uuid' },
                description: { type: 'string', example: 'Mi manga favorito' },
              },
            },
            comment: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string', example: 'comment-uuid' },
                content: { type: 'string', example: 'Excelente manga' },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Datos de entrada inválidos' },
        errors: {
          type: 'array',
          items: {
            type: 'string',
            example: 'El tipo de reacción es obligatorio',
          },
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acceso inválido o expirado',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Token de acceso inválido' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Post o comentario no encontrado',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Post no encontrado' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  async create(
    @Body() createReactionDto: CreateReactionDto,
    @GetCurrentUser() user: User,
  ) {
    return this.reactionsService.create(createReactionDto, user.id);
  }

  @Get('post/:postId')
  @Public()
  @ApiOperation({
    summary: 'Obtener reacciones de un post',
    description: 'Obtiene el conteo de reacciones de un post específico',
  })
  @ApiParam({
    name: 'postId',
    description: 'ID del post',
    type: 'string',
    format: 'uuid',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Reacciones obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Operación exitosa' },
        data: {
          type: 'object',
          properties: {
            likesCount: { type: 'number', example: 15 },
            dislikesCount: { type: 'number', example: 2 },
            totalReactions: { type: 'number', example: 17 },
            postId: {
              type: 'string',
              example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            },
          },
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Post no encontrado',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Post no encontrado' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  async getPostReactions(@Param('postId', ParseUUIDPipe) postId: string) {
    return this.reactionsService.getReactionsByPost(postId);
  }

  @Get('comment/:commentId')
  @Public()
  @ApiOperation({
    summary: 'Obtener reacciones de un comentario',
    description: 'Obtiene el conteo de reacciones de un comentario específico',
  })
  @ApiParam({
    name: 'commentId',
    description: 'ID del comentario',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Reacciones obtenidas exitosamente',
  })
  async getCommentReactions(
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    return this.reactionsService.getReactionsByComment(commentId);
  }

  @Get('user/post/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener reacciones de un post con reacción del usuario',
    description:
      'Obtiene el conteo de reacciones de un post incluyendo la reacción del usuario autenticado',
  })
  @ApiParam({
    name: 'postId',
    description: 'ID del post',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Reacciones con reacción del usuario obtenidas exitosamente',
  })
  async getPostReactionsWithUser(
    @Param('postId', ParseUUIDPipe) postId: string,
    @GetCurrentUser() user: User,
  ) {
    return this.reactionsService.getReactionsWithUserReaction(user.id, postId);
  }

  @Get('user/comment/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener reacciones de un comentario con reacción del usuario',
    description:
      'Obtiene el conteo de reacciones de un comentario incluyendo la reacción del usuario autenticado',
  })
  @ApiParam({
    name: 'commentId',
    description: 'ID del comentario',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Reacciones con reacción del usuario obtenidas exitosamente',
  })
  async getCommentReactionsWithUser(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @GetCurrentUser() user: User,
  ) {
    return this.reactionsService.getReactionsWithUserReaction(
      user.id,
      undefined,
      commentId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar reacción',
    description: 'Elimina una reacción existente del usuario',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la reacción',
    type: 'string',
    format: 'uuid',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Reacción eliminada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Reacción eliminada exitosamente' },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            },
            type: { type: 'string', example: 'like' },
            target: { type: 'string', example: 'post' },
            deletedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          },
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acceso inválido o expirado',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Token de acceso inválido' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado para eliminar esta reacción',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: {
          type: 'string',
          example: 'No tienes permisos para eliminar esta reacción',
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Reacción no encontrada',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Reacción no encontrada' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCurrentUser() user: User,
  ) {
    await this.reactionsService.remove(id, user.id);
    return { message: 'Reacción eliminada exitosamente' };
  }
}
