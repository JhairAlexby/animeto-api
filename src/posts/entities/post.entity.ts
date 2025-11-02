import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';

export enum ContentType {
  ANIME = 'anime',
  MANGA = 'manga',
  MANHWA = 'manhwa',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'bytea', nullable: true })
  image: Buffer | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  imageMimeType: string | null;

  @Column({ type: 'int', default: 0 })
  currentChapters: number;

  @Column({
    type: 'enum',
    enum: ContentType,
    default: ContentType.MANGA,
  })
  type: ContentType;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  likesCount: number;

  @Column({ type: 'int', default: 0 })
  dislikesCount: number;

  @Column({ type: 'int', default: 0 })
  commentsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ type: 'uuid' })
  authorId: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Reaction, (reaction) => reaction.post)
  reactions: Reaction[];
}