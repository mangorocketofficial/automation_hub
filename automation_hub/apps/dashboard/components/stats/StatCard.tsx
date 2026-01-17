'use client';

import { ReactNode } from 'react';
import { formatCompactNumber, formatChange } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  format?: 'number' | 'percent';
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'yellow';
  isLoading?: boolean;
}

const colorStyles = {
  blue: 'text-blue-400',
  green: 'text-green-400',
  purple: 'text-purple-400',
  yellow: 'text-yellow-400',
};

export default function StatCard({
  title,
  value,
  change,
  format = 'number',
  icon,
  color = 'blue',
  isLoading = false,
}: StatCardProps) {
  const displayValue = format === 'percent' ? `${value}%` : formatCompactNumber(value);

  if (isLoading) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-zinc-700 rounded w-20 mb-3" />
        <div className="h-8 bg-zinc-700 rounded w-24 mb-2" />
        <div className="h-4 bg-zinc-700 rounded w-16" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 hover:border-zinc-600 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-400">{title}</span>
        {icon && <span className={colorStyles[color]}>{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${colorStyles[color]}`}>{displayValue}</div>
      {change !== undefined && (
        <div
          className={`mt-1 text-sm flex items-center gap-1 ${
            change >= 0 ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {change >= 0 ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          )}
          {formatChange(change)}
        </div>
      )}
    </div>
  );
}
