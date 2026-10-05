import { Request, Response } from 'express';
import { CommunityService } from './community.service';
import { logger } from '../../core/utils/logger';

export class CommunityController {
  constructor(private readonly service: CommunityService) {}

  getPosts = async (req: Request, res: Response) => {
    try {
      const userId = req.auth!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const posts = await this.service.getPosts(userId, limit, offset);
      res.json(posts);
    } catch (error) {
      logger.error('Failed to get community posts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  createPost = async (req: Request, res: Response) => {
    try {
      const userId = req.auth!.id;
      const post = await this.service.createPost(userId, req.body);
      res.status(201).json(post);
    } catch (error) {
      logger.error('Failed to create community post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  likePost = async (req: Request, res: Response) => {
    try {
      const userId = req.auth!.id;
      const postId = req.params.id as string;
      const result = await this.service.likePost(postId, userId);
      res.json(result);
    } catch (error) {
      logger.error('Failed to like post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
