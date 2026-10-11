import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EcoLeafIcon, AlertCircleIcon, EyeIcon, EyeOffIcon, CheckCircleIcon, SparklesIcon } from '../../components/ui/Icons';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDemoFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password@123');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const authenticatedUser = await login({ email, password });
      
      // Determine redirection target based on genuine server-enforced role
      const intendedDestination = location.state?.from?.pathname;
      let targetPath = '/citizen/devices';

      if (authenticatedUser.role === ROLES.ADMIN) {
        targetPath = intendedDestination && intendedDestination.startsWith('/admin')
          ? intendedDestination
          : '/admin/stats';
      } else if (authenticatedUser.role === ROLES.COLLECTOR) {
        targetPath = intendedDestination && intendedDestination.startsWith('/collector')
          ? intendedDestination
          : '/collector/open';
      } else {
        targetPath = intendedDestination && !intendedDestination.startsWith('/admin') && !intendedDestination.startsWith('/collector')
          ? intendedDestination
          : '/citizen/devices';
      }

      navigate(targetPath, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Visual Storytelling & Circular Economy Pitch */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 backdrop-blur border border-emerald-400/30 flex items-center justify-center shadow-inner">
                <EcoLeafIcon className="w-6 h-6 text-emerald-300" />
              </div>
              <span className="font-bold tracking-tight text-xl text-white">E-Waste Passport</span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs font-semibold text-emerald-200 mb-4">
              <SparklesIcon className="w-3.5 h-3.5" />
              Waste & Energy Track
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              A passport for every old device.
            </h2>
            <p className="mt-3 text-emerald-100/90 text-sm leading-relaxed">
              From the owner's hand to its verified final outcome. Transparent lifecycle tracking, AI-powered disposition, and verifiable environmental impact.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-200">Zero Guesswork</h4>
                  <p className="text-xs text-emerald-100/80 mt-0.5">Instant AI identification and repair vs recycling recommendations.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-200">Verified Chain of Custody</h4>
                  <p className="text-xs text-emerald-100/80 mt-0.5">Authorized collectors inspect and document final outcomes.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-200">Empirical Impact</h4>
                  <p className="text-xs text-emerald-100/80 mt-0.5">Transparent recovery metrics, CO₂ offset, and citizen reward coins.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-700/50 relative z-10 flex items-center justify-between text-xs text-emerald-200">
            <span>Enterprise Security</span>
            <span>Bcrypt Hashed</span>
          </div>
        </div>

        {/* Right Column: Authentication Form & Demo Switcher */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In</h1>
              <p className="text-sm text-slate-500 mt-1">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            {/* Quick-Fill Demo Identifiers */}
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Quick Demo Accounts</span>
                <span className="text-[11px] text-slate-500">Click to autofill</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('sanesh7644@gmail.com')}
                  className="px-2.5 py-2 text-xs font-medium rounded-xl border border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100 transition-colors text-center"
                >
                  <span className="block font-semibold">Admin</span>
                  <span className="text-[10px] text-purple-600 truncate block">sanesh7644@...</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoFill('santosh@gmail.com')}
                  className="px-2.5 py-2 text-xs font-medium rounded-xl border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors text-center"
                >
                  <span className="block font-semibold">Collector</span>
                  <span className="text-[10px] text-blue-600 truncate block">santosh@...</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoFill('citizen@example.org')}
                  className="px-2.5 py-2 text-xs font-medium rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors text-center"
                >
                  <span className="block font-semibold">Citizen</span>
                  <span className="text-[10px] text-emerald-600 truncate block">citizen@...</span>
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-sm text-red-800">
                <AlertCircleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-800 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="name@example.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 transition"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-800 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Demo password for all seed accounts is <code className="text-slate-600 font-mono">password@123</code>
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="w-full py-2.5 text-base font-semibold rounded-xl shadow-md"
                >
                  Sign In to Dashboard
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              Need an account?{' '}
              <Link to="/signup" className="text-emerald-700 font-semibold hover:underline">
                Create a Citizen Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
