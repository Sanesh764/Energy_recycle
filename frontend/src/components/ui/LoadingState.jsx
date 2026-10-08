import React from 'react';

export function LoadingState({ message = 'Loading...', minHeight = 'min-h-[240px]' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${minHeight}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative w-10 h-10 mb-3">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-200"></div>
        <div className="absolute inset-0 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}
