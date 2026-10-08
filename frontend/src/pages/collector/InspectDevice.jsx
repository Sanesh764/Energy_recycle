import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { ArrowLeftIcon, AlertCircleIcon, ShieldCheckIcon } from '../../components/ui/Icons';
import { OUTCOMES, OUTCOME_CONFIG } from '../../config/statusLifecycle';

const OUTCOME_OPTIONS = [
  { value: OUTCOMES.REPAIR, label: 'REPAIR — Refurbish or replace broken parts' },
  { value: OUTCOMES.REUSE, label: 'REUSE — Functional condition for donation/secondary user' },
  { value: OUTCOMES.RESALE, label: 'RESALE — Commercial market value retention' },
  { value: OUTCOMES.RECYCLE, label: 'RECYCLE — Safe material decomposition and recovery' },
];

export function InspectDevice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [outcome, setOutcome] = useState(OUTCOMES.REPAIR);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Boundary notice: Frontend-1 simulation
    setTimeout(() => {
      setSubmitting(false);
      navigate('/collector/my-pickups');
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <Link
        to="/collector/my-pickups"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-emerald-700 font-medium"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to My Pickups
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Physical Device Inspection</h1>
        <p className="text-sm text-slate-500 mt-1">
          Perform hands-on verification and assign certified final outcome.
        </p>
      </div>

      {/* Mandatory SPEC rule banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3">
        <ShieldCheckIcon className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <strong className="block font-semibold text-emerald-950 text-sm mb-0.5">
            Collector Authority Rule (SPEC.md):
          </strong>
          "Collector inspects the device and sets the final outcome. This overrides the AI suggestion. Collector-confirmed outcome becomes the final outcome."
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader
            title="Inspection Determination"
            subtitle="Choose the accurate physical outcome following diagnostic inspection."
          />
          <CardBody className="space-y-5">
            <div>
              <label htmlFor="final-outcome-select" className="block text-sm font-medium text-slate-800 mb-1">
                Final Confirmed Outcome <span className="text-red-600">*</span>
              </label>
              <select
                id="final-outcome-select"
                required
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                {OUTCOME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-slate-500">
                {OUTCOME_CONFIG[outcome]?.description}
              </p>
            </div>

            <Textarea
              id="inspection-note"
              label="Inspection Findings & Justification"
              required
              rows={4}
              maxLength={300}
              placeholder="e.g. Screen functions normally, internal battery diagnostics reveal 84% health. Eligible for refurbishing and secondary reuse."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              helperText="Required audit trail documentation. Maximum 300 characters."
            />
          </CardBody>

          <CardFooter className="justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/collector/my-pickups')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Submit Certified Inspection
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
