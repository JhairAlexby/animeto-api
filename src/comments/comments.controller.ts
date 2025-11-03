import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser } from '../common/decorators/file-validation.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Comentarios')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear comentario',
    description: 'Crea un nuevo comentario en un post o respuesta a otro comentario',
  })
  @ApiResponse({
    status: 201,
    description: 'Comentario creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Comentario creado exitosamente' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
            content: { type: 'string', example: 'Me encanta este manga, muy buena historia' },
            likesCount: { type: 'number', example: 0 },
            dislikesCount: { type: 'number', example: 0 },
            repliesCount: { type: 'number', example: 0 },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            author: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'author-uuid' },
                name: { type: 'string', example: 'Juan Pérez' },
                hasProfilePhoto: { type: 'boolean', example: true },
              },
            },
            post: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'post-uuid' },
                description: { type: 'string', example: 'Mi manga favorito' },
              },
            },
            parentComment: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string', example: 'parent-comment-uuid' },
                content: { type: 'string', example: 'Comentario padre' },
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
            example: 'El contenido del comentario es obligatorio'
          }
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
    description: 'Post o comentario padre no encontrado',
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
    @Body() createCommentDto: CreateCommentDto,
    @GetCurrentUser() user: User,
  ) {
    return this.commentsService.create(createCommentDto, user.id);
  }

  @Get('post/:postId')
  @Public()
  @ApiOperation({
    summary: 'Obtener comentarios de un post',
    description: 'Obtiene los comentarios principales de un post con paginación',
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
    description: 'Comentarios obtenidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Operación exitosa' },
        data: {
          type: 'object',
          properties: {
            comments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'comment-uuid' },
                  content: { type: 'string', example: 'Me encanta este manga, muy buena historia' },
                  likesCount: { type: 'number', example: 5 },
                  dislikesCount: { type: 'number', example: 1 },
                  repliesCount: { type: 'number', example: 3 },
                  createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                  author: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'author-uuid' },
                      name: { type: 'string', example: 'Juan Pérez' },
                      hasProfilePhoto: { type: 'boolean', example: true },
                    },
                  },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                total: { type: 'number', example: 25 },
                totalPages: { type: 'number', example: 3 },
              },
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
  async findByPost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.commentsService.findByPost(postId, paginationDto);
  }

  @Get(':id/replies')
  @Public()
  @ApiOperation({
    summary: 'Obtener respuestas de un comentario',
    description: 'Obtiene las respuestas de un comentario específico con paginación',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del comentario',
    type: 'string',
    format: 'uuid',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Respuestas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Operación exitosa' },
        data: {
          type: 'object',
          properties: {
            replies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'reply-uuid' },
                  content: { type: 'string', example: 'Estoy de acuerdo, es excelente' },
                  likesCount: { type: 'number', example: 2 },
                  dislikesCount: { type: 'number', example: 0 },
                  repliesCount: { type: 'number', example: 0 },
                  createdAt: { type: 'string', example: '2024-01-01T01:00:00.000Z' },
                  author: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'author-uuid-2' },
                      name: { type: 'string', example: 'María García' },
                      hasProfilePhoto: { type: 'boolean', example: false },
                    },
                  },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                total: { type: 'number', example: 5 },
                totalPages: { type: 'number', example: 1 },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Comentario no encontrado',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Comentario no encontrado' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  async findReplies(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.commentsService.findReplies(id, paginationDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Obtener comentario por ID',
    description: 'Obtiene un comentario específico por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del comentario',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Comentario obtenido exitosamente',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar comentario',
    description: 'Actualiza un comentario existente (solo el autor puede hacerlo)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del comentario',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Comentario actualizado exitosamente',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetCurrentUser() user: User,
  ) {
    return this.commentsService.update(id, updateCommentDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar comentario',
    description: 'Elimina un comentario existente (solo el autor puede hacerlo)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del comentario',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Comentario eliminado exitosamente',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCurrentUser() user: User,
  ) {
    await this.commentsService.remove(id, user.id);
    return { message: 'Comentario eliminado exitosamente' };
  }
}