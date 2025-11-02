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
@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear o actualizar reacción',
    description: 'Crea una nueva reacción o actualiza una existente (like/dislike toggle)',
  })
  @ApiResponse({
    status: 201,
    description: 'Reacción creada/actualizada exitosamente',
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
  })
  @ApiResponse({
    status: 200,
    description: 'Reacciones obtenidas exitosamente',
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
  async getCommentReactions(@Param('commentId', ParseUUIDPipe) commentId: string) {
    return this.reactionsService.getReactionsByComment(commentId);
  }

  @Get('user/post/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener reacciones de un post con reacción del usuario',
    description: 'Obtiene el conteo de reacciones de un post incluyendo la reacción del usuario autenticado',
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
    description: 'Obtiene el conteo de reacciones de un comentario incluyendo la reacción del usuario autenticado',
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
    return this.reactionsService.getReactionsWithUserReaction(user.id, undefined, commentId);
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
  })
  @ApiResponse({
    status: 200,
    description: 'Reacción eliminada exitosamente',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetCurrentUser() user: User,
  ) {
    await this.reactionsService.remove(id, user.id);
    return { message: 'Reacción eliminada exitosamente' };
  }
}