import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, SampleDataBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { TruckIcon, InfoIcon, CheckCircleIcon, ArrowRightIcon } from '../../components/ui/Icons';
import { DEVICE_STATUSES } from '../../config/statusLifecycle';
import { pickupsApi } from '../../services/api';

export function OpenPickups() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimingId, setClaimingId] = useState(null);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState('');

  const fetchOpenPickups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pickupsApi.getOpenPickups({ status: 'REQUESTED' });
      setPickups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load open pickups:', err);
      setError(err.message || 'Unable to retrieve open pickup requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenPickups();
  }, []);

  const handleAccept = async (pickupId) => {
    setClaimingId(pickupId);
    setClaimSuccessMsg('');
    try {
      await pickupsApi.acceptPickup(pickupId);
      setClaimSuccessMsg('Pickup accepted! Custody assigned to you. View under My Pickups.');
      await fetchOpenPickups();
    } catch (err) {
      alert(err.message || 'Could not accept pickup. It may have already been claimed.');
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) {
    return <LoadingState message="Scanning for open pickups in your serviced postal areas..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Open Pickups"
        message={error}
        onRetry={fetchOpenPickups}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
            Collector Dispatch Terminal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight mt-0.5">
            OPEN PICKUP REQUESTS
          </h1>
          <p className="text-sm text-zinc-600">
            Pickups waiting for assignment within your authorized service pincodes (110001, 110002).
          </p>
        </div>
        <Link to="/collector/my-pickups">
          <Button variant="secondary" size="md">
            View My Assigned Pickups
            <ArrowRightIcon className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>

      {claimSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-950 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span>{claimSuccessMsg}</span>
          </div>
          <Link to="/collector/my-pickups" className="underline font-bold text-forest-900">
            Go to My Pickups
          </Link>
        </div>
      )}

      <div className="p-3.5 bg-zinc-100 rounded-xl text-xs text-zinc-600 border border-zinc-200 flex items-start gap-2">
        <InfoIcon className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Concurrency-Safe Atomic Assignment:</strong> The backend uses atomic conditional updates
          to guarantee that only one collector can successfully accept an open pickup. Two collectors cannot accept the same device.
        </span>
      </div>

      {pickups.length === 0 ? (
        <EmptyState
          title="No Open Pickups in Your Area"
          message="All scheduled requests in your serviced pincodes have been assigned. New requests appear here as citizens register them."
          actionText="Refresh Open Requests"
          onAction={fetchOpenPickups}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pickups.map((pickup) => {
            const dev = pickup.deviceId || {};
            const deviceCode = dev.deviceCode || pickup.deviceCode || 'EW-DEVICE';
            const deviceType = dev.type || pickup.deviceType || 'UNKNOWN';
            const damage = dev.damage || pickup.damage || 'NONE';
            const powersOn = dev.powersOn !== undefined ? dev.powersOn : pickup.powersOn;
            const isClaiming = claimingId === pickup._id;

            return (
              <Card key={pickup._id} highlight={true}>
                <CardHeader
                  title={
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-forest-900 font-bold">{deviceCode}</span>
                      {pickup.isSample && <SampleDataBadge />}
                    </div>
                  }
                  subtitle={`Category: ${deviceType} · Registered ${new Date(pickup.createdAt).toLocaleDateString()}`}
                  action={<StatusBadge status={DEVICE_STATUSES.PICKUP_REQUESTED} />}
                />
                <CardBody className="space-y-3 text-xs">
                  <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/80 space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Service Pincode:</span>
                      <span className="font-bold text-zinc-900 font-mono">{pickup.address?.pincode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Pickup Address:</span>
                      <span className="text-zinc-800 text-right font-sans">{pickup.address?.text}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Preferred Slot:</span>
                      <span className="font-medium text-forest-800">{pickup.preferredSlot}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-zinc-500 pt-1 font-mono">
                    <span>Powers on: <strong className="text-zinc-900">{powersOn ? 'YES' : 'NO'}</strong></span>
                    <span>Visible damage: <strong className="text-zinc-900">{damage}</strong></span>
                  </div>
                </CardBody>
                <CardFooter className="justify-between">
                  <Link to={`/citizen/devices/${dev._id || pickup.deviceId}`}>
                    <Button variant="ghost" size="sm">
                      View Passport
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={isClaiming}
                    onClick={() => handleAccept(pickup._id)}
                  >
                    <TruckIcon className="w-4 h-4 mr-1.5" />
                    Accept Pickup
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
