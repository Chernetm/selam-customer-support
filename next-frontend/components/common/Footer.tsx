'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);

const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-1 2.17-2.09 3.42a8.18 8.18 0 0 1-8.38 7.03 11.21 11.21 0 0 1-3.13-.43A10.51 10.51 0 0 0 2 19c6.69 0 11.24-4.58 11.24-11.24 0-.17 0-.34-.01-.51A8.25 8.25 0 0 0 20 5.4a1 1 0 0 1-1 1H18a8.26 8.26 0 0 1-3.32-.71c-.02-.15-.03-.3-.03-.45A8.25 8.25 0 0 1 18.25 4" /></svg>
);

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const { t } = useLanguage();

  const hideFooter = ['/chat', '/dashboard', '/admin'].some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  if (hideFooter) return null;

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                <span className="font-black text-lg tracking-tighter">B</span>
              </div>
              <span className="font-black text-xl text-white tracking-tight">{t('common.brand')}</span>
            </Link>
            <p className="text-gray-400 text-sm font-bold leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FacebookIcon size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <TwitterIcon size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <InstagramIcon size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-gray-200 mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3 font-black">
              <li>
                <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">{t('nav.about')}</Link>
              </li>
              <li>
                <Link href="/services" className="text-sm text-gray-400 hover:text-white transition-colors">Services</Link>
              </li>
              <li>
                <Link href="/help-center" className="text-sm text-gray-400 hover:text-white transition-colors">{t('nav.helpCenter')}</Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">{t('nav.contact')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black text-gray-200 mb-4">Support</h3>
            <ul className="space-y-3 font-black">
              <li>
                <Link href="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</Link>
              </li>
              <li>
                <Link href="/receipt" className="text-sm text-gray-400 hover:text-white transition-colors">{t('nav.receipt')}</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black text-gray-200 mb-4">{t('footer.contactInfo')}</h3>
            <ul className="space-y-3 font-black">
              <li className="flex items-start gap-3">
                <MapPin className="text-indigo-500 mt-0.5" size={18} />
                <span className="text-sm text-gray-400">{t('footer.address')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-indigo-500" size={18} />
                <span className="text-sm text-gray-400">+251 111 55 32 33</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-indigo-500" size={18} />
                <span className="text-sm text-gray-400">info@birhanenaselam.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col items-center justify-between gap-4 sm:flex-row font-black">
          <p className="text-sm text-gray-400 text-center sm:text-left" suppressHydrationWarning>
            &copy; {currentYear} {t('common.brand')} {t('common.enterprise')}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
