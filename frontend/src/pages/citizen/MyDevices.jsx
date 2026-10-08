import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { StatusBadge, SampleDataBadge } from '../../components/ui/StatusBadge';
import {
  LaptopIcon,
  SmartphoneIcon,
  PlusIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from '../../components/ui/Icons';
import { DEVICE_STATUSES } from '../../config/statusLifecycle';

const SAMPLE_DEVICES = [
  {
    _id: 'mock_dev_01',
    deviceCode: 'EW-2026-000101',
    type: 'LAPTOP',
    ageYears: 4,
    powersOn: true,
    damage: 'Minor damage',
    status: DEVICE_STATUSES.PICKUP_REQUESTED,
    createdAt: '2026-10-01T10:30:00Z',
    isSample: true,
    ai: {
      suggestedOutcome: 'REPAIR',
      reason: 'Chassis has minor surface wear while logic board and power circuit function properly.',
    },
  },
  {
    _id: 'mock_dev_02',
    deviceCode: 'EW-2026-000102',
    type: 'PHONE',
    ageYears: 6,
    powersOn: false,
    damage: 'Major damage',
    status: DEVICE_STATUSES.COLLECTED,
    createdAt: '2026-09-28T14:15:00Z',
    isSample: true,
    ai: {
      suggestedOutcome: 'RECYCLE',
      reason: 'No power response with severe structural cracking; suitable for materials recovery.',
    },
  },
];

export function MyDevices() {
  const devices = SAMPLE_DEVICES;

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
        <div className="space-y-1">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
            Citizen Passport Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            MY DEVICES
          </h1>
          <p className="text-sm text-zinc-600">
            Track every registered device from first assessment to final outcome.
          </p>
        </div>
        <div>
          <Link to="/citizen/devices/new">
            <Button variant="primary" size="md">
              <PlusIcon className="w-4 h-4 mr-1.5" />
              Register Device
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid of Product-Object Device Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map((device) => {
          const isCollectedOrLater = [
            DEVICE_STATUSES.COLLECTED,
            DEVICE_STATUSES.INSPECTED,
            DEVICE_STATUSES.COMPLETED,
          ].includes(device.status);

          const isCompleted = device.status === DEVICE_STATUSES.COMPLETED;

          return (
            <div
              key={device._id}
              className="bg-white rounded-2xl border border-zinc-200/90 shadow-subtle hover:border-zinc-300 hover:shadow-premium transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Card Top Strip with Device Image Area / Identity */}
                <div className="p-5 sm:p-6 bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Device Icon Graphic Area */}
                    <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-800 shadow-subtle flex-shrink-0">
                      {device.type === 'LAPTOP' ? (
                        <LaptopIcon className="w-6 h-6 text-zinc-800" />
                      ) : (
                        <SmartphoneIcon className="w-6 h-6 text-zinc-800" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-zinc-950 tracking-wider">
                          {device.deviceCode}
                        </span>
                        {device.isSample && <SampleDataBadge />}
                      </div>
                      <h3 className="text-base font-extrabold text-forest-950">
                        {device.type}
                      </h3>
                      <p className="text-xs text-zinc-500 font-mono">
                        {device.ageYears} years · {device.powersOn ? 'Powers on' : 'No power'} · {device.damage}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={device.status} />
                </div>

                {/* AI Suggestion Section */}
                <div className="p-5 sm:p-6 space-y-4">
                  {device.ai && (
                    <div className="p-3.5 bg-forest-50/60 rounded-xl border border-forest-200/70 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[10px] font-bold text-forest-800 uppercase tracking-wider">
                          AI SUGGESTION
                        </span>
                        <span className="font-mono font-bold text-forest-900 text-xs">
                          {device.ai.suggestedOutcome}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {device.ai.reason}
                      </p>
                    </div>
                  )}

                  {/* Compact Progress Indicator */}
                  <div className="pt-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-2 font-semibold">
                      Lifecycle Progress
                    </span>
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-600">
                      <span className="text-forest-800 font-bold">● Registered</span>
                      <span className="text-forest-800 font-bold">● Pickup Requested</span>
                      <span className={isCollectedOrLater ? 'text-forest-800 font-bold' : 'text-zinc-400'}>
                        {isCollectedOrLater ? '● Collected' : '○ Collected'}
                      </span>
                      <span className={isCompleted ? 'text-forest-800 font-bold' : 'text-zinc-400'}>
                        {isCompleted ? '● Completed' : '○ Completed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-5 py-4 sm:px-6 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400">
                  Registered {new Date(device.createdAt).toLocaleDateString()}
                </span>
                <Link to={`/citizen/devices/${device._id}`}>
                  <Button variant="secondary" size="sm" className="font-semibold text-xs">
                    View Passport
                    <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
