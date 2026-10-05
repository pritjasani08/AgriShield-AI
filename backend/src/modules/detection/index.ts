import { SqlDetectionRepository } from './detection.repository.sql';
import { MockDetectionRepository } from './detection.repository.mock';
import { DetectionService } from './detection.service';
import { DetectionController } from './detection.controller';
import { createDetectionRoutes } from './detection.routes';
import { DummyDetectionProvider } from '../../core/providers/detection';
import { env } from '../../config/env';

import { FastApiDetectionProvider } from '../../core/providers/detection/FastApiDetectionProvider';
import { IDetectionProvider, ProviderDetectionRequest, RawDetectionResult } from '../../core/providers/detection/IDetectionProvider';

const useMock = env.DATABASE_PROVIDER === 'mock';
const detectionProvider = useMock ? new DummyDetectionProvider() : new FastApiDetectionProvider();
const detectionRepository = useMock ? new MockDetectionRepository() : new SqlDetectionRepository();

const detectionService = new DetectionService(detectionProvider, detectionRepository);
const detectionController = new DetectionController(detectionService);
const detectionRoutes = createDetectionRoutes(detectionController);

export { detectionRoutes };
