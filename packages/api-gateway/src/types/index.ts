export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ProxyRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
}

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: User;
}

export interface ServiceHealth {
  service: string;
  status: 'up' | 'down';
  timestamp: string;
  responseTime?: number;
}
