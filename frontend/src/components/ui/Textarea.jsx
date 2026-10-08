import React from 'react';

export function Textarea({
  id,
  label,
  error,
  helperText,
  required = false,
  className = '',
  disabled = false,
  rows = 3,
  maxLength,
  value,
  ...props
}) {
  const textareaId = id || props.name || Math.random().toString(36).slice(2, 9);
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-800"
          >
            {label} {required && <span className="text-red-600" aria-hidden="true">*</span>}
          </label>
        )}
        {maxLength && (
          <span className="text-xs text-slate-400">
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        required={required}
        className={`w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-red-600 font-medium" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="mt-1.5 text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
