'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface NavLinkProps {
  name: string;
  path: string;
  isActive: boolean;
  onClick?: () => void;
  icon?: React.ComponentType<{ size: number }>;
}

export function NavLink({ name, path, isActive, onClick, icon: Icon }: NavLinkProps) {
  return (
    <Link
      href={path}
      onClick={onClick}
      className={clsx(
        'text-sm font-medium transition-colors hover:text-indigo-600 relative flex items-center gap-2',
        isActive ? 'text-indigo-600' : 'text-gray-600'
      )}
    >
      {Icon && <Icon size={18} />}
      {name}
      {isActive && (
        <motion.div
          layoutId="underline"
          className="absolute left-0 top-full h-0.5 w-full bg-indigo-600 mt-1"
        />
      )}
    </Link>
  );
}
