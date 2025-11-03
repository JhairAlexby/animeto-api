import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  Reaction,
  ReactionType,
  ReactionTarget,
} from './entities/reaction.entity';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { PostsService } from '../posts/posts.service';
import { CommentsService } from '../comments/comments.service';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction)
    private reactionRepository: Repository<Reaction>,
    private postsService: PostsService,
    private commentsService: CommentsService,
  ) {}

  async create(
    createReactionDto: CreateReactionDto,
    userId: string,
  ): Promise<Reaction> {
    const { type, target, postId, commentId } = createReactionDto;

    // Validar que se proporcione el ID correcto según el target
    if (target === ReactionTarget.POST && !postId) {
      throw new BadRequestException(
        'Se requiere postId para reacciones a posts',
      );
    }

    if (target === ReactionTarget.COMMENT && !commentId) {
      throw new BadRequestException(
        'Se requiere commentId para reacciones a comentarios',
      );
    }

    // Verificar que el post o comentario existe
    if (target === ReactionTarget.POST && postId) {
      await this.postsService.findOne(postId);
    } else if (target === ReactionTarget.COMMENT && commentId) {
      await this.commentsService.findOne(commentId);
    }

    // Verificar si ya existe una reacción del usuario para este elemento
    const existingReaction = await this.reactionRepository.findOne({
      where: {
        userId,
        postId: target === ReactionTarget.POST ? postId : IsNull(),
        commentId: target === ReactionTarget.COMMENT ? commentId : IsNull(),
      },
    });

    if (existingReaction) {
      // Si la reacción es la misma, eliminarla (toggle)
      if (existingReaction.type === type) {
        return this.remove(existingReaction.id, userId);
      } else {
        // Si es diferente, actualizarla
        return this.update(existingReaction.id, type, userId);
      }
    }

    // Crear nueva reacción
    const reaction = new Reaction();
    reaction.type = type;
    reaction.target = target;
    reaction.userId = userId;
    reaction.postId = target === ReactionTarget.POST ? postId || null : null;
    reaction.commentId =
      target === ReactionTarget.COMMENT ? commentId || null : null;

    const savedReaction = await this.reactionRepository.save(reaction);

    // Actualizar contadores
    await this.updateCounters(
      target,
      postId || null,
      commentId || null,
      type,
      'increment',
    );

    return savedReaction;
  }

  async update(
    id: string,
    newType: ReactionType,
    userId: string,
  ): Promise<Reaction> {
    const reaction = await this.reactionRepository.findOne({
      where: { id, userId },
    });

    if (!reaction) {
      throw new NotFoundException('Reacción no encontrada');
    }

    const oldType = reaction.type;

    // Decrementar contador anterior
    await this.updateCounters(
      reaction.target,
      reaction.postId,
      reaction.commentId,
      oldType,
      'decrement',
    );

    // Actualizar tipo de reacción
    reaction.type = newType;
    const updatedReaction = await this.reactionRepository.save(reaction);

    // Incrementar nuevo contador
    await this.updateCounters(
      reaction.target,
      reaction.postId,
      reaction.commentId,
      newType,
      'increment',
    );

    return updatedReaction;
  }

  async remove(id: string, userId: string): Promise<Reaction> {
    const reaction = await this.reactionRepository.findOne({
      where: { id, userId },
    });

    if (!reaction) {
      throw new NotFoundException('Reacción no encontrada');
    }

    // Decrementar contador
    await this.updateCounters(
      reaction.target,
      reaction.postId,
      reaction.commentId,
      reaction.type,
      'decrement',
    );

    await this.reactionRepository.remove(reaction);
    return reaction;
  }

  async getUserReaction(
    userId: string,
    postId?: string,
    commentId?: string,
  ): Promise<Reaction | null> {
    return this.reactionRepository.findOne({
      where: {
        userId,
        postId: postId || IsNull(),
        commentId: commentId || IsNull(),
      },
    });
  }

  async getReactionsByPost(
    postId: string,
  ): Promise<{ likes: number; dislikes: number; userReaction?: ReactionType }> {
    const post = await this.postsService.findOne(postId);

    return {
      likes: post.likesCount,
      dislikes: post.dislikesCount,
    };
  }

  async getReactionsByComment(
    commentId: string,
  ): Promise<{ likes: number; dislikes: number; userReaction?: ReactionType }> {
    const comment = await this.commentsService.findOne(commentId);

    return {
      likes: comment.likesCount,
      dislikes: comment.dislikesCount,
    };
  }

  async getReactionsWithUserReaction(
    userId: string,
    postId?: string,
    commentId?: string,
  ): Promise<{ likes: number; dislikes: number; userReaction?: ReactionType }> {
    let reactions: { likes: number; dislikes: number };

    if (postId) {
      reactions = await this.getReactionsByPost(postId);
    } else if (commentId) {
      reactions = await this.getReactionsByComment(commentId);
    } else {
      throw new BadRequestException('Se debe proporcionar postId o commentId');
    }

    const userReaction = await this.getUserReaction(userId, postId, commentId);

    return {
      ...reactions,
      userReaction: userReaction?.type,
    };
  }

  private async updateCounters(
    target: ReactionTarget,
    postId: string | null,
    commentId: string | null,
    type: ReactionType,
    operation: 'increment' | 'decrement',
  ): Promise<void> {
    if (target === ReactionTarget.POST && postId) {
      if (type === ReactionType.LIKE) {
        if (operation === 'increment') {
          await this.postsService.incrementLikes(postId);
        } else {
          await this.postsService.decrementLikes(postId);
        }
      } else {
        if (operation === 'increment') {
          await this.postsService.incrementDislikes(postId);
        } else {
          await this.postsService.decrementDislikes(postId);
        }
      }
    } else if (target === ReactionTarget.COMMENT && commentId) {
      if (type === ReactionType.LIKE) {
        if (operation === 'increment') {
          await this.commentsService.incrementLikes(commentId);
        } else {
          await this.commentsService.decrementLikes(commentId);
        }
      } else {
        if (operation === 'increment') {
          await this.commentsService.incrementDislikes(commentId);
        } else {
          await this.commentsService.decrementDislikes(commentId);
        }
      }
    }
  }
}
