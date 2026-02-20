// src/components/user/types/user.ts
export type Role = 'admin' | 'user' | 'manager' | string;

export interface User {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  role?: Role;
  active?: boolean;
}

export interface CreateUserData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  passwordConfirmation: string;
  position?: string;
  role?: Role;
}

export interface GetUsersParams {
  sort?: string;
  fields?: string;
  from?: string;
  to?: string;
  limit?: number;
  page?: number;
  keyword?: string;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  status?: string;
  results?: number;
  data: T[];
  page?: number;
  limit?: number;
  total?: number;
}

export interface Statistics {
  total: number;
  active: number;
  inactive: number;
  admins: number;
}
