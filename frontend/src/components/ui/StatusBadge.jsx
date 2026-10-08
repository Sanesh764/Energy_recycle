import React from 'react';
import { STATUS_CONFIG, DEVICE_STATUSES } from '../../config/statusLifecycle';
import { Badge } from './Badge';

export function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    variant: 'neutral',
  };

  const dotColors = {
    neutral: 'bg-slate-400',
    brand: 'bg-emerald-500',
    success: 'bg-green-600',
    info: 'bg-sky-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  };

  return (
    <Badge variant={config.variant} className={className}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotColors[config.variant] || 'bg-slate-400'}`}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </Badge>
  );
}

export function SampleDataBadge({ className = '' }) {
  return (
    <Badge variant="sample" className={className}>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" />
      <span>Sample Data</span>
    </Badge>
  );
}
