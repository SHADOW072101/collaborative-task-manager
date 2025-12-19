export interface UserPayload {
  userId: string;
  iat: number;
  exp: number;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
  token: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// backend/src/modules/auth/auth.types.ts
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  isActive?: boolean;
  role?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}