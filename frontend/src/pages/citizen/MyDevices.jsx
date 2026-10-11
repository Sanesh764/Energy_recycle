import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { StatusBadge, SampleDataBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  LaptopIcon,
  SmartphoneIcon,
  TvIcon,
  RecycleIcon,
  PlusIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  EcoLeafIcon,
} from '../../components/ui/Icons';
import { DEVICE_STATUSES } from '../../config/statusLifecycle';
import { devicesApi } from '../../services/api';

const DEVICE_IMAGE_MAP = {
  LAPTOP: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80',
  PHONE: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=400&q=80',
  TV: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=400&q=80',
  BATTERY: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
  CHARGER: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
  PRINTER: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=400&q=80',
  OTHER: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80',
};

export function MyDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await devicesApi.getDevices();
      setDevices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
      setError(err.message || 'Unable to load devices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  if (loading) {
    return <LoadingState message="Loading your registered device passports..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Passports"
        message={error}
        onRetry={fetchDevices}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
              Citizen Passport Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            MY DEVICES
          </h1>
          <p className="text-sm text-zinc-600">
            Track every registered device from first assessment to certified final outcome.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/citizen/rewards">
            <Button variant="secondary" size="md">
              <EcoLeafIcon className="w-4 h-4 mr-1.5 text-forest-700" />
              Rewards Wallet
            </Button>
          </Link>
          <Link to="/citizen/devices/new">
            <Button variant="primary" size="md">
              <PlusIcon className="w-4 h-4 mr-1.5" />
              Register Device
            </Button>
          </Link>
        </div>
      </div>

      {devices.length === 0 ? (
        <EmptyState
          title="No Devices Registered Yet"
          message="Give your old phone, laptop, or gadget a responsible next step. Upload a photo to generate an instant AI passport."
          actionText="Register Your First Device"
          onAction={() => window.location.assign('/citizen/devices/new')}
        />
      ) : (
        /* Grid of Product-Object Device Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {devices.map((device) => {
            const isCollectedOrLater = [
              DEVICE_STATUSES.COLLECTED,
              DEVICE_STATUSES.INSPECTED,
              DEVICE_STATUSES.COMPLETED,
            ].includes(device.status);

            const isCompleted = device.status === DEVICE_STATUSES.COMPLETED;
            const deviceImg = DEVICE_IMAGE_MAP[device.type] || DEVICE_IMAGE_MAP.OTHER;

            return (
              <div
                key={device._id}
                className="bg-white rounded-2xl border border-zinc-200/90 shadow-subtle hover:border-zinc-300 hover:shadow-premium transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Top Strip with Device Image & Identity */}
                  <div className="p-5 sm:p-6 bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {/* Photo Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-subtle flex-shrink-0">
                        <img
                          src={deviceImg}
                          alt={device.type}
                          className="w-full h-full object-cover"
                        />
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
                        Lifecycle Stage
                      </span>
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-600">
                        <span className="text-forest-800 font-bold">● Registered</span>
                        <span className={device.status !== DEVICE_STATUSES.REGISTERED ? 'text-forest-800 font-bold' : 'text-zinc-400'}>
                          {device.status !== DEVICE_STATUSES.REGISTERED ? '● Pickup' : '○ Pickup'}
                        </span>
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
      )}
    </div>
  );
}
