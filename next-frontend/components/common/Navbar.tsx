'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Search, HelpCircle, Info, Phone, MessageSquare, LayoutDashboard } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import { NavLink } from './Navbar/NavLink';
import { UserActions } from './Navbar/UserActions';
import { MobileMenu } from './Navbar/MobileMenu';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();

  const { authStatus } = useAuth();
  const { role } = authStatus;

  const navLinks = [
    { name: t('nav.home'), path: '/', icon: Home },
    { name: t('nav.receipt'), path: '/receipt', icon: Search },
    { name: t('nav.helpCenter'), path: '/chat', icon: HelpCircle },
    { name: t('nav.contact'), path: '/contact', icon: Phone },
    { name: t('nav.about'), path: '/about', icon: Info },
  ];

  if (role === 'agent' || role === 'manager') {
    navLinks.push({ name: t('nav.chat'), path: '/admin/chat', icon: MessageSquare });
  } else if (role === 'super_admin' || role === 'super-admin') {
    navLinks.push({ name: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard });
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#1e293b]/95 backdrop-blur-md border-b border-white/5 font-bold shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-white text-slate-950 w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-xl shadow-black/20">
              <span className="font-black text-xl tracking-tighter">B</span>
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span className="font-black text-xl text-white tracking-tight">{t('common.brand')}</span>
              <span className="text-[9px] font-black text-slate-400">{t('common.enterprise')}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            <div className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={clsx(
                    "text-xs font-black tracking-widest transition-all duration-300 hover:text-white",
                    pathname === link.path ? "text-white" : "text-slate-400/80"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-6 border-l border-white/10 pl-8">
              <UserActions />
              {/* Language Switcher */}
              <div className="flex items-center bg-black/20 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setLanguage('en')}
                  className={clsx(
                    "px-3 py-1.5 transition-all duration-500 rounded-lg text-[10px] font-black",
                    language === 'en' ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-white"
                  )}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('am')}
                  className={clsx(
                    "px-3 py-1.5 transition-all duration-500 rounded-lg text-xs font-black",
                    language === 'am' ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-white"
                  )}
                >
                  አማ
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white border border-white/10 p-2 rounded-xl bg-white/5"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileMenu
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        navLinks={navLinks}
      />
    </nav>
  );
}
