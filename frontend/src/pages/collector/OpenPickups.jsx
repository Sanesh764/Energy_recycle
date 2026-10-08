import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, SampleDataBadge } from '../../components/ui/StatusBadge';
import { TruckIcon, InfoIcon } from '../../components/ui/Icons';
import { DEVICE_STATUSES } from '../../config/statusLifecycle';

const MOCK_OPEN_PICKUPS = [
  {
    _id: 'pickup_mock_01',
    deviceId: 'mock_dev_01',
    deviceCode: 'EW-2026-000101',
    deviceType: 'LAPTOP',
    damage: 'MINOR',
    powersOn: true,
    address: {
      text: 'Flat 402, Green Enclave, Sector 14',
      pincode: '110001',
    },
    preferredSlot: 'Weekend Morning (10 AM - 1 PM)',
    status: 'REQUESTED',
    isSample: true,
  },
  {
    _id: 'pickup_mock_02',
    deviceId: 'mock_dev_03',
    deviceCode: 'EW-2026-000105',
    deviceType: 'TV',
    damage: 'NONE',
    powersOn: true,
    address: {
      text: 'B-12 Community Center, Main Road',
      pincode: '110002',
    },
    preferredSlot: 'Weekday Evening (5 PM - 8 PM)',
    status: 'REQUESTED',
    isSample: true,
  },
];

export function OpenPickups() {
  const [pickups, setPickups] = useState(MOCK_OPEN_PICKUPS);
  const [acceptedIds, setAcceptedIds] = useState([]);

  const handleAccept = (pickupId) => {
    // UI state representation for FRONTEND-1
    setAcceptedIds((prev) => [...prev, pickupId]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Open Pickup Requests</h1>
        <p className="text-sm text-slate-500 mt-1">
          Pickups waiting for assignment within your serviced pincodes.
        </p>
      </div>

      <div className="p-3.5 bg-slate-100 rounded-lg text-xs text-slate-600 border border-slate-200 flex items-start gap-2">
        <InfoIcon className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Concurrency Protection:</strong> Backend uses atomic conditional updates to ensure only one collector can claim an open pickup simultaneously.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pickups.map((pickup) => {
          const isAccepted = acceptedIds.includes(pickup._id);

          return (
            <Card key={pickup._id} highlight={!isAccepted}>
              <CardHeader
                title={
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-800 font-bold">{pickup.deviceCode}</span>
                    {pickup.isSample && <SampleDataBadge />}
                  </div>
                }
                subtitle={`Type: ${pickup.deviceType}`}
                action={<StatusBadge status={isAccepted ? DEVICE_STATUSES.ACCEPTED : DEVICE_STATUSES.PICKUP_REQUESTED} />}
              />
              <CardBody className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Pincode:</span>
                    <span className="font-bold text-slate-800 font-mono">{pickup.address.pincode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="text-slate-800 text-right">{pickup.address.text}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Preferred Slot:</span>
                    <span className="font-medium text-emerald-800">{pickup.preferredSlot}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-500 pt-1">
                  <span>Powers on: {pickup.powersOn ? 'Yes' : 'No'}</span>
                  <span>Damage: {pickup.damage}</span>
                </div>
              </CardBody>
              <CardFooter className="justify-end">
                <Button
                  variant={isAccepted ? 'secondary' : 'primary'}
                  size="sm"
                  disabled={isAccepted}
                  onClick={() => handleAccept(pickup._id)}
                >
                  <TruckIcon className="w-4 h-4 mr-1.5" />
                  {isAccepted ? 'Assigned to You' : 'Accept Pickup'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
