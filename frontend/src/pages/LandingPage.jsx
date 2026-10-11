import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  EcoLeafIcon,
  LaptopIcon,
  SmartphoneIcon,
  TvIcon,
  RecycleIcon,
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
  CameraIcon,
  EyeIcon,
} from '../components/ui/Icons';

export function LandingPage() {
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  return (
    <div className="w-full bg-[#fafaf9] text-zinc-900">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-18 md:pb-24 border-b border-zinc-200/80 bg-gradient-to-b from-white via-[#fafaf8] to-[#f4f4f2]">
        {/* Subtle ambient lighting */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-emerald-100/40 blur-[120px] -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Core Value Proposition & Mandatory CTAs */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200/80 text-[11px] font-mono uppercase tracking-wider text-forest-900">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-700 animate-pulse"></span>
                <span>Track 03 · Waste & Energy Pilot</span>
              </div>

              {/* Exact Mandated Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-950 tracking-tight leading-[1.08]">
                Turn Your <br className="hidden sm:inline" />
                E-Waste Into <span className="text-forest-800">Rewards.</span>
              </h1>

              {/* Service Explanation */}
              <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                A verified passport for every old device. Upload a photo, get instant AI guidance,
                schedule doorstep collection, track its journey to certified completion, and earn
                green reward coins.
              </p>

              {/* Mandated CTAs: Recycle Now & Track My Device */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                    Recycle Now
                    <ArrowRightIcon className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link to="/citizen/devices" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    <EyeIcon className="w-4 h-4 mr-1.5 text-zinc-600" />
                    Track My Device
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-zinc-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-zinc-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-4 h-4 text-forest-700" />
                  Amazon Bedrock AI Triage
                </span>
                <span className="flex items-center gap-1.5">
                  <TruckIcon className="w-4 h-4 text-forest-700" />
                  Verified Doorstep Pickup
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-forest-700" />
                  Immutable Audit Passport
                </span>
              </div>
            </div>

            {/* Right Column: Genuine E-Waste Photography & Real Passport Card */}
            <div className="lg:col-span-6">
              <div className="mx-auto max-w-md lg:max-w-none bg-white rounded-2xl border border-zinc-200/90 shadow-elevated overflow-hidden">
                {/* Photo Header: Real Unsplash E-Waste Sorting Photo */}
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-zinc-900">
                  {!heroImgFailed ? (
                    <img
                      src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1000&q=80"
                      alt="Electronic waste collection and sorting facility"
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                      onError={() => setHeroImgFailed(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-forest-950 text-emerald-400 font-mono text-xs">
                      [Verified E-Waste Recovery Facility]
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent"></div>
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-zinc-900/80 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-mono text-white border border-zinc-700/60">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>CERTIFIED COLLECTION HUB</span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white font-mono text-xs">
                    <span className="font-bold tracking-wider">PASSPORT EW-2026-000101</span>
                    <span className="bg-emerald-500/90 text-zinc-950 px-2 py-0.5 rounded font-bold text-[10px]">
                      +50 COINS VERIFIED
                    </span>
                  </div>
                </div>

                {/* Passport Card Body */}
                <div className="p-6 space-y-4">
                  {/* Device Specification Row */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-forest-50 rounded-xl text-forest-800 border border-forest-200/60">
                        <LaptopIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-zinc-950">ThinkPad Laptop</h4>
                          <span className="text-[10px] uppercase font-mono font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                            Collected
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                          4 years · Powers on · Pincode: 110001
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Suggestion Box */}
                  <div className="p-3.5 bg-forest-50/70 rounded-xl border border-forest-200/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold uppercase tracking-wider text-forest-900 text-[10px]">
                        AI Disposition Triage
                      </span>
                      <span className="font-mono text-[11px] text-forest-700 font-bold">REPAIR</span>
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed">
                      "Logic board is intact with minor casing wear. Servicing hardware prevents electronic waste."
                    </p>
                  </div>

                  {/* Lifecycle Tracker */}
                  <div className="pt-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-zinc-400 block mb-2">
                      Lifecycle Audit Track
                    </span>
                    <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono">
                      <div className="p-1 bg-forest-900 text-white rounded font-bold">REG</div>
                      <div className="p-1 bg-forest-900 text-white rounded font-bold">PICKUP</div>
                      <div className="p-1 bg-forest-800 text-white rounded font-bold">COLLECT</div>
                      <div className="p-1 bg-forest-100 text-forest-900 border border-forest-300 rounded font-bold">INSPECT</div>
                      <div className="p-1 bg-zinc-100 text-zinc-400 rounded">DONE</div>
                    </div>
                  </div>

                  {/* Spec Note */}
                  <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-500 italic text-center">
                    "This is a suggestion. The collector confirms the final outcome."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THREE-STEP PROCESS: Submit -> Collect -> Earn Rewards                 */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 md:py-24 border-b border-zinc-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Submit Device → Get It Collected → Earn Rewards
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              Transform obsolete technology into circular resources and shopping rewards in three transparent steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Submit Device */}
            <div className="bg-[#fafaf9] rounded-2xl border border-zinc-200/90 p-6 flex flex-col justify-between space-y-5 hover:border-forest-600/50 transition-all">
              <div className="space-y-4">
                <div className="relative h-44 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                  <img
                    src="https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80"
                    alt="Old electronic smartphones and gadgets"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 font-mono text-xs font-bold text-white bg-forest-900/90 backdrop-blur-sm px-2.5 py-1 rounded">
                    STEP 01
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">1. Submit Device</h3>
                  <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed">
                    Take a photo of your old device, confirm its age and working condition, and let
                    Amazon Bedrock AI suggest whether it should be repaired, reused, resold, or recycled.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-forest-800 font-semibold block pt-2 border-t border-zinc-200/60">
                Instant AI triage & digital passport
              </span>
            </div>

            {/* Step 2: Get It Collected */}
            <div className="bg-[#fafaf9] rounded-2xl border border-zinc-200/90 p-6 flex flex-col justify-between space-y-5 hover:border-forest-600/50 transition-all">
              <div className="space-y-4">
                <div className="relative h-44 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                  <img
                    src="https://images.unsplash.com/photo-1569163139599-0f4517e36f51?auto=format&fit=crop&w=800&q=80"
                    alt="Organized e-waste recycling containers and logistics"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 font-mono text-xs font-bold text-white bg-forest-900/90 backdrop-blur-sm px-2.5 py-1 rounded">
                    STEP 02
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">2. Get It Collected</h3>
                  <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed">
                    Choose a convenient pickup slot. A verified local collector claims the request,
                    arrives at your doorstep, conducts physical inspection, and updates the passport in real time.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-forest-800 font-semibold block pt-2 border-t border-zinc-200/60">
                Free verified doorstep collection
              </span>
            </div>

            {/* Step 3: Earn Rewards */}
            <div className="bg-[#fafaf9] rounded-2xl border border-forest-300 shadow-subtle p-6 flex flex-col justify-between space-y-5 ring-1 ring-forest-200 hover:border-forest-600 transition-all">
              <div className="space-y-4">
                <div className="relative h-44 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                  <img
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
                    alt="Recycled green technology and high value components"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 font-mono text-xs font-bold text-white bg-emerald-800/90 backdrop-blur-sm px-2.5 py-1 rounded">
                    STEP 03
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 font-mono text-xs font-black text-zinc-950 bg-emerald-400 px-2 py-0.5 rounded shadow">
                    +50 REWARD COINS
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">3. Earn Rewards</h3>
                  <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed">
                    Once physical collection is verified, reward coins are immediately credited to your
                    eco-wallet. Redeem coins for grocery vouchers, ride discounts, and eco-coupons.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-800 font-semibold block pt-2 border-t border-forest-200">
                Interactive coupon redemption shop
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ENVIRONMENTAL MISSION SECTION                                         */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-24 border-b border-zinc-200/80 bg-[#f7f7f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Mission statement */}
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
                The Environmental Mission
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                62 million tonnes of e-waste generated each year. <br />
                <span className="text-forest-800">Only 22.3% is formally recycled.</span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                Discarded electronics leak heavy metals (lead, mercury, cadmium) into soil and water
                while squandering valuable rare-earth elements, copper, and gold.
              </p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                By assigning every device an immutable lifecycle passport, we ensure functional devices
                are repaired or reused first, while broken equipment enters formal metallurgical recovery
                measured against published <strong>ITU Global E-waste Monitor 2024</strong> standards.
              </p>

              <div className="pt-2 flex items-center gap-6 font-mono text-xs">
                <div className="p-3 bg-white rounded-xl border border-zinc-200">
                  <span className="text-2xl font-black text-forest-900 block">85%</span>
                  <span className="text-zinc-500 text-[11px]">Laptop Recyclable Share</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-zinc-200">
                  <span className="text-2xl font-black text-forest-900 block">80%</span>
                  <span className="text-zinc-500 text-[11px]">Phone Recyclable Share</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-zinc-200">
                  <span className="text-2xl font-black text-forest-900 block">0%</span>
                  <span className="text-zinc-500 text-[11px]">Landfill Toxic Leakage</span>
                </div>
              </div>
            </div>

            {/* Right: Real Technician & E-Waste Inspection Photography */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 shadow-elevated">
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80"
                  alt="Hardware diagnostic technician checking electronics"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-bold">
                    Physical Field Audit
                  </span>
                  <h3 className="text-lg font-bold mt-0.5">Authoritative Diagnostic Inspection</h3>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    Certified collectors physically verify each device to extend operating life and guarantee compliant recycling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WORKFLOWS: Citizen, Collector, Admin Portals                          */}
      {/* ========================================================================= */}
      <section id="portals" className="py-20 md:py-24 border-b border-zinc-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
              Ecosystem Governance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              One Unified Platform for All Stakeholders
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              Tailored, role-guarded workflows designed for citizens, field collectors, and sustainability administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Citizen Workflow */}
            <div className="bg-[#fafaf9] rounded-2xl border border-zinc-200/90 p-7 flex flex-col justify-between space-y-6 hover:shadow-subtle transition-shadow">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-forest-100 text-forest-900 text-xs font-mono font-bold">
                  CITIZEN ROLE
                </div>
                <h3 className="text-xl font-bold text-zinc-950">Citizen Journey</h3>
                <ul className="text-xs text-zinc-600 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Upload device photos with automated presigned S3 storage.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Receive Bedrock AI disposition suggestions and safety tips.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Schedule doorstep pickups and track immutable status timelines.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Earn reward coins upon verified collection to redeem for coupons.</span>
                  </li>
                </ul>
              </div>
              <Link to="/login" className="block pt-2">
                <Button variant="primary" size="sm" className="w-full">
                  Citizen Portal
                </Button>
              </Link>
            </div>

            {/* Collector Workflow */}
            <div id="collectors" className="bg-[#fafaf9] rounded-2xl border border-zinc-200/90 p-7 flex flex-col justify-between space-y-6 hover:shadow-subtle transition-shadow">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-950 text-xs font-mono font-bold">
                  COLLECTOR ROLE
                </div>
                <h3 className="text-xl font-bold text-zinc-950">Collector Field Operations</h3>
                <ul className="text-xs text-zinc-600 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>View open pickup requests filtered to assigned service pincodes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Atomic claim prevents two collectors claiming the same unit.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Mark collection on doorstep handover to credit citizen rewards.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Conduct physical diagnostic inspection and confirm final outcome.</span>
                  </li>
                </ul>
              </div>
              <Link to="/login" className="block pt-2">
                <Button variant="secondary" size="sm" className="w-full">
                  Collector Portal
                </Button>
              </Link>
            </div>

            {/* Admin Workflow */}
            <div id="admins" className="bg-[#fafaf9] rounded-2xl border border-zinc-200/90 p-7 flex flex-col justify-between space-y-6 hover:shadow-subtle transition-shadow">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-200 text-zinc-900 text-xs font-mono font-bold">
                  ADMIN ROLE
                </div>
                <h3 className="text-xl font-bold text-zinc-950">Administrator Oversight</h3>
                <ul className="text-xs text-zinc-600 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Read-only system-wide audit register of all devices and pickups.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Verified environmental metrics (kg kept in use, kg recyclable).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Sample data toggle separating demo records from production records.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Transparent formulas citing ITU / UNITAR published factors.</span>
                  </li>
                </ul>
              </div>
              <Link to="/login" className="block pt-2">
                <Button variant="secondary" size="sm" className="w-full">
                  Admin Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FINAL CALL TO ACTION                                                  */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-24 bg-[#052115] text-white relative overflow-hidden">
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-emerald-500/10 blur-[120px]"></div>

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
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto bg-white hover:bg-zinc-100 text-zinc-950 border-0 font-bold">
                Recycle Now
                <ArrowRightIcon className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link to="/citizen/devices" className="w-full sm:w-auto">
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
