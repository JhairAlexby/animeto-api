import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostsDto } from './dto/filter-posts.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    authorId: string,
    image?: Express.Multer.File,
  ): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      authorId,
      image: image?.buffer || null,
      imageMimeType: image?.mimetype || null,
    });

    return this.postRepository.save(post);
  }

  async findAll(filterDto: FilterPostsDto): Promise<PaginatedResponse<Post>> {
    const {
      page = 1,
      limit = 10,
      type,
      tags,
      search,
      authorId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .select([
        'post.id',
        'post.description',
        'post.currentChapters',
        'post.type',
        'post.tags',
        'post.likesCount',
        'post.dislikesCount',
        'post.commentsCount',
        'post.createdAt',
        'post.updatedAt',
        'post.imageMimeType',
        'author.id',
        'author.name',
      ]);

    this.applyFilters(queryBuilder, { type, tags, search, authorId });

    queryBuilder.orderBy(`post.${sortBy}`, sortOrder);

    const [posts, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data: posts.map((post) => ({
        ...post,
        hasImage: !!post.imageMimeType,
        imageMimeType: undefined,
      })) as any,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
      select: {
        id: true,
        description: true,
        currentChapters: true,
        type: true,
        tags: true,
        likesCount: true,
        dislikesCount: true,
        commentsCount: true,
        createdAt: true,
        updatedAt: true,
        imageMimeType: true,
        author: {
          id: true,
          name: true,
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    return {
      ...post,
      hasImage: !!post.imageMimeType,
      imageMimeType: undefined,
    } as any;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
  ): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('No tienes permisos para editar este post');
    }

    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }

  async updateImage(
    id: string,
    userId: string,
    image: Express.Multer.File,
  ): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('No tienes permisos para editar este post');
    }

    post.image = image.buffer;
    post.imageMimeType = image.mimetype;

    return this.postRepository.save(post);
  }

  async getImage(
    id: string,
  ): Promise<{ image: Buffer; mimeType: string | null }> {
    const post = await this.postRepository.findOne({
      where: { id },
      select: ['image', 'imageMimeType'],
    });

    if (!post || !post.image) {
      throw new NotFoundException('Imagen no encontrada');
    }

    return {
      image: post.image,
      mimeType: post.imageMimeType,
    };
  }

  async deleteImage(id: string, userId: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('No tienes permisos para editar este post');
    }

    post.image = null;
    post.imageMimeType = null;

    return this.postRepository.save(post);
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar este post',
      );
    }

    await this.postRepository.remove(post);
  }

  async incrementLikes(id: string): Promise<void> {
    await this.postRepository.increment({ id }, 'likesCount', 1);
  }

  async decrementLikes(id: string): Promise<void> {
    await this.postRepository.decrement({ id }, 'likesCount', 1);
  }

  async incrementDislikes(id: string): Promise<void> {
    await this.postRepository.increment({ id }, 'dislikesCount', 1);
  }

  async decrementDislikes(id: string): Promise<void> {
    await this.postRepository.decrement({ id }, 'dislikesCount', 1);
  }

  async incrementComments(id: string): Promise<void> {
    await this.postRepository.increment({ id }, 'commentsCount', 1);
  }

  async decrementComments(id: string): Promise<void> {
    await this.postRepository.decrement({ id }, 'commentsCount', 1);
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Post>,
    filters: {
      type?: string;
      tags?: string[];
      search?: string;
      authorId?: string;
    },
  ): void {
    const { type, tags, search, authorId } = filters;

    if (type) {
      queryBuilder.andWhere('post.type = :type', { type });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('post.tags && :tags', { tags });
    }

    if (search) {
      queryBuilder.andWhere('post.description ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (authorId) {
      queryBuilder.andWhere('post.authorId = :authorId', { authorId });
    }
  }

  async getPostsByUser(
    userId: string,
    filterDto: FilterPostsDto,
  ): Promise<PaginatedResponse<Post>> {
    return this.findAll({ ...filterDto, authorId: userId });
  }
}
