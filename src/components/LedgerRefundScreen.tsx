// Screen 7: Ledger and 4-State Refund Timeline with Reconciliation Proof
import React from 'react';
import { useJourneyStore } from '../store/journeyStore.ts';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  IndianRupee,
  RefreshCw,
  Hash,
} from 'lucide-react';
import { RefundState } from '../types/index.ts';

export const LedgerRefundScreen: React.FC = () => {
  const {
    ledgerEntries,
    ledgerReconciliation,
    advanceRefundState,
    cancelBerth,
    passengers,
  } = useJourneyStore();

  const statesOrder: RefundState[] = [
    'CANCELLATION_REQUESTED',
    'REFUND_INITIATED',
    'REFUND_PROCESSING',
    'FINAL_CREDIT',
  ];

  return (
    <section aria-labelledby="ledger-heading" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 id="ledger-heading" className="text-2xl font-bold text-railway-blue flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-railway-saffron" aria-hidden="true" />
            Transparent Per-Passenger Ledger & Refund Lifecycle
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Strictly ordered four-state refund machine. Individual per-passenger tracking with zero double-counting and mathematical reconciliation.
          </p>
        </div>

        <button
          onClick={() => cancelBerth('P5', 'LEG-1-CONFIRMED')}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm focus:ring-2 focus:ring-red-400 self-start md:self-auto"
        >
          Simulate P5 Berth Cancellation & Recalculate
        </button>
      </div>

      {/* Mathematical Reconciliation Summary */}
      {ledgerReconciliation && (
        <div
          role="region"
          aria-label="Ledger Mathematical Reconciliation Audit"
          className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" aria-hidden="true" />
              <h2 className="text-base font-bold text-white">Mathematical Ledger Reconciliation Audit</h2>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                ledgerReconciliation.reconciliationStatus === 'MATCHED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              {ledgerReconciliation.reconciliationStatus === 'MATCHED'
                ? 'AUDIT VERIFIED: ZERO DOUBLE-COUNTING'
                : 'DISCREPANCY DETECTED'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <span className="text-slate-400 block mb-1">Total Original Fare Paid:</span>
              <span className="font-mono font-bold text-white text-base">
                ₹{ledgerReconciliation.totalFarePaidINR.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Across {ledgerReconciliation.passengerCount} passengers
              </span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <span className="text-slate-400 block mb-1">Total Refunds Credited:</span>
              <span className="font-mono font-bold text-emerald-400 text-base">
                ₹{ledgerReconciliation.totalRefundsCreditedINR.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Net returned to payment source
              </span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <span className="text-slate-400 block mb-1">Deductions Retained by Railway:</span>
              <span className="font-mono font-bold text-amber-400 text-base">
                ₹{ledgerReconciliation.totalDeductionsRetainedINR.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Clerkage & 25% cancellation fee
              </span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <span className="text-slate-400 block mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-railway-saffron" aria-hidden="true" />
                Audit Hash Invariant:
              </span>
              <span className="font-mono text-[11px] text-slate-300 truncate block">
                {ledgerReconciliation.auditHash}
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">
                Refunds + Deductions = Total Fare
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Per-Passenger Ledger Entries ({ledgerEntries.length} Transactions)
          </h2>
          <span className="text-xs text-slate-500">
            Click 'Advance State' to progress refund through the 4-state pipeline
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Passenger Ledger Table">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th scope="col" className="p-3">Tx ID / Passenger</th>
                <th scope="col" className="p-3">Leg</th>
                <th scope="col" className="p-3">Current State (4-Stage Pipeline)</th>
                <th scope="col" className="p-3 text-right">Fare Paid</th>
                <th scope="col" className="p-3 text-right">Deduction</th>
                <th scope="col" className="p-3 text-right">Net Refund</th>
                <th scope="col" className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledgerEntries.map((entry) => {
                const isFinal = entry.state === 'FINAL_CREDIT';
                const hasCancellation = entry.transactionId.includes('CANCEL');

                return (
                  <tr
                    key={entry.transactionId}
                    className={`hover:bg-slate-50 transition-colors ${
                      hasCancellation ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Passenger & Tx */}
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">
                        {entry.passengerName} ({entry.passengerId})
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 block">
                        {entry.transactionId}
                      </span>
                      {entry.tdrReferenceNumber && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-1 rounded inline-block mt-0.5">
                          {entry.tdrReferenceNumber}
                        </span>
                      )}
                    </td>

                    {/* Leg */}
                    <td className="p-3 font-mono text-slate-700">
                      {entry.legId}
                    </td>

                    {/* 4-State Pipeline Indicator */}
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        {statesOrder.map((st, idx) => {
                          const statePassed =
                            statesOrder.indexOf(entry.state) >= idx;
                          const isCurrent = entry.state === st;

                          return (
                            <React.Fragment key={st}>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                                  isCurrent
                                    ? 'bg-railway-navy text-white ring-1 ring-railway-navy'
                                    : statePassed
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                                title={st}
                              >
                                {idx + 1}. {st.replace('_', ' ').slice(0, 8)}
                              </span>
                              {idx < statesOrder.length - 1 && (
                                <ArrowRight className="w-2.5 h-2.5 text-slate-300" aria-hidden="true" />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Status: <strong>{entry.state.replace('_', ' ')}</strong>
                      </span>
                    </td>

                    {/* Fare */}
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      ₹{entry.fareAmountINR}
                    </td>

                    {/* Deduction */}
                    <td className="p-3 text-right font-mono text-amber-700">
                      ₹{entry.cancellationChargeINR + entry.clerkageDeductedINR}
                    </td>

                    {/* Net Refund */}
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">
                      ₹{entry.netRefundAmountINR}
                    </td>

                    {/* State Progression Action */}
                    <td className="p-3 text-center">
                      {!isFinal ? (
                        <button
                          onClick={() => advanceRefundState(entry.transactionId)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-railway-navy hover:text-white text-slate-800 border border-slate-300 rounded font-semibold text-[11px] transition-all focus:ring-2 focus:ring-railway-saffron"
                        >
                          Advance State →
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          Final Credit
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
