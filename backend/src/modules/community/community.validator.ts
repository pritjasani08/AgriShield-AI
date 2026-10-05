import { z } from 'zod';

export const createCommunityPostSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Content is required').max(1000, 'Content too long'),
    animalType: z.string().optional(),
    distance: z.string().optional(),
    side: z.string().optional(),
    imageUrl: z.string().url().optional(),
  })
});
