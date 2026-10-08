import React from 'react';
import { EcoLeafIcon } from '../components/ui/Icons';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded bg-emerald-700 text-white">
              <EcoLeafIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                E-Waste Passport
              </p>
              <p className="text-xs text-slate-500">
                A passport for every old device, from the owner's hand to its final outcome.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-center md:text-right">
            <span>Track 03 — Waste and Energy • AWS Civic Tech</span>
            <div className="mt-1">
              <span>Roles: Citizen • Collector • Admin (Cognito Architecture)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
