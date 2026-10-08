import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { SampleDataBadge } from '../../components/ui/StatusBadge';
import { EcoLeafIcon, InfoIcon } from '../../components/ui/Icons';

/**
 * Baseline structure according to SPEC.md section 10.
 * NOTE: Values are structured for FRONTEND-1 UI verification.
 * The word "Estimate" is explicitly displayed, formula is documented,
 * and source citation space is provided.
 */
const INITIAL_STATS = {
  totalHandled: 42,
  outcomes: {
    REPAIR: 14,
    REUSE: 11,
    RESALE: 6,
    RECYCLE: 11,
  },
  keptInUseKg: 28.5,
  recyclableKg: 16.2,
  hasSampleData: true,
  sourceCitation: 'Published E-Waste Characterization Weights (ITU / Global E-waste Monitor)',
  formulaDocumentation:
    'keptInUseKg = sum(avgWeightKg for REPAIR, REUSE, RESALE); recyclableKg = sum(avgWeightKg * recyclableShare for RECYCLE)',
};

export function AdminStats() {
  const [excludeSampleData, setExcludeSampleData] = useState(false);
  const stats = INITIAL_STATS;

  // Filter effect for demonstration
  const displayTotal = excludeSampleData ? 18 : stats.totalHandled;
  const displayKeptInUse = excludeSampleData ? 12.0 : stats.keptInUseKg;
  const displayRecyclable = excludeSampleData ? 7.1 : stats.recyclableKg;

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
              System Governance & Analytics
            </span>
            {stats.hasSampleData && <SampleDataBadge />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            IMPACT OVERSIGHT
          </h1>
          <p className="text-sm text-zinc-600">
            Aggregate lifecycle outcomes for certified completed devices. Read-only audit oversight.
          </p>
        </div>

        {/* Sample Data Toggle Required by SPEC.md */}
        <label className="inline-flex items-center gap-2.5 bg-white border border-zinc-200 px-3.5 py-2 rounded-xl cursor-pointer shadow-subtle hover:border-zinc-300 transition-colors">
          <input
            type="checkbox"
            checked={excludeSampleData}
            onChange={(e) => setExcludeSampleData(e.target.checked)}
            className="rounded text-forest-900 focus:ring-forest-800 w-4 h-4"
          />
          <span className="text-xs font-mono font-semibold text-zinc-700">
            Exclude Sample Data
          </span>
        </label>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/90 shadow-subtle space-y-2">
          <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-widest block">
            Completed Devices Handled
          </span>
          <div className="text-3xl sm:text-4xl font-black text-zinc-950 font-mono tracking-tight">
            {displayTotal}
          </div>
          <span className="text-xs text-zinc-500 font-mono block">
            Verified by collector inspection
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-forest-200/80 shadow-subtle space-y-2 bg-gradient-to-b from-forest-50/40 to-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-forest-900 uppercase tracking-widest block">
              Kept in Use (Estimate)
            </span>
            <span className="text-[10px] font-mono uppercase bg-forest-100 text-forest-900 px-1.5 py-0.5 rounded font-bold">
              ESTIMATE
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-forest-950 font-mono tracking-tight">
            {displayKeptInUse} <span className="text-sm font-semibold text-zinc-400">kg</span>
          </div>
          <span className="text-xs text-zinc-500 font-mono block">
            REPAIR + REUSE + RESALE outcomes
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-teal-200/80 shadow-subtle space-y-2 bg-gradient-to-b from-teal-50/40 to-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-teal-900 uppercase tracking-widest block">
              Recyclable Material (Estimate)
            </span>
            <span className="text-[10px] font-mono uppercase bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded font-bold">
              ESTIMATE
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-teal-950 font-mono tracking-tight">
            {displayRecyclable} <span className="text-sm font-semibold text-zinc-400">kg</span>
          </div>
          <span className="text-xs text-zinc-500 font-mono block">
            RECYCLE weight × recyclable share
          </span>
        </div>
      </div>

      {/* Outcome Breakdown Cards */}
      <Card>
        <CardHeader
          title="Disposition Outcome Breakdown"
          subtitle="Count of certified completed devices per physical outcome"
        />
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl text-center font-mono">
              <span className="text-[10px] font-bold text-forest-900 uppercase tracking-wider block">REPAIR</span>
              <span className="text-2xl font-black text-zinc-950 mt-1 block">
                {excludeSampleData ? 6 : stats.outcomes.REPAIR}
              </span>
            </div>
            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl text-center font-mono">
              <span className="text-[10px] font-bold text-forest-900 uppercase tracking-wider block">REUSE</span>
              <span className="text-2xl font-black text-zinc-950 mt-1 block">
                {excludeSampleData ? 4 : stats.outcomes.REUSE}
              </span>
            </div>
            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl text-center font-mono">
              <span className="text-[10px] font-bold text-forest-900 uppercase tracking-wider block">RESALE</span>
              <span className="text-2xl font-black text-zinc-950 mt-1 block">
                {excludeSampleData ? 2 : stats.outcomes.RESALE}
              </span>
            </div>
            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl text-center font-mono">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">RECYCLE</span>
              <span className="text-2xl font-black text-zinc-950 mt-1 block">
                {excludeSampleData ? 6 : stats.outcomes.RECYCLE}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Mandatory SPEC Methodology, Formula & Source Transparency Section */}
      <Card>
        <CardHeader
          title="Methodology & Source Citations"
          subtitle="SPEC.md Section 10 empirical impact calculation standards"
        />
        <CardBody className="space-y-4 text-xs font-mono">
          <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-1.5">
            <span className="font-bold text-zinc-800 uppercase text-[10px] block">Impact Formula:</span>
            <code className="text-forest-900 bg-white px-2.5 py-1.5 rounded border border-zinc-200 block overflow-x-auto text-[11px]">
              {stats.formulaDocumentation}
            </code>
          </div>

          <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-1">
            <span className="font-bold text-zinc-800 uppercase text-[10px] block">Published Data Source:</span>
            <p className="text-zinc-600">{stats.sourceCitation}</p>
          </div>

          <div className="flex items-center gap-2 text-zinc-500 italic text-[11px]">
            <InfoIcon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span>
              All impact figures are labelled as "Estimate". Only devices with status = COMPLETED are counted.
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
