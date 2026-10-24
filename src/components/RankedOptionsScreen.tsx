// Screen 2: Ranked Options with Wilson Ranges, Dynamic Priority Sliders, Diff Announcements, and IRCTC Hand-Off
import React, { useState } from 'react';
import { useJourneyStore } from '../store/journeyStore.ts';
import {
  Sliders,
  TrendingUp,
  Clock,
  IndianRupee,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  Check,
  ExternalLink,
} from 'lucide-react';
import { IRCTCHandOffModal } from './IRCTCHandOffModal.tsx';

export const RankedOptionsScreen: React.FC = () => {
  const {
    rankedOptions,
    weights,
    setRankingWeights,
    rankingDiffs,
    ruleSetVersion,
    selectActivePlan,
    activePlanId,
  } = useJourneyStore();

  const [handOffOption, setHandOffOption] = useState<any | null>(null);

  const handleSliderChange = (key: keyof typeof weights, value: number) => {
    setRankingWeights({ [key]: value / 100 });
  };

  return (
    <section aria-labelledby="ranking-heading" className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 id="ranking-heading" className="text-2xl font-bold text-railway-blue flex items-center gap-2">
            <Sliders className="w-6 h-6 text-railway-saffron" aria-hidden="true" />
            Ranked Journey Options with Uncertainty Ranges
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Every itinerary is scored deterministically based on risk-adjusted arrival (P10–P90), confirmation likelihood, and accessibility compliance.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded border border-slate-300">
            Engine: {ruleSetVersion}
          </span>
        </div>
      </div>

      {/* Priority Tuning Sliders */}
      <div
        className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-sm space-y-4"
        aria-label="User Priority Tuning"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-railway-saffron" aria-hidden="true" />
            <h2 className="text-base font-bold text-white">Interactive Priority Tuning & Deterministic Weighting</h2>
          </div>
          <span className="text-xs text-slate-400">
            Adjusting weights immediately triggers re-ranking and computes diff explanations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {/* Speed / Urgent Arrival */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label htmlFor="speed-slider" className="font-semibold text-slate-200">
                Speed / Early Arrival:
              </label>
              <span className="font-mono text-railway-saffron font-bold">
                {Math.round(weights.speedWeight * 100)}%
              </span>
            </div>
            <input
              id="speed-slider"
              type="range"
              min="0"
              max="100"
              value={Math.round(weights.speedWeight * 100)}
              onChange={(e) => handleSliderChange('speedWeight', Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-railway-saffron focus:outline-none focus:ring-2 focus:ring-railway-saffron"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(weights.speedWeight * 100)}
              aria-valuetext={`${Math.round(weights.speedWeight * 100)} percent speed priority`}
            />
          </div>

          {/* Cost Importance */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label htmlFor="cost-slider" className="font-semibold text-slate-200">
                Budget / Cost Priority:
              </label>
              <span className="font-mono text-emerald-400 font-bold">
                {Math.round(weights.costWeight * 100)}%
              </span>
            </div>
            <input
              id="cost-slider"
              type="range"
              min="0"
              max="100"
              value={Math.round(weights.costWeight * 100)}
              onChange={(e) => handleSliderChange('costWeight', Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(weights.costWeight * 100)}
              aria-valuetext={`${Math.round(weights.costWeight * 100)} percent cost priority`}
            />
          </div>

          {/* Comfort & Accessibility */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label htmlFor="comfort-slider" className="font-semibold text-slate-200">
                Comfort & Ground Rest:
              </label>
              <span className="font-mono text-blue-400 font-bold">
                {Math.round(weights.comfortWeight * 100)}%
              </span>
            </div>
            <input
              id="comfort-slider"
              type="range"
              min="0"
              max="100"
              value={Math.round(weights.comfortWeight * 100)}
              onChange={(e) => handleSliderChange('comfortWeight', Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(weights.comfortWeight * 100)}
              aria-valuetext={`${Math.round(weights.comfortWeight * 100)} percent comfort priority`}
            />
          </div>

          {/* Risk Tolerance */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label htmlFor="risk-slider" className="font-semibold text-slate-200">
                Risk Aversion / Certainty:
              </label>
              <span className="font-mono text-purple-400 font-bold">
                {Math.round(weights.riskToleranceWeight * 100)}%
              </span>
            </div>
            <input
              id="risk-slider"
              type="range"
              min="0"
              max="100"
              value={Math.round(weights.riskToleranceWeight * 100)}
              onChange={(e) => handleSliderChange('riskToleranceWeight', Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(weights.riskToleranceWeight * 100)}
              aria-valuetext={`${Math.round(weights.riskToleranceWeight * 100)} percent risk aversion`}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Ranking Diff Region (polite aria-live) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="space-y-2"
        role="region"
        aria-label="Ranking Position Shifts and Explanations"
      >
        {rankingDiffs.length > 0 && (
          <div className="bg-blue-50 border border-blue-300 p-4 rounded-xl text-blue-950 text-xs shadow-sm">
            <div className="font-bold flex items-center gap-1.5 text-sm mb-1.5">
              <TrendingUp className="w-4 h-4 text-blue-700" aria-hidden="true" />
              Dynamic Ranking Diff Generated (Rule Engine Explanation):
            </div>
            <ul className="space-y-1 list-disc list-inside">
              {rankingDiffs.map((diff, idx) => (
                <li key={idx} className="font-medium">
                  {diff.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Ranked Options Cards */}
      <div className="space-y-4" role="list" aria-label="Ranked Journey Options">
        {rankedOptions.map((opt) => {
          const isSelected = activePlanId === opt.optionId;

          return (
            <article
              key={opt.optionId}
              role="listitem"
              className={`bg-white rounded-xl border-2 transition-all p-6 shadow-sm ${
                opt.rank === 1
                  ? 'border-railway-navy shadow-md ring-1 ring-railway-navy/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base shrink-0 ${
                      opt.rank === 1
                        ? 'bg-railway-navy text-white shadow'
                        : opt.rank === 2
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    #{opt.rank}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-bold text-slate-900">{opt.name}</h2>
                      {opt.rank === 1 && (
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-railway-navy font-semibold mt-0.5">
                      {opt.oneLineReason}
                    </p>
                  </div>
                </div>

                {/* Fare and Action Buttons */}
                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Total Family Fare</span>
                    <span className="text-lg font-extrabold text-slate-900 font-mono">
                      ₹{opt.totalFareINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => selectActivePlan(opt.optionId as any)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all focus:ring-2 focus:ring-railway-saffron ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-railway-navy hover:bg-railway-blue text-white'
                    }`}
                  >
                    {isSelected ? 'Active Plan' : 'Select This Plan'}
                  </button>
                  <button
                    onClick={() => setHandOffOption(opt)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 focus:ring-2 focus:ring-railway-saffron"
                    title="Generate summary to take to official IRCTC website"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                    IRCTC Hand-Off
                  </button>
                </div>
              </div>

              {/* Metrics Grid with Uncertainty Ranges */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Risk-Adjusted Arrival Range */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block mb-1 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                    Arrival Range (P10–P90):
                  </span>
                  <span className="font-mono font-bold text-slate-900 block text-sm">
                    {opt.p10Arrival.slice(11, 16)} – {opt.p90Arrival.slice(11, 16)}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Expected delay: +{opt.expectedDelayMinutes} mins
                  </span>
                </div>

                {/* Confirmation Likelihood Range */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block mb-1 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    Likelihood (Wilson CI):
                  </span>
                  <span className="font-mono font-bold text-slate-900 block text-sm">
                    {Math.round(opt.confidenceRange.lower * 100)}% – {Math.round(opt.confidenceRange.upper * 100)}%
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Sample size: n = {opt.confidenceRange.sampleSize} cases
                  </span>
                </div>

                {/* Accessibility Preservation */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block mb-1 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />
                    Accessibility Compliance:
                  </span>
                  <span className="font-bold text-emerald-700 block text-sm">
                    {opt.p1AccessibilityPreserved ? 'Step-Free Verified' : 'Inaccessible for P1'}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    P1 + P2 Caregiver Link Preserved
                  </span>
                </div>

                {/* Deadline countdown */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block mb-1 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                    Booking Window Deadline:
                  </span>
                  <span className="font-mono font-bold text-amber-800 block text-sm">
                    {opt.deadlineMinutesRemaining} mins remaining
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Cut-off: {opt.deadlineIso.slice(11, 16)} IST
                  </span>
                </div>
              </div>

              {/* Trade-off Summary */}
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <span>
                  <strong>Trade-off:</strong> {opt.tradeOffSummary}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Deterministic Score: {opt.breakdownScore.toFixed(1)} / 100
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* IRCTC Prepared Summary Hand-Off Modal */}
      {handOffOption && (
        <IRCTCHandOffModal
          option={handOffOption}
          onClose={() => setHandOffOption(null)}
        />
      )}
    </section>
  );
};
