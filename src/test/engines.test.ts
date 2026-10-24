// Comprehensive Unit Tests for All 8 Railyug Pure Engines
import { describe, it, expect, beforeEach } from 'vitest';
import scenarioData from '../../data/scenario.json';
import { Passenger, TransferJunction, LuggageProfile, JourneyLeg } from '../types/index.ts';

import { WaitlistEstimator } from '../engines/wlEstimator.ts';
import { TransferFeasibilityEngine } from '../engines/transferFeasibility.ts';
import { GroupConstraintSolver } from '../engines/groupConstraintSolver.ts';
import { LegDependencyEvaluator } from '../engines/legDependencyEvaluator.ts';
import { ItineraryRanker } from '../engines/ranker.ts';
import { DisruptionEngine } from '../engines/disruptionEngine.ts';
import { LedgerStateMachine } from '../engines/ledgerStateMachine.ts';
import { TatkalHoldManager } from '../engines/tatkalHoldManager.ts';

const passengers: Passenger[] = scenarioData.passengers as Passenger[];
const junction: TransferJunction = scenarioData.transferJunction as TransferJunction;
const luggage: LuggageProfile = scenarioData.luggage as LuggageProfile;
const leg1: JourneyLeg = scenarioData.legs[0] as unknown as JourneyLeg;
const leg2: JourneyLeg = scenarioData.legs[1] as unknown as JourneyLeg;

describe('Engine 1: Waitlist Confirmation Estimator', () => {
  it('determinism: produces identical output for identical inputs across runs', () => {
    const est1 = new WaitlistEstimator(42891);
    const est2 = new WaitlistEstimator(42891);

    const res1 = est1.estimateConfirmation('12059', 'CC', 'GN', 2, 7);
    const res2 = est2.estimateConfirmation('12059', 'CC', 'GN', 2, 7);

    expect(res1.lower).toBe(res2.lower);
    expect(res1.upper).toBe(res2.upper);
    expect(res1.sampleSize).toBe(res2.sampleSize);
  });

  it('honesty: never returns 0% or 100% confidence', () => {
    const est = new WaitlistEstimator(42891);
    const extremeBad = est.estimateConfirmation('12059', '1A', 'TQ', 1, 99);
    const extremeGood = est.estimateConfirmation('12059', 'SL', 'GN', 80, 1);

    expect(extremeBad.lower).toBeGreaterThan(0);
    expect(extremeBad.upper).toBeLessThan(1);
    expect(extremeGood.lower).toBeGreaterThan(0);
    expect(extremeGood.upper).toBeLessThan(1);
  });

  it('calibration: computes Brier score on held-out data meeting target threshold <= 0.18', () => {
    const est = new WaitlistEstimator(42891);
    const evalResult = est.evaluateHeldOutPerformance();

    expect(evalResult.totalHeldOutSamples).toBe(840);
    expect(evalResult.brierScore).toBeLessThanOrEqual(0.18);
    expect(evalResult.calibrationTable.length).toBe(10);
    expect(evalResult.passedCalibrationThreshold).toBe(true);
  });
});

describe('Engine 2: Transfer Feasibility Engine', () => {
  const engine = new TransferFeasibilityEngine();

  it('honestly models missed connection when Train 1 is 55m late on 40m window', () => {
    const result = engine.computeTransferFeasibility({
      passengers,
      luggage,
      junction,
      train1DelayMinutes: 55,
      train2DelayMinutes: 0,
    });

    expect(result.feasible).toBe(false);
    expect(result.marginMinutes).toBeLessThan(0);
    expect(result.bottleneckPassengerId).toBe('P1');
    expect(result.effectiveAvailableWindowMinutes).toBe(-15);
    expect(result.connectionProbabilityRange.lower).toBeLessThan(0.05);
  });

  it('accommodates lift outage scenario by routing via ramps and increasing distance', () => {
    const result = engine.computeTransferFeasibility({
      passengers,
      luggage,
      junction,
      train1DelayMinutes: 0,
      liftOperationalOverride: false,
    });

    expect(result.routeType).toBe('STEP_FREE_RAMP');
    expect(result.p1Accessible).toBe(true);
    expect(result.notes.some((n) => n.includes('OUT OF ORDER'))).toBe(true);
  });
});

describe('Engine 3: Group Constraint Solver', () => {
  const solver = new GroupConstraintSolver();

  it('HARD RULE: P1 and P2 can never be separated', () => {
    const p1 = passengers.find((p) => p.id === 'P1')!;
    const p2 = passengers.find((p) => p.id === 'P2')!;
    const p5 = passengers.find((p) => p.id === 'P5')!;

    // Test grouping with P1 without P2
    const invalidCheck = solver.validateGrouping([p1, p5]);
    expect(invalidCheck.valid).toBe(false);
    expect(invalidCheck.violations.some((v) => v.ruleCode === 'HARD_RULE_P1_P2_LINK')).toBe(true);

    // Test grouping with both P1 and P2
    const validCheck = solver.validateGrouping([p1, p2, p5]);
    expect(validCheck.valid).toBe(true);
  });

  it('HARD RULE: P3 must have at least one adult guardian', () => {
    const p1 = passengers.find((p) => p.id === 'P1')!;
    const p3 = passengers.find((p) => p.id === 'P3')!;
    const p4 = passengers.find((p) => p.id === 'P4')!;

    // P3 with P1 & P4 only (neither P2 nor P5 present)
    const check = solver.validateGrouping([p1, p3, p4]);
    expect(check.valid).toBe(false);
    expect(check.violations.some((v) => v.ruleCode === 'HARD_RULE_P3_GUARDIAN_ADJACENCY')).toBe(true);
  });

  it('visibly BLOCKS illegal split attempt separating P1 and P2 with clear reason', () => {
    const p1 = passengers.find((p) => p.id === 'P1')!;
    const p2 = passengers.find((p) => p.id === 'P2')!;
    const p3 = passengers.find((p) => p.id === 'P3')!;
    const p4 = passengers.find((p) => p.id === 'P4')!;
    const p5 = passengers.find((p) => p.id === 'P5')!;

    // Illegal split: P2 & P5 go ahead, P1, P3, P4 left behind
    const splitProposal = solver.evaluateSplitProposal([p1, p3, p4], [p2, p5]);
    expect(splitProposal.isLegallyAllowed).toBe(false);
    expect(splitProposal.blockingReason).toContain('ILLEGAL SPLIT BLOCKED');
  });

  it('allows legal split (P5 solo road transit) with clear trade-off panel', () => {
    const p1 = passengers.find((p) => p.id === 'P1')!;
    const p2 = passengers.find((p) => p.id === 'P2')!;
    const p3 = passengers.find((p) => p.id === 'P3')!;
    const p4 = passengers.find((p) => p.id === 'P4')!;
    const p5 = passengers.find((p) => p.id === 'P5')!;

    const legalSplit = solver.evaluateSplitProposal([p1, p2, p3, p4], [p5]);
    expect(legalSplit.isLegallyAllowed).toBe(true);
    expect(legalSplit.tradeOff.gained.length).toBeGreaterThan(0);
    expect(legalSplit.tradeOff.lost.length).toBeGreaterThan(0);
  });
});

describe('Engine 4: Leg Dependency Evaluator', () => {
  const evaluator = new LegDependencyEvaluator('rules-v1.0');

  it('evaluates Keep Leg 1 vs Cancel Leg 1 vs Re-route with explicit deadlines', () => {
    const comparison = evaluator.evaluateDependency(leg1, leg2, passengers);

    expect(comparison.options.length).toBe(3);
    expect(comparison.recommendedOptionKey).toBe('RE_ROUTE');

    const reroute = comparison.options.find((o) => o.optionKey === 'RE_ROUTE')!;
    const keep = comparison.options.find((o) => o.optionKey === 'KEEP_LEG1')!;
    const cancel = comparison.options.find((o) => o.optionKey === 'CANCEL_LEG1')!;

    expect(reroute.probabilityReachingDestination.lower).toBeGreaterThan(0.8);
    expect(keep.recommendationLevel).toBe('NOT_RECOMMENDED');
    expect(cancel.refundImpactINR).toBeGreaterThan(10000);
    expect(reroute.deadlineMinutesRemaining).toBeGreaterThan(0);
  });
});

describe('Engine 5: Multi-Attribute Ranker & Diff Generator', () => {
  const ranker = new ItineraryRanker('rules-v1.0');

  it('ranks itineraries deterministically with arrival ranges and one-line reasons', () => {
    const replanner = new DisruptionEngine('rules-v1.0');
    const plans = replanner.generateReplans(
      scenarioData.injectableDisruptions[0] as any,
      passengers,
      junction
    );

    const weights = {
      costWeight: 0.2,
      speedWeight: 0.8,
      comfortWeight: 0.3,
      riskToleranceWeight: 0.4,
    };

    const ranked = ranker.rankOptions([plans.planA, plans.planB, plans.planC], weights);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[0].oneLineReason).toBeDefined();
    expect(ranked[0].ruleSetVersion).toBe('rules-v1.0');
  });

  it('generates accurate diff when priorities shift', () => {
    const replanner = new DisruptionEngine('rules-v1.0');
    const plans = replanner.generateReplans(
      scenarioData.injectableDisruptions[0] as any,
      passengers,
      junction
    );

    const speedWeights = { costWeight: 0.1, speedWeight: 0.9, comfortWeight: 0.2, riskToleranceWeight: 0.2 };
    const costWeights = { costWeight: 0.9, speedWeight: 0.1, comfortWeight: 0.2, riskToleranceWeight: 0.2 };

    const rankedSpeed = ranker.rankOptions([plans.planA, plans.planB, plans.planC], speedWeights);
    const rankedCost = ranker.rankOptions([plans.planA, plans.planB, plans.planC], costWeights);

    const diffs = ranker.generateDiff(rankedSpeed, rankedCost, speedWeights, costWeights);
    expect(diffs.length).toBeGreaterThan(0);
    expect(diffs[0].reason).toContain('cost priority increased');
  });
});

describe('Engine 6: Disruption Engine and Re-planner', () => {
  const disruptionEngine = new DisruptionEngine('rules-v1.0');

  it('strictly segregates Official, Crowd, and Predicted information streams', () => {
    const officialEvent = scenarioData.injectableDisruptions[0] as any; // 55m delay
    const crowdEvent = scenarioData.injectableDisruptions[12] as any; // crowd congestion
    const predictedEvent = scenarioData.injectableDisruptions[13] as any; // predicted delay

    const officialAlert = disruptionEngine.formatAlert(officialEvent);
    const crowdAlert = disruptionEngine.formatAlert(crowdEvent);
    const predictedAlert = disruptionEngine.formatAlert(predictedEvent);

    expect(officialAlert.sourceType).toBe('OFFICIAL');
    expect(officialAlert.canTriggerReplan).toBe(true);

    expect(crowdAlert.sourceType).toBe('CROWD');
    expect(crowdAlert.canTriggerReplan).toBe(false);

    expect(predictedAlert.sourceType).toBe('PREDICTED');
    expect(predictedAlert.canTriggerReplan).toBe(false);
  });

  it('generates Plan A, B, and C within the 2000ms compute budget', () => {
    const officialEvent = scenarioData.injectableDisruptions[0] as any;
    const result = disruptionEngine.generateReplans(officialEvent, passengers, junction);

    expect(result.metBudget).toBe(true);
    expect(result.computeDurationMs).toBeLessThan(2000);
    expect(result.planA).toBeDefined();
    expect(result.planB).toBeDefined();
    expect(result.planC).toBeDefined();
  });
});

describe('Engine 7: Ledger and Refund State Machine', () => {
  let ledger: LedgerStateMachine;

  beforeEach(() => {
    ledger = new LedgerStateMachine();
    ledger.initializeLegEntries(leg1, passengers);
  });

  it('enforces strictly ordered 4-state refund lifecycle with no skipping', () => {
    const txId = 'TX-LEG-1-CONFIRMED-P5';

    // Must advance to REFUND_INITIATED first
    ledger.advanceState(txId, 'REFUND_INITIATED');
    expect(ledger.getEntry(txId)?.state).toBe('REFUND_INITIATED');

    // Illegal skip to FINAL_CREDIT without PROCESSING must throw
    expect(() => ledger.advanceState(txId, 'FINAL_CREDIT')).toThrow(
      /ILLEGAL STATE TRANSITION/
    );

    // Valid progression
    ledger.advanceState(txId, 'REFUND_PROCESSING');
    expect(ledger.getEntry(txId)?.state).toBe('REFUND_PROCESSING');

    ledger.advanceState(txId, 'FINAL_CREDIT');
    expect(ledger.getEntry(txId)?.state).toBe('FINAL_CREDIT');
  });

  it('recalculates fare upon cancelling P5 berth and verifies mathematical reconciliation', () => {
    const cancelResult = ledger.cancelBerth(leg1, 'P5', passengers, 26);

    expect(cancelResult.beforeTotalFareINR).toBe(14250);
    expect(cancelResult.afterTotalFareINR).toBe(11400); // 14250 - 2850
    expect(cancelResult.cancellationChargeINR).toBe(713); // 25% of 2850
    expect(cancelResult.netRefundINR).toBe(2137); // 2850 - 713

    // Mathematical reconciliation: Net Refund + Deductions == Total Cancelled Fare
    const reconciliation = ledger.reconcile();
    expect(reconciliation.reconciliationStatus).toBe('MATCHED');
  });
});

describe('Engine 8: Tatkal Fair-Booking Hold Manager', () => {
  it('concurrency test: fires multiple simulated users at one seat and asserts ZERO overlapping holds', () => {
    const manager = new TatkalHoldManager();
    const targetSeat = 'B2-4';
    const users = ['user_1', 'user_2', 'user_3', 'user_4', 'user_5', 'user_6'];

    const results = users.map((u) => manager.claimSingleSeat(targetSeat, u));

    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    // Exactly one user must win the hold
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(users.length - 1);
    expect(failures[0].errorCode).toBe('ALREADY_HELD');
    expect(failures[0].suggestedAlternativeSeats?.length).toBeGreaterThan(0);
  });

  it('server clock authority: refresh or re-click reuses existing hold without extending timer', () => {
    const manager = new TatkalHoldManager();
    const targetSeat = 'B2-10';
    const userId = 'traveler_alpha';

    const firstClaim = manager.claimSingleSeat(targetSeat, userId);
    expect(firstClaim.success).toBe(true);

    // Advance clock by 60 seconds
    manager.advanceServerClockMs(60 * 1000);

    // Simulate page refresh / re-click
    const secondClaim = manager.claimSingleSeat(targetSeat, userId);
    expect(secondClaim.success).toBe(true);
    expect(secondClaim.holdId).toBe(firstClaim.holdId);
    expect(secondClaim.expiresAtMs).toBe(firstClaim.expiresAtMs);
    expect(secondClaim.remainingSeconds).toBeLessThan(180);
  });

  it('all-or-nothing group hold: claims all seats or releases completely', () => {
    const manager = new TatkalHoldManager();

    // Seat B2-1 is already taken by stranger
    manager.claimSingleSeat('B2-1', 'stranger_user');

    // Family tries to hold B2-1 and B2-2 together for P1 & P2
    const groupResult = manager.claimGroupHold(['B2-1', 'B2-2'], 'family_head');
    expect(groupResult.success).toBe(false);
    expect(groupResult.errorCode).toBe('GROUP_INCOMPLETE');

    // B2-2 must remain AVAILABLE (never partially held)
    const seat2 = manager.getSeat('B2-2');
    expect(seat2?.status).toBe('AVAILABLE');
  });

  it('late payment rejection: payment after expiry is rejected and sent to refund', () => {
    const manager = new TatkalHoldManager();
    const targetSeat = 'B2-15';
    const userId = 'slow_payer';

    const claim = manager.claimSingleSeat(targetSeat, userId);
    expect(claim.success).toBe(true);

    // Advance clock past the 3-minute window (200 seconds)
    manager.advanceServerClockMs(200 * 1000);

    const paymentResult = manager.confirmHoldPayment(claim.holdId!, userId, 1250);
    expect(paymentResult.success).toBe(false);
    expect(paymentResult.requiresRefund).toBe(true);
  });

  it('accessible extension grants one-time +120 seconds to assistive tech users', () => {
    const manager = new TatkalHoldManager();
    const targetSeat = 'B2-20';
    const userId = 'screen_reader_user';

    const claim = manager.claimSingleSeat(targetSeat, userId);
    const initialExpiry = claim.expiresAtMs!;

    const extension = manager.requestAccessibleExtension(claim.holdId!, userId);
    expect(extension.success).toBe(true);
    expect(extension.expiresAtMs).toBe(initialExpiry + 120 * 1000);

    // Second extension must be rejected (one-time only)
    const secondExtension = manager.requestAccessibleExtension(claim.holdId!, userId);
    expect(secondExtension.success).toBe(false);
  });
});
