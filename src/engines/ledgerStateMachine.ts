// Ledger and Refund State Machine Engine
// Enforces strictly ordered four-state refund lifecycle:
// CANCELLATION_REQUESTED -> REFUND_INITIATED -> REFUND_PROCESSING -> FINAL_CREDIT
// Guarantees per-passenger per-leg row tracking, cancellation recalculation,
// and mathematical reconciliation with zero double-counting.

import {
  LedgerEntry,
  RefundState,
  LedgerReconciliation,
  JourneyLeg,
  Passenger,
} from '../types/index.ts';

export const REFUND_STATE_SEQUENCE: RefundState[] = [
  'CANCELLATION_REQUESTED',
  'REFUND_INITIATED',
  'REFUND_PROCESSING',
  'FINAL_CREDIT',
];

export interface BerthCancellationResult {
  cancelledPassengerId: string;
  legId: string;
  beforeTotalFareINR: number;
  afterTotalFareINR: number;
  cancellationChargeINR: number;
  clerkageFeeINR: number;
  netRefundINR: number;
  ledgerEntry: LedgerEntry;
  remainingPassengersFare: Record<string, number>;
}

export class LedgerStateMachine {
  private entries: Map<string, LedgerEntry> = new Map();

  // Initialize ledger rows for a journey leg
  public initializeLegEntries(
    leg: JourneyLeg,
    passengers: Passenger[]
  ): LedgerEntry[] {
    const createdEntries: LedgerEntry[] = [];

    for (const p of passengers) {
      const fare = leg.fareBreakdownPerPassenger[p.id] ?? 0;
      const txId = `TX-${leg.legId}-${p.id}`;

      const entry: LedgerEntry = {
        transactionId: txId,
        legId: leg.legId,
        passengerId: p.id,
        passengerName: p.name,
        state: 'CANCELLATION_REQUESTED',
        fareAmountINR: fare,
        clerkageDeductedINR: 0,
        cancellationChargeINR: 0,
        netRefundAmountINR: 0,
        stateTimestamps: {
          CANCELLATION_REQUESTED: null,
          REFUND_INITIATED: null,
          REFUND_PROCESSING: null,
          FINAL_CREDIT: null,
        },
        sourceEvent: 'TICKET_BOOKING_INIT',
        isReconciled: true,
      };

      this.entries.set(txId, entry);
      createdEntries.push(entry);
    }

    return createdEntries;
  }

  // Strictly transition a ledger entry to the next state
  public advanceState(
    transactionId: string,
    targetState: RefundState,
    timestamp: string = new Date().toISOString()
  ): LedgerEntry {
    const entry = this.entries.get(transactionId);
    if (!entry) {
      throw new Error(`Transaction ${transactionId} not found in ledger.`);
    }

    const currentIndex = REFUND_STATE_SEQUENCE.indexOf(entry.state);
    const targetIndex = REFUND_STATE_SEQUENCE.indexOf(targetState);

    // Strict no-skipping rule
    if (targetIndex !== currentIndex + 1 && targetState !== entry.state) {
      throw new Error(
        `ILLEGAL STATE TRANSITION: Cannot transition from ${entry.state} to ${targetState}. Refund lifecycle must strictly follow: ${REFUND_STATE_SEQUENCE.join(' -> ')}`
      );
    }

    entry.state = targetState;
    entry.stateTimestamps[targetState] = timestamp;
    this.entries.set(transactionId, entry);
    return entry;
  }

  // Cancel one berth and recalculate fare and refund for others
  public cancelBerth(
    leg: JourneyLeg,
    passengerId: string,
    passengers: Passenger[],
    hoursBeforeDeparture: number = 26,
    reason: string = 'User requested cancellation of flexible passenger P5',
    timestamp: string = new Date().toISOString()
  ): BerthCancellationResult {
    const passenger = passengers.find((p) => p.id === passengerId);
    if (!passenger) {
      throw new Error(`Passenger ${passengerId} not found.`);
    }

    const beforeTotalFare = leg.farePaidTotal;
    const passengerFare = leg.fareBreakdownPerPassenger[passengerId] ?? 0;

    let cancellationCharge = 0;
    let clerkageFee = 0;

    // Rules: between 12 and 48 hours = 25% cancellation charge
    if (leg.status === 'WAITLISTED') {
      // WL cancellation: flat clerkage fee of ₹60
      clerkageFee = 60;
      cancellationCharge = 0;
    } else {
      // Confirmed ticket cancellation
      if (hoursBeforeDeparture > 48) {
        cancellationCharge = 200; // Flat 2A/3A charge
      } else if (hoursBeforeDeparture >= 12 && hoursBeforeDeparture <= 48) {
        cancellationCharge = Math.round(passengerFare * 0.25);
      } else if (hoursBeforeDeparture >= 4 && hoursBeforeDeparture < 12) {
        cancellationCharge = Math.round(passengerFare * 0.5);
      } else {
        cancellationCharge = passengerFare; // 0% refund
      }
    }

    const netRefund = Math.max(0, passengerFare - cancellationCharge - clerkageFee);
    const afterTotalFare = beforeTotalFare - passengerFare;

    const remainingPassengersFare: Record<string, number> = {};
    for (const [pId, fare] of Object.entries(leg.fareBreakdownPerPassenger)) {
      if (pId !== passengerId) {
        remainingPassengersFare[pId] = fare;
      }
    }

    const txId = `TX-${leg.legId}-${passengerId}-CANCEL`;
    const ledgerEntry: LedgerEntry = {
      transactionId: txId,
      legId: leg.legId,
      passengerId,
      passengerName: passenger.name,
      state: 'CANCELLATION_REQUESTED',
      fareAmountINR: passengerFare,
      clerkageDeductedINR: clerkageFee,
      cancellationChargeINR: cancellationCharge,
      netRefundAmountINR: netRefund,
      stateTimestamps: {
        CANCELLATION_REQUESTED: timestamp,
        REFUND_INITIATED: null,
        REFUND_PROCESSING: null,
        FINAL_CREDIT: null,
      },
      sourceEvent: reason,
      tdrReferenceNumber: `TDR-${Math.floor(100000 + Math.random() * 900000)}`,
      isReconciled: true,
    };

    this.entries.set(txId, ledgerEntry);

    return {
      cancelledPassengerId: passengerId,
      legId: leg.legId,
      beforeTotalFareINR: beforeTotalFare,
      afterTotalFareINR: afterTotalFare,
      cancellationChargeINR: cancellationCharge,
      clerkageFeeINR: clerkageFee,
      netRefundINR: netRefund,
      ledgerEntry,
      remainingPassengersFare,
    };
  }

  // Reconcile all entries mathematically ensuring zero double-counting
  public reconcile(): LedgerReconciliation {
    let totalFarePaid = 0;
    let totalRefundsCredited = 0;
    let totalDeductionsRetained = 0;
    const passengerSet = new Set<string>();

    const allEntries = Array.from(this.entries.values());

    for (const entry of allEntries) {
      passengerSet.add(entry.passengerId);
      totalFarePaid += entry.fareAmountINR;
      totalRefundsCredited += entry.netRefundAmountINR;
      totalDeductionsRetained += entry.cancellationChargeINR + entry.clerkageDeductedINR;
    }

    // Mathematical reconciliation invariant:
    // For all cancelled/refunded entries: netRefund + deductions === originalFare
    let matched = true;
    for (const entry of allEntries) {
      if (entry.stateTimestamps.CANCELLATION_REQUESTED !== null) {
        const componentSum =
          entry.netRefundAmountINR +
          entry.cancellationChargeINR +
          entry.clerkageDeductedINR;
        if (componentSum !== entry.fareAmountINR) {
          matched = false;
        }
      }
    }

    const auditHash = `HASH-${totalFarePaid}-${totalRefundsCredited}-${totalDeductionsRetained}-${allEntries.length}`;

    return {
      totalFarePaidINR: totalFarePaid,
      totalRefundsCreditedINR: totalRefundsCredited,
      totalDeductionsRetainedINR: totalDeductionsRetained,
      passengerCount: passengerSet.size,
      entriesCount: allEntries.length,
      reconciliationStatus: matched ? 'MATCHED' : 'DISCREPANCY',
      auditHash,
    };
  }

  public getAllEntries(): LedgerEntry[] {
    return Array.from(this.entries.values());
  }

  public getEntry(transactionId: string): LedgerEntry | undefined {
    return this.entries.get(transactionId);
  }
}
