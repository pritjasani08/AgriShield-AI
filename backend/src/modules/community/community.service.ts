import { ICommunityRepository } from './community.repository';
import { CommunityPostDto, CreateCommunityPostDto } from './community.types';
import { DomainEvents } from '../../core/events';
import { COMMUNITY_EVENTS } from './community.events';
import { logger } from '../../core/utils/logger';

export class CommunityService {
  constructor(private readonly repo: ICommunityRepository) {}

  async getPosts(userId: string, limit?: number, offset?: number): Promise<CommunityPostDto[]> {
    return this.repo.getPosts(userId, limit, offset);
  }

  async createPost(userId: string, data: CreateCommunityPostDto): Promise<CommunityPostDto> {
    const post = await this.repo.createPost(userId, data);
    
    // Emit domain event
    DomainEvents.emitEvent(COMMUNITY_EVENTS.POST_CREATED, {
      postId: post.id,
      userId: post.userId,
      userName: post.userName,
      content: post.content,
      animalType: post.animalType,
      createdAt: post.createdAt,
    });
    
    logger.info(`Community post created by user ${userId}: ${post.id}`);
    return post;
  }

  async likePost(postId: string, userId: string): Promise<{ liked: boolean }> {
    const liked = await this.repo.likePost(postId, userId);
    
    if (liked) {
      DomainEvents.emitEvent(COMMUNITY_EVENTS.POST_LIKED, {
        postId,
        userId
      });
      logger.info(`User ${userId} liked post ${postId}`);
    } else {
      logger.info(`User ${userId} unliked post ${postId}`);
    }
    
    return { liked };
  }
}
