import client from './client';
import { CustomerRegisterProps, AdminRegisterProps, AuthResponse, LoginProps } from '@/types/auth';

export const registerCustomer = async (data: CustomerRegisterProps): Promise<AuthResponse> => {
  const response = await client.post('/customer/register', data);
  return response.data;
};

export const registerAdmin = async (data: AdminRegisterProps): Promise<AuthResponse> => {
  const response = await client.post('/admin/super/register', data);
  return response.data;
};

export const loginCustomer = async (data: LoginProps): Promise<AuthResponse> => {
  const response = await client.post('/customer/login', data);
  return response.data;
};

export const loginAdmin = async (data: LoginProps): Promise<AuthResponse> => {
  const response = await client.post('/admin/login', data);
  return response.data;
};

export const changePasswordAdmin = async (newPassword: string): Promise<any> => {
  const response = await client.post('/admin/change-password', { newPassword });
  return response.data;
};

export const changePasswordCustomer = async (newPassword: string): Promise<any> => {
  const response = await client.post('/customer/change-password', { newPassword });
  return response.data;
};
