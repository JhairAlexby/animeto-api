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
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostsDto } from './dto/filter-posts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser, ValidateImageFile } from '../common/decorators/file-validation.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Posts')
@Controller('posts')
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
  @ApiResponse({
    status: 201,
    description: 'Post creado exitosamente',
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
  async getImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
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