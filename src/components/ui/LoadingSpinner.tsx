import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  className,
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center gap-2 p-6', className)}>
      <Loader2 className={clsx('animate-spin text-blue-600', sizeMap[size])} />
      {label && <p className="text-xs text-slate-500 font-medium">{label}</p>}
    </div>
  );
};

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={clsx('animate-pulse rounded-md bg-slate-200/80', className)}
      {...props}
    />
  );
};
