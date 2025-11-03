import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Reaction, ReactionTarget } from '../reactions/entities/reaction.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Reaction)
    private readonly reactionRepository: Repository<Reaction>,
  ) {}

  async getCompletas(pagination: PaginationDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;

    const [posts, total] = await this.postRepository.findAndCount({
      relations: ['author'],
      select: {
        id: true,
        description: true,
        image: true,
        imageMimeType: true,
        createdAt: true,
        author: {
          id: true,
          name: true,
        },
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit || 1);

    if (posts.length === 0) {
      return {
        publicaciones: [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: false,
          hasPrev: page > 1,
        },
      };
    }

    const postIds = posts.map((p) => p.id);

    const reactions = await this.reactionRepository.find({
      where: {
        target: ReactionTarget.POST,
        postId: In(postIds),
      },
      relations: ['user'],
      select: {
        id: true,
        type: true,
        createdAt: true,
        postId: true as any,
        user: {
          id: true,
          name: true,
        },
      } as any,
      order: { createdAt: 'DESC' },
    });

    const comments = await this.commentRepository.find({
      where: {
        postId: In(postIds),
        parentId: IsNull(),
      },
      relations: ['author'],
      select: {
        id: true,
        content: true,
        createdAt: true,
        postId: true as any,
        author: {
          id: true,
          name: true,
        },
      } as any,
      order: { createdAt: 'DESC' },
    });

    const reactionsByPost = new Map<string, any[]>();
    for (const r of reactions) {
      const list = reactionsByPost.get(r.postId!) || [];
      list.push({
        type: r.type,
        createdAt: r.createdAt,
        user: { id: r.user.id, name: r.user.name },
      });
      reactionsByPost.set(r.postId!, list);
    }

    const commentsByPost = new Map<string, any[]>();
    for (const c of comments) {
      const list = commentsByPost.get(c.postId) || [];
      list.push({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        user: { id: c.author.id, name: c.author.name },
      });
      commentsByPost.set(c.postId, list);
    }

    const publicaciones = posts.map((p) => ({
      id: p.id,
      description: p.description,
      createdAt: p.createdAt,
      hasImage: !!p.image,
      imageUrl: p.image ? `/posts/${p.id}/image` : null,
      author: { id: p.author.id, name: p.author.name },
      reactions: reactionsByPost.get(p.id) || [],
      comments: commentsByPost.get(p.id) || [],
    }));

    return {
      publicaciones,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}