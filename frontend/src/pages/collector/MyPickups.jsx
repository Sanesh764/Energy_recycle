import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, SampleDataBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  EyeIcon,
  TruckIcon,
  ArrowRightIcon,
} from '../../components/ui/Icons';
import { DEVICE_STATUSES } from '../../config/statusLifecycle';
import { pickupsApi, devicesApi } from '../../services/api';

export function MyPickups() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  const fetchMyPickups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pickupsApi.getOpenPickups({ assigned: 'true' });
      setPickups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load assigned pickups:', err);
      setError(err.message || 'Unable to retrieve assigned pickups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPickups();
  }, []);

  const handleMarkCollected = async (pickupId) => {
    setActioningId(pickupId);
    try {
      await pickupsApi.markCollected(pickupId);
      await fetchMyPickups();
    } catch (err) {
      alert(err.message || 'Failed to mark pickup as collected.');
    } finally {
      setActioningId(null);
    }
  };

  const handleMarkComplete = async (deviceId, pickupId) => {
    setActioningId(pickupId);
    try {
      await devicesApi.completeDevice(deviceId);
      await fetchMyPickups();
    } catch (err) {
      alert(err.message || 'Failed to complete device.');
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your assigned field pickups..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Pickups"
        message={error}
        onRetry={fetchMyPickups}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
            Collector Field Execution
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight mt-0.5">
            MY ASSIGNED PICKUPS
          </h1>
          <p className="text-sm text-zinc-600">
            Manage physical custody transfer, hands-on diagnostics, and certified completion.
          </p>
        </div>
        <Link to="/collector/open">
          <Button variant="secondary" size="md">
            <TruckIcon className="w-4 h-4 mr-1.5" />
            Check Open Requests
          </Button>
        </Link>
      </div>

      {pickups.length === 0 ? (
        <EmptyState
          title="No Pickups Currently Assigned"
          message="You have no active pickups assigned. Browse open requests in your service areas to claim new pickups."
          actionText="Browse Open Pickups"
          onAction={() => window.location.assign('/collector/open')}
        />
      ) : (
        <div className="space-y-4">
          {pickups.map((item) => {
            const dev = item.deviceId || {};
            const devId = dev._id || item.deviceId;
            const deviceCode = dev.deviceCode || item.deviceCode || 'EW-DEVICE';
            const deviceType = dev.type || item.deviceType || 'UNKNOWN';
            const status = dev.status || item.status || DEVICE_STATUSES.ACCEPTED;
            const isProcessing = actioningId === item._id;

            return (
              <Card key={item._id}>
                <CardHeader
                  title={
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-forest-900 font-bold">{deviceCode}</span>
                      {(item.isSample || dev.isSample) && <SampleDataBadge />}
                    </div>
                  }
                  subtitle={`Device: ${deviceType} · Address: ${item.address?.text} (${item.address?.pincode})`}
                  action={<StatusBadge status={status} />}
                />
                <CardBody className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                  <div className="text-zinc-600 space-y-1">
                    <div>
                      Scheduled Slot: <strong className="text-zinc-900">{item.preferredSlot}</strong>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Standard Workflow: Accept → Collect (Awards Coins) → Inspect → Complete
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 font-sans">
                    {/* Action button based on current lifecycle stage */}
                    {status === DEVICE_STATUSES.ACCEPTED && (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={isProcessing}
                        onClick={() => handleMarkCollected(item._id)}
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Mark Collected (+50 Coins to Owner)
                      </Button>
                    )}

                    {status === DEVICE_STATUSES.COLLECTED && (
                      <Link to={`/collector/inspect/${devId}`}>
                        <Button variant="primary" size="sm">
                          <ShieldCheckIcon className="w-4 h-4 mr-1" />
                          Perform Inspection
                        </Button>
                      </Link>
                    )}

                    {status === DEVICE_STATUSES.INSPECTED && (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={isProcessing}
                        onClick={() => handleMarkComplete(devId, item._id)}
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Mark Completed
                      </Button>
                    )}

                    <Link to={`/citizen/devices/${devId}`}>
                      <Button variant="secondary" size="sm">
                        <EyeIcon className="w-3.5 h-3.5 mr-1" />
                        View Passport
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
