import React from 'react';
import { Link } from 'react-router-dom';
import { EcoLeafIcon } from '../components/ui/Icons';

export function PublicFooter() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-14">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-forest-900 text-emerald-300">
                <EcoLeafIcon className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">
                E-Waste Passport
              </span>
            </div>
            <p className="text-zinc-400 text-xs max-w-sm leading-relaxed">
              "A passport for every old device, from the owner's hand to its final outcome."
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Track 03 · Waste & Energy</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] font-semibold text-zinc-200 uppercase tracking-widest">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#impact" className="hover:text-white transition-colors">
                  Impact Model
                </a>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] font-semibold text-zinc-200 uppercase tracking-widest">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#collectors" className="hover:text-white transition-colors">
                  Collectors
                </a>
              </li>
              <li>
                <a href="#admins" className="hover:text-white transition-colors">
                  Admins
                </a>
              </li>
              <li>
                <Link to="/citizen/devices" className="hover:text-white transition-colors">
                  Citizen Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] font-semibold text-zinc-200 uppercase tracking-widest">
              Account
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Log In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-white transition-colors">
                  Register Device
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 font-mono">
          <span>Track 03 · Waste & Energy · E-Waste Passport</span>
          <span>Amazon Cognito · Amazon Bedrock · Amazon S3</span>
        </div>
      </div>
    </footer>
  );
}
