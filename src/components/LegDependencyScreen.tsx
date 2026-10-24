// Screen 3: Leg Dependency Comparison (Keep vs Cancel vs Re-route) with Live Deadlines
import React from 'react';
import { useJourneyStore } from '../store/journeyStore.ts';
import {
  GitFork,
  AlertTriangle,
  Clock,
  IndianRupee,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';

export const LegDependencyScreen: React.FC = () => {
  const { legDependency, legs, passengers, selectActivePlan, setActiveTab } = useJourneyStore();

  if (!legDependency) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-600 text-sm">Evaluating leg dependencies...</p>
      </div>
    );
  }

  return (
    <section aria-labelledby="dependency-heading" className="space-y-6">
      {/* Header and Strategic Coupling Alert */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 id="dependency-heading" className="text-2xl font-bold text-railway-blue flex items-center gap-2">
              <GitFork className="w-6 h-6 text-railway-saffron" aria-hidden="true" />
              Coupled Leg Dependency & Strategic Dilemma
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Leg 1 is confirmed, but onward Leg 2 is waitlisted (WL 7–10). How should the family proceed before the penalty cliffs?
            </p>
          </div>
          <span className="text-xs bg-red-100 text-red-800 font-bold px-3 py-1.5 rounded-full border border-red-300 flex items-center gap-1 self-start sm:self-auto">
            <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden="true" />
            Strategic Coupling Alert
          </span>
        </div>

        {/* Current Journey Leg Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
            <div className="flex items-center justify-between font-bold text-emerald-950 mb-1">
              <span>Leg 1: {legs[0].trainNumber} {legs[0].trainName}</span>
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                CONFIRMED (B3)
              </span>
            </div>
            <p className="text-slate-700">
              {legs[0].originName} → {legs[0].destinationName} • Paid ₹{legs[0].farePaidTotal}
            </p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs">
            <div className="flex items-center justify-between font-bold text-amber-950 mb-1">
              <span>Leg 2: {legs[1].trainNumber} {legs[1].trainName}</span>
              <span className="bg-amber-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                WAITLISTED (WL 7-10)
              </span>
            </div>
            <p className="text-slate-700">
              {legs[1].originName} → {legs[1].destinationName} • Confirmation Likelihood: 38%–54% (Uncertain)
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-950">
          <strong>The Dependency Trap:</strong> If Leg 2 fails to confirm at chart preparation (23:55 IST), the family will already be on board Train 1 or stranded at Kota Junction with vulnerable senior P1 and child P3 with no onward berths.
        </div>
      </div>

      {/* 3-Way Comparative Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" role="list" aria-label="Leg Dependency Alternatives">
        {legDependency.options.map((opt) => {
          const isRecommended = opt.recommendationLevel === 'RECOMMENDED';
          const isNotRecommended = opt.recommendationLevel === 'NOT_RECOMMENDED';

          return (
            <article
              key={opt.optionKey}
              role="listitem"
              className={`bg-white rounded-xl border-2 p-6 flex flex-col justify-between shadow-sm transition-all ${
                isRecommended
                  ? 'border-railway-navy shadow-md ring-2 ring-railway-navy/20'
                  : isNotRecommended
                  ? 'border-red-200 bg-red-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isRecommended
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isNotRecommended
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-slate-100 text-slate-800 border border-slate-300'
                    }`}
                  >
                    {isRecommended ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                        RECOMMENDED
                      </>
                    ) : isNotRecommended ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
                        HIGH STRANDING RISK
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                        DEFENSIVE ABORT
                      </>
                    )}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {opt.optionKey}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 mb-1">{opt.title}</h2>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{opt.summary}</p>

                {/* Key Metrics */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  {/* Probability of Reaching Destination */}
                  <div>
                    <span className="text-slate-500 block mb-0.5">
                      Probability of Reaching Destination:
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm block">
                      {Math.round(opt.probabilityReachingDestination.lower * 100)}% –{' '}
                      {Math.round(opt.probabilityReachingDestination.upper * 100)}%
                    </span>
                    <span className="text-[11px] text-slate-500 italic block mt-0.5">
                      {opt.probabilityReachingDestination.assumption}
                    </span>
                  </div>

                  {/* Expected Financial Cost */}
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block mb-0.5">Expected Net Outlay:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm block">
                      ₹{opt.expectedNetCostINR.toLocaleString('en-IN')}
                    </span>
                    {opt.refundImpactINR > 0 && (
                      <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                        Recoverable refund: +₹{opt.refundImpactINR.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Worst Case Scenario */}
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-red-700 font-bold block mb-0.5 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                      Worst Case Scenario:
                    </span>
                    <p className="text-slate-700 text-[11px] leading-normal font-medium">
                      {opt.worstCaseScenario}
                    </p>
                  </div>
                </div>

                {/* Per-Passenger Refund Breakdown if available */}
                {opt.refundImpactINR > 0 && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200 text-xs">
                    <span className="font-bold text-slate-800 block mb-1">
                      Refund Credit Impact Per Passenger:
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-600">
                      {Object.entries(opt.refundBreakdownPerPassenger).map(([pId, refund]) => (
                        <div key={pId} className="flex justify-between">
                          <span>{pId}:</span>
                          <span className="font-bold text-slate-900">₹{refund}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Deadline & Decision Action */}
              <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                    Decision Deadline:
                  </span>
                  <span className="font-mono font-bold text-amber-800">
                    {opt.deadlineMinutesRemaining} mins remaining
                  </span>
                </div>

                {isRecommended ? (
                  <button
                    onClick={() => {
                      selectActivePlan('PLAN_A');
                      setActiveTab('plans');
                    }}
                    className="w-full py-2.5 bg-railway-navy hover:bg-railway-blue text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-railway-saffron"
                  >
                    Execute Re-Route Plan (Plan A) →
                  </button>
                ) : isNotRecommended ? (
                  <button
                    onClick={() => {
                      selectActivePlan('ORIGINAL');
                      setActiveTab('plans');
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Hold Existing Tickets
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveTab('ledger');
                    }}
                    className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-lg text-xs font-semibold"
                  >
                    Initiate Total Cancellation →
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
