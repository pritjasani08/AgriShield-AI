import { CommunityPostDto, CreateCommunityPostDto } from './community.types';

export interface ICommunityRepository {
  getPosts(userId: string, limit?: number, offset?: number): Promise<CommunityPostDto[]>;
  createPost(userId: string, data: CreateCommunityPostDto): Promise<CommunityPostDto>;
  likePost(postId: string, userId: string): Promise<boolean>; // Returns true if liked, false if unliked
}
