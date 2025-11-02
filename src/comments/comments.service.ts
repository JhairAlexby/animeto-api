import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PostsService } from '../posts/posts.service';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private postsService: PostsService,
  ) {}

  async create(createCommentDto: CreateCommentDto, authorId: string): Promise<Comment> {
    const { postId, parentId, content } = createCommentDto;

    // Verificar que el post existe
    await this.postsService.findOne(postId);

    // Si es una respuesta, verificar que el comentario padre existe
    if (parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('Comentario padre no encontrado');
      }

      if (parentComment.postId !== postId) {
        throw new BadRequestException('El comentario padre no pertenece al mismo post');
      }
    }

    const comment = this.commentRepository.create({
      content,
      postId,
      parentId,
      authorId,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Incrementar contador de comentarios en el post
    await this.postsService.incrementComments(postId);

    // Si es una respuesta, incrementar contador de respuestas en el comentario padre
    if (parentId) {
      await this.commentRepository.increment({ id: parentId }, 'repliesCount', 1);
    }

    return this.findOne(savedComment.id);
  }

  async findByPost(postId: string, paginationDto: PaginationDto): Promise<PaginatedResponse<Comment>> {
    const { page = 1, limit = 10 } = paginationDto;

    // Verificar que el post existe
    await this.postsService.findOne(postId);

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { postId, parentId: IsNull() }, // Solo comentarios principales
      relations: ['author'],
      select: {
        id: true,
        content: true,
        likesCount: true,
        dislikesCount: true,
        repliesCount: true,
        createdAt: true,
        updatedAt: true,
        author: {
          id: true,
          name: true,
        },
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: comments,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findReplies(commentId: string, paginationDto: PaginationDto): Promise<PaginatedResponse<Comment>> {
    const { page = 1, limit = 10 } = paginationDto;

    // Verificar que el comentario padre existe
    const parentComment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!parentComment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    const [replies, total] = await this.commentRepository.findAndCount({
      where: { parentId: commentId },
      relations: ['author'],
      select: {
        id: true,
        content: true,
        likesCount: true,
        dislikesCount: true,
        repliesCount: true,
        createdAt: true,
        updatedAt: true,
        author: {
          id: true,
          name: true,
        },
      },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: replies,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
      select: {
        id: true,
        content: true,
        likesCount: true,
        dislikesCount: true,
        repliesCount: true,
        createdAt: true,
        updatedAt: true,
        postId: true,
        parentId: true,
        author: {
          id: true,
          name: true,
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('No tienes permisos para editar este comentario');
    }

    Object.assign(comment, updateCommentDto);
    await this.commentRepository.save(comment);

    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este comentario');
    }

    // Decrementar contador de comentarios en el post
    await this.postsService.decrementComments(comment.postId);

    // Si es una respuesta, decrementar contador de respuestas en el comentario padre
    if (comment.parentId) {
      await this.commentRepository.decrement({ id: comment.parentId }, 'repliesCount', 1);
    }

    await this.commentRepository.remove(comment);
  }

  async incrementLikes(id: string): Promise<void> {
    await this.commentRepository.increment({ id }, 'likesCount', 1);
  }

  async decrementLikes(id: string): Promise<void> {
    await this.commentRepository.decrement({ id }, 'likesCount', 1);
  }

  async incrementDislikes(id: string): Promise<void> {
    await this.commentRepository.increment({ id }, 'dislikesCount', 1);
  }

  async decrementDislikes(id: string): Promise<void> {
    await this.commentRepository.decrement({ id }, 'dislikesCount', 1);
  }
}