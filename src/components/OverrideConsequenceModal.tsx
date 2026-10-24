// Screen 6: Override with Consequence Preview Confirmation Dialog
import React from 'react';
import { RankedItineraryOption } from '../types/index.ts';
import {
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Clock,
  IndianRupee,
} from 'lucide-react';

interface OverrideConsequenceModalProps {
  targetPlanKey: string;
  targetPlan: RankedItineraryOption;
  currentPlanId: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const OverrideConsequenceModal: React.FC<OverrideConsequenceModalProps> = ({
  targetPlanKey,
  targetPlan,
  currentPlanId,
  onConfirm,
  onClose,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="override-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-300 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-railway-navy text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-6 h-6 text-railway-saffron" aria-hidden="true" />
            <div>
              <h2 id="override-dialog-title" className="text-lg font-bold">
                Consequence Preview: Plan Override
              </h2>
              <p className="text-xs text-blue-200">
                Review all operational and financial changes before overriding active plan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cancel dialog"
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 focus:ring-2 focus:ring-railway-saffron"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-950">
            <span className="font-bold block mb-1">
              Switching from {currentPlanId.replace('_', ' ')} to {targetPlanKey.replace('_', ' ')}:
            </span>
            <p>
              Applying this override will adjust your active itinerary, update per-passenger status, and alter ticket modification deadlines.
            </p>
          </div>

          {/* Before vs After Comparison */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="grid grid-cols-2 bg-slate-100 font-bold p-2.5 border-b border-slate-200 text-slate-700">
              <span>Attribute</span>
              <span>New Value under {targetPlanKey.replace('_', ' ')}</span>
            </div>
            <div className="divide-y divide-slate-100 p-2.5 space-y-2">
              <div className="grid grid-cols-2">
                <span className="text-slate-500">Destination Arrival:</span>
                <span className="font-bold font-mono text-slate-900">
                  {targetPlan.p10Arrival.slice(11, 16)} – {targetPlan.p90Arrival.slice(11, 16)} IST
                </span>
              </div>
              <div className="grid grid-cols-2 pt-1.5">
                <span className="text-slate-500">Total Group Outlay:</span>
                <span className="font-bold font-mono text-slate-900">
                  ₹{targetPlan.totalFareINR.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="grid grid-cols-2 pt-1.5">
                <span className="text-slate-500">P1 Mobility Route:</span>
                <span className="font-bold text-emerald-700">
                  Step-free lift/ramp verified
                </span>
              </div>
              <div className="grid grid-cols-2 pt-1.5">
                <span className="text-slate-500">P1 & P2 Caregiver Adjacency:</span>
                <span className="font-bold text-emerald-700">
                  Strictly Maintained (No separation)
                </span>
              </div>
              <div className="grid grid-cols-2 pt-1.5">
                <span className="text-slate-500">Trade-Off Consequence:</span>
                <span className="font-medium text-slate-800">
                  {targetPlan.tradeOffSummary}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 focus:ring-2 focus:ring-slate-400"
          >
            Cancel (Keep Current Plan)
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-railway-navy hover:bg-railway-blue text-white rounded-lg text-xs font-bold transition-all focus:ring-2 focus:ring-railway-saffron"
          >
            Confirm Override & Activate Plan →
          </button>
        </div>
      </div>
    </div>
  );
};
