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
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { to: '/login', label: 'Log In' },
        { to: '/signup', label: 'Sign Up' },
      ];
    }

    if (role === ROLES.CITIZEN) {
      return [
        { to: '/citizen/devices', label: 'My Devices' },
        { to: '/citizen/devices/new', label: '+ Add Device' },
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
    if (!isAuthenticated) return '/login';
    if (role === ROLES.COLLECTOR) return '/collector/open';
    if (role === ROLES.ADMIN) return '/admin/stats';
    return '/citizen/devices';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200/80 shadow-subtle">
      {/* Sleek, Dark Developer Testing Bar (Clearly segregated from product UI) */}
      <div className="bg-zinc-950 text-zinc-400 text-[11px] font-mono px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 select-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Dev Auth Boundary</span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-400">Active Role:</span>
          <span className="font-bold text-white uppercase">{role || 'None'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500 text-[10px] mr-1">Switch:</span>
          <button
            type="button"
            onClick={() => switchRole(ROLES.CITIZEN)}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
              role === ROLES.CITIZEN
                ? 'bg-forest-800 text-emerald-200 font-bold'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            Citizen
          </button>
          <button
            type="button"
            onClick={() => switchRole(ROLES.COLLECTOR)}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
              role === ROLES.COLLECTOR
                ? 'bg-forest-800 text-emerald-200 font-bold'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            Collector
          </button>
          <button
            type="button"
            onClick={() => switchRole(ROLES.ADMIN)}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
              role === ROLES.ADMIN
                ? 'bg-forest-800 text-emerald-200 font-bold'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Main Authenticated Application Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to={getHomePath()}
            className="flex items-center gap-2.5 text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-800 rounded-md p-1 group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-forest-900 text-white shadow-subtle group-hover:bg-forest-800 transition-colors">
              <EcoLeafIcon className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base tracking-tight text-zinc-950">
                E-Waste Passport
              </span>
              <span className="hidden sm:inline-block font-mono text-[10px] uppercase font-semibold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                App
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
                  `px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
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
              <div className="flex items-center gap-3 pl-3 border-l border-zinc-200">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-zinc-900 leading-tight">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {user?.email}
                  </span>
                </div>
                <Badge variant="forest" size="sm" className="capitalize">
                  {role}
                </Badge>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-zinc-500 hover:text-red-700 transition-colors px-2 py-1 font-medium"
                  aria-label="Log out"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="secondary" size="sm">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-700 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-800"
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
        <div className="md:hidden border-t border-zinc-200 bg-white px-5 pt-3 pb-5 space-y-3">
          {isAuthenticated && (
            <div className="pb-3 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-900">{user?.name}</p>
                <p className="text-xs font-mono text-zinc-400">{user?.email}</p>
              </div>
              <Badge variant="forest" size="sm" className="capitalize">
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
                      ? 'bg-zinc-100 text-zinc-950 font-bold'
                      : 'text-zinc-700 hover:bg-zinc-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="pt-3 border-t border-zinc-100">
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
        </div>
      )}
    </header>
  );
}
