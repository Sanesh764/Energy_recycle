import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="py-16 text-center max-w-md mx-auto">
      <h1 className="text-5xl font-black text-slate-300">404</h1>
      <h2 className="mt-2 text-xl font-bold text-slate-800">Page Not Found</h2>
      <p className="mt-2 text-sm text-slate-600">
        The requested page does not exist or has been moved.
      </p>
      <div className="mt-6 flex justify-center">
        <Link to="/">
          <Button variant="primary">Go to Home</Button>
        </Link>
      </div>
    </div>
  );
}
