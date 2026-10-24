// Screen: Append-Only Audit Trail Viewer with Deterministic Snapshot Replay
import React from 'react';
import { useJourneyStore } from '../store/journeyStore.ts';
import {
  FileText,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Hash,
  Clock,
  Check,
  AlertCircle,
} from 'lucide-react';

export const AuditTrailScreen: React.FC = () => {
  const { eventLog, replayFromLogEntry, replayVerificationResult, ruleSetVersion } = useJourneyStore();

  return (
    <section aria-labelledby="audit-heading" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 id="audit-heading" className="text-2xl font-bold text-railway-blue flex items-center gap-2">
            <FileText className="w-6 h-6 text-railway-saffron" aria-hidden="true" />
            Append-Only Audit Trail & Deterministic Engine Replay
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Every analytical decision, weight adjustment, and plan generation is cryptographically stamped and logged. Any past recommendation can be re-executed deterministically to yield identical results.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1.5 rounded border border-slate-300">
            Rules: {ruleSetVersion}
          </span>
        </div>
      </div>

      {/* Replay Verification Result Announcement */}
      {replayVerificationResult && (
        <div
          role="region"
          aria-label="Replay Verification Outcome"
          className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
            replayVerificationResult.matched
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-red-50 border-red-300 text-red-950'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-bold block text-sm">
              DETERMINISTIC REPLAY VERIFIED (EVENT {replayVerificationResult.eventId}):
            </span>
            <p className="mt-0.5 font-medium">{replayVerificationResult.message}</p>
          </div>
        </div>
      )}

      {/* Event Log Stream */}
      <div className="space-y-3" role="list" aria-label="Append-Only Event Stream">
        {eventLog.map((entry, idx) => (
          <article
            key={entry.eventId}
            role="listitem"
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                  #{eventLog.length - idx} • {entry.eventType}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {entry.timestamp}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono text-slate-400">
                  {entry.systemStateHash}
                </span>
                <button
                  onClick={() => replayFromLogEntry(entry.eventId)}
                  className="px-3 py-1 bg-slate-100 hover:bg-railway-navy hover:text-white text-slate-800 border border-slate-300 rounded font-semibold text-xs transition-colors flex items-center gap-1 focus:ring-2 focus:ring-railway-saffron"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  Replay Snapshot
                </button>
              </div>
            </div>

            {/* Reasons and Context */}
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-700 block">Logged Rationale:</span>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                {entry.reasons.map((r, rIdx) => (
                  <li key={rIdx}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Structured Inputs and Outputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-slate-700 block mb-1 text-[11px]">
                  INPUT SNAPSHOT:
                </span>
                <pre className="text-[11px] font-mono text-slate-600 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(entry.inputs, null, 2)}
                </pre>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-slate-700 block mb-1 text-[11px]">
                  DETERMINISTIC OUTPUT:
                </span>
                <pre className="text-[11px] font-mono text-slate-600 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(entry.outputs, null, 2)}
                </pre>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
