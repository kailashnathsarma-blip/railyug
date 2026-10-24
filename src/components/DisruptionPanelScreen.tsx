// Screen 9: Disruption Simulation Control Panel with All 20 Scripted Disruptions
import React, { useState } from 'react';
import { useJourneyStore } from '../store/journeyStore.ts';
import {
  Radio,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { DisruptionEngine } from '../engines/disruptionEngine.ts';

export const DisruptionPanelScreen: React.FC = () => {
  const {
    injectableDisruptions,
    activeDisruptionIds,
    injectDisruption,
    resetAllDisruptions,
    setActiveTab,
  } = useJourneyStore();

  const [selectedDisruptionId, setSelectedDisruptionId] = useState<string>(
    injectableDisruptions[0]?.id || ''
  );

  const disruptionEngine = new DisruptionEngine('rules-v1.0');
  const activeDisruption = injectableDisruptions.find(
    (d) => d.id === selectedDisruptionId
  ) || injectableDisruptions[0];

  const formattedAlert = activeDisruption
    ? disruptionEngine.formatAlert(activeDisruption)
    : null;

  return (
    <section aria-labelledby="disruptions-heading" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 id="disruptions-heading" className="text-2xl font-bold text-railway-blue flex items-center gap-2">
            <Radio className="w-6 h-6 text-railway-saffron" aria-hidden="true" />
            Disruption Simulation Control Panel (20 Scripted Scenarios)
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Simulate real-world operational rail anomalies. Information sources are strictly segregated into Official, Crowd, and Predicted feeds.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={resetAllDisruptions}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors focus:ring-2 focus:ring-slate-400"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset to Base Scenario
          </button>
        </div>
      </div>

      {/* Information Stream Segregation Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs flex items-center space-x-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="font-bold text-blue-950 block">1. OFFICIAL FEED</span>
            <span className="text-slate-600 block text-[11px]">
              Authoritative railway bulletin. Legally verified. Automatically triggers re-planning.
            </span>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs flex items-center space-x-3">
          <div className="p-2 bg-amber-600 text-white rounded-lg">
            <Users className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="font-bold text-amber-950 block">2. CROWD ADVISORY</span>
            <span className="text-slate-600 block text-[11px]">
              Passenger reported rush or ground delays. Shows report count. Does not alter schedules.
            </span>
          </div>
        </div>

        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs flex items-center space-x-3">
          <div className="p-2 bg-purple-600 text-white rounded-lg">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="font-bold text-purple-950 block">3. PREDICTED FORECAST</span>
            <span className="text-slate-600 block text-[11px]">
              Machine learning delay probability models with explicit confidence intervals.
            </span>
          </div>
        </div>
      </div>

      {/* Disruption Flow: What Happened -> What it Affects -> Options with Consequences -> Confirm */}
      {formattedAlert && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  formattedAlert.sourceType === 'OFFICIAL'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : formattedAlert.sourceType === 'CROWD'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-purple-100 text-purple-800 border border-purple-200'
                }`}
              >
                {formattedAlert.badgeLabel}
              </span>
            </div>

            <button
              onClick={() => {
                injectDisruption(activeDisruption.id);
                setActiveTab('plans');
              }}
              className="px-4 py-2 bg-railway-navy hover:bg-railway-blue text-white rounded-lg text-xs font-bold transition-all shadow-sm focus:ring-2 focus:ring-railway-saffron flex items-center gap-1.5"
            >
              Inject This Disruption & Jump to Plans →
            </button>
          </div>

          {/* Sequence Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs pt-1">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Step 1: What Happened
              </span>
              <p className="font-bold text-slate-900 text-sm">{activeDisruption.name}</p>
              <p className="text-slate-600 mt-1">{activeDisruption.description}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Step 2: What It Affects
              </span>
              <p className="font-medium text-slate-800">
                {activeDisruption.effects.connectionBroken
                  ? 'Connection transfer broken (-15m margin). Missed onward train.'
                  : activeDisruption.effects.liftOperational === false
                  ? 'Kota lift out of order. P1 must use 340m ramp incline.'
                  : activeDisruption.effects.violatesRule
                  ? 'Hard caregiver constraint triggered. Action blocked.'
                  : 'Operational timeline and buffer parameters adjusted.'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Step 3: Options Generated
              </span>
              <p className="font-medium text-slate-800">
                Re-planner computes <strong>Plan A</strong> (Guaranteed Express), <strong>Plan B</strong> (Senior Day-Room Rest), and <strong>Plan C</strong> (Safe Fallback Split).
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Step 4: User Confirmation
              </span>
              <p className="text-slate-600">
                Consequence preview dialog displays exact arrival shift and refund implications prior to committing changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid of All 20 Scripted Disruptions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Select From Scripted Disruption Harness (20 Total)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" role="list" aria-label="Scripted Disruptions">
          {injectableDisruptions.map((d, idx) => {
            const isSelected = selectedDisruptionId === d.id;
            const isActive = activeDisruptionIds.includes(d.id);

            return (
              <button
                key={d.id}
                role="listitem"
                onClick={() => setSelectedDisruptionId(d.id)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-railway-saffron ${
                  isSelected
                    ? 'border-railway-navy bg-blue-50/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-500">
                      #{idx + 1}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        d.type === 'OFFICIAL' || d.type === 'COMPOUND_CASCADE'
                          ? 'bg-blue-100 text-blue-800'
                          : d.type === 'CROWD'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {d.type.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 leading-snug">{d.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {d.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-railway-navy font-semibold">Inspect Details →</span>
                  {isActive && (
                    <span className="bg-red-500 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full">
                      ACTIVE
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
