export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pages?: number;
  page?: number;
  total?: number;
} 