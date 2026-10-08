import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, SampleDataBadge } from '../../components/ui/StatusBadge';
import { CheckCircleIcon, ShieldCheckIcon, EyeIcon } from '../../components/ui/Icons';
import { DEVICE_STATUSES } from '../../config/statusLifecycle';

const MOCK_ASSIGNED = [
  {
    _id: 'pickup_assigned_01',
    deviceId: 'mock_dev_01',
    deviceCode: 'EW-2026-000101',
    deviceType: 'LAPTOP',
    status: DEVICE_STATUSES.ACCEPTED,
    address: 'Flat 402, Green Enclave, Sector 14',
    pincode: '110001',
    slot: 'Weekend Morning (10 AM - 1 PM)',
    isSample: true,
  },
  {
    _id: 'pickup_assigned_02',
    deviceId: 'mock_dev_02',
    deviceCode: 'EW-2026-000102',
    deviceType: 'PHONE',
    status: DEVICE_STATUSES.COLLECTED,
    address: 'Block C, Street 9, Rohini',
    pincode: '110085',
    slot: 'Today (2 PM - 5 PM)',
    isSample: true,
  },
];

export function MyPickups() {
  const [items, setItems] = useState(MOCK_ASSIGNED);

  const markCollected = (deviceId) => {
    setItems((prev) =>
      prev.map((item) =>
        item.deviceId === deviceId
          ? { ...item, status: DEVICE_STATUSES.COLLECTED }
          : item
      )
    );
  };

  const markComplete = (deviceId) => {
    setItems((prev) =>
      prev.map((item) =>
        item.deviceId === deviceId
          ? { ...item, status: DEVICE_STATUSES.COMPLETED }
          : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Assigned Pickups</h1>
        <p className="text-sm text-slate-500 mt-1">
          Fulfill physical device collection, inspection, and verified disposition.
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item._id}>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-800 font-bold">{item.deviceCode}</span>
                  {item.isSample && <SampleDataBadge />}
                </div>
              }
              subtitle={`Device: ${item.deviceType} • Address: ${item.address} (${item.pincode})`}
              action={<StatusBadge status={item.status} />}
            />
            <CardBody className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="text-slate-600">
                <span className="font-medium text-slate-700 block">Scheduled Slot: {item.slot}</span>
                <span className="text-slate-400 mt-0.5 block">
                  Action order: Accept → Collect → Inspect → Complete
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {item.status === DEVICE_STATUSES.ACCEPTED && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => markCollected(item.deviceId)}
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Mark Collected
                  </Button>
                )}

                {item.status === DEVICE_STATUSES.COLLECTED && (
                  <Link to={`/collector/inspect/${item.deviceId}`}>
                    <Button variant="primary" size="sm">
                      <ShieldCheckIcon className="w-4 h-4 mr-1" />
                      Perform Inspection
                    </Button>
                  </Link>
                )}

                {item.status === DEVICE_STATUSES.INSPECTED && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => markComplete(item.deviceId)}
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Mark Completed
                  </Button>
                )}

                <Link to={`/citizen/devices/${item.deviceId}`}>
                  <Button variant="secondary" size="sm">
                    <EyeIcon className="w-3.5 h-3.5 mr-1" />
                    View Passport
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
