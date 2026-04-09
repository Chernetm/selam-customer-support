'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Phone, User, Mail, MapPin, Eye, EyeOff } from 'lucide-react';
import { registerAdmin } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AdminRegisterProps } from '@/types/auth';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<AdminRegisterProps>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // Component Mount logic to check if they have permission
    const role = localStorage.getItem('role');
    if (role === 'super-admin' || role === 'super_admin') {
      setIsSuperAdmin(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const getPasswordStrength = (pass?: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };
    if (pass.length > 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-yellow-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (strength.label === 'Weak') {
      setError('Please use a stronger password');
      return;
    }

    setLoading(true);

    try {
      await registerAdmin({
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
        email: form.email,
        password: form.password,
        address: form.address,
      });

      router.push('/admin/login?message=Admin account created successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse"
      >
        {/* Right Side - Branding */}
        <div className="md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598301257982-0cf014dabbcd?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-30"></div>
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-3xl font-bold mb-6">Admin Access</h2>
            <p className="text-indigo-100 mb-8">
              Create administrator accounts to manage departments and system operations.
            </p>
            <ul className="space-y-3 text-sm text-indigo-50 hidden md:block">
              <li>✓ Manage users</li>
              <li>✓ Department control</li>
              <li>✓ System configuration</li>
            </ul>
          </div>
        </div>

        {/* Left Side - Form */}
        <div className="md:w-1/2 p-12">
          <div className="text-center md:text-left mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Create Admin Account</h3>
            <p className="text-gray-500 text-sm mt-1">
              Only authorized personnel should register.
            </p>
            {isSuperAdmin && (
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline mt-2">
                ← Back to Dashboard
              </Link>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="John"
              required
              icon={<User size={18} />}
            />

            <Input
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Doe"
              required
              icon={<User size={18} />}
            />

            <Input
              label="Phone Number"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="+251..."
              required
              icon={<Phone size={18} />}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              icon={<Mail size={18} />}
            />

            <div>
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                icon={<Lock size={18} />}
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
                <div className="mt-2 text-[10px] uppercase font-bold tracking-wider">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Strength: {strength.label}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1">
                    <div
                      className={`${strength.color} h-1 rounded-full transition-all duration-300`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              icon={<Lock size={18} />}
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

            <Input
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Addis Ababa"
              icon={<MapPin size={18} />}
            />

            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}

            <Button type="submit" isLoading={loading} className="w-full mt-2">
              Register Admin
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
