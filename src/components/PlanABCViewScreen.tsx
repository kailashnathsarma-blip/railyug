// Screen 4: Plan A, Plan B, and Plan C Multi-Plan Re-planning View
import React, { useState } from 'react';
import { useJourneyStore } from '../store/journeyStore.ts';
import {
  Compass,
  Cpu,
  CheckCircle2,
  Clock,
  ShieldCheck,
  IndianRupee,
  Train,
  Bus,
  ArrowRight,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { OverrideConsequenceModal } from './OverrideConsequenceModal.tsx';
import { IRCTCHandOffModal } from './IRCTCHandOffModal.tsx';

export const PlanABCViewScreen: React.FC = () => {
  const { currentReplanResult, activePlanId, selectActivePlan, setActiveTab } = useJourneyStore();
  const [overrideTargetPlan, setOverrideTargetPlan] = useState<any | null>(null);
  const [handOffOption, setHandOffOption] = useState<any | null>(null);

  if (!currentReplanResult) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-600 text-sm">Generating Plans within compute budget...</p>
      </div>
    );
  }

  const plans = [
    { key: 'PLAN_A', plan: currentReplanResult.planA, label: 'Plan A: Guaranteed Same-Day Express' },
    { key: 'PLAN_B', plan: currentReplanResult.planB, label: 'Plan B: Senior Rest Layover (Retiring Room)' },
    { key: 'PLAN_C', plan: currentReplanResult.planC, label: 'Plan C: Coordinated Multi-Modal Split' },
  ];

  return (
    <section aria-labelledby="plans-heading" className="space-y-6">
      {/* Header and Compute Budget Badge */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 id="plans-heading" className="text-2xl font-bold text-railway-blue flex items-center gap-2">
            <Compass className="w-6 h-6 text-railway-saffron" aria-hidden="true" />
            Adaptive Multi-Plan Re-Planner (Plans A, B & C)
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Deterministic re-planning generates three distinct verified contingency plans while preserving all mobility constraints.
          </p>
        </div>

        {/* Compute Budget Telemetry */}
        <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800 text-xs font-mono self-start sm:self-auto">
          <div className="flex items-center space-x-1.5 text-railway-saffron font-bold mb-1">
            <Cpu className="w-4 h-4" aria-hidden="true" />
            <span>Compute Engine Budget</span>
          </div>
          <div className="flex justify-between gap-3 text-slate-300">
            <span>Execution Time:</span>
            <span className="font-bold text-emerald-400">
              {currentReplanResult.computeDurationMs} ms
            </span>
          </div>
          <div className="flex justify-between gap-3 text-slate-300">
            <span>Budget Ceiling:</span>
            <span>{currentReplanResult.computeBudgetMs} ms</span>
          </div>
          <div className="mt-1 pt-1 border-t border-slate-800 flex justify-between gap-3 text-[11px]">
            <span>Met Budget:</span>
            <span className="text-emerald-400 font-bold">
              {currentReplanResult.metBudget ? 'PASSED (100%)' : 'EXCEEDED'}
            </span>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" role="list" aria-label="Alternative Plans A, B, and C">
        {plans.map(({ key, plan, label }) => {
          const isCurrentActive = activePlanId === key;

          return (
            <article
              key={key}
              role="listitem"
              className={`bg-white rounded-xl border-2 p-6 flex flex-col justify-between shadow-sm transition-all ${
                isCurrentActive
                  ? 'border-railway-navy shadow-lg ring-2 ring-railway-navy/30'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`font-mono text-xs font-bold px-2.5 py-1 rounded ${
                      isCurrentActive
                        ? 'bg-railway-navy text-white'
                        : 'bg-slate-100 text-slate-800 border border-slate-300'
                    }`}
                  >
                    {key.replace('_', ' ')}
                  </span>
                  {isCurrentActive && (
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      Active Selection
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-bold text-slate-900 mb-1">{plan.name}</h2>
                <p className="text-xs text-railway-navy font-semibold mb-3">
                  {plan.oneLineReason}
                </p>

                {/* Plan Highlights */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2.5 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expected Arrival Range:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {plan.p10Arrival.slice(11, 16)} – {plan.p90Arrival.slice(11, 16)} IST
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Group Fare:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{plan.totalFareINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Confidence Likelihood:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {Math.round(plan.confidenceRange.lower * 100)}% –{' '}
                      {Math.round(plan.confidenceRange.upper * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Step-Free Accessibility:</span>
                    <span className="font-bold text-emerald-700">100% Preserved</span>
                  </div>
                </div>

                {/* Leg Segments */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-700 block">Itinerary Segments:</span>
                  {plan.legs.map((leg, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Train className="w-4 h-4 text-railway-navy" aria-hidden="true" />
                        <div>
                          <span className="font-bold text-slate-900">
                            {leg.trainNumber} {leg.trainName}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {leg.origin} → {leg.destination}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300">
                        {leg.status}
                      </span>
                    </div>
                  ))}

                  {/* Split details if Plan C */}
                  {plan.splits && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-[11px] text-purple-950 mt-2 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <Bus className="w-3.5 h-3.5 text-purple-700" aria-hidden="true" />
                        Partition: P1–P4 Rail / P5 Express Bus
                      </div>
                      <p>
                        <strong>P5 Solo:</strong> {plan.splits.tradeOff.gained[0]}
                      </p>
                      <p className="text-purple-800">
                        <strong>Contingency:</strong> {plan.splits.tradeOff.contingencyPlan}
                      </p>
                    </div>
                  )}
                </div>

                {/* Trade-off Callout */}
                <div className="mt-4 p-3 bg-amber-50/70 rounded-lg border border-amber-200 text-[11px] text-amber-950">
                  <strong>Trade-off:</strong> {plan.tradeOffSummary}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-200 space-y-2">
                <button
                  onClick={() => {
                    if (activePlanId !== key) {
                      setOverrideTargetPlan({ key, plan });
                    }
                  }}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-railway-saffron ${
                    isCurrentActive
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-railway-navy hover:bg-railway-blue text-white'
                  }`}
                >
                  {isCurrentActive ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      Currently Active Plan
                    </>
                  ) : (
                    <>
                      Switch to {key.replace('_', ' ')} (Preview Consequences) →
                    </>
                  )}
                </button>

                <button
                  onClick={() => setHandOffOption(plan)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-slate-400"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                  Prepared IRCTC Booking Handoff
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Override Consequence Preview Modal */}
      {overrideTargetPlan && (
        <OverrideConsequenceModal
          targetPlanKey={overrideTargetPlan.key}
          targetPlan={overrideTargetPlan.plan}
          currentPlanId={activePlanId}
          onConfirm={() => {
            selectActivePlan(overrideTargetPlan.key);
            setOverrideTargetPlan(null);
          }}
          onClose={() => setOverrideTargetPlan(null)}
        />
      )}

      {/* IRCTC Hand-Off Modal */}
      {handOffOption && (
        <IRCTCHandOffModal
          option={handOffOption}
          onClose={() => setHandOffOption(null)}
        />
      )}
    </section>
  );
};
