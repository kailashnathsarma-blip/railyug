// Group Constraint Solver Engine
// Enforces hard constraints BEFORE ranking:
// 1. Caregiver Protection: P1 is never separated from P2.
// 2. Child Protection: P3 must always have at least one adult guardian (P2 or P5).
// 3. Accessibility Preservation: P1 routes must preserve step-free access.
// Evaluates split proposals and blocks illegal split attempts with clear reasons.

import {
  Passenger,
  HardConstraintCheckResult,
  PassengerSplitOption,
} from '../types/index.ts';

export class GroupConstraintSolver {
  // Evaluates a passenger grouping against hard rules
  public validateGrouping(
    subgroup: Passenger[],
    routeAccessibilityInfo?: { stepFree: boolean; lowerBerthAvailable?: boolean }
  ): HardConstraintCheckResult {
    const passengerIds = new Set(subgroup.map((p) => p.id));
    const violations: HardConstraintCheckResult['violations'] = [];
    const warnings: string[] = [];

    // Rule 1: P1 never separated from P2
    const hasP1 = passengerIds.has('P1');
    const hasP2 = passengerIds.has('P2');

    if (hasP1 && !hasP2) {
      violations.push({
        ruleCode: 'HARD_RULE_P1_P2_LINK',
        description:
          'Caregiver Hard Constraint Violated: Passenger P1 (Senior Citizen with limited mobility) cannot travel without designated caregiver P2.',
        affectedPassengers: ['P1', 'P2'],
        severity: 'BLOCKING',
      });
    }

    if (hasP2 && !hasP1 && passengerIds.size > 0) {
      // If P2 travels in a subgroup without P1, we must check if P1 is stranded alone
      // Handled when validating both split groups
    }

    // Rule 2: P3 never separated from at least one eligible guardian (P2 or P5)
    const hasP3 = passengerIds.has('P3');
    if (hasP3) {
      const eligibleGuardians = ['P2', 'P5'];
      const hasGuardian = eligibleGuardians.some((gId) => passengerIds.has(gId));
      if (!hasGuardian) {
        violations.push({
          ruleCode: 'HARD_RULE_P3_GUARDIAN_ADJACENCY',
          description:
            'Child Dependency Constraint Violated: Passenger P3 (child under five) must be accompanied by an eligible adult guardian (P2 or P5).',
          affectedPassengers: ['P3'],
          severity: 'BLOCKING',
        });
      }
    }

    // Rule 3: P1 accessibility compliance
    if (hasP1 && routeAccessibilityInfo) {
      if (!routeAccessibilityInfo.stepFree) {
        violations.push({
          ruleCode: 'HARD_RULE_P1_STEP_FREE',
          description:
            'Accessibility Constraint Violated: Selected path requires stairs, which is physically inaccessible for P1.',
          affectedPassengers: ['P1'],
          severity: 'BLOCKING',
        });
      }

      if (routeAccessibilityInfo.lowerBerthAvailable === false) {
        warnings.push(
          'Warning: Lower berth is not confirmed for P1 on overnight transit. Medical assistance recommended.'
        );
      }
    }

    return {
      valid: violations.length === 0,
      violations,
      warnings,
    };
  }

  // Evaluates a split partition between Group A and Group B
  public evaluateSplitProposal(
    groupAPassengers: Passenger[],
    groupBPassengers: Passenger[],
    modeA: 'TRAIN' | 'AC_BUS' | 'CAB' = 'TRAIN',
    modeB: 'TRAIN' | 'AC_BUS' | 'CAB' = 'TRAIN',
    summaryA: string = 'Main Family Group on Train',
    summaryB: string = 'Split Group on Alternate Route'
  ): PassengerSplitOption {
    const idsA = groupAPassengers.map((p) => p.id);
    const idsB = groupBPassengers.map((p) => p.id);

    const checkA = this.validateGrouping(groupAPassengers);
    const checkB = this.validateGrouping(groupBPassengers);

    // Cross-check: Ensure P1 and P2 are not on different sides
    let isLegallyAllowed = checkA.valid && checkB.valid;
    let blockingReason: string | undefined;

    if (!checkA.valid) {
      blockingReason = `ILLEGAL SPLIT BLOCKED: ${checkA.violations.map((v) => v.description).join('; ')}`;
      isLegallyAllowed = false;
    } else if (!checkB.valid) {
      blockingReason = `ILLEGAL SPLIT BLOCKED: ${checkB.violations.map((v) => v.description).join('; ')}`;
      isLegallyAllowed = false;
    } else if (
      (idsA.includes('P1') && idsB.includes('P2')) ||
      (idsB.includes('P1') && idsA.includes('P2'))
    ) {
      isLegallyAllowed = false;
      blockingReason =
        'ILLEGAL SPLIT BLOCKED: P1 and P2 are hard-linked. A caregiver cannot be assigned to a separate transport mode or itinerary from their dependent.';
    }

    // Generate Honest Trade-Off Panel
    const gained: string[] = [];
    const lost: string[] = [];
    let contingencyPlan = '';

    if (idsB.length === 1 && idsB[0] === 'P5') {
      // P5 Solo Split
      gained.push('P5 arrives 3 hours earlier in New Delhi via Express AC Bus');
      gained.push('Frees up 1 waitlisted rail berth, improving P1–P4 clearance odds');
      gained.push('Lower total family fare expenditure by ₹680');

      lost.push('P5 cannot assist with heavy luggage (4 bags) at Kota junction platform change');
      lost.push('Family travel cohesion split across road and rail networks');
      lost.push('If P5 loses cellular connectivity, real-time coordination must fall back to pre-agreed SMS check-ins');

      contingencyPlan =
        'Contingency Plan: P5 carries offline itinerary pack and pre-printed bus voucher. In case of road delay or cellular outage, group rendezvous at New Delhi IRCTC Executive Lounge at 13:00.';
    } else {
      gained.push(`Partitioned groups can book available berths across different train classes`);
      lost.push(`Caregiver redundancy reduced; luggage handling distributed`);
      contingencyPlan =
        'Contingency Plan: Group leaders communicate via junction station master or pre-fixed meeting checkpoints.';
    }

    return {
      splitId: `SPLIT-${idsA.join('')}-${idsB.join('')}`,
      groupA: {
        passengers: idsA,
        routeSummary: summaryA,
        mode: modeA,
        expectedArrival: '2026-10-26T12:30:00+05:30',
      },
      groupB: {
        passengers: idsB,
        routeSummary: summaryB,
        mode: modeB,
        expectedArrival: '2026-10-26T09:30:00+05:30',
      },
      isLegallyAllowed,
      blockingReason,
      tradeOff: {
        gained,
        lost,
        contingencyPlan,
      },
    };
  }
}
