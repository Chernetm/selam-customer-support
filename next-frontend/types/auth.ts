export interface CustomerRegisterProps {
  name: string;
  phoneNumber: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface AdminRegisterProps {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  address?: string;
}

export interface LoginProps {
  email: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  refreshToken: string;
  expiresIn?: number;
  user?: {
    id: string;
    role: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  data?: any;
}
