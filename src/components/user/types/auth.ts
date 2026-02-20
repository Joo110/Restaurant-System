// src/components/user/types/auth.ts
export interface SignUpPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
  position?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
