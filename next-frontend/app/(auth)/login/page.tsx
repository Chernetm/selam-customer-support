'use client';

import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CustomerLoginPage() {
  const { t } = useLanguage();

  return (
    <LoginForm
      userType="customer"
      brandingTitle={t('auth.loginTitle')}
      brandingSubtitle={t('auth.loginSubtitle')}
      backgroundImage="https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
      features={t('auth.loginFeatures') as string[]}
    />
  );
}
