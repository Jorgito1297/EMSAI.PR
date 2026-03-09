/**
 * Reusable stat card with animated counter and icon.
 */

'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'amber' | 'purple';
  trend?: 'up' | 'down' | 'neutral';
}

const COLOR_MAP: Record<StatCardProps['color'], string> = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
};

const ICON_BG: Record<StatCardProps['color'], string> = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  amber: 'bg-amber-100 text-amber-600',
  purple: 'bg-purple-100 text-purple-600',
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border p-5 shadow-sm ${COLOR_MAP[color]}`}
      role="article"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium opacity-80">{title}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs opacity-70">{subtitle}</p>
          )}
        </div>
        <div
          className={`ml-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${ICON_BG[color]}`}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs opacity-70">
          <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
          <span>sesión actual</span>
        </div>
      )}
    </motion.div>
  );
}
