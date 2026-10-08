import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  EcoLeafIcon,
  LaptopIcon,
  SmartphoneIcon,
  TvIcon,
  ChargerIcon,
  PrinterIcon,
  RecycleIcon,
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
  InfoIcon,
  CameraIcon,
} from '../components/ui/Icons';

export function LandingPage() {
  return (
    <div className="w-full bg-[#fafaf9] text-zinc-900">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-zinc-200/70 bg-gradient-to-b from-white via-[#fafaf8] to-[#f4f4f2] bg-grid-pattern">
        {/* Subtle radial ambient highlight */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-100/30 blur-[100px] -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Messaging & CTAs */}
            <div className="lg:col-span-6 space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200/80 text-[11px] font-mono uppercase tracking-wider text-forest-900">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-700"></span>
                <span>Track 03 · Waste & Energy</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-950 tracking-tight leading-[1.08]">
                Give every old device <br className="hidden sm:inline" />
                a <span className="text-forest-800">responsible</span> next step.
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                E-Waste Passport helps you register old electronics, understand what to do with them,
                arrange collection, and follow their journey to a final outcome.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Register a Device
                    <ArrowRightIcon className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Explore the Process
                  </Button>
                </a>
              </div>

              {/* Technical trust badges */}
              <div className="pt-6 border-t border-zinc-200/70 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-zinc-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-forest-700" />
                  Amazon Bedrock Vision
                </span>
                <span className="flex items-center gap-1.5">
                  <TruckIcon className="w-3.5 h-3.5 text-forest-700" />
                  Verified Doorstep Pickup
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-forest-700" />
                  Immutable Lifecycle Log
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual - Realistic Product Passport Card */}
            <div className="lg:col-span-6">
              <div className="mx-auto max-w-md lg:max-w-none bg-white rounded-2xl border border-zinc-200 shadow-elevated overflow-hidden">
                {/* Product window titlebar */}
                <div className="bg-zinc-900 text-zinc-300 px-5 py-3 flex items-center justify-between text-xs border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="font-mono text-zinc-400 uppercase tracking-wider text-[11px]">
                      Device Passport Interface
                    </span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold tracking-wider text-[11px]">
                    EW-2026-000101
                  </span>
                </div>

                <div className="p-6 space-y-5">
                  {/* Device Specification Row */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-zinc-100 rounded-xl text-zinc-800 border border-zinc-200/60">
                        <LaptopIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-zinc-950">Laptop</h4>
                          <span className="text-[10px] uppercase font-mono font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                            Registered
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                          4 years old · Powers on · Minor damage
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Suggestion Box */}
                  <div className="p-4 bg-forest-50/70 rounded-xl border border-forest-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold uppercase tracking-wider text-forest-900 text-[10px]">
                        AI Disposition Triage
                      </span>
                      <span className="font-mono text-[11px] text-forest-700">Bedrock Converse</span>
                    </div>
                    <div className="text-lg font-black text-forest-950 tracking-tight">
                      SUGGESTION: REPAIR
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed">
                      "Power is functional and structural chassis exhibits minor surface wear. Repair can extend useful operating life."
                    </p>
                  </div>

                  {/* Connected Lifecycle Visual */}
                  <div className="pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-zinc-400 block mb-3">
                      Audit Lifecycle Stage Track
                    </span>
                    <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono">
                      <div className="p-1.5 bg-forest-900 text-white rounded font-bold">
                        REG
                      </div>
                      <div className="p-1.5 bg-forest-900 text-white rounded font-bold">
                        PICKUP
                      </div>
                      <div className="p-1.5 bg-forest-100 text-forest-900 border border-forest-300 rounded font-bold">
                        COLLECT
                      </div>
                      <div className="p-1.5 bg-zinc-100 text-zinc-400 rounded">
                        INSPECT
                      </div>
                      <div className="p-1.5 bg-zinc-100 text-zinc-400 rounded">
                        DONE
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1.5 px-0.5">
                      <span className="text-forest-900 font-semibold">Stage: Collected</span>
                      <span>Next: Collector Inspection</span>
                    </div>
                  </div>

                  {/* Mandatory SPEC Note */}
                  <div className="pt-3 border-t border-zinc-100 text-[11px] text-zinc-500 italic">
                    "This is a suggestion. The collector confirms the final outcome."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PRODUCT VALUE SECTION (EDITORIAL LAYOUT)                               */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 border-b border-zinc-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left: Statement */}
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
                The Core Problem
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                Old electronics create a simple question: <br />
                <span className="text-forest-800">What should I do with this?</span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                Most citizens keep old devices in storage for years because determining whether to fix,
                give away, sell, or scrap them is fraught with uncertainty.
              </p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                E-Waste Passport transforms ambiguity into a transparent, guided journey with certified
                doorstep fulfillment.
              </p>
            </div>

            {/* Right: Four Destination Blocks */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-xl border border-zinc-200/80 bg-[#fafaf9] hover:border-forest-700/40 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-forest-900 bg-forest-100 px-2 py-0.5 rounded">
                    DESTINATION 01
                  </span>
                  <span className="text-sm font-black text-forest-900">REPAIR</span>
                </div>
                <h3 className="text-base font-bold text-zinc-950">Extend Useful Life</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Identify functional hardware where servicing a battery or screen keeps the original device in service.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-zinc-200/80 bg-[#fafaf9] hover:border-forest-700/40 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-forest-900 bg-forest-100 px-2 py-0.5 rounded">
                    DESTINATION 02
                  </span>
                  <span className="text-sm font-black text-forest-900">REUSE</span>
                </div>
                <h3 className="text-base font-bold text-zinc-950">Direct Re-deployment</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Connect fully operable devices with secondary users, schools, or community organizations without shredding.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-zinc-200/80 bg-[#fafaf9] hover:border-forest-700/40 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-forest-900 bg-forest-100 px-2 py-0.5 rounded">
                    DESTINATION 03
                  </span>
                  <span className="text-sm font-black text-forest-900">RESALE</span>
                </div>
                <h3 className="text-base font-bold text-zinc-950">Commercial Recovery</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Channel higher-value devices into authorized refurbisher networks to recover residual asset value.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-zinc-200/80 bg-[#fafaf9] hover:border-forest-700/40 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-700 bg-zinc-200 px-2 py-0.5 rounded">
                    DESTINATION 04
                  </span>
                  <span className="text-sm font-black text-zinc-900">RECYCLE</span>
                </div>
                <h3 className="text-base font-bold text-zinc-950">Material Extraction</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Ensure broken, hazardous, or obsolete equipment enters formal metallurgy recovery to capture raw elements safely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS (HORIZONTAL LIFECYCLE TRACK)                             */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 md:py-28 border-b border-zinc-200/80 bg-[#f7f7f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
              The Product Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              How E-Waste Passport Works
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              A 5-step verified workflow connecting the device owner to certified collection and verified outcome.
            </p>
          </div>

          {/* Connected track for desktop */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-subtle flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-forest-900 bg-forest-50 px-2 py-0.5 rounded">
                    01
                  </span>
                  <CameraIcon className="w-4 h-4 text-zinc-400" />
                </div>
                <h3 className="text-sm font-bold text-zinc-950 mt-3">Register</h3>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  Upload a device photo and answer four simple questions about age, power, and damage.
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Input Stage</span>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-xl border border-forest-300 shadow-subtle ring-1 ring-forest-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-forest-900 bg-forest-100 px-2 py-0.5 rounded">
                    02
                  </span>
                  <SparklesIcon className="w-4 h-4 text-forest-700" />
                </div>
                <h3 className="text-sm font-bold text-zinc-950 mt-3">Get a Suggestion</h3>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  AI analyses the device via Bedrock Converse and suggests a practical next step with safety tips.
                </p>
              </div>
              <span className="text-[10px] font-mono text-forest-700 uppercase font-semibold">AI Triage</span>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-subtle flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-forest-900 bg-forest-50 px-2 py-0.5 rounded">
                    03
                  </span>
                  <TruckIcon className="w-4 h-4 text-zinc-400" />
                </div>
                <h3 className="text-sm font-bold text-zinc-950 mt-3">Request Pickup</h3>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  Specify your address, pincode, and preferred time window for free municipal or verified collection.
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Logistics</span>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-subtle flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-forest-900 bg-forest-50 px-2 py-0.5 rounded">
                    04
                  </span>
                  <ShieldCheckIcon className="w-4 h-4 text-zinc-400" />
                </div>
                <h3 className="text-sm font-bold text-zinc-950 mt-3">Inspection</h3>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  An authorized collector collects the unit and conducts physical diagnostic inspection.
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Verification</span>
            </div>

            {/* Step 5 */}
            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-subtle flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-forest-900 bg-forest-50 px-2 py-0.5 rounded">
                    05
                  </span>
                  <CheckCircleIcon className="w-4 h-4 text-forest-700" />
                </div>
                <h3 className="text-sm font-bold text-zinc-950 mt-3">Final Outcome</h3>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  The collector confirms the final certified outcome (Repair, Reuse, Resale, or Recycle).
                </p>
              </div>
              <span className="text-[10px] font-mono text-forest-800 uppercase font-semibold">Completed</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CORE FEATURES (BENTO LAYOUT)                                          */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 md:py-28 border-b border-zinc-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
              Capability Grid
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Everything you need to give an old device a next step.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              Purpose-built tools adhering strictly to the SPEC.md lifecycle model.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bento Item 1: Large feature with UI preview (AI Assessment) */}
            <div className="md:col-span-2 bg-[#fafaf9] rounded-2xl border border-zinc-200/90 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-2 max-w-lg">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-forest-800">
                  Feature 01 · Intelligence
                </span>
                <h3 className="text-xl font-bold text-zinc-950">AI Device Assessment</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Get a practical suggestion based on device type, age, power status, damage, and photo via Amazon Bedrock Converse API.
                </p>
              </div>

              {/* Realistic mini UI preview */}
              <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-subtle space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="font-mono text-zinc-500">bedrock-triage-output.json</span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                    VALIDATED
                  </span>
                </div>
                <div className="font-mono text-[11px] text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-100 space-y-1">
                  <div>"suggestedOutcome": <span className="font-bold text-forest-800">"REPAIR"</span>,</div>
                  <div>"reason": <span className="text-zinc-600">"Power is available and damage is minor. Repair may extend useful life."</span>,</div>
                  <div>"safetyTip": <span className="text-zinc-600">"Backup files and wipe personal accounts before pickup."</span></div>
                </div>
              </div>
            </div>

            {/* Bento Item 2: Digital Passport */}
            <div className="bg-[#fafaf9] rounded-2xl border border-zinc-200/90 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-forest-800">
                  Feature 02 · Identity
                </span>
                <h3 className="text-xl font-bold text-zinc-950">Digital Device Passport</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Every registered device receives a unique permanent tracking code and lifecycle audit history.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-subtle text-center space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                  Generated Passport Code
                </span>
                <span className="font-mono text-lg font-black text-forest-900 block">
                  EW-2026-000101
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">Sequential atomic counter</span>
              </div>
            </div>

            {/* Bento Item 3: Pickup Tracking */}
            <div className="bg-[#fafaf9] rounded-2xl border border-zinc-200/90 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-forest-800">
                  Feature 03 · Logistics
                </span>
                <h3 className="text-lg font-bold text-zinc-950">Pickup Tracking</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Request collection and follow the device through the pickup process from scheduled slot to collection.
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-zinc-200 text-xs flex items-center justify-between text-zinc-600">
                <span>Pincode matching</span>
                <span className="font-mono font-bold text-forest-900">110001</span>
              </div>
            </div>

            {/* Bento Item 4: Collector Inspection */}
            <div className="bg-[#fafaf9] rounded-2xl border border-zinc-200/90 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-forest-800">
                  Feature 04 · Governance
                </span>
                <h3 className="text-lg font-bold text-zinc-950">Collector Inspection</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Collectors confirm the actual condition and final outcome after hands-on physical inspection.
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-zinc-200 text-xs flex items-center justify-between text-zinc-600">
                <span>Collector override rule</span>
                <span className="font-mono text-forest-900 font-bold">AUTHORITATIVE</span>
              </div>
            </div>

            {/* Bento Item 5: Secure Photos */}
            <div className="bg-[#fafaf9] rounded-2xl border border-zinc-200/90 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-forest-800">
                  Feature 05 · Security
                </span>
                <h3 className="text-lg font-bold text-zinc-950">Secure Device Photos</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Photos are stored privately in Amazon S3 and accessed strictly through controlled short-lived presigned URLs.
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-zinc-200 text-xs flex items-center justify-between text-zinc-600">
                <span>Bucket policy</span>
                <span className="font-mono text-zinc-800 font-bold">BLOCK_PUBLIC_ACCESS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. AI SHOWCASE (REAL PRODUCT INTERFACE)                                  */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 border-b border-zinc-200/80 bg-[#f7f7f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
              Multimodal Diagnostics
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              AI helps you decide what comes next.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              Bedrock vision triage evaluates photo evidence and user specifications in seconds.
            </p>
          </div>

          {/* Product UI Interface Screenshot / Mockup */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-zinc-300 shadow-elevated overflow-hidden">
            {/* Topbar */}
            <div className="bg-zinc-900 text-zinc-300 px-6 py-3.5 flex items-center justify-between text-xs border-b border-zinc-800 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>DEVICE ASSESSMENT</span>
              </div>
              <span className="text-zinc-400">EW-2026-000101</span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Device Condition Block */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 text-xs">
                <div>
                  <span className="font-bold text-zinc-950 text-sm block">Laptop</span>
                  <span className="text-zinc-500 font-mono">Condition: 4 years · Powers On · Minor Damage</span>
                </div>
                <span className="font-mono text-zinc-400 text-[11px]">Model: Bedrock Converse</span>
              </div>

              {/* AI Suggestion Display */}
              <div className="p-5 bg-forest-50/80 rounded-xl border border-forest-200/80 space-y-2">
                <span className="font-mono text-[10px] font-bold text-forest-800 uppercase tracking-widest block">
                  AI SUGGESTION
                </span>
                <span className="text-2xl font-black text-forest-950 block tracking-tight">
                  REPAIR
                </span>
                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed pt-1">
                  Power is available and damage is minor. Repair may extend the device's useful life.
                </p>
              </div>

              {/* Mandatory Specification Disclaimer */}
              <div className="pt-2 text-center text-xs text-zinc-500 font-medium">
                "This is a suggestion. The collector confirms the final outcome."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. PASSPORT SHOWCASE (CORE PRODUCT DIFFERENTIATOR)                       */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 border-b border-zinc-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Product Mockup Card */}
            <div className="lg:col-span-7">
              <div className="bg-[#fafaf9] rounded-2xl border border-zinc-300 shadow-elevated p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-semibold">
                      Digital Lifecycle Certificate
                    </span>
                    <h3 className="text-xl sm:text-2xl font-mono font-black text-zinc-950 mt-0.5">
                      EW-2026-000101
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-forest-900 bg-forest-100 px-2.5 py-1 rounded block">
                      LAPTOP
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
                      Registered 10/01/2026
                    </span>
                  </div>
                </div>

                {/* Vertical Timeline */}
                <div className="space-y-4 py-2 text-xs font-mono">
                  <div className="flex items-start gap-3">
                    <span className="text-forest-700 font-bold">●</span>
                    <div>
                      <span className="font-bold text-zinc-900">Registered</span>
                      <span className="text-zinc-400 block text-[11px]">Device photos and questions saved</span>
                    </div>
                  </div>
                  <div className="w-0.5 h-3 bg-zinc-200 ml-1.5 -my-2"></div>

                  <div className="flex items-start gap-3">
                    <span className="text-forest-700 font-bold">●</span>
                    <div>
                      <span className="font-bold text-zinc-900">Pickup Requested</span>
                      <span className="text-zinc-400 block text-[11px]">Matched to serviced pincode 110001</span>
                    </div>
                  </div>
                  <div className="w-0.5 h-3 bg-zinc-200 ml-1.5 -my-2"></div>

                  <div className="flex items-start gap-3">
                    <span className="text-forest-700 font-bold">●</span>
                    <div>
                      <span className="font-bold text-zinc-900">Accepted</span>
                      <span className="text-zinc-400 block text-[11px]">Claimed by verified municipal collector</span>
                    </div>
                  </div>
                  <div className="w-0.5 h-3 bg-zinc-200 ml-1.5 -my-2"></div>

                  <div className="flex items-start gap-3">
                    <span className="text-forest-700 font-bold">●</span>
                    <div>
                      <span className="font-bold text-zinc-900">Collected</span>
                      <span className="text-zinc-400 block text-[11px]">Physical custody transferred</span>
                    </div>
                  </div>
                  <div className="w-0.5 h-3 bg-zinc-200 ml-1.5 -my-2"></div>

                  <div className="flex items-start gap-3 text-zinc-400">
                    <span>○</span>
                    <div>
                      <span>Inspected</span>
                      <span className="block text-[11px]">Physical hardware condition determination</span>
                    </div>
                  </div>
                  <div className="w-0.5 h-3 bg-zinc-200 ml-1.5 -my-2"></div>

                  <div className="flex items-start gap-3 text-zinc-400">
                    <span>○</span>
                    <div>
                      <span>Completed</span>
                      <span className="block text-[11px]">Certified final outcome recorded</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Editorial Explanation */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
                Core Differentiator
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                One device. <br />
                One identity. <br />
                <span className="text-forest-800">One traceable journey.</span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                Traditional e-waste collection is an opaque black hole. Once a device leaves your hands,
                you never know if it ended up in an open burning pit or responsibly refurbished.
              </p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                The digital passport gives every unit an immutable trail from citizen registration to certified
                final outcome.
              </p>
              <div className="pt-2">
                <Link to="/signup">
                  <Button variant="primary" size="md">
                    Create Your Device Passport
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. OUTCOME SECTION                                                       */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 border-b border-zinc-200/80 bg-[#f7f7f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
              Certified Dispositions
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Every device can have a different next step.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              The collector's inspected final outcome is authoritative and completes the passport.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-subtle space-y-2">
              <span className="font-mono text-xs font-bold text-forest-900 bg-forest-50 px-2 py-0.5 rounded inline-block">
                REPAIR
              </span>
              <h3 className="text-base font-bold text-zinc-950 mt-2">Extend Useful Life</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Minor component replacement and technical refurbishment to restore full device utility.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-subtle space-y-2">
              <span className="font-mono text-xs font-bold text-forest-900 bg-forest-50 px-2 py-0.5 rounded inline-block">
                REUSE
              </span>
              <h3 className="text-base font-bold text-zinc-950 mt-2">Keep in Use</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Direct transfer of working electronics to classrooms, community hubs, or new owners.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-subtle space-y-2">
              <span className="font-mono text-xs font-bold text-forest-900 bg-forest-50 px-2 py-0.5 rounded inline-block">
                RESALE
              </span>
              <h3 className="text-base font-bold text-zinc-950 mt-2">Secondary Value</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Authorized resale channels that return financial return while avoiding new resource extraction.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-subtle space-y-2">
              <span className="font-mono text-xs font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded inline-block">
                RECYCLE
              </span>
              <h3 className="text-base font-bold text-zinc-950 mt-2">Material Recovery</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Controlled smelting and disassembly to extract copper, gold, and polymers safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. COLLECTOR + ADMIN SECTION                                             */}
      {/* ========================================================================= */}
      <section id="collectors" className="py-20 md:py-28 border-b border-zinc-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
              Ecosystem Portals
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Built for Field Operations & System Oversight
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              Role-guarded interfaces tailored for field collectors and administrative analysts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Collectors */}
            <div className="bg-[#fafaf9] p-7 sm:p-8 rounded-2xl border border-zinc-200 space-y-6">
              <div className="space-y-1">
                <span className="font-mono text-xs uppercase font-bold text-forest-800">Field Workflow</span>
                <h3 className="text-xl font-bold text-zinc-950">For Collectors</h3>
                <p className="text-xs text-zinc-600">
                  Accept pickups in serviced pincodes, verify physical items, and assign final outcome.
                </p>
              </div>

              {/* Realistic mini pickup card preview */}
              <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-subtle space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="font-mono font-bold text-forest-900">EW-2026-000101</span>
                  <span className="font-mono text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                    REQUESTED
                  </span>
                </div>
                <div className="text-zinc-600 font-mono text-[11px] space-y-1">
                  <div>Type: <strong className="text-zinc-900">PHONE</strong></div>
                  <div>Pincode: <strong className="text-zinc-900">110001</strong></div>
                  <div>Slot: <strong className="text-zinc-900">Weekend Morning</strong></div>
                </div>
                <div className="pt-2">
                  <span className="inline-block w-full text-center py-1.5 bg-forest-900 text-white rounded font-mono font-bold text-[11px]">
                    Accept Pickup
                  </span>
                </div>
              </div>

              <Link to="/login" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  Access Collector Portal
                </Button>
              </Link>
            </div>

            {/* For Admins */}
            <div id="admins" className="bg-[#fafaf9] p-7 sm:p-8 rounded-2xl border border-zinc-200 space-y-6">
              <div className="space-y-1">
                <span className="font-mono text-xs uppercase font-bold text-zinc-600">Audit & Analytics</span>
                <h3 className="text-xl font-bold text-zinc-950">For Admins</h3>
                <p className="text-xs text-zinc-600">
                  System-wide oversight of completed outcomes, material factors, and read-only audit register.
                </p>
              </div>

              {/* Realistic mini stats preview */}
              <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-subtle space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 font-mono">
                  <span className="text-zinc-500">AGGREGATE OVERSIGHT</span>
                  <span className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600 font-bold">
                    DEMO
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                  <div className="p-2 bg-zinc-50 rounded border border-zinc-100">
                    <span className="text-[10px] text-zinc-400 block uppercase">Completed</span>
                    <span className="text-base font-bold text-zinc-900">42 Units</span>
                  </div>
                  <div className="p-2 bg-forest-50 rounded border border-forest-100">
                    <span className="text-[10px] text-forest-800 block uppercase">Estimate</span>
                    <span className="text-base font-bold text-forest-900">28.5 kg in use</span>
                  </div>
                </div>
              </div>

              <Link to="/login" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  Access Admin Oversight
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. IMPACT SECTION (SCIENTIFIC / DATA ORIENTED)                           */}
      {/* ========================================================================= */}
      <section id="impact" className="py-20 md:py-28 border-b border-zinc-200/80 bg-[#fafaf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
              Transparent Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Measure the journey, not just the pickup.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              Completed devices contribute to empirical estimates based strictly on published impact factors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Kept in Use Card */}
            <div className="bg-white p-7 rounded-2xl border border-zinc-200 shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-forest-900">
                  CATEGORY METRIC
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-forest-100 text-forest-900 px-2 py-0.5 rounded">
                  ESTIMATE
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-950">Devices Kept in Use</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Applies when collector-inspected outcome is <strong>REPAIR, REUSE, or RESALE</strong>. Prevents premature landfill disposal and preserves the device's embodied manufacturing energy.
              </p>
            </div>

            {/* Recyclable Materials Card */}
            <div className="bg-white p-7 rounded-2xl border border-zinc-200 shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-forest-900">
                  CATEGORY METRIC
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-forest-100 text-forest-900 px-2 py-0.5 rounded">
                  ESTIMATE
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-950">Recyclable Material Recovered</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Calculated on <strong>RECYCLE</strong> outcomes using published unit weights multiplied by empirical recyclable fraction shares from international characterization baselines.
              </p>
            </div>
          </div>

          <div className="max-w-xl mx-auto text-center text-xs text-zinc-500 font-mono">
            "Calculated from completed device outcomes and configured published impact factors."
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FINAL CTA SECTION                                                    */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 bg-[#052115] text-white relative overflow-hidden">
        {/* Subtle radial ambient */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-emerald-500/10 blur-[120px]"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative z-10">
          <span className="inline-block text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60 font-semibold">
            Civic Electronics Responsibility
          </span>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Your old device still has a next step.
          </h2>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-xl mx-auto leading-relaxed">
            Register it, understand your options, arrange collection, and follow its journey.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto bg-white hover:bg-zinc-100 text-zinc-950 border-0 font-bold">
                Register a Device
                <ArrowRightIcon className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-transparent border-emerald-700/80 text-white hover:bg-white/10">
                Explore the Process
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
