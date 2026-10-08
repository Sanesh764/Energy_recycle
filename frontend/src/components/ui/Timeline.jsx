import React from 'react';
import {
  ORDERED_LIFECYCLE_STEPS,
  STATUS_CONFIG,
  DEVICE_STATUSES,
} from '../../config/statusLifecycle';
import { CheckCircleIcon, AlertCircleIcon } from './Icons';

export function Timeline({ currentStatus = DEVICE_STATUSES.REGISTERED, history = [] }) {
  const isCancelled = currentStatus === DEVICE_STATUSES.CANCELLED;
  const currentIndex = ORDERED_LIFECYCLE_STEPS.indexOf(currentStatus);

  return (
    <div className="w-full py-4">
      {/* Step progress track */}
      <ol className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-2" aria-label="Device Lifecycle Progress">
        {ORDERED_LIFECYCLE_STEPS.map((stepKey, idx) => {
          const config = STATUS_CONFIG[stepKey];
          const isPassed = !isCancelled && currentIndex > idx;
          const isCurrent = !isCancelled && currentIndex === idx;
          const isPending = isCancelled || currentIndex < idx;

          return (
            <li
              key={stepKey}
              aria-current={isCurrent ? 'step' : undefined}
              className="flex-1 flex md:flex-col items-center gap-3 md:text-center relative"
            >
              {/* Connector line for horizontal desktop view */}
              {idx < ORDERED_LIFECYCLE_STEPS.length - 1 && (
                <div
                  className={`hidden md:block absolute top-4 left-1/2 w-full h-0.5 -z-0 ${
                    isPassed ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Step indicator node */}
              <div
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold border-2 transition-colors ${
                  isPassed
                    ? 'bg-emerald-700 border-emerald-700 text-white'
                    : isCurrent
                    ? 'bg-white border-emerald-700 text-emerald-800 ring-4 ring-emerald-100'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isPassed ? (
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="flex flex-col text-left md:text-center">
                <span
                  className={`text-xs font-medium ${
                    isCurrent
                      ? 'text-emerald-900 font-bold'
                      : isPassed
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {config.label}
                </span>
                <span className="hidden lg:block text-[11px] text-slate-400 max-w-[130px] mx-auto">
                  {config.description}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Cancelled Alert if applicable */}
      {isCancelled && (
        <div className="mt-6 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-red-800 text-sm">
          <AlertCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>
            This device request has been <strong>Cancelled</strong>.
          </span>
        </div>
      )}

      {/* Detailed Timeline History Log if provided */}
      {history.length > 0 && (
        <div className="mt-8 border-t border-slate-200 pt-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Audit Trail History
          </h3>
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      {STATUS_CONFIG[item.step]?.label || item.step}
                    </span>
                    <time className="text-slate-400">
                      {item.at ? new Date(item.at).toLocaleString() : 'Just now'}
                    </time>
                  </div>
                  {item.byRole && (
                    <span className="text-[11px] text-emerald-800 font-medium">
                      By: {item.byRole}
                    </span>
                  )}
                  {item.note && (
                    <p className="mt-1 text-slate-600 italic">"{item.note}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
