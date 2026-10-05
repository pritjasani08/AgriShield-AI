import { Router } from 'express';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { SqlCommunityRepository } from './community.repository.sql';
import { MockCommunityRepository } from './community.repository.mock';
import { requireAuth } from '../../core/middleware/requireAuth';
import { validateRequest } from '../../core/middleware/validateRequest';
import { createCommunityPostSchema } from './community.validator';

const router = Router();

// DI Setup
const provider = process.env.DATABASE_PROVIDER || 'mock';
const repo = provider === 'postgres' ? new SqlCommunityRepository() : new MockCommunityRepository();
const service = new CommunityService(repo);
const controller = new CommunityController(service);

router.use(requireAuth);

router.get('/posts', controller.getPosts);
router.post('/posts', validateRequest(createCommunityPostSchema), controller.createPost);
router.post('/posts/:id/like', controller.likePost);

export const communityRoutes = router;
