// Screen 5: Active Journey Overview with Per-Passenger Status and Junction Feasibility
import React, { useState } from 'react';
import { useJourneyStore } from '../store/journeyStore.ts';
import {
  Train,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  Luggage,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  XCircle,
} from 'lucide-react';

export const JourneyViewScreen: React.FC = () => {
  const {
    legs,
    passengers,
    transferFeasibility,
    train1DelayMinutes,
    isLiftOperational,
    departurePlatform,
    cancelBerth,
    setActiveTab,
  } = useJourneyStore();

  const [cancelModalPassengerId, setCancelModalPassengerId] = useState<string | null>(null);

  const leg1 = legs[0];
  const leg2 = legs[1];

  return (
    <section aria-labelledby="journey-heading" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 id="journey-heading" className="text-2xl font-bold text-railway-blue flex items-center gap-2">
            <Train className="w-6 h-6 text-railway-saffron" aria-hidden="true" />
            Live Journey Status & Per-Passenger Berths
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Real-time multi-leg tracking. Leg 1 is confirmed; Leg 2 is waitlisted. Interchange at Kota Junction.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {train1DelayMinutes > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1.5 rounded-full border border-red-300 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden="true" />
              Train 1 Running {train1DelayMinutes}m Late
            </span>
          )}
          <button
            onClick={() => setActiveTab('disruptions')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold"
          >
            Disruption Simulator →
          </button>
        </div>
      </div>

      {/* Leg 1 & Leg 2 Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leg 1 Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-600 text-white font-mono text-xs font-bold px-2 py-0.5 rounded">
                LEG 1
              </span>
              <h2 className="font-bold text-base text-slate-900">
                {leg1.trainNumber} {leg1.trainName}
              </h2>
            </div>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              CONFIRMED (PNR: {leg1.pnr})
            </span>
          </div>

          <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block">Origin:</span>
              <span className="font-bold text-slate-900">{leg1.originName} ({leg1.origin})</span>
              <span className="text-slate-500 block mt-0.5">Dep: 17:00 IST</span>
            </div>
            <div className="text-center px-3">
              <span className="font-mono text-[11px] text-slate-500">10h 15m transit</span>
              <div className="w-20 h-0.5 bg-slate-300 my-1 mx-auto relative">
                <div className="w-2 h-2 rounded-full bg-emerald-600 absolute right-0 -top-0.75" />
              </div>
              {train1DelayMinutes > 0 && (
                <span className="text-red-600 font-bold font-mono text-[11px]">
                  +{train1DelayMinutes}m delay
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Transfer Station:</span>
              <span className="font-bold text-slate-900">{leg1.destinationName} ({leg1.destination})</span>
              <span className="text-slate-500 block mt-0.5">
                Arr: {train1DelayMinutes > 0 ? '04:10' : '03:15'} IST
              </span>
            </div>
          </div>

          {/* Per-Passenger Berth Allocations */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-2">Per-Passenger Coach & Berth Allocation (Coach B3):</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {passengers.map((p) => {
                const berth = leg1.berths?.[p.id] || 'B3-Confirmed';
                const isP1 = p.id === 'P1';

                return (
                  <div
                    key={p.id}
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{p.id}: {p.name}</span>
                      <span className="text-[11px] text-slate-500 block font-mono">
                        {berth}
                      </span>
                    </div>
                    {isP1 && (
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                        Lower Berth
                      </span>
                    )}
                    {p.id === 'P5' && (
                      <button
                        onClick={() => cancelBerth('P5', leg1.legId)}
                        className="text-[11px] text-red-600 hover:text-red-800 font-bold underline"
                        title="Cancel P5 berth and recalculate ledger"
                      >
                        Cancel Berth
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Leg 2 Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-600 text-white font-mono text-xs font-bold px-2 py-0.5 rounded">
                LEG 2
              </span>
              <h2 className="font-bold text-base text-slate-900">
                {leg2.trainNumber} {leg2.trainName}
              </h2>
            </div>
            <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              WAITLISTED (WL 7-10)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block">Origin:</span>
              <span className="font-bold text-slate-900">{leg2.originName} ({leg2.origin})</span>
              <span className="text-slate-500 block mt-0.5">Dep: 03:55 IST</span>
            </div>
            <div className="text-center px-3">
              <span className="font-mono text-[11px] text-slate-500">8h 35m transit</span>
              <div className="w-20 h-0.5 bg-slate-300 my-1 mx-auto relative">
                <div className="w-2 h-2 rounded-full bg-amber-600 absolute right-0 -top-0.75" />
              </div>
              <span className="text-amber-700 font-bold font-mono text-[11px]">
                WL Clearance: 38%–54%
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Final Destination:</span>
              <span className="font-bold text-slate-900">{leg2.destinationName} ({leg2.destination})</span>
              <span className="text-slate-500 block mt-0.5">Arr: 12:30 IST</span>
            </div>
          </div>

          {/* Waitlist Position Status */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-amber-950">Current Status:</span>
              <span className="font-mono font-bold text-amber-900">WL 7, 8, 9, 10 (GNWL / CC)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-amber-950">Booking Position:</span>
              <span className="font-mono text-slate-700">GNWL 14, 15, 16, 17</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-amber-950">Chart Preparation Cut-Off:</span>
              <span className="font-mono font-bold text-red-700">Oct 25, 23:55 IST (4h before)</span>
            </div>
            <p className="text-[11px] text-amber-900 pt-1 border-t border-amber-200">
              Unconfirmed waitlisted e-tickets are automatically dropped at chart prep. Passengers holding dropped tickets cannot board.
            </p>
          </div>
        </div>
      </div>

      {/* Connection Transfer Junction Feasibility Box */}
      {transferFeasibility && (
        <div
          role="region"
          aria-label="Transfer Feasibility Analysis"
          className={`p-6 rounded-xl border-2 shadow-sm space-y-4 ${
            transferFeasibility.feasible
              ? 'bg-white border-slate-200'
              : 'bg-red-50/40 border-red-300'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-railway-saffron" aria-hidden="true" />
              <h2 className="text-base font-bold text-slate-900">
                Interchange Transfer Feasibility at Kota Junction (PF 2 → PF {departurePlatform})
              </h2>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                transferFeasibility.feasible
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              {transferFeasibility.feasible ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  Connection Feasible (Margin: +{transferFeasibility.marginMinutes}m)
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600" aria-hidden="true" />
                  MISSED CONNECTION (Margin: {transferFeasibility.marginMinutes}m)
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Bottleneck Pace (P1):</span>
              <span className="font-bold font-mono text-slate-900">
                {transferFeasibility.groupWalkingSpeedMps} m/s
              </span>
              <span className="text-[11px] text-slate-500 block">
                Walk time: {transferFeasibility.walkingTimeMinutes} mins
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Vertical Transit:</span>
              <span className="font-bold text-slate-900">
                {transferFeasibility.routeType.replace('_', ' ')}
              </span>
              <span className="text-[11px] text-slate-500 block">
                Lift status: {isLiftOperational ? 'Operational' : 'OUT OF ORDER (Ramp)'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Luggage & Childcare Overhead:</span>
              <span className="font-bold font-mono text-slate-900">
                +{transferFeasibility.overheadBufferMinutes} mins
              </span>
              <span className="text-[11px] text-slate-500 block">4 heavy bags + toddler stroller</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Effective Window:</span>
              <span className="font-bold font-mono text-slate-900">
                {transferFeasibility.effectiveAvailableWindowMinutes} mins
              </span>
              <span className="text-[11px] text-slate-500 block">
                Required: {transferFeasibility.totalRequiredTransferMinutes} mins
              </span>
            </div>
          </div>

          {/* Feasibility Notes */}
          <div className="text-xs space-y-1 bg-slate-100 p-3 rounded-lg border border-slate-200 text-slate-700">
            {transferFeasibility.notes.map((note, idx) => (
              <p key={idx} className="font-medium">• {note}</p>
            ))}
          </div>

          {!transferFeasibility.feasible && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveTab('plans')}
                className="px-4 py-2 bg-railway-navy hover:bg-railway-blue text-white rounded-lg text-xs font-bold transition-all focus:ring-2 focus:ring-railway-saffron"
              >
                Trigger Adaptive Re-Planning (View Plans A, B, C) →
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
