import { IDetectionRepository } from './detection.repository';
import { RawDetectionResult } from '../../core/providers/detection';

export class MockDetectionRepository implements IDetectionRepository {
  async saveDetection(result: RawDetectionResult): Promise<{ id: string }> {
    console.log(`[MockDB] Saved detection for ${result.animalType} (${result.confidence * 100}%)`);
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { id: 'mock-detection-id-' + Date.now() };
  }

  async getHistory(limit: number, offset: number): Promise<any[]> {
    return [];
  }
}
