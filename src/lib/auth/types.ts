export interface AuthResult {
  success?: boolean;
  error?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: Record<string, unknown>;
}
