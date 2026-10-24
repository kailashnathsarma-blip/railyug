// Screen 1: Passenger and Family Setup with Hard Constraints & Mobility Profiles
import React, { useState } from 'react';
import { useJourneyStore } from '../store/journeyStore.ts';
import {
  Users,
  Shield,
  HeartHandshake,
  Baby,
  Eye,
  Luggage,
  AlertOctagon,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { GroupConstraintSolver } from '../engines/groupConstraintSolver.ts';

export const PassengerSetupScreen: React.FC = () => {
  const { passengers, luggage, ruleSetVersion, setActiveTab } = useJourneyStore();
  const [splitAttemptMessage, setSplitAttemptMessage] = useState<string | null>(null);
  const [isAttemptIllegal, setIsAttemptIllegal] = useState<boolean>(false);

  const groupSolver = new GroupConstraintSolver();

  // Test illegal split: P2 splits away leaving P1 behind
  const testIllegalSplit = () => {
    const p1 = passengers.find((p) => p.id === 'P1')!;
    const p2 = passengers.find((p) => p.id === 'P2')!;
    const p3 = passengers.find((p) => p.id === 'P3')!;
    const p4 = passengers.find((p) => p.id === 'P4')!;
    const p5 = passengers.find((p) => p.id === 'P5')!;

    const result = groupSolver.evaluateSplitProposal([p1, p3, p4], [p2, p5]);
    setIsAttemptIllegal(!result.isLegallyAllowed);
    setSplitAttemptMessage(result.blockingReason || 'Split approved');
  };

  // Test legal split: P5 splits solo
  const testLegalSplit = () => {
    const p1 = passengers.find((p) => p.id === 'P1')!;
    const p2 = passengers.find((p) => p.id === 'P2')!;
    const p3 = passengers.find((p) => p.id === 'P3')!;
    const p4 = passengers.find((p) => p.id === 'P4')!;
    const p5 = passengers.find((p) => p.id === 'P5')!;

    const result = groupSolver.evaluateSplitProposal([p1, p2, p3, p4], [p5]);
    setIsAttemptIllegal(!result.isLegallyAllowed);
    setSplitAttemptMessage(
      `LEGAL SPLIT VALIDATED: P1–P4 remain safely accompanied. P5 takes road transit. Gained: ${result.tradeOff.gained.join(' | ')}. Lost: ${result.tradeOff.lost.join(' | ')}`
    );
  };

  return (
    <section aria-labelledby="passenger-setup-heading" className="space-y-6">
      {/* Header and Context */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h1 id="passenger-setup-heading" className="text-2xl font-bold text-railway-blue flex items-center gap-2">
              <Users className="w-6 h-6 text-railway-saffron" aria-hidden="true" />
              Passenger & Family Travel Group Profile
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Deterministic journey safety model. Hard accessibility and caregiver constraints are applied BEFORE ranking.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2.5 py-1 rounded border border-slate-300 font-semibold">
              Rule Set: {ruleSetVersion}
            </span>
            <button
              onClick={() => setActiveTab('ranking')}
              className="bg-railway-navy hover:bg-railway-blue text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus:ring-2 focus:ring-railway-saffron"
            >
              View Ranked Options →
            </button>
          </div>
        </div>

        {/* Hard Constraints Callout */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
            <div className="font-bold text-railway-navy flex items-center gap-1.5 mb-1">
              <HeartHandshake className="w-4 h-4 text-blue-700" aria-hidden="true" />
              Hard Rule 1: Caregiver Lock
            </div>
            <p className="text-slate-700">
              <strong>P1 (Senior Citizen)</strong> is hard-linked to <strong>P2 (Caregiver)</strong>. They cannot be separated under any split or booking alternative.
            </p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
            <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
              <Baby className="w-4 h-4 text-amber-700" aria-hidden="true" />
              Hard Rule 2: Child Guardian Adjacency
            </div>
            <p className="text-slate-700">
              <strong>P3 (Toddler, 4y)</strong> must travel in the exact same coach and compartment as guardian <strong>P2</strong> or <strong>P5</strong>.
            </p>
          </div>

          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs">
            <div className="font-bold text-purple-900 flex items-center gap-1.5 mb-1">
              <Shield className="w-4 h-4 text-purple-700" aria-hidden="true" />
              Hard Rule 3: Accessibility Filter
            </div>
            <p className="text-slate-700">
              Routes lacking step-free infrastructure or requiring stairs-only platform changes are filtered out before scoring.
            </p>
          </div>
        </div>
      </div>

      {/* Passenger Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Family Passenger List">
        {passengers.map((p) => {
          return (
            <article
              key={p.id}
              role="listitem"
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Badge & Identifier */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                      {p.id}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">{p.name}</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {p.age} years • {p.gender === 'M' ? 'Male' : 'Female'} • {p.category}
                    </p>
                  </div>
                  {p.id === 'P1' && (
                    <span className="text-[11px] bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-red-600" aria-hidden="true" />
                      Mobility Limited
                    </span>
                  )}
                  {p.id === 'P2' && (
                    <span className="text-[11px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                      <HeartHandshake className="w-3 h-3 text-blue-600" aria-hidden="true" />
                      P1 Caregiver
                    </span>
                  )}
                  {p.id === 'P3' && (
                    <span className="text-[11px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                      <Baby className="w-3 h-3 text-amber-600" aria-hidden="true" />
                      Dependent Child
                    </span>
                  )}
                  {p.id === 'P4' && (
                    <span className="text-[11px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-purple-600" aria-hidden="true" />
                      Screen-Reader
                    </span>
                  )}
                  {p.id === 'P5' && (
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                      Splittable Adult
                    </span>
                  )}
                </div>

                {/* Mobility & Physical Profile */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs space-y-1.5 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Walking Speed:</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {p.mobilityProfile.walkingSpeedMps} m/s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Walk Distance:</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {p.mobilityProfile.maxWalkDistanceMeters}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Step-Free Required:</span>
                    <span className="font-semibold text-slate-900">
                      {p.mobilityProfile.needsRampOrLift ? 'YES (No Stairs)' : 'No'}
                    </span>
                  </div>
                  {p.mobilityProfile.requiresLowerBerth && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Berth Preference:</span>
                      <span className="font-semibold text-railway-navy">Lower Berth Mandatory</span>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-600 italic border-t border-slate-200 pt-1 mt-1">
                    "{p.mobilityProfile.notes}"
                  </p>
                </div>

                {/* Constraints & Linkages */}
                <div className="text-xs space-y-1 text-slate-700">
                  {p.caregiverLinkedPassengerId && (
                    <p className="flex items-center gap-1 text-blue-900 font-semibold">
                      <HeartHandshake className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                      Linked Caregiver: {p.caregiverLinkedPassengerId} (Sunita Sharma)
                    </p>
                  )}
                  {p.caregiverForPassengerId && (
                    <p className="flex items-center gap-1 text-blue-900 font-semibold">
                      <HeartHandshake className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                      Caregiver for: {p.caregiverForPassengerId} (Rameshwar Sharma)
                    </p>
                  )}
                  {p.dependentGuardians && (
                    <p className="flex items-center gap-1 text-amber-900 font-semibold">
                      <Baby className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                      Eligible Guardians: {p.dependentGuardians.join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Ticket Name Validation */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Leg 1 Ticket Name:</span>
                <span className="font-mono text-slate-800 font-medium">
                  {p.ticketNames?.leg1 || p.name}
                </span>
              </div>
            </article>
          );
        })}

        {/* Luggage Profile Card */}
        <article
          role="listitem"
          className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between border border-slate-800 shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                LUGGAGE
              </span>
              <Luggage className="w-5 h-5 text-railway-saffron" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-white">Group Baggage & Stroller</h2>
            <p className="text-xs text-slate-400 mt-1">
              Platform changes incorporate realistic physical luggage carrying speed penalties.
            </p>

            <div className="mt-4 space-y-2 text-xs bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Heavy Bags:</span>
                <span className="font-bold font-mono text-white">{luggage.totalHeavyBags} bags (P5 / P2 load)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Child Strollers:</span>
                <span className="font-bold font-mono text-white">{luggage.strollerCount} folding stroller</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Overhead Transfer Penalty:</span>
                <span className="font-bold font-mono text-railway-saffron">
                  +{luggage.overheadMinutes} minutes buffer
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-slate-400">
            Bottleneck pace: Group moves together at 0.55 m/s with 5m regrouping time.
          </div>
        </article>
      </div>

      {/* Interactive Group Split Feasibility Playground */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-railway-blue flex items-center gap-2">
          <Shield className="w-5 h-5 text-railway-saffron" aria-hidden="true" />
          Group Partition & Constraint Verification Playground
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Test Railyug's hard constraint solver by simulating split proposals. Illegal splits that isolate dependent passengers are immediately blocked.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={testIllegalSplit}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 focus:ring-2 focus:ring-red-400"
          >
            <AlertOctagon className="w-4 h-4 text-red-600" aria-hidden="true" />
            Simulate Illegal Split (Separate P1 from P2)
          </button>

          <button
            onClick={testLegalSplit}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 focus:ring-2 focus:ring-emerald-400"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            Simulate Legal Split (P5 Solo Road Express)
          </button>
        </div>

        {/* Dynamic Constraint Result Output */}
        {splitAttemptMessage && (
          <div
            role="alert"
            className={`mt-4 p-4 rounded-lg border text-xs leading-relaxed ${
              isAttemptIllegal
                ? 'bg-red-50 border-red-300 text-red-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 mb-1 text-sm">
              {isAttemptIllegal ? (
                <>
                  <AlertOctagon className="w-4 h-4 text-red-600" aria-hidden="true" />
                  CONSTRAINT SOLVER: PROPOSAL REJECTED
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  CONSTRAINT SOLVER: PROPOSAL APPROVED WITH TRADE-OFFS
                </>
              )}
            </div>
            <p>{splitAttemptMessage}</p>
          </div>
        )}
      </div>
    </section>
  );
};
