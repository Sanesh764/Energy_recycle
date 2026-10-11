import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { SampleDataBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EcoLeafIcon, InfoIcon, ShieldCheckIcon } from '../../components/ui/Icons';
import { adminApi } from '../../services/api';

export function AdminStats() {
  const [excludeSampleData, setExcludeSampleData] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getStats({ excludeSample: excludeSampleData });
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setError(err.message || 'Unable to retrieve admin statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [excludeSampleData]);

  if (loading && !stats) {
    return <LoadingState message="Aggregating verified completed devices and environmental metrics..." />;
  }

  if (error && !stats) {
    return (
      <ErrorState
        title="Failed to Load Statistics"
        message={error}
        onRetry={fetchStats}
      />
    );
  }

  const outcomes = stats?.outcomes || { REPAIR: 0, REUSE: 0, RESALE: 0, RECYCLE: 0 };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
              System Governance & Analytics
            </span>
            {stats?.hasSampleData && <SampleDataBadge />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            IMPACT OVERSIGHT
          </h1>
          <p className="text-sm text-zinc-600">
            Aggregate lifecycle outcomes for certified completed devices. Read-only audit oversight.
          </p>
        </div>

        {/* Sample Data Toggle Required by SPEC.md Section 10 */}
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
            {stats?.totalHandled ?? 0}
          </div>
          <span className="text-xs text-zinc-500 font-mono block">
            Verified by certified collector inspection
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
            {stats?.keptInUseKg}{' '}
            {typeof stats?.keptInUseKg === 'number' && (
              <span className="text-sm font-semibold text-zinc-400">kg</span>
            )}
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
            {stats?.recyclableKg}{' '}
            {typeof stats?.recyclableKg === 'number' && (
              <span className="text-sm font-semibold text-zinc-400">kg</span>
            )}
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
          subtitle="Count of certified completed devices per verified physical outcome"
        />
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl text-center font-mono">
              <span className="text-[10px] font-bold text-forest-900 uppercase tracking-wider block">REPAIR</span>
              <span className="text-2xl font-black text-zinc-950 mt-1 block">
                {outcomes.REPAIR}
              </span>
            </div>
            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl text-center font-mono">
              <span className="text-[10px] font-bold text-forest-900 uppercase tracking-wider block">REUSE</span>
              <span className="text-2xl font-black text-zinc-950 mt-1 block">
                {outcomes.REUSE}
              </span>
            </div>
            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl text-center font-mono">
              <span className="text-[10px] font-bold text-forest-900 uppercase tracking-wider block">RESALE</span>
              <span className="text-2xl font-black text-zinc-950 mt-1 block">
                {outcomes.RESALE}
              </span>
            </div>
            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl text-center font-mono">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">RECYCLE</span>
              <span className="text-2xl font-black text-zinc-950 mt-1 block">
                {outcomes.RECYCLE}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Mandatory SPEC Methodology, Formula & Source Transparency Section */}
      <Card>
        <CardHeader
          title="Methodology & Empirical Source Citations"
          subtitle="SPEC.md Section 10 empirical impact calculation standards"
        />
        <CardBody className="space-y-4 text-xs font-mono">
          <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-1.5">
            <span className="font-bold text-zinc-800 uppercase text-[10px] block">Impact Formula:</span>
            <code className="text-forest-900 bg-white px-2.5 py-1.5 rounded border border-zinc-200 block overflow-x-auto text-[11px]">
              {stats?.formulaDocumentation}
            </code>
          </div>

          <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-1">
            <span className="font-bold text-zinc-800 uppercase text-[10px] block">Published Data Source:</span>
            <p className="text-zinc-600 leading-relaxed">{stats?.sourceCitation}</p>
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
