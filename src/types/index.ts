import { PetType, Role } from '@prisma/client';

export interface CreatePetDto {
  name: string;
  type: PetType;
  age: number;
  breed: string;
  description?: string;
}

export interface UpdatePetDto {
  name?: string;
  type?: PetType;
  age?: number;
  breed?: string;
  description?: string;
}

export interface PetQueryDto {
  page?: number;
  limit?: number;
  type?: PetType;
  minAge?: number;
  maxAge?: number;
  breed?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  role?: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}