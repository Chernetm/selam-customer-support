'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, ShieldCheck, Users, Eye, EyeOff } from 'lucide-react';
import { loginAdmin, loginCustomer } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface LoginFormProps {
  userType: 'admin' | 'customer';
  brandingTitle: string;
  brandingSubtitle: string;
  backgroundImage: string;
  features?: string[];
}

import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginForm({
  userType,
  brandingTitle,
  brandingSubtitle,
  backgroundImage,
  features = [],
}: LoginFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`[LoginForm] Submitting ${userType} login for: ${email}`);
    setError('');
    setLoading(true);

    try {
      const data = userType === 'admin'
        ? await loginAdmin({ email, password })
        : await loginCustomer({ email, password });
      
      console.log('[LoginForm] Login successful:', data);

      if (typeof window !== 'undefined') {
        const prefix = userType === 'admin' ? 'admin' : 'customer';

        // Store tokens
        localStorage.setItem(`${prefix}Token`, data.token);
        localStorage.setItem(`${prefix}RefreshToken`, data.refreshToken);

        if (userType === 'admin' && data.user) {
          localStorage.setItem('adminId', data.user.id);
          localStorage.setItem('role', data.user.role);
        }

        // Set cookies with expiresIn
        const maxAge = data.expiresIn || 3600;
        document.cookie = `${prefix}Token=${data.token}; max-age=${maxAge}; path=/`;
        document.cookie = `${prefix}RefreshToken=${data.refreshToken}; max-age=${3600 * 24 * 30}; path=/`;
        
        if (userType === 'admin' && data.user) {
          document.cookie = `role=${data.user.role}; max-age=${maxAge}; path=/`;
        }

        // Redirect based on role and type
        setTimeout(() => {
          if (userType === 'admin') {
            if (data.user?.role === 'super-admin') {
              window.location.href = '/dashboard';
            } else {
              window.location.href = '/admin/chat';
            }
          } else {
            window.location.href = '/chat';
          }
        }, 100);
      }
    } catch (err: any) {
      const msg = err.message || '';
      // Map technical auth errors to a user-friendly message
      if (
        msg.includes('INVALID_LOGIN_CREDENTIALS') || 
        msg.includes('not found locally') || 
        msg.includes('firebase auth failed') ||
        msg.includes('Unauthorized') ||
        msg.includes('invalid password')
      ) {
        setError(t('auth.loginFailed'));
      } else {
        setError(msg || t('auth.loginFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row shadow-indigo-900/10 border border-gray-100"
      >
        {/* Branding Side */}
        <div className="md:w-1/2 bg-indigo-900 p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 transition-transform duration-[10s] hover:scale-110"
            style={{ backgroundImage: `url('${backgroundImage}')` }}
          />
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-6 tracking-tight">{brandingTitle}</h2>
            <p className="text-indigo-100 text-lg mb-8 leading-relaxed font-bold">
              {brandingSubtitle}
            </p>
            {features.length > 0 && (
              <ul className="space-y-4 mb-8 hidden md:block">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3 text-indigo-50 font-bold"
                  >
                    <div className="w-5 h-5 bg-indigo-500/30 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    {feature}
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative z-10 mt-auto">
            <div className="flex items-center gap-3 text-sm text-indigo-300 font-black">
              <div className="w-12 h-0.5 bg-indigo-500" />
              {t('auth.empoweringSupport')}
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center bg-white">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">
              {userType === 'admin' ? t('auth.adminLoginTitle') : t('auth.signIn')}
            </h3>
            <p className="text-gray-500 mt-3 font-bold">
              {userType === 'admin' ? t('auth.adminLoginSubtitle') : t('auth.welcomeBackPortal')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={t('auth.emailLabel')}
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={20} />}
              className="py-4 text-black placeholder:text-gray-400 font-bold"
            />

            <div className="space-y-2">
              <Input
                label={t('auth.passwordLabel')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={20} />}
                className="py-4 text-black placeholder:text-gray-400 font-bold"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />
              <div className="flex justify-end">
                <Link
                  href={`/forgot-password?type=${userType}`}
                  className="text-sm text-indigo-600 hover:underline font-black tracking-tight"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-bold"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              isLoading={loading}
              className="w-full py-6 text-base font-black shadow-lg shadow-indigo-100 group relative overflow-hidden"
            >
              <div className="flex items-center justify-center gap-2">
                {t('auth.logIn')}
                {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </div>
            </Button>
          </form>

          <div className="mt-10 text-center">
            {userType === 'customer' ? (
              <p className="text-sm text-gray-600 font-bold">
                {t('auth.dontHaveAccount')}{' '}
                <Link href="/customer-register" className="text-indigo-600 font-black hover:underline transition-all">
                  {t('auth.createAccount')}
                </Link>
              </p>
            ) : (
              <p className="text-sm text-gray-600 font-black">
                {t('auth.authorizedOnly')}
              </p>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <Link
              href={userType === 'admin' ? '/login' : '/admin-login'}
              className="inline-flex items-center gap-2.5 text-indigo-600 hover:text-indigo-800 font-black transition-colors py-3 px-6 rounded-2xl bg-indigo-50 hover:bg-indigo-100 tracking-tight"
            >
              {userType === 'admin' ? (
                <>
                  <Users size={18} />
                  {t('auth.customerPortal')}
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  {t('auth.adminPortal')}
                </>
              )}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
