import { Router } from 'express';
import multer from 'multer';
import { DetectionController } from './detection.controller';
import { requireAuth } from '../../core/middleware/requireAuth';
import { validateRequest } from '../../core/middleware/validateRequest';
import { analyzeSchema } from './detection.validator';

export const createDetectionRoutes = (detectionController: DetectionController): Router => {
  const router = Router();

  // Configure multer for memory storage (max 10MB)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  router.use(requireAuth);

  router.get('/history', detectionController.getHistory);

  router.post(
    '/analyze',
    upload.single('image'),
    validateRequest(analyzeSchema),
    detectionController.analyze
  );

  return router;
};
