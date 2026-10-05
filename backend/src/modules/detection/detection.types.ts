export interface BoundingBoxDto {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RecommendationDto {
  action: string;
  priority: string;
}

export interface DetectionResultDto {
  animal: string;
  confidence: number;
  boundingBox: BoundingBoxDto;
  risk: string;
  recommendations: RecommendationDto[];
}

export interface DetectionHistoryDto {
  id: string;
  animal: string;
  confidence: number;
  date: string;
  time: string;
  side: string;
  summary: string;
  actions: string[];
  status: string;
  risk: string;
}
