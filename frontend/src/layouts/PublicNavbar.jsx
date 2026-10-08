import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EcoLeafIcon, MenuIcon, CloseIcon } from '../components/ui/Icons';
import { Button } from '../components/ui/Button';

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-800 rounded-md p-1 group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-forest-900 text-white shadow-subtle group-hover:bg-forest-800 transition-colors">
              <EcoLeafIcon className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base tracking-tight text-zinc-950">
                E-Waste Passport
              </span>
              <span className="hidden sm:inline-block font-mono text-[10px] uppercase font-semibold text-forest-700 bg-forest-50 px-1.5 py-0.5 rounded border border-forest-200/60">
                Civic
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Public Navigation">
            <a
              href="#how-it-works"
              className="text-xs uppercase tracking-wider font-semibold text-zinc-600 hover:text-forest-900 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-xs uppercase tracking-wider font-semibold text-zinc-600 hover:text-forest-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#collectors"
              className="text-xs uppercase tracking-wider font-semibold text-zinc-600 hover:text-forest-900 transition-colors"
            >
              Collectors
            </a>
            <a
              href="#admins"
              className="text-xs uppercase tracking-wider font-semibold text-zinc-600 hover:text-forest-900 transition-colors"
            >
              Admins
            </a>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-700 hover:text-zinc-950 transition-colors px-3 py-1.5"
            >
              Log In
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm" className="font-semibold text-xs tracking-wide">
                Register Device
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-700 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-800"
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
        <div className="md:hidden border-t border-zinc-200 bg-white px-5 pt-4 pb-6 space-y-4 shadow-lg">
          <nav className="flex flex-col space-y-3" aria-label="Mobile Navigation">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-800 hover:text-forest-900 py-1"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-800 hover:text-forest-900 py-1"
            >
              Features
            </a>
            <a
              href="#collectors"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-800 hover:text-forest-900 py-1"
            >
              Collectors
            </a>
            <a
              href="#admins"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-800 hover:text-forest-900 py-1"
            >
              Admins
            </a>
          </nav>

          <div className="pt-4 border-t border-zinc-100 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-lg border border-zinc-200 font-semibold text-zinc-700 text-xs uppercase tracking-wider"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button variant="primary" size="md" className="w-full text-xs uppercase tracking-wider">
                Register Device
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
