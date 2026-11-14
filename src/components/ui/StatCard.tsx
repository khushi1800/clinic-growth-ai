import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  subtitle,
  icon,
  iconBg = 'bg-blue-50',
  iconColor = 'text-blue-600',
}) => {
  return (
    <Card className="hover:border-slate-300 transition-all">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          {icon && (
            <div className={clsx('p-2 rounded-xl flex items-center justify-center shrink-0', iconBg, iconColor)}>
              {icon}
            </div>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
          {change && (
            <span
              className={clsx(
                'inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-full',
                isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              )}
            >
              {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
              {change}
            </span>
          )}
        </div>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};
