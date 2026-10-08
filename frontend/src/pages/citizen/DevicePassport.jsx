import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { StatusBadge, SampleDataBadge } from '../../components/ui/StatusBadge';
import { Timeline } from '../../components/ui/Timeline';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  ShieldCheckIcon,
  AlertTriangleIcon,
  EcoLeafIcon,
  ArrowLeftIcon,
  TruckIcon,
  LaptopIcon,
} from '../../components/ui/Icons';
import { DEVICE_STATUSES, canCancelStatus } from '../../config/statusLifecycle';

const SAMPLE_PASSPORT = {
  _id: 'sample_dev_01',
  deviceCode: 'EW-2026-000101',
  type: 'LAPTOP',
  ageYears: 4,
  powersOn: true,
  damage: 'MINOR',
  notes: 'Intel Core i5, battery holds charge, minor chassis wear on lower panel.',
  status: DEVICE_STATUSES.PICKUP_REQUESTED,
  isSample: true,
  createdAt: '2026-10-01T09:00:00Z',
  ai: {
    status: 'OK',
    suggestedOutcome: 'REPAIR',
    reason: 'Chassis has minor surface wear while logic board and power circuit function properly. Component servicing extends useful life.',
    safetyTip: 'Safely decouple personal cloud accounts and execute storage sanitization prior to collection.',
    modelId: 'anthropic.claude-3-sonnet',
    createdAt: '2026-10-01T09:00:15Z',
  },
  pickup: {
    address: {
      text: 'Flat 402, Green Enclave, Sector 14',
      pincode: '110001',
    },
    preferredSlot: 'Weekend Morning (10 AM - 1 PM)',
    status: 'REQUESTED',
  },
  timeline: [
    {
      step: DEVICE_STATUSES.REGISTERED,
      at: '2026-10-01T09:00:15Z',
      byRole: 'citizen',
      note: 'Device registered and AI triage generated.',
    },
    {
      step: DEVICE_STATUSES.PICKUP_REQUESTED,
      at: '2026-10-01T09:15:00Z',
      byRole: 'citizen',
      note: 'Doorstep pickup requested for pincode 110001.',
    },
  ],
};

export function DevicePassport() {
  const { id } = useParams();
  const [device, setDevice] = useState(SAMPLE_PASSPORT);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [pickupForm, setPickupForm] = useState({
    addressText: '',
    pincode: '',
    preferredSlot: 'Morning (9 AM - 12 PM)',
  });

  const canCancel = canCancelStatus(device.status);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/citizen/devices"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to My Devices
        </Link>
        <div className="flex items-center gap-2">
          {device.isSample && <SampleDataBadge />}
          <StatusBadge status={device.status} />
        </div>
      </div>

      {/* Main Passport Document Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-elevated overflow-hidden">
        {/* Document Header Banner */}
        <div className="bg-zinc-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px] uppercase tracking-widest font-semibold mb-1">
              <EcoLeafIcon className="w-4 h-4 text-emerald-400" />
              <span>Digital Device Passport</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-mono font-black tracking-tight text-white">
              {device.deviceCode}
            </h1>
            <p className="text-zinc-400 text-xs mt-1 font-mono">
              Category: <strong className="text-zinc-200">{device.type}</strong> · Age: {device.ageYears}y · {device.powersOn ? 'Powers on' : 'No power'}
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl text-center sm:text-right font-mono">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">
              Disposition Status
            </span>
            <span className="text-sm font-bold text-emerald-400 uppercase mt-0.5 block">
              {device.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Mandatory SPEC Regulatory Notices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100 bg-[#fafaf9] border-b border-zinc-200 text-xs">
          <div className="p-4 flex items-start gap-2.5 text-zinc-700">
            <AlertTriangleIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-zinc-900 font-semibold block">Specification Rule:</strong>
              "This is a suggestion. The collector confirms the final outcome."
            </div>
          </div>
          <div className="p-4 flex items-start gap-2.5 text-zinc-700">
            <ShieldCheckIcon className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-zinc-900 font-semibold block">Privacy Directive:</strong>
              "Please wipe or remove your personal data before pickup."
            </div>
          </div>
        </div>

        {/* Passport Body Details */}
        <div className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Device Hardware Information */}
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-500">
                Hardware Evidence
              </h3>

              <div className="h-40 bg-zinc-50 rounded-xl border border-zinc-200/80 p-4 flex flex-col items-center justify-center text-center text-xs text-zinc-400 font-mono">
                <LaptopIcon className="w-8 h-8 text-zinc-300 mb-2" />
                <span>Private S3 Bucket</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">Presigned URL authentication</span>
              </div>

              <div className="text-xs font-mono space-y-2 divide-y divide-zinc-100">
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Powers on:</span>
                  <span className="font-bold text-zinc-900">{device.powersOn ? 'YES' : 'NO'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Damage:</span>
                  <span className="font-bold text-zinc-900">{device.damage}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Registered:</span>
                  <span className="font-bold text-zinc-900">{new Date(device.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {device.notes && (
                <div className="p-3 bg-zinc-50 rounded-lg text-xs text-zinc-600 font-mono border border-zinc-100">
                  <span className="font-bold text-zinc-800 block text-[10px] uppercase">Notes:</span>
                  {device.notes}
                </div>
              )}
            </div>

            {/* Right: AI Triage & Pickup Details */}
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-500">
                AI Diagnostic Triage
              </h3>

              {device.ai && (
                <div className="p-5 bg-forest-50/70 rounded-xl border border-forest-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] font-bold text-forest-800 uppercase tracking-wider">
                      SUGGESTED DISPOSITION
                    </span>
                    <span className="font-mono text-[11px] text-forest-700">Model: {device.ai.modelId}</span>
                  </div>
                  <div className="text-2xl font-black text-forest-950 font-mono">
                    {device.ai.suggestedOutcome}
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed">
                    {device.ai.reason}
                  </p>
                  {device.ai.safetyTip && (
                    <div className="pt-2 border-t border-forest-200/60 text-xs text-forest-900 font-medium">
                      Tip: {device.ai.safetyTip}
                    </div>
                  )}
                </div>
              )}

              {/* Pickup Information */}
              {device.pickup && (
                <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Collection Schedule
                    </span>
                    <span className="font-mono text-xs text-forest-900 font-bold">{device.pickup.status}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-zinc-700">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">ADDRESS</span>
                      <span>{device.pickup.address.text}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">PINCODE</span>
                      <span className="font-bold text-zinc-950">{device.pickup.address.pincode}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">PREFERRED SLOT</span>
                      <span>{device.pickup.preferredSlot}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300"
                onClick={() => {
                  if (window.confirm('Cancel this pickup request?')) {
                    setDevice((prev) => ({
                      ...prev,
                      status: DEVICE_STATUSES.CANCELLED,
                    }));
                  }
                }}
              >
                Cancel Pickup Request
              </Button>
            )}

            {device.status === DEVICE_STATUSES.REGISTERED && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsPickupModalOpen(true)}
              >
                <TruckIcon className="w-4 h-4 mr-1.5" />
                Schedule Doorstep Pickup
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Complete Audit Timeline */}
      <Card>
        <CardHeader
          title="Passport Lifecycle History"
          subtitle="Verifiable event sequence from citizen submission to certified completion"
        />
        <CardBody>
          <Timeline currentStatus={device.status} history={device.timeline} />
        </CardBody>
      </Card>

      {/* Pickup Request Modal */}
      <Modal
        isOpen={isPickupModalOpen}
        onClose={() => setIsPickupModalOpen(false)}
        title="Schedule Collection"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDevice((prev) => ({
              ...prev,
              status: DEVICE_STATUSES.PICKUP_REQUESTED,
              pickup: {
                address: { text: pickupForm.addressText, pincode: pickupForm.pincode },
                preferredSlot: pickupForm.preferredSlot,
                status: 'REQUESTED',
              },
            }));
            setIsPickupModalOpen(false);
          }}
          className="space-y-4"
        >
          <Input
            id="pickup-address"
            label="Street Address / Building"
            required
            placeholder="Flat 101, Green Society"
            value={pickupForm.addressText}
            onChange={(e) => setPickupForm({ ...pickupForm, addressText: e.target.value })}
          />
          <Input
            id="pickup-pincode"
            label="Postal Pincode"
            required
            placeholder="110001"
            value={pickupForm.pincode}
            onChange={(e) => setPickupForm({ ...pickupForm, pincode: e.target.value })}
            helperText="Matched to collectors serving this postal area."
          />
          <div>
            <label htmlFor="pickup-slot" className="block text-sm font-medium text-slate-800 mb-1">
              Preferred Time Window
            </label>
            <select
              id="pickup-slot"
              value={pickupForm.preferredSlot}
              onChange={(e) => setPickupForm({ ...pickupForm, preferredSlot: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
            >
              <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
              <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
              <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
              <option value="Weekend (10 AM - 2 PM)">Weekend (10 AM - 2 PM)</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsPickupModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Pickup
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
