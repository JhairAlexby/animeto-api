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
  })
  @ApiResponse({
    status: 200,
    description: 'Comentarios obtenidos exitosamente',
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
  })
  @ApiResponse({
    status: 200,
    description: 'Respuestas obtenidas exitosamente',
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