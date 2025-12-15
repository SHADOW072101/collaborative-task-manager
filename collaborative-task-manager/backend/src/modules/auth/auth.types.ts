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