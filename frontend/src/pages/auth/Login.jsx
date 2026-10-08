import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { EcoLeafIcon } from '../../components/ui/Icons';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES.CITIZEN);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || (
    role === ROLES.COLLECTOR ? '/collector/open' :
    role === ROLES.ADMIN ? '/admin/stats' : '/citizen/devices'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login({ email, role });
    setLoading(false);
    navigate(from, { replace: true });
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="text-center mb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm mb-3">
          <EcoLeafIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Sign in to E-Waste Passport</h1>
        <p className="text-sm text-slate-500 mt-1">
          Civic device lifecycle tracking & impact registry
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardBody className="space-y-4">
            {/* Dev Boundary Notification */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900">
              <span className="font-semibold block">Authentication Boundary Notice:</span>
              In production, this form authenticates directly via Amazon Cognito JWT.
              For local UI verification, select your target role below to simulate the authenticated session.
            </div>

            <Input
              id="login-email"
              label="Email Address"
              type="email"
              required
              placeholder="name@example.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              id="login-password"
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Managed by AWS Cognito user pool"
            />

            <div>
              <label htmlFor="login-role-select" className="block text-sm font-medium text-slate-800 mb-1">
                Target Role (Cognito Group Simulation)
              </label>
              <select
                id="login-role-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value={ROLES.CITIZEN}>Citizen (Create & View Own Passports)</option>
                <option value={ROLES.COLLECTOR}>Collector (Open & Assigned Pickups)</option>
                <option value={ROLES.ADMIN}>Admin (Read-only Stats & Audit)</option>
              </select>
            </div>
          </CardBody>

          <CardFooter className="flex-col sm:flex-row gap-3">
            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>

      <p className="text-center text-xs text-slate-500 mt-4">
        Need an account?{' '}
        <Link to="/signup" className="text-emerald-700 font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
