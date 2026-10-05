import { Request, Response } from 'express';
import { DetectionService } from './detection.service';
import { ApiResponse } from '../../core/utils/ApiResponse';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { HTTP_STATUS } from '../../core/constants/http';
import { ApiError } from '../../core/utils/ApiError';

export class DetectionController {
  constructor(private readonly detectionService: DetectionService) {}

  analyze = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No image provided for analysis');
    }

    const userId = req.auth!.id;
    const mimetype = req.file.mimetype;
    const results = await this.detectionService.processImage(req.file.buffer, userId, mimetype);
    
    res.status(HTTP_STATUS.OK).json(ApiResponse.success('Image analyzed successfully', results));
  });

  getHistory = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 4;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const history = await this.detectionService.getHistory(limit, offset);
    res.status(HTTP_STATUS.OK).json(ApiResponse.success('History retrieved successfully', history));
  });
}
