export interface ApiSuccess<T> {
  statusCode: number;
  success: true;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export interface ApiError {
  statusCode: number;
  success: false;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
