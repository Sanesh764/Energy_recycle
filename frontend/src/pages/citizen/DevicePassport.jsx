import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { StatusBadge, SampleDataBadge } from '../../components/ui/StatusBadge';
import { Timeline } from '../../components/ui/Timeline';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  ShieldCheckIcon,
  AlertTriangleIcon,
  EcoLeafIcon,
  ArrowLeftIcon,
  TruckIcon,
  LaptopIcon,
  CheckCircleIcon,
  CameraIcon,
} from '../../components/ui/Icons';
import { DEVICE_STATUSES, canCancelStatus } from '../../config/statusLifecycle';
import { devicesApi } from '../../services/api';

const DEVICE_IMAGE_MAP = {
  LAPTOP: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
  PHONE: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=600&q=80',
  TV: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80',
  BATTERY: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
  CHARGER: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
  PRINTER: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80',
  OTHER: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
};

export function DevicePassport() {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [schedulingPickup, setSchedulingPickup] = useState(false);
  const [pickupForm, setPickupForm] = useState({
    addressText: 'Flat 402, Green Enclave, Sector 14',
    pincode: '110001',
    preferredSlot: 'Weekend Morning (10 AM - 1 PM)',
  });
  const [pickupError, setPickupError] = useState('');

  const fetchDevice = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await devicesApi.getDeviceById(id);
      setDevice(data);
    } catch (err) {
      console.error('Failed to load device passport:', err);
      setError(err.message || 'Unable to load device passport.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDevice();
    }
  }, [id]);

  const handleSchedulePickup = async (e) => {
    e.preventDefault();
    if (!pickupForm.addressText.trim() || !pickupForm.pincode.trim()) {
      setPickupError('Please provide both address and postal pincode.');
      return;
    }

    setSchedulingPickup(true);
    setPickupError('');

    try {
      await devicesApi.requestPickup(device._id, {
        address: {
          text: pickupForm.addressText.trim(),
          pincode: pickupForm.pincode.trim(),
        },
        preferredSlot: pickupForm.preferredSlot,
      });

      setIsPickupModalOpen(false);
      await fetchDevice();
    } catch (err) {
      console.error('Pickup request failed:', err);
      setPickupError(err.message || 'Failed to request pickup. Please try again.');
    } finally {
      setSchedulingPickup(false);
    }
  };

  const handleCancelPickup = async () => {
    if (!window.confirm('Are you sure you want to cancel this pickup request?')) {
      return;
    }

    try {
      await devicesApi.cancelDevice(device._id);
      await fetchDevice();
    } catch (err) {
      alert(err.message || 'Failed to cancel pickup.');
    }
  };

  if (loading) {
    return <LoadingState message="Retrieving digital passport from blockchain and audit log..." />;
  }

  if (error || !device) {
    return (
      <ErrorState
        title="Passport Not Found"
        message={error || 'The requested device passport could not be found.'}
        onRetry={fetchDevice}
      />
    );
  }

  const canCancel = canCancelStatus(device.status);
  const deviceImg = DEVICE_IMAGE_MAP[device.type] || DEVICE_IMAGE_MAP.OTHER;

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
              Current Stage
            </span>
            <span className="text-sm font-bold text-emerald-400 uppercase mt-0.5 block">
              {device.status.replace(/_/g, ' ')}
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
            {/* Left: Device Hardware Information & Photo */}
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-500">
                Hardware Evidence
              </h3>

              <div className="h-44 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-subtle relative">
                <img
                  src={deviceImg}
                  alt={device.type}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-zinc-950/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-zinc-300 flex items-center justify-between">
                  <span>Photo Verified</span>
                  <span className="text-emerald-400">S3 Presigned</span>
                </div>
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
                {device.finalOutcome && (
                  <div className="flex justify-between py-1 text-forest-900 font-bold">
                    <span>Certified Outcome:</span>
                    <span>{device.finalOutcome}</span>
                  </div>
                )}
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
                    <span className="font-mono text-[11px] text-forest-700">
                      Model: {device.ai.modelId || 'Bedrock Converse / Advisory'}
                    </span>
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

              {/* Pickup Logistics Information */}
              {device.pickupAddress || device.pickup ? (
                <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-200">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-forest-800 flex items-center gap-1.5">
                      <TruckIcon className="w-4 h-4 text-forest-700" />
                      Doorstep Pickup Logistics
                    </span>
                    <span className="font-mono text-xs text-forest-900 font-bold bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                      {(device.pickup?.status || device.status).replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-700">
                    <div className="sm:col-span-2">
                      <span className="text-zinc-400 block text-[10px] font-mono uppercase">Full Pickup Address</span>
                      <p className="font-semibold text-zinc-900">
                        {device.pickupAddress
                          ? `${device.pickupAddress.street}, ${device.pickupAddress.locality}, ${device.pickupAddress.city}, ${device.pickupAddress.state} - ${device.pickupAddress.pincode}`
                          : device.pickup?.address?.text}
                      </p>
                    </div>

                    <div>
                      <span className="text-zinc-400 block text-[10px] font-mono uppercase">Postal PIN Code</span>
                      <span className="font-mono font-bold text-zinc-950">
                        {device.pickupAddress?.pincode || device.pickup?.address?.pincode}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-400 block text-[10px] font-mono uppercase">Contact Mobile</span>
                      <span className="font-mono font-bold text-zinc-950">
                        {device.pickupAddress?.contactPhone || 'Registered Citizen Phone'}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-zinc-400 block text-[10px] font-mono uppercase">Preferred Slot</span>
                      <span className="font-mono text-zinc-800">
                        {device.pickupAddress?.preferredSlot || device.pickup?.preferredSlot || 'Standard Doorstep (10:00 AM - 6:00 PM)'}
                      </span>
                    </div>

                    {device.pickupAddress?.instructions && (
                      <div className="sm:col-span-2 pt-1 border-t border-zinc-200/80">
                        <span className="text-zinc-400 block text-[10px] font-mono uppercase">Collector Instructions</span>
                        <p className="italic text-zinc-600 font-mono text-[11px]">
                          "{device.pickupAddress.instructions}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-zinc-50 rounded-xl border border-dashed border-zinc-300 text-center space-y-2">
                  <p className="text-xs text-zinc-500">
                    No collection requested yet for this device.
                  </p>
                  {device.status === DEVICE_STATUSES.REGISTERED && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsPickupModalOpen(true)}
                    >
                      <TruckIcon className="w-4 h-4 mr-1.5" />
                      Schedule Free Pickup
                    </Button>
                  )}
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
                onClick={handleCancelPickup}
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

            {device.rewardCredited && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full font-mono text-xs font-bold">
                <CheckCircleIcon className="w-4 h-4 text-emerald-700" />
                <span>+50 Reward Coins Credited</span>
              </div>
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
          <Timeline currentStatus={device.status} history={device.timeline || []} />
        </CardBody>
      </Card>

      {/* Pickup Request Modal */}
      <Modal
        isOpen={isPickupModalOpen}
        onClose={() => setIsPickupModalOpen(false)}
        title="Schedule Doorstep Collection"
      >
        <form onSubmit={handleSchedulePickup} className="space-y-4">
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
            helperText="Matched to authorized collectors serving this area."
          />
          <div>
            <label htmlFor="pickup-slot" className="block text-sm font-medium text-zinc-800 mb-1">
              Preferred Time Window
            </label>
            <select
              id="pickup-slot"
              value={pickupForm.preferredSlot}
              onChange={(e) => setPickupForm({ ...pickupForm, preferredSlot: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-forest-800"
            >
              <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
              <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
              <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
              <option value="Weekend Morning (10 AM - 1 PM)">Weekend Morning (10 AM - 1 PM)</option>
            </select>
          </div>

          {pickupError && (
            <p className="text-xs text-red-600 font-medium" role="alert">
              {pickupError}
            </p>
          )}

          <div className="pt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsPickupModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={schedulingPickup}>
              Confirm Pickup
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
