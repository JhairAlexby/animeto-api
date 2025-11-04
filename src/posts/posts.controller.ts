import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostsDto } from './dto/filter-posts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  GetCurrentUser,
  ValidateImageFile,
} from '../common/decorators/file-validation.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Posts')
@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear nuevo post',
    description: 'Crea un nuevo post con imagen opcional',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Datos del post con imagen opcional',
    schema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Descripción del post',
          example: 'Mi manga favorito de la temporada',
        },
        currentChapters: {
          type: 'number',
          description: 'Número de capítulos actuales',
          example: 25,
        },
        type: {
          type: 'string',
          enum: ['anime', 'manga', 'manhwa'],
          description: 'Tipo de contenido',
          example: 'manga',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Etiquetas del post',
          example: ['acción', 'aventura', 'shonen'],
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagen del post (opcional)',
        },
      },
      required: ['description', 'type'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Post creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Post creado exitosamente' },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            },
            description: {
              type: 'string',
              example: 'Mi manga favorito de la temporada',
            },
            currentChapters: { type: 'number', example: 25 },
            type: { type: 'string', example: 'manga' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['acción', 'aventura', 'shonen'],
            },
            likesCount: { type: 'number', example: 0 },
            dislikesCount: { type: 'number', example: 0 },
            commentsCount: { type: 'number', example: 0 },
            hasImage: { type: 'boolean', example: true },
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
            example: 'La descripción es obligatoria',
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
  async create(
    @Body() createPostDto: CreatePostDto,
    @GetCurrentUser() user: User,
    @ValidateImageFile() image?: Express.Multer.File,
  ) {
    return this.postsService.create(createPostDto, user.id, image);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Obtener posts con filtros',
    description: 'Obtiene una lista paginada de posts con filtros opcionales',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de posts obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Operación exitosa' },
        data: {
          type: 'object',
          properties: {
            posts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                  },
                  description: {
                    type: 'string',
                    example: 'Mi manga favorito de la temporada',
                  },
                  currentChapters: { type: 'number', example: 25 },
                  type: { type: 'string', example: 'manga' },
                  tags: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['acción', 'aventura', 'shonen'],
                  },
                  likesCount: { type: 'number', example: 15 },
                  dislikesCount: { type: 'number', example: 2 },
                  commentsCount: { type: 'number', example: 8 },
                  hasImage: { type: 'boolean', example: true },
                  createdAt: {
                    type: 'string',
                    example: '2024-01-01T00:00:00.000Z',
                  },
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
                total: { type: 'number', example: 50 },
                totalPages: { type: 'number', example: 5 },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  async findAll(@Query() filterDto: FilterPostsDto) {
    return this.postsService.findAll(filterDto);
  }

  @Get('my-posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener mis posts',
    description: 'Obtiene los posts del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Posts del usuario obtenidos exitosamente',
  })
  async getMyPosts(
    @GetCurrentUser() user: User,
    @Query() filterDto: FilterPostsDto,
  ) {
    return this.postsService.getPostsByUser(user.id, filterDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Obtener post por ID',
    description: 'Obtiene un post específico por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del post',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Post obtenido exitosamente',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  @Get(':id/image')
  @Public()
  @ApiOperation({
    summary: 'Obtener imagen del post',
    description: 'Obtiene la imagen de un post específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del post',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen obtenida exitosamente',
  })
  async getImage(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const { image, mimeType } = await this.postsService.getImage(id);

    res.set({
      'Content-Type': mimeType,
      'Content-Length': image.length.toString(),
    });

    res.send(image);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar post',
    description: 'Actualiza un post existente (solo el autor puede hacerlo)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del post',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Post actualizado exitosamente',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @GetCurrentUser() user: User,
  ) {
    return this.postsService.update(id, updatePostDto, user.id);
  }

  @Patch(':id/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar imagen del post',
    description: 'Actualiza la imagen de un post existente',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'ID del post',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen actualizada exitosamente',
  })
  async updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCurrentUser() user: User,
    @ValidateImageFile() image: Express.Multer.File,
  ) {
    if (!image) {
      throw new Error('No se proporcionó ninguna imagen');
    }

    await this.postsService.updateImage(id, user.id, image);
    return { message: 'Imagen actualizada exitosamente' };
  }

  @Delete(':id/image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar imagen del post',
    description: 'Elimina la imagen de un post existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del post',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen eliminada exitosamente',
  })
  async deleteImage(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCurrentUser() user: User,
  ) {
    await this.postsService.deleteImage(id, user.id);
    return { message: 'Imagen eliminada exitosamente' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar post',
    description: 'Elimina un post existente (solo el autor puede hacerlo)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del post',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Post eliminado exitosamente',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCurrentUser() user: User,
  ) {
    await this.postsService.remove(id, user.id);
    return { message: 'Post eliminado exitosamente' };
  }
}
