import React from 'react';

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}) {
  const variantStyles = {
    neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200/80',
    forest: 'bg-forest-50 text-forest-900 border-forest-200/80',
    brand: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
    success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    info: 'bg-sky-50 text-sky-900 border-sky-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    danger: 'bg-red-50 text-red-900 border-red-200',
    sample: 'bg-amber-50 text-amber-900 border-amber-300 font-mono tracking-tight',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-xs px-3 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border tracking-tight ${variantStyles[variant] || variantStyles.neutral} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
