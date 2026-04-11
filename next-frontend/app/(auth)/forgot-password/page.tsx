'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { KeyRound, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 shadow-indigo-900/10 border border-gray-100"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {submitted ? 'Reset Link Sent' : 'Forgot Password?'}
          </h1>
          <p className="text-gray-500 mt-2 font-bold text-sm">
            {submitted 
              ? `We've sent reset instructions to ${email}`
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={20} />}
              className="py-4 text-black font-bold"
            />
            <Button type="submit" className="w-full py-6 font-black uppercase tracking-widest text-xs">
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="text-center">
             <p className="text-xs text-gray-400 font-bold mb-6 italic">
                Note: In this demonstration, no actual email is sent.
             </p>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-black text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
