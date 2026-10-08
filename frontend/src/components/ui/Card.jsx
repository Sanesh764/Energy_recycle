import React from 'react';

export function Card({ children, className = '', highlight = false, hover = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-150 ${
        highlight
          ? 'border-forest-700/30 ring-1 ring-forest-700/10 shadow-premium'
          : 'border-zinc-200/80 shadow-subtle'
      } ${hover ? 'hover:border-zinc-300 hover:shadow-premium' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`p-5 sm:p-6 border-b border-zinc-100 flex items-start justify-between gap-4 ${className}`}>
      <div>
        {title && <h2 className="text-base font-semibold text-zinc-900 tracking-tight">{title}</h2>}
        {subtitle && <p className="text-xs text-zinc-500 mt-1 leading-normal">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`p-4 sm:p-5 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between gap-3 text-xs ${className}`}>
      {children}
    </div>
  );
}
