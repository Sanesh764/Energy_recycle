import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import {
  EcoLeafIcon,
  LaptopIcon,
  SmartphoneIcon,
  RecycleIcon,
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CameraIcon,
  EyeIcon,
  CoinIcon,
  GiftIcon,
  MapPinIcon,
  UserIcon,
  GithubIcon,
  LinkedinIcon,
  ExternalLinkIcon,
  InfoIcon,
} from '../components/ui/Icons';

export function LandingPage() {
  const { user, role, isAuthenticated } = useAuth();
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [step1ImgFailed, setStep1ImgFailed] = useState(false);
  const [step2ImgFailed, setStep2ImgFailed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 80);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash]);

  // Dynamic routing based on current authenticated identity
  const getRecycleNowPath = () => {
    if (!isAuthenticated) return '/signup';
    if (role === ROLES.ADMIN) return '/admin/stats';
    if (role === ROLES.COLLECTOR) return '/collector/open';
    return '/citizen/devices/new';
  };

  const getTrackDevicePath = () => {
    if (!isAuthenticated) return '/login';
    if (role === ROLES.ADMIN) return '/admin/devices';
    if (role === ROLES.COLLECTOR) return '/collector/my-pickups';
    return '/citizen/devices';
  };

  const getRewardsPath = () => {
    if (!isAuthenticated) return '/signup';
    if (role === ROLES.CITIZEN) return '/citizen/rewards';
    return '/login';
  };

  return (
    <div className="w-full bg-[#fafaf9] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-18 md:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white via-[#fafaf8] to-[#f4f4f1]">
        {/* Subtle ambient lighting */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-emerald-100/40 blur-[130px] -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Core Value Proposition & Primary CTAs */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono uppercase tracking-wider text-emerald-900">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>E-Waste Collection & Rewards Platform</span>
              </div>

              {/* Exact Mandated Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.08]">
                Turn Your E-Waste <br className="hidden sm:inline" />
                Into <span className="text-emerald-700">Rewards.</span>
              </h1>

              {/* Exact Mandated Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                Give your old electronics a responsible next destination. Register your device, schedule a pickup, track its journey, and earn EcoCoins when your collection is verified.
              </p>

              {/* Prominent Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link to={getRecycleNowPath()} className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                    Recycle Now
                    <ArrowRightIcon className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link to={getTrackDevicePath()} className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    <EyeIcon className="w-4 h-4 mr-1.5 text-slate-600" />
                    Track My Device
                  </Button>
                </Link>
              </div>

              {/* Value Signals */}
              <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <TruckIcon className="w-4 h-4 text-emerald-700" />
                  Doorstep Collection
                </span>
                <span className="flex items-center gap-1.5">
                  <CoinIcon className="w-4 h-4 text-emerald-700" />
                  EcoCoins Rewards
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-700" />
                  Verifiable Passport ID
                </span>
              </div>
            </div>

            {/* Right Column: E-Waste Photography & Interactive Passport Preview */}
            <div className="lg:col-span-6">
              <div className="mx-auto max-w-md lg:max-w-none bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                {/* Photo Header: Verified Unsplash E-Waste Sorting */}
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-900">
                  {!heroImgFailed ? (
                    <img
                      src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1000&q=80"
                      alt="Electronic waste collection and sorting facility"
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                      onError={() => setHeroImgFailed(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-emerald-400 font-mono text-xs">
                      [Verified Electronic Recovery Hub]
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-mono text-white border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>AUTHENTICATED PASSPORT PREVIEW</span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white font-mono text-xs">
                    <span className="font-bold tracking-wider">EW-2026-000101</span>
                    <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1">
                      <CoinIcon className="w-3 h-3 text-slate-950" />
                      +50 ECOCOINS CREDITED
                    </span>
                  </div>
                </div>

                {/* Passport Card Body */}
                <div className="p-6 space-y-4">
                  {/* Device Specification Row */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 border border-emerald-200">
                        <LaptopIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-950">ThinkPad T480 Laptop</h4>
                          <span className="text-[10px] uppercase font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Collected
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">
                          4 years old · Powers on · PIN: 110001
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Suggestion Box */}
                  <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold uppercase tracking-wider text-emerald-900 text-[10px] flex items-center gap-1">
                        <SparklesIcon className="w-3 h-3 text-emerald-700" />
                        AI Disposition Triage
                      </span>
                      <span className="font-mono text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">REPAIR</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      "Logic board is intact with light casing wear. Hardware refurbishment avoids electronic scrap."
                    </p>
                  </div>

                  {/* Lifecycle Tracker */}
                  <div className="pt-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 block mb-2">
                      Verified Lifecycle Timeline
                    </span>
                    <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono">
                      <div className="p-1 bg-emerald-900 text-white rounded font-bold">REG</div>
                      <div className="p-1 bg-emerald-900 text-white rounded font-bold">PICKUP</div>
                      <div className="p-1 bg-emerald-800 text-white rounded font-bold">COLLECT</div>
                      <div className="p-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded font-bold">INSPECT</div>
                      <div className="p-1 bg-slate-100 text-slate-400 rounded">DONE</div>
                    </div>
                  </div>

                  {/* Spec Note */}
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic text-center">
                    "AI provides an initial suggestion. The authorized collector confirms the final physical outcome."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. DEDICATED ECOCOINS REWARDS SECTION                                    */}
      {/* ========================================================================= */}
      <section id="rewards" className="py-20 md:py-24 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-bold uppercase tracking-wider">
              <CoinIcon className="w-3.5 h-3.5 text-amber-600" />
              Green Rewards Program
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Recycle More. Earn EcoCoins.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every discarded gadget holds valuable recoverable resources. We turn your responsible recycling into verified EcoCoins that you can redeem for sample merchant vouchers and shopping rewards.
            </p>
          </div>

          {/* 4-Step Explanation & Sample Wallet Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: 4-Step Process Explanation */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-mono font-bold text-sm shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Submit your old electronic device</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Upload a photo of your phone, laptop, screen, or printer and confirm your address and contact details.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-mono font-bold text-sm shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">A collector accepts and collects it</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      An authorized collector assigned to your PIN code claims your request and collects the device at your doorstep.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-mono font-bold text-sm shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">After verified collection, eligible demo coins are credited</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Upon doorstep handover verification, reward coins are added directly to your Citizen EcoCoins balance.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-mono font-bold text-sm shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Explore available reward coupons and redeem in demo shop</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Exchange your accumulated EcoCoins for demo shopping vouchers, ride discounts, and eco-partner coupons.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button: Explore Rewards */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <Link to={getRewardsPath()}>
                  <Button variant="primary" size="md" className="shadow-md">
                    <GiftIcon className="w-4 h-4 mr-2" />
                    Explore Rewards
                  </Button>
                </Link>
                <span className="text-xs text-slate-500">
                  {isAuthenticated && role === ROLES.CITIZEN
                    ? 'View your active wallet and available coupons'
                    : 'Sign in as a Citizen to manage your wallet'}
                </span>
              </div>
            </div>

            {/* Right: Polished Example Wallet Card */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-emerald-800/60 space-y-6">
                {/* Wallet Balance Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-emerald-300">
                        Citizen EcoCoins Wallet
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-400 text-slate-950 font-bold">
                        Demo Balance
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-4xl font-extrabold text-white">150</span>
                      <span className="text-emerald-300 font-bold text-base">EcoCoins</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-800/80 border border-emerald-500/40 flex items-center justify-center shadow-inner">
                    <CoinIcon className="w-7 h-7 text-amber-400" />
                  </div>
                </div>

                {/* Sample Transaction Item */}
                <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-200">Recent Collection Credit</span>
                    <span className="font-mono font-bold text-emerald-300">+50 Coins</span>
                  </div>
                  <p className="text-xs text-slate-200">
                    ThinkPad T480 Laptop · Doorstep collection verified
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 pt-0.5">
                    Today · Tx: #TX-EW-9021 · Verified by Santosh (Collector)
                  </p>
                </div>

                {/* Sample Reward Coupon Card */}
                <div className="p-4 rounded-xl bg-white text-slate-900 shadow-md space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-100 text-purple-800 border border-purple-200 uppercase">
                        Sample Coupon
                      </span>
                      <h5 className="text-sm font-bold text-slate-950 mt-1">₹100 Green Electronics Voucher</h5>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-900 font-bold font-mono text-xs whitespace-nowrap">
                      40 Coins
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Demo redeemable voucher on energy-efficient peripherals and certified recycled tech.
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono">Code: ECO-100-DEMO</span>
                    <span className="text-emerald-700 font-semibold">Ready to Redeem</span>
                  </div>
                </div>

                {/* Explicit Rules & Demo Disclaimer */}
                <div className="p-3 bg-emerald-950/80 rounded-xl border border-emerald-800/80 text-[11px] text-emerald-200/90 leading-relaxed flex items-start gap-2">
                  <InfoIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Demo Notice:</strong> Rewards depend on the platform's configured rules. Vouchers and balances are for demonstration purposes and are never presented as real merchant offers.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. WHY CHOOSE E-WASTE PASSPORT                                           */}
      {/* ========================================================================= */}
      <section id="why-us" className="py-20 md:py-24 border-b border-slate-200 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-800">
              Core Platform Advantages
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Why Choose E-Waste Passport?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              We replace informal electronics dumping with transparent chain-of-custody tracking, smart assistance, and civic incentives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Convenient Doorstep Pickup */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <TruckIcon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-950">
                  Convenient Doorstep Pickup
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Register an old electronic device and request collection from your address without having to visit drop-off centers.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-emerald-800 font-semibold">
                Scheduled by PIN Code
              </div>
            </div>

            {/* Card 2: Transparent Device Tracking */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-950">
                  Transparent Device Tracking
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Follow the device through its unique passport and collection-status timeline from handover to verified completion.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-blue-800 font-semibold">
                Immutable Status History
              </div>
            </div>

            {/* Card 3: Rewards for Responsible Recycling */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <CoinIcon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-950">
                  Rewards for Responsible Recycling
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Earn eligible EcoCoins after verified collection and explore demo shopping coupons in the integrated rewards store.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-amber-800 font-semibold">
                Instant Wallet Credit
              </div>
            </div>

            {/* Card 4: AI-Assisted Device Guidance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-950">
                  AI-Assisted Device Guidance
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Get an initial suggestion about repair, reuse, resale, or recycling. Clearly understand that final outcomes depend on collector inspection.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-purple-800 font-semibold">
                Computer Vision Analysis
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW THE PLATFORM WORKS (Visual 4-Step Process)                        */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 md:py-24 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-800">
              End-to-End Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              How E-Waste Passport Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              From an unwanted device in your cabinet to verified recovery and wallet rewards in four structured steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-[#fafaf9] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 hover:border-emerald-600 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-mono font-bold text-sm shadow">
                    01
                  </span>
                  <span className="text-[10px] font-mono font-semibold uppercase text-slate-400">Step 1</span>
                </div>
                <h3 className="text-base font-bold text-slate-950">Register Your Device</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Upload a photograph, confirm device details (type, brand, age, condition), and provide your pickup address.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/80 text-[11px] font-mono text-emerald-800">
                Photo + AI Recommendation
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#fafaf9] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 hover:border-emerald-600 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-mono font-bold text-sm shadow">
                    02
                  </span>
                  <span className="text-[10px] font-mono font-semibold uppercase text-slate-400">Step 2</span>
                </div>
                <h3 className="text-base font-bold text-slate-950">Get a Collection Request</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Receive a unique passport ID (e.g. EW-2026-000101) and track the status of your collection request in real time.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/80 text-[11px] font-mono text-emerald-800">
                Digital Passport Issued
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#fafaf9] rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 hover:border-emerald-600 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-mono font-bold text-sm shadow">
                    03
                  </span>
                  <span className="text-[10px] font-mono font-semibold uppercase text-slate-400">Step 3</span>
                </div>
                <h3 className="text-base font-bold text-slate-950">Collector Verifies Collection</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  An authorized collector accepts the request, collects the device, and records inspection and physical outcome details.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/80 text-[11px] font-mono text-emerald-800">
                Doorstep Physical Handover
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#fafaf9] rounded-2xl border border-emerald-300 ring-1 ring-emerald-200 p-6 flex flex-col justify-between space-y-4 shadow-sm hover:border-emerald-600 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-mono font-bold text-sm shadow">
                    04
                  </span>
                  <span className="text-[10px] font-mono font-semibold uppercase text-emerald-700 font-bold">Step 4</span>
                </div>
                <h3 className="text-base font-bold text-slate-950">Track Outcomes & Rewards</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  View your device timeline and eligible EcoCoins. Administrators monitor operations and review aggregate impact.
                </p>
              </div>
              <div className="pt-3 border-t border-emerald-200 text-[11px] font-mono text-emerald-800 font-bold">
                Completed Timeline + Coins
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SHOW THE THREE USER ROLES                                             */}
      {/* ========================================================================= */}
      <section id="roles" className="py-20 md:py-24 border-b border-slate-200 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-800">
              Role Governance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Built for Every Stakeholder
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Strictly segregated roles ensure transparent chain of custody from household device to verified recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* For Citizens */}
            <div className="bg-white rounded-2xl border border-slate-200 p-7 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100 text-emerald-950 text-xs font-mono font-bold">
                  <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
                  CITIZEN ROLE
                </div>
                <h3 className="text-xl font-bold text-slate-950">For Citizens</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Register old electronics, request free doorstep collection, follow real-time passports, and earn EcoCoins for verified handovers.
                </p>
                <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Device photo upload & details</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Doorstep address scheduling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Personal EcoCoins rewards wallet</span>
                  </li>
                </ul>
              </div>
              <Link to="/signup" className="block pt-2">
                <Button variant="primary" size="sm" className="w-full">
                  Start as Citizen
                </Button>
              </Link>
            </div>

            {/* For Collectors */}
            <div id="collectors" className="bg-white rounded-2xl border border-slate-200 p-7 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-100 text-blue-950 text-xs font-mono font-bold">
                  <TruckIcon className="w-3.5 h-3.5 text-blue-700" />
                  COLLECTOR ROLE
                </div>
                <h3 className="text-xl font-bold text-slate-950">For Collectors</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Manage authorized pickup requests in your assigned PIN codes, record physical doorstep handovers, inspect devices, and document final outcomes.
                </p>
                <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>Pincode-filtered open requests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>Doorstep collection confirmation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>Physical diagnostic inspection</span>
                  </li>
                </ul>
              </div>
              <Link to="/login" className="block pt-2">
                <Button variant="secondary" size="sm" className="w-full">
                  Collector Portal
                </Button>
              </Link>
            </div>

            {/* For Administrators */}
            <div id="admins" className="bg-white rounded-2xl border border-slate-200 p-7 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-purple-100 text-purple-950 text-xs font-mono font-bold">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-purple-700" />
                  ADMIN ROLE
                </div>
                <h3 className="text-xl font-bold text-slate-950">For Administrators</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Monitor device statuses across the system, manage operational oversight, review aggregate impact statistics, and audit immutable timelines.
                </p>
                <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>System-wide device register</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>Aggregate empirical metrics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>Sample data audit toggle</span>
                  </li>
                </ul>
              </div>
              <Link to="/login" className="block pt-2">
                <Button variant="secondary" size="sm" className="w-full">
                  Admin Console
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TRANSPARENT ENVIRONMENTAL IMPACT SECTION                              */}
      {/* ========================================================================= */}
      <section id="impact" className="py-20 md:py-24 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-800">
              Verified Scientific Accounting
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Transparent Environmental Impact
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              E-Waste Passport tracks verified completed device outcomes: <strong>REPAIR</strong>, <strong>REUSE</strong>, <strong>RESALE</strong>, and <strong>RECYCLE</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Triage vs Outcome Explanation */}
            <div className="lg:col-span-6 space-y-5">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-emerald-900 uppercase font-mono tracking-wider">
                  Key Distinction: AI Guidance vs. Physical Inspection
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Upon photo registration, the platform's AI model provides an initial triage suggestion. However, <strong>only the authorized collector's physical inspection confirms the authoritative final outcome</strong>.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>
                  Calculations follow published international e-waste statistics (ITU Global E-waste Monitor) to quantify weight kept in circular use versus recyclable materials diverted from unmanaged disposal.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900">Standardized Formulas:</div>
                  <div>• Kept In Use (kg) = sum(avgWeightKg for REPAIR, REUSE, RESALE)</div>
                  <div>• Recyclable (kg) = sum(avgWeightKg * recyclableShare for RECYCLE)</div>
                </div>
              </div>
            </div>

            {/* Right: Empirical Framework Diagram */}
            <div className="lg:col-span-6">
              <div className="bg-[#fafaf9] rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-mono font-bold text-slate-900 uppercase">
                    Empirical Outcomes Framework
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                    Published Benchmarks
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase font-mono block">Circularity</span>
                    <span className="text-lg font-black text-emerald-800 mt-1 block">REPAIR & REUSE</span>
                    <p className="text-[11px] text-slate-500 mt-1">Keeps 100% of device mass in useful service life.</p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase font-mono block">Material Yield</span>
                    <span className="text-lg font-black text-blue-800 mt-1 block">RECYCLE</span>
                    <p className="text-[11px] text-slate-500 mt-1">Recovers 80–85% of critical metals and circuit materials.</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic text-center">
                  Source: ITU / Global E-waste Monitor published research (UNU-KEY classification).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. ABOUT THE DEVELOPER                                                    */}
      {/* ========================================================================= */}
      <section id="developer" className="py-20 md:py-24 border-b border-slate-200 bg-[#f8f9fa]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-800">
              Project Engineering
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              About the Developer
            </h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-md space-y-6">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md">
                SK
              </div>
              <h3 className="text-2xl font-bold text-slate-950">Sanesh Kumar</h3>
              <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                "Built to make electronic waste collection more transparent, convenient, and rewarding."
              </p>
            </div>

            {/* Verified Profile Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="https://github.com/Sanesh764"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition"
              >
                <GithubIcon className="w-4 h-4 text-slate-900" />
                <span>GitHub Profile</span>
                <ExternalLinkIcon className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a
                href="https://www.linkedin.com/in/sanesh-kumar/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold text-xs transition"
              >
                <LinkedinIcon className="w-4 h-4 text-blue-700" />
                <span>LinkedIn Profile</span>
                <ExternalLinkIcon className="w-3.5 h-3.5 text-blue-400" />
              </a>
            </div>

            {/* Verified Architecture & Tech Stack Badges */}
            <div className="pt-6 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                Core Technology Stack
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">React 18</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">Vite</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">Node.js</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">Express</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">MongoDB</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">Tailwind CSS</span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">Bcrypt Auth</span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">AWS Bedrock Ready</span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">AWS S3 Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FINAL CALL TO ACTION                                                  */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-24 bg-[#052115] text-white relative overflow-hidden">
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-emerald-500/10 blur-[130px]" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative z-10">
          <span className="inline-block text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60 font-semibold">
            Responsible Electronic Life Cycle
          </span>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to give your device a responsible next step?
          </h2>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-xl mx-auto leading-relaxed">
            Register your device in 60 seconds, schedule doorstep pickup, and collect your reward coins today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link to={getRecycleNowPath()} className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-950 border-0 font-bold shadow-lg">
                Recycle Now
                <ArrowRightIcon className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link to={getTrackDevicePath()} className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-transparent border-emerald-700/80 text-white hover:bg-white/10">
                Track My Device
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
