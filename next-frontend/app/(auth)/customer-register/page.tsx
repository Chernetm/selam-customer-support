'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Phone, User, Mail, Eye, EyeOff } from 'lucide-react';
import { registerCustomer } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CustomerRegisterProps } from '@/types/auth';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CustomerRegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [form, setForm] = useState<CustomerRegisterProps>({
    name: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    email: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = (pass?: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };
    if (pass.length > 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 25, label: t('auth.weak'), color: 'bg-red-500' };
    if (score === 2) return { score: 50, label: t('auth.fair'), color: 'bg-yellow-500' };
    if (score === 3) return { score: 75, label: t('auth.good'), color: 'bg-blue-500' };
    return { score: 100, label: t('auth.strong'), color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError(t('auth.passwordsMismatch'));
      return;
    }

    if (strength.label === t('auth.weak')) {
      setError(t('auth.strongerPassword'));
      return;
    }

    setLoading(true);

    try {
      await registerCustomer({
        name: form.name,
        phoneNumber: form.phoneNumber,
        password: form.password,
        email: form.email || undefined,
      });

      // Redirect to login on success
      router.push(`/login?message=${t('auth.registrationSuccess')}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 italic uppercase">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse shadow-indigo-900/10 border border-gray-100"
      >
        {/* Right Side - Image */}
        <div className="md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598301257982-0cf014dabbcd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-30"></div>
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-4xl font-black mb-6 tracking-tight italic">{t('auth.registerTitle')}</h2>
            <p className="text-indigo-100 text-lg mb-8 font-bold italic leading-relaxed">
              {t('auth.registerSubtitle')}
            </p>
            <ul className="space-y-4 text-sm font-bold hidden md:block italic">
              {(t('auth.registerFeatures') as string[]).map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px]">✓</div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Left Side - Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <div className="text-center md:text-left mb-8">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight italic">{t('auth.createAccount')}</h3>
            <p className="text-gray-500 text-sm mt-2 font-bold italic">{t('auth.freeAccountDesc')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.firstNameLabel')}
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              icon={<User size={18} />}
              className="py-4 font-bold italic"
            />

            <Input
              label={t('auth.phoneLabel')}
              name="phoneNumber"
              type="tel"
              required
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="+251..."
              icon={<Phone size={18} />}
              className="py-4 font-bold italic"
            />

            <Input
              label={t('auth.emailLabel')}
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              icon={<Mail size={18} />}
              className="py-4 font-bold italic"
            />

            <div>
              <Input
                label={t('auth.passwordLabel')}
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={<Lock size={18} />}
                className="py-4 font-bold italic"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-indigo-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              {form.password && (
                <div className="mt-3 text-[10px] uppercase font-black tracking-widest">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-gray-500">{t('auth.strength')}: {strength.label}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`${strength.color} h-full transition-all duration-500`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Input
              label={t('auth.confirmPasswordLabel')}
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              icon={<Lock size={18} />}
              className="py-4 font-bold italic"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-indigo-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {error && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl text-center font-bold italic border border-red-100">{error}</div>}

            <Button type="submit" isLoading={loading} className="w-full py-6 mt-4 font-black text-lg uppercase tracking-widest shadow-lg shadow-indigo-100">
              {t('auth.register')}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm font-bold italic">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link href="/login" className="text-indigo-600 font-black hover:underline">
              {t('auth.logIn')}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
