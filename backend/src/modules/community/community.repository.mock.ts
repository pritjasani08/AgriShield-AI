import { ICommunityRepository } from './community.repository';
import { CommunityPostDto, CreateCommunityPostDto } from './community.types';
import crypto from 'crypto';

export class MockCommunityRepository implements ICommunityRepository {
  private posts: CommunityPostDto[] = [
    {
      id: crypto.randomUUID(),
      userId: 'test-user',
      userName: 'Farmer John',
      content: 'Wild boars spotted near north fence.',
      animalType: 'Wild Boar',
      distance: '200m',
      side: 'North Fence',
      likesCount: 12,
      isLikedByMe: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: crypto.randomUUID(),
      userId: 'test-user',
      userName: 'AgriTech Admin',
      content: 'System update scheduled for tonight.',
      likesCount: 45,
      isLikedByMe: true,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
    }
  ];

  async getPosts(userId: string, limit: number = 20, offset: number = 0): Promise<CommunityPostDto[]> {
    return Promise.resolve(this.posts.slice(offset, offset + limit));
  }

  async createPost(userId: string, data: CreateCommunityPostDto): Promise<CommunityPostDto> {
    const newPost: CommunityPostDto = {
      id: crypto.randomUUID(),
      userId,
      userName: 'Mock User',
      content: data.content,
      animalType: data.animalType,
      distance: data.distance,
      side: data.side,
      imageUrl: data.imageUrl,
      likesCount: 0,
      isLikedByMe: false,
      createdAt: new Date()
    };
    this.posts.unshift(newPost);
    return Promise.resolve(newPost);
  }

  async likePost(postId: string, userId: string): Promise<boolean> {
    const post = this.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');
    
    if (post.isLikedByMe) {
      post.isLikedByMe = false;
      post.likesCount--;
      return Promise.resolve(false);
    } else {
      post.isLikedByMe = true;
      post.likesCount++;
      return Promise.resolve(true);
    }
  }
}
