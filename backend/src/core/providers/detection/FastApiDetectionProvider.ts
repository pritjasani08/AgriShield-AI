import { IDetectionProvider, ProviderDetectionRequest, RawDetectionResult } from './IDetectionProvider';
import { env } from '../../../config/env';
import { AnimalType, RiskLevel } from '../../enums';
import { logger } from '../../utils/logger';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../constants/http';

const animalMap: Record<string, AnimalType> = {
  'boar': AnimalType.BOAR,
  'wild boar': AnimalType.BOAR,
  'elephant': AnimalType.ELEPHANT,
  'deer': AnimalType.DEER,
  'monkey': AnimalType.MONKEY,
  'buffalo': AnimalType.BUFFALO,
  'cow': AnimalType.COW,
  'nilgai': AnimalType.NILGAI,
};

export class FastApiDetectionProvider implements IDetectionProvider {
  constructor() {
    if (!env.FASTAPI_URL) {
      logger.error('Configuration Error: FASTAPI_URL is missing');
      throw new Error('FASTAPI_URL is not configured');
    }
    logger.info('Detection Provider Initialized', {
      provider: 'FastApiDetectionProvider',
      url: env.FASTAPI_URL
    });
  }

  async analyze(request: ProviderDetectionRequest): Promise<RawDetectionResult[]> {
    if (!request.imageBuffer) {
      throw new Error('imageBuffer is required for FastApiDetectionProvider');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const startTime = Date.now();
    
    logger.info('FastAPI request started');

    try {
      const isVideo = request.mimetype?.startsWith('video/') || false;
      const formData = new FormData();
      
      if (isVideo) {
        formData.append('video', request.imageBuffer, { filename: 'video.mp4', contentType: request.mimetype || 'video/mp4' });
      } else {
        formData.append('image', request.imageBuffer, { filename: 'image.jpg', contentType: request.mimetype || 'image/jpeg' });
      }

      const endpoint = isVideo ? '/predict_video' : '/predict';
      const response = await fetch(`${env.FASTAPI_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
        signal: controller.signal as any,
      });

      if (!response.ok) {
        logger.error('FastAPI HTTP Error', { status: response.status, statusText: response.statusText });
        throw new ApiError(HTTP_STATUS.SERVICE_UNAVAILABLE, `FastAPI responded with status: ${response.status}`);
      }

      const data = await response.json() as any;
      const durationMs = Date.now() - startTime;
      
      logger.info('Raw FastAPI Response', { rawFastApiResponse: data });

      logger.info('Inference Metadata', {
        ai_provider: 'FastApiDetectionProvider',
        model_version: 'YOLO11 (latest)',
        duration_ms: durationMs,
        timestamp: new Date().toISOString()
      });

      return this.mapFastApiResponse(data, durationMs);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        logger.error('Network Failure: FastAPI request timed out', { timeoutMs: 10000 });
        throw new ApiError(HTTP_STATUS.SERVICE_UNAVAILABLE, 'Inference server timeout');
      }
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        logger.error('Network Failure: FastAPI server is unreachable', { reason: error.message });
        throw new ApiError(HTTP_STATUS.SERVICE_UNAVAILABLE, 'Inference server unreachable');
      }
      
      logger.error('FastApiDetectionProvider request failed', { reason: error.message || error });
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private mapFastApiResponse(data: any, durationMs: number): RawDetectionResult[] {
    if (data.detected === false) {
      logger.info('FastAPI request completed', {
        durationMs,
        prediction: 'None',
        confidence: 0
      });
      return [];
    }

    if (!data.animal || typeof data.confidence !== 'number') {
      logger.error('Malformed FastAPI response', { fields: Object.keys(data) });
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Malformed response from inference server');
    }

    const label = String(data.animal).trim().toLowerCase();
    const animalType = animalMap[label] || AnimalType.UNKNOWN;

    let confidence = data.confidence;
    if (confidence > 1) {
      confidence = confidence / 100;
    }

    let riskLevel = RiskLevel.LOW;
    if (confidence >= 0.80) riskLevel = RiskLevel.CRITICAL;
    else if (confidence >= 0.55) riskLevel = RiskLevel.HIGH;
    else if (confidence >= 0.35) riskLevel = RiskLevel.MEDIUM;

    let x = 0, y = 0, width = 100, height = 100;
    
    if (data.bbox) {
      x = Math.max(0, Number(data.bbox.x) || 0);
      y = Math.max(0, Number(data.bbox.y) || 0);
      width = Math.max(0, Number(data.bbox.width) || 0);
      height = Math.max(0, Number(data.bbox.height) || 0);
      
      if (width <= 0 || height <= 0) {
        logger.warn('Ignored detection due to invalid bounding box geometry', { width, height });
        return [];
      }
    }

    logger.info('FastAPI request mapped successfully', {
      durationMs,
      prediction: animalType,
      confidence
    });

    return [{
      animalType,
      confidence,
      riskLevel,
      boundingBox: { x, y, width, height }
    }];
  }
}