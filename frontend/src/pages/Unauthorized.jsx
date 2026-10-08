import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { AlertCircleIcon } from '../components/ui/Icons';

export function Unauthorized() {
  const { role } = useAuth();

  const getFallbackPath = () => {
    if (role === 'collector') return '/collector/open';
    if (role === 'admin') return '/admin/stats';
    return '/citizen/devices';
  };

  return (
    <div className="py-16 text-center max-w-md mx-auto">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 mb-4">
        <AlertCircleIcon className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Access Restricted</h1>
      <p className="mt-2 text-sm text-slate-600">
        Your current role (<strong className="capitalize">{role || 'guest'}</strong>) does not have permission to view this view. Backend role policies strictly enforce this boundary.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to={getFallbackPath()}>
          <Button variant="primary">Return to Role Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
