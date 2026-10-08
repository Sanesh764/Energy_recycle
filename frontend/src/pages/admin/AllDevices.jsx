import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { StatusBadge, SampleDataBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { EyeIcon } from '../../components/ui/Icons';
import { DEVICE_STATUSES, DEVICE_TYPES } from '../../config/statusLifecycle';

const MOCK_ADMIN_DEVICES = [
  {
    _id: 'mock_dev_01',
    deviceCode: 'EW-2026-000101',
    type: 'LAPTOP',
    ageYears: 4,
    powersOn: true,
    damage: 'MINOR',
    status: DEVICE_STATUSES.PICKUP_REQUESTED,
    finalOutcome: null,
    isSample: true,
    createdAt: '2026-10-01',
  },
  {
    _id: 'mock_dev_02',
    deviceCode: 'EW-2026-000102',
    type: 'PHONE',
    ageYears: 6,
    powersOn: false,
    damage: 'MAJOR',
    status: DEVICE_STATUSES.COLLECTED,
    finalOutcome: null,
    isSample: true,
    createdAt: '2026-09-28',
  },
  {
    _id: 'mock_dev_03',
    deviceCode: 'EW-2026-000103',
    type: 'TV',
    ageYears: 8,
    powersOn: true,
    damage: 'NONE',
    status: DEVICE_STATUSES.COMPLETED,
    finalOutcome: 'REUSE',
    isSample: false,
    createdAt: '2026-09-20',
  },
  {
    _id: 'mock_dev_04',
    deviceCode: 'EW-2026-000104',
    type: 'BATTERY',
    ageYears: 2,
    powersOn: false,
    damage: 'MAJOR',
    status: DEVICE_STATUSES.COMPLETED,
    finalOutcome: 'RECYCLE',
    isSample: true,
    createdAt: '2026-09-15',
  },
];

export function AllDevices() {
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filtered = MOCK_ADMIN_DEVICES.filter((d) => {
    if (filterType !== 'ALL' && d.type !== filterType) return false;
    if (filterStatus !== 'ALL' && d.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Devices Registry</h1>
        <p className="text-sm text-slate-500 mt-1">
          System-wide read-only audit log of all registered passports and dispositions.
        </p>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardBody className="p-4 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <label htmlFor="filter-type" className="font-semibold text-slate-700">
              Type:
            </label>
            <select
              id="filter-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800"
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
            <label htmlFor="filter-status" className="font-semibold text-slate-700">
              Status:
            </label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              {Object.keys(DEVICE_STATUSES).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-slate-400">
            Showing {filtered.length} of {MOCK_ADMIN_DEVICES.length} records (Read-Only)
          </div>
        </CardBody>
      </Card>

      {/* Responsive Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" role="table">
            <caption className="sr-only">Audit register of all electronic devices</caption>
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th scope="col" className="p-3.5">Device Code</th>
                <th scope="col" className="p-3.5">Type</th>
                <th scope="col" className="p-3.5">Age</th>
                <th scope="col" className="p-3.5">Damage</th>
                <th scope="col" className="p-3.5">Status</th>
                <th scope="col" className="p-3.5">Final Outcome</th>
                <th scope="col" className="p-3.5">Sample</th>
                <th scope="col" className="p-3.5 text-right">Passport</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((device) => (
                <tr key={device._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-emerald-800">
                    {device.deviceCode}
                  </td>
                  <td className="p-3.5 font-medium text-slate-800">{device.type}</td>
                  <td className="p-3.5 text-slate-600">{device.ageYears}y</td>
                  <td className="p-3.5 text-slate-600">{device.damage}</td>
                  <td className="p-3.5">
                    <StatusBadge status={device.status} />
                  </td>
                  <td className="p-3.5 font-semibold text-slate-800">
                    {device.finalOutcome || '—'}
                  </td>
                  <td className="p-3.5">
                    {device.isSample ? <SampleDataBadge /> : <span className="text-slate-400">Real</span>}
                  </td>
                  <td className="p-3.5 text-right">
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
      </div>
    </div>
  );
}
