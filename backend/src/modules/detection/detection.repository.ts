import { RawDetectionResult } from '../../core/providers/detection';

export interface IDetectionRepository {
  saveDetection(result: RawDetectionResult): Promise<{ id: string }>;
  getHistory(limit: number, offset: number): Promise<any[]>;
}
