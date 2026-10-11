import React from 'react';
import { Link } from 'react-router-dom';
import { EcoLeafIcon, GithubIcon, LinkedinIcon, ExternalLinkIcon } from '../components/ui/Icons';

export function PublicFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-14">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-800 text-emerald-300">
                <EcoLeafIcon className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">
                E-Waste Passport
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              "A passport for every old device, from the owner's hand to its final outcome."
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Track 03 · Waste & Energy</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] font-semibold text-slate-200 uppercase tracking-widest">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#rewards" className="hover:text-white transition-colors">
                  EcoCoins Rewards
                </a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-white transition-colors">
                  Why Choose Us
                </a>
              </li>
              <li>
                <a href="#impact" className="hover:text-white transition-colors">
                  Impact Model
                </a>
              </li>
            </ul>
          </div>

          {/* Platform Roles */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] font-semibold text-slate-200 uppercase tracking-widest">
              Roles & Access
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#roles" className="hover:text-white transition-colors">
                  Role Architecture
                </a>
              </li>
              <li>
                <a href="#collectors" className="hover:text-white transition-colors">
                  Collectors
                </a>
              </li>
              <li>
                <a href="#admins" className="hover:text-white transition-colors">
                  Administrators
                </a>
              </li>
              <li>
                <Link to="/citizen/devices" className="hover:text-white transition-colors">
                  Citizen Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer & Codebase */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] font-semibold text-slate-200 uppercase tracking-widest">
              Developer
            </h4>
            <p className="text-[11px] text-slate-400">
              Sanesh Kumar
            </p>
            <div className="flex flex-col space-y-2 pt-1">
              <a
                href="https://github.com/Sanesh764"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>GitHub Profile</span>
                <ExternalLinkIcon className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://www.linkedin.com/in/sanesh-kumar/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
              >
                <LinkedinIcon className="w-3.5 h-3.5" />
                <span>LinkedIn Profile</span>
                <ExternalLinkIcon className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <span>E-Waste Passport · Circular Electronics Life Cycle System</span>
          <span>React · Node.js · Express · MongoDB · AWS Ready</span>
        </div>
      </div>
    </footer>
  );
}
