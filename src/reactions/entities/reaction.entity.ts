import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';

export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

export enum ReactionTarget {
  POST = 'post',
  COMMENT = 'comment',
}

@Entity('reactions')
@Unique(['userId', 'postId', 'commentId'])
export class Reaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ReactionType,
  })
  type: ReactionType;

  @Column({
    type: 'enum',
    enum: ReactionTarget,
  })
  target: ReactionTarget;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Post, (post) => post.reactions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column({ type: 'uuid', nullable: true })
  postId: string | null;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @Column({ type: 'uuid', nullable: true })
  commentId: string | null;
}
