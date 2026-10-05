export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export interface AuthPayload {
  id: string;
  email: string;
}

export interface DetectionResult {
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
  label: string;
}

export interface User {
  id: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: Date;
  phone?: string;
}

export interface Settings {
  userId: string;
  notificationsEnabled: boolean;
  theme: string;
}

export interface DashboardResponse {
  activeCameras: number;
  recentDetections: number;
  systemHealth: string;
}

export interface MetricCardDto {
  title: string;
  value: string | number;
  trend?: string;
  status?: 'success' | 'warning' | 'danger' | 'info';
}

export interface ChartDataDto {
  labels: string[];
  series: number[];
}

export interface QuickActionDto {
  id: string;
  label: string;
  actionEndpoint: string;
}
