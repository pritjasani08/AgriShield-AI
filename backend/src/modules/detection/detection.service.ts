import { BaseService } from '../../core/services/BaseService';
import { IDetectionProvider } from '../../core/providers/detection';
import { IDetectionRepository } from './detection.repository';
import { DetectionResultDto } from './detection.types';
import { DetectionMapper } from './detection.mapper';
import { DomainEvents, EventTypes } from '../../core/events';
import { ApiError } from '../../core/utils/ApiError';
import { HTTP_STATUS } from '../../core/constants/http';

export class DetectionService extends BaseService {
  constructor(
    private readonly detectionProvider: IDetectionProvider,
    private readonly detectionRepository: IDetectionRepository
  ) {
    super();
  }

  async processImage(imageBuffer: Buffer, userId: string, mimetype?: string): Promise<DetectionResultDto[]> {
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid image buffer provided');
    }

    // 1. Send buffer to AI provider for inference
    const rawResults = await this.detectionProvider.analyze({ imageBuffer, mimetype });

    // 2. Persist the raw results
    for (const result of rawResults) {
      const saved = await this.detectionRepository.saveDetection(result);
      
      // Emit domain event for notifications
      DomainEvents.emitEvent(EventTypes.DETECTION_CREATED, {
        userId,
        detectionId: saved.id,
        animalType: result.animalType,
        confidence: result.confidence,
        riskLevel: result.riskLevel
      });
    }

    // 3. Map raw entities to DTOs
    return rawResults.map(raw => DetectionMapper.toDetectionResultDto(raw));
  }

  async getHistory(limit: number, offset: number): Promise<any[]> {
    const rawHistory = await this.detectionRepository.getHistory(limit, offset);
    return rawHistory.map(record => {
      const animal = record.animal_type;
      const riskLevel = record.risk_level;
      const confidence = Math.round(Number(record.confidence) * 100);
      
      const dateObj = new Date(record.created_at);
      const date = dateObj.toLocaleDateString();
      const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const recommendations = DetectionMapper['generateRecommendations'](animal as any, riskLevel as any);
      const actions = recommendations.map(r => r.action);
      
      return {
        id: record.id,
        animal,
        confidence,
        date,
        time,
        side: 'North Fence', // Defaulting for now as it's not captured by FastAPI yet
        summary: `${animal} detected near the North Fence with ${confidence}% confidence. Risk level is ${riskLevel}.`,
        actions,
        status: riskLevel === 'CRITICAL' ? 'Needs Review' : (riskLevel === 'HIGH' ? 'Monitoring' : 'Resolved'),
        risk: riskLevel
      };
    });
  }
}
