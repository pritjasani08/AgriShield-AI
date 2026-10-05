import { AnimalType, RiskLevel } from '../../enums';

export interface ProviderDetectionRequest {
  imagePath?: string;
  imageBuffer?: Buffer;
  mimetype?: string;
}

export interface RawBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RawDetectionResult {
  animalType: AnimalType;
  confidence: number;
  boundingBox: RawBoundingBox;
  riskLevel: RiskLevel;
}

export interface IDetectionProvider {
  analyze(request: ProviderDetectionRequest): Promise<RawDetectionResult[]>;
}
