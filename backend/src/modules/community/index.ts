export * from './community.types';
export * from './community.validator';
export * from './community.events';
export * from './community.repository';
export * from './community.service';
export * from './community.controller';
export * from './community.routes';

// Side-effect: Register Event Listeners
import { DomainEvents, EventTypes } from '../../core/events';
import { CommunityService } from './community.service';
import { SqlCommunityRepository } from './community.repository.sql';
import { logger } from '../../core/utils/logger';

const repo = new SqlCommunityRepository();
const communityService = new CommunityService(repo);

DomainEvents.on(EventTypes.DETECTION_CREATED, async (payload: { userId: string, detectionId: string, animalType: string, riskLevel: string }) => {
  try {
    const content = `Shared alert today: ${payload.animalType} detected! Be cautious and check your perimeter.`;
    await communityService.createPost({
      userId: payload.userId, // Defaulting to the user who received the detection
      content,
      animalType: payload.animalType,
      distance: 'Unknown',
      side: 'North Fence', // Currently fixed as North Fence in other mocks
    });
    logger.info(`Auto-created community post for detection: ${payload.detectionId}`);
  } catch (error) {
    logger.error('Failed to auto-create community post', error);
  }
});
