// backend/src/modules/users/user.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}