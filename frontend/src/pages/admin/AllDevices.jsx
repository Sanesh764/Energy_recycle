import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { StatusBadge, SampleDataBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { EyeIcon } from '../../components/ui/Icons';
import { DEVICE_STATUSES, DEVICE_TYPES } from '../../config/statusLifecycle';
import { devicesApi } from '../../services/api';

export function AllDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await devicesApi.getDevices();
      setDevices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load devices for admin:', err);
      setError(err.message || 'Unable to retrieve devices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  if (loading) {
    return <LoadingState message="Loading system-wide device audit records..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Device Register"
        message={error}
        onRetry={fetchDevices}
      />
    );
  }

  const filtered = devices.filter((d) => {
    if (filterType !== 'ALL' && d.type !== filterType) return false;
    if (filterStatus !== 'ALL' && d.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
          Immutable Lifecycle Ledger
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight mt-0.5">
          ALL DEVICES REGISTRY
        </h1>
        <p className="text-sm text-zinc-500">
          System-wide read-only audit log of all registered passports and dispositions.
        </p>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardBody className="p-4 flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <label htmlFor="filter-type" className="font-semibold text-zinc-700">
              Category:
            </label>
            <select
              id="filter-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-zinc-300 px-2.5 py-1.5 bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-forest-800"
            >
              <option value="ALL">All Categories</option>
              {DEVICE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="filter-status" className="font-semibold text-zinc-700">
              Status:
            </label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-zinc-300 px-2.5 py-1.5 bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-forest-800"
            >
              <option value="ALL">All Statuses</option>
              {Object.keys(DEVICE_STATUSES).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-zinc-400">
            Showing {filtered.length} of {devices.length} records (Read-Only)
          </div>
        </CardBody>
      </Card>

      {/* Responsive Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-subtle">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400 font-mono">
            No devices match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" role="table">
              <thead className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200 uppercase tracking-wider font-mono text-[11px]">
                <tr>
                  <th scope="col" className="p-3.5">Device Code</th>
                  <th scope="col" className="p-3.5">Category</th>
                  <th scope="col" className="p-3.5">Age</th>
                  <th scope="col" className="p-3.5">Damage</th>
                  <th scope="col" className="p-3.5">Status</th>
                  <th scope="col" className="p-3.5">Final Outcome</th>
                  <th scope="col" className="p-3.5">Dataset</th>
                  <th scope="col" className="p-3.5 text-right">Passport</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono">
                {filtered.map((device) => (
                  <tr key={device._id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="p-3.5 font-bold text-forest-900">
                      {device.deviceCode}
                    </td>
                    <td className="p-3.5 font-sans font-medium text-zinc-800">{device.type}</td>
                    <td className="p-3.5 text-zinc-600">{device.ageYears}y</td>
                    <td className="p-3.5 text-zinc-600">{device.damage}</td>
                    <td className="p-3.5 font-sans">
                      <StatusBadge status={device.status} />
                    </td>
                    <td className="p-3.5 font-semibold text-zinc-900">
                      {device.finalOutcome || '—'}
                    </td>
                    <td className="p-3.5">
                      {device.isSample ? <SampleDataBadge /> : <span className="text-zinc-500">Live</span>}
                    </td>
                    <td className="p-3.5 text-right font-sans">
                      <Link to={`/citizen/devices/${device._id}`}>
                        <Button variant="ghost" size="sm" aria-label={`View passport for ${device.deviceCode}`}>
                          <EyeIcon className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
