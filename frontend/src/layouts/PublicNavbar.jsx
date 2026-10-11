import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import { EcoLeafIcon, MenuIcon, CloseIcon } from '../components/ui/Icons';
import { Button } from '../components/ui/Button';

export function PublicNavbar() {
  const { user, role, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (role === ROLES.ADMIN) return '/admin/stats';
    if (role === ROLES.COLLECTOR) return '/collector/open';
    return '/citizen/devices';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-md p-1 group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-800 text-white shadow-sm group-hover:bg-emerald-900 transition-colors">
              <EcoLeafIcon className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-950">
                E-Waste Passport
              </span>
              <span className="hidden sm:inline-block font-mono text-[10px] uppercase font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Civic Circular
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Public Navigation">
            <a
              href="#how-it-works"
              className="text-xs uppercase tracking-wider font-semibold text-slate-600 hover:text-emerald-800 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#rewards"
              className="text-xs uppercase tracking-wider font-semibold text-slate-600 hover:text-emerald-800 transition-colors"
            >
              EcoCoins
            </a>
            <a
              href="#why-us"
              className="text-xs uppercase tracking-wider font-semibold text-slate-600 hover:text-emerald-800 transition-colors"
            >
              Why Us
            </a>
            <a
              href="#roles"
              className="text-xs uppercase tracking-wider font-semibold text-slate-600 hover:text-emerald-800 transition-colors"
            >
              Roles
            </a>
            <a
              href="#impact"
              className="text-xs uppercase tracking-wider font-semibold text-slate-600 hover:text-emerald-800 transition-colors"
            >
              Impact
            </a>
            <a
              href="#developer"
              className="text-xs uppercase tracking-wider font-semibold text-slate-600 hover:text-emerald-800 transition-colors"
            >
              Developer
            </a>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-mono">
                  {user?.email}
                </span>
                <Link to={getDashboardPath()}>
                  <Button variant="primary" size="sm" className="font-semibold text-xs tracking-wide">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-950 transition-colors px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm" className="font-semibold text-xs tracking-wide shadow-sm">
                    Recycle Now
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              aria-label={mobileMenuOpen ? 'Close main navigation' : 'Open main navigation'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-5 pt-4 pb-6 space-y-4 shadow-lg">
          <nav className="flex flex-col space-y-3" aria-label="Mobile Navigation">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-800 hover:text-emerald-800 py-1"
            >
              How It Works
            </a>
            <a
              href="#rewards"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-800 hover:text-emerald-800 py-1"
            >
              EcoCoins Rewards
            </a>
            <a
              href="#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-800 hover:text-emerald-800 py-1"
            >
              Why Choose Us
            </a>
            <a
              href="#roles"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-800 hover:text-emerald-800 py-1"
            >
              User Roles
            </a>
            <a
              href="#impact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-800 hover:text-emerald-800 py-1"
            >
              Empirical Impact
            </a>
            <a
              href="#developer"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-800 hover:text-emerald-800 py-1"
            >
              Developer
            </a>
          </nav>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full"
              >
                <Button variant="primary" size="md" className="w-full text-xs uppercase tracking-wider">
                  Open Dashboard ({role})
                </Button>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-lg border border-slate-200 font-semibold text-slate-700 text-xs uppercase tracking-wider"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button variant="primary" size="md" className="w-full text-xs uppercase tracking-wider">
                    Recycle Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
