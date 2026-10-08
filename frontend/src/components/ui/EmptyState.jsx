import React from 'react';
import { DeviceIcon } from './Icons';

export function EmptyState({
  title = 'No items found',
  description = 'There are no records to display at this time.',
  action,
  icon,
  className = '',
}) {
  return (
    <div
      className={`text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 bg-white ${className}`}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 mb-4">
        {icon || <DeviceIcon className="h-6 w-6 text-emerald-700" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
