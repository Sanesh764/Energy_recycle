import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import {
  EcoLeafIcon,
  MenuIcon,
  CloseIcon,
  UserIcon,
} from '../components/ui/Icons';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function Navbar() {
  const { user, role, logout, switchRole, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleDevSwitch = async (targetRole) => {
    if (switching) return;
    setSwitching(true);
    try {
      await switchRole(targetRole);
      if (targetRole === ROLES.ADMIN) {
        navigate('/admin/stats', { replace: true });
      } else if (targetRole === ROLES.COLLECTOR) {
        navigate('/collector/open', { replace: true });
      } else {
        navigate('/citizen/devices', { replace: true });
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setSwitching(false);
    }
  };

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { to: '/login', label: 'Sign In' },
        { to: '/signup', label: 'Create Account' },
      ];
    }

    if (role === ROLES.CITIZEN) {
      return [
        { to: '/citizen/devices', label: 'My Devices' },
        { to: '/citizen/devices/new', label: '+ Add Device' },
        { to: '/citizen/rewards', label: 'Rewards Wallet' },
      ];
    }

    if (role === ROLES.COLLECTOR) {
      return [
        { to: '/collector/open', label: 'Open Pickups' },
        { to: '/collector/my-pickups', label: 'My Pickups' },
      ];
    }

    if (role === ROLES.ADMIN) {
      return [
        { to: '/admin/stats', label: 'Impact & Stats' },
        { to: '/admin/devices', label: 'All Devices' },
      ];
    }

    return [];
  };

  const links = getNavLinks();

  const getHomePath = () => {
    if (!isAuthenticated) return '/';
    if (role === ROLES.COLLECTOR) return '/collector/open';
    if (role === ROLES.ADMIN) return '/admin/stats';
    return '/citizen/devices';
  };

  const getRoleBadgeVariant = (userRole) => {
    if (userRole === ROLES.ADMIN) return 'primary';
    if (userRole === ROLES.COLLECTOR) return 'secondary';
    return 'forest';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200/80 shadow-sm">
      {/* Dev Role Testing Toolbar - Active strictly during development */}
      {import.meta.env.DEV && (
        <div className="bg-slate-900 text-slate-300 text-[11px] font-mono px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400 uppercase tracking-widest text-[10px] font-semibold">Dev Test Toolbar</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">Authenticated:</span>
            <span className="font-bold text-white uppercase">{role || 'Unauthenticated'}</span>
            {user?.email && (
              <span className="text-slate-400 text-[10px]">({user.email})</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px] mr-1">Quick Switch:</span>
            <button
              type="button"
              disabled={switching}
              onClick={() => handleDevSwitch(ROLES.CITIZEN)}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                role === ROLES.CITIZEN
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              } disabled:opacity-50`}
            >
              Citizen
            </button>
            <button
              type="button"
              disabled={switching}
              onClick={() => handleDevSwitch(ROLES.COLLECTOR)}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                role === ROLES.COLLECTOR
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              } disabled:opacity-50`}
            >
              Collector (santosh)
            </button>
            <button
              type="button"
              disabled={switching}
              onClick={() => handleDevSwitch(ROLES.ADMIN)}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                role === ROLES.ADMIN
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              } disabled:opacity-50`}
            >
              Admin (sanesh)
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to={getHomePath()}
            className="flex items-center gap-2.5 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-md p-1 group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-700 text-white shadow-sm group-hover:bg-emerald-800 transition-colors">
              <EcoLeafIcon className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900">
                E-Waste Passport
              </span>
              <span className="hidden sm:inline-block font-mono text-[10px] uppercase font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Circular
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Application Navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* User Profile / Status / Logout */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-900 leading-tight">
                    {user?.name || 'Verified User'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {user?.email}
                  </span>
                </div>
                <Badge variant={getRoleBadgeVariant(role)} size="sm" className="capitalize font-medium">
                  {role}
                </Badge>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-slate-500 hover:text-red-700 transition-colors px-2.5 py-1 rounded hover:bg-red-50 font-medium"
                  aria-label="Log out"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="secondary" size="sm">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">Create Account</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              aria-label={mobileMenuOpen ? 'Close application menu' : 'Open application menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-5 pt-3 pb-5 space-y-3">
          {isAuthenticated && (
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs font-mono text-slate-500">{user?.email}</p>
              </div>
              <Badge variant={getRoleBadgeVariant(role)} size="sm" className="capitalize">
                {role}
              </Badge>
            </div>
          )}

          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {isAuthenticated && (
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider text-red-600 hover:bg-red-50 rounded-lg"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
