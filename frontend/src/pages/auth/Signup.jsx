import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { Card, CardBody, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { EcoLeafIcon } from '../../components/ui/Icons';

export function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login({ email, role: ROLES.CITIZEN });
    setLoading(false);
    navigate('/citizen/devices', { replace: true });
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="text-center mb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm mb-3">
          <EcoLeafIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Create Citizen Account</h1>
        <p className="text-sm text-slate-500 mt-1">
          Register old electronics, receive AI disposition guidance, and track pickup to completion.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardBody className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              Per SPEC.md, new self-registered users are assigned the <strong>Citizen</strong> role.
              Collector and Admin roles are granted via Cognito console groups.
            </div>

            <Input
              id="signup-name"
              label="Full Name"
              type="text"
              required
              placeholder="Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              id="signup-email"
              label="Email Address"
              type="email"
              required
              placeholder="name@example.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              id="signup-password"
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Minimum 8 characters with numbers and symbols"
            />
          </CardBody>

          <CardFooter>
            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Create Account
            </Button>
          </CardFooter>
        </form>
      </Card>

      <p className="text-center text-xs text-slate-500 mt-4">
        Already registered?{' '}
        <Link to="/login" className="text-emerald-700 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
