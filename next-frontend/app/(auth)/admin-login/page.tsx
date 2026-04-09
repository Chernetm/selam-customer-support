import React from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Admin Login | Customer Help Center',
  description: 'Secure access for administrators and support agents.',
};

export default function AdminLoginPage() {
  return (
    <LoginForm
      userType="admin"
      brandingTitle="Admin Portal"
      brandingSubtitle="Sign in to manage support tickets, oversee departments, and provide exceptional customer service."
      backgroundImage="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      features={[
        'Real-time ticket management',
        'Department-level oversight',
        'Secure communication logs',
        'System-wide configuration'
      ]}
    />
  );
}
