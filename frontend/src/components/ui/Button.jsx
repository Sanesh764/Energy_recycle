import React from 'react';

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99] tracking-tight';

  const variantStyles = {
    primary:
      'bg-forest-900 hover:bg-forest-800 active:bg-forest-950 text-white focus-visible:ring-forest-800 shadow-sm border border-forest-950/20',
    secondary:
      'bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/80 text-zinc-900 focus-visible:ring-zinc-400 shadow-subtle',
    outline:
      'border border-zinc-300 hover:border-forest-800 text-zinc-800 hover:text-forest-900 hover:bg-forest-50/40 focus-visible:ring-forest-700',
    danger:
      'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus-visible:ring-red-600 shadow-sm',
    ghost:
      'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950 focus-visible:ring-zinc-400',
    dark:
      'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700/60 shadow-sm',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 h-11 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
