// Domain types for Railyug Journey Assistant

export type InformationSourceType = 'OFFICIAL' | 'CROWD' | 'PREDICTED';

export interface ConfidenceRange {
  lower: number; // e.g. 0.35 (never 0.0)
  upper: number; // e.g. 0.52 (never 1.0)
  sampleSize: number;
  lowDataWarning: boolean;
  assumption: string;
}

export interface ArrivalRange {
  p10: string; // ISO string
  p50: string; // ISO string
  p90: string; // ISO string
  expectedDelayMinutes?: number;
}

export interface MobilityProfile {
  needsRampOrLift: boolean;
  maxWalkDistanceMeters: number;
  walkingSpeedMps: number;
  requiresLowerBerth: boolean;
  notes: string;
}

export interface Passenger {
  id: string; // "P1" | "P2" | "P3" | "P4" | "P5"
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  category: string;
  mobilityProfile: MobilityProfile;
  caregiverLinkedPassengerId?: string; // P1 links to P2
  caregiverForPassengerId?: string; // P2 is caregiver for P1
  dependentGuardians?: string[]; // P3 requires P2 or P5
  mustTravelWith: string[];
  childcareOverheadMinutes?: number;
  accessibilityNeeds: string[];
  seatPreferences: string[];
  isSplittable?: boolean;
  connectivityStatus?: 'ONLINE' | 'OFFLINE';
  ticketNames?: {
    leg1: string;
    leg2: string;
  };
}

export interface LuggageProfile {
  totalHeavyBags: number;
  strollerCount: number;
  overheadMinutes: number;
}

export type TicketStatus = 'CONFIRMED' | 'WAITLISTED' | 'RAC' | 'CANCELLED_BY_PASSENGER' | 'CANCELLED_BY_RAILWAY';

export interface JourneyLeg {
  legIndex: number;
  legId: string;
  trainNumber: string;
  trainName: string;
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  estimatedArrivalRange: ArrivalRange;
  status: TicketStatus;
  pnr: string;
  coach?: string;
  berths?: Record<string, string>; // passengerId -> berth string
  farePaidTotal: number;
  fareBreakdownPerPassenger: Record<string, number>;
  liveDelayMinutes: number;
  confirmationProbabilityRange?: ConfidenceRange;
  bookingStatus?: string;
  currentStatus?: string;
  quota?: string;
  travelClass?: string;
  disruptionAlert?: string | null;
}

export interface PlatformInfrastructure {
  stairs: { available: boolean; stepCount: number };
  lifts: { available: boolean; count: number; isOperational: boolean; averageWaitTimeMinutes: number };
  ramps: { available: boolean; count: number; distanceMeters: number; gradePercent: number };
}

export interface TransferJunction {
  stationCode: string;
  stationName: string;
  scheduledWindowMinutes: number;
  arrivalPlatform: number;
  departurePlatform: number;
  distanceMeters: number;
  infrastructure: PlatformInfrastructure;
  accessibilityProfile: {
    p1Feasible: boolean;
    requiresStepFreeRoute: boolean;
    stepFreePath: string[];
  };
}

export interface TransferFeasibilityResult {
  feasible: boolean;
  routeType: 'STEP_FREE_LIFT' | 'STEP_FREE_RAMP' | 'STAIRS_FAST' | 'BLOCKED';
  bottleneckPassengerId: string;
  groupWalkingSpeedMps: number;
  walkingTimeMinutes: number;
  verticalTransitTimeMinutes: number;
  overheadBufferMinutes: number;
  totalRequiredTransferMinutes: number;
  scheduledWindowMinutes: number;
  actualArrivalDelayMinutes: number;
  effectiveAvailableWindowMinutes: number;
  marginMinutes: number;
  connectionProbabilityRange: ConfidenceRange;
  p1Accessible: boolean;
  notes: string[];
}

export interface HardConstraintCheckResult {
  valid: boolean;
  violations: Array<{
    ruleCode: string;
    description: string;
    affectedPassengers: string[];
    severity: 'BLOCKING';
  }>;
  warnings: string[];
}

export interface PassengerSplitOption {
  splitId: string;
  groupA: {
    passengers: string[];
    routeSummary: string;
    mode: 'TRAIN' | 'AC_BUS' | 'CAB';
    expectedArrival: string;
  };
  groupB: {
    passengers: string[];
    routeSummary: string;
    mode: 'TRAIN' | 'AC_BUS' | 'CAB';
    expectedArrival: string;
  };
  isLegallyAllowed: boolean;
  blockingReason?: string;
  tradeOff: {
    gained: string[];
    lost: string[];
    contingencyPlan: string;
  };
}

export interface RankingWeights {
  costWeight: number; // 0.0 to 1.0
  speedWeight: number; // 0.0 to 1.0
  comfortWeight: number; // 0.0 to 1.0
  riskToleranceWeight: number; // 0.0 to 1.0
}

export interface RankedItineraryOption {
  optionId: string;
  name: string;
  rank: number;
  riskAdjustedArrival: string;
  p10Arrival: string;
  p90Arrival: string;
  arrivalWindowMinutes: number;
  expectedDelayMinutes: number;
  totalFareINR: number;
  confidenceRange: ConfidenceRange;
  accessibilityScore: number; // 0 to 100
  p1AccessibilityPreserved: boolean;
  oneLineReason: string;
  tradeOffSummary: string;
  breakdownScore: number;
  legs: JourneyLeg[];
  splits?: PassengerSplitOption;
  deadlineIso: string;
  deadlineMinutesRemaining: number;
  ruleSetVersion: string;
}

export interface RankingDiff {
  previousOptionId: string;
  newOptionId: string;
  previousRank: number;
  newRank: number;
  reason: string;
  arrivalOverlapPercent: number;
  timestamp: string;
}

export type RefundState =
  | 'CANCELLATION_REQUESTED'
  | 'REFUND_INITIATED'
  | 'REFUND_PROCESSING'
  | 'FINAL_CREDIT';

export interface LedgerEntry {
  transactionId: string;
  legId: string;
  passengerId: string;
  passengerName: string;
  state: RefundState;
  fareAmountINR: number;
  clerkageDeductedINR: number;
  cancellationChargeINR: number;
  netRefundAmountINR: number;
  stateTimestamps: Record<RefundState, string | null>;
  sourceEvent: string;
  tdrReferenceNumber?: string;
  isReconciled: boolean;
}

export interface LedgerReconciliation {
  totalFarePaidINR: number;
  totalRefundsCreditedINR: number;
  totalDeductionsRetainedINR: number;
  passengerCount: number;
  entriesCount: number;
  reconciliationStatus: 'MATCHED' | 'DISCREPANCY';
  auditHash: string;
}

export interface TatkalSeat {
  seatId: string;
  berthType: 'LB' | 'MB' | 'UB' | 'SL' | 'SU' | 'CC';
  coach: string;
  priceINR: number;
  status: 'AVAILABLE' | 'PROCESSING' | 'CONFIRMED';
  heldByUserId?: string | null;
  holdExpiresAt?: number | null; // epoch ms (simulated server clock)
}

export interface TatkalHoldResult {
  success: boolean;
  holdId?: string;
  seatIds?: string[];
  expiresAtMs?: number;
  remainingSeconds?: number;
  message: string;
  errorCode?: 'ALREADY_HELD' | 'EXPIRED' | 'LIMIT_EXCEEDED' | 'GROUP_INCOMPLETE';
  suggestedAlternativeSeats?: string[];
}

export interface DisruptionEvent {
  id: string;
  name: string;
  type: InformationSourceType | 'LOCAL_EVENT' | 'SIMULATION_CURVEBALL' | 'VALIDATION_WARNING' | 'USER_PREFERENCE' | 'COMPOUND_CASCADE' | 'SPLIT_PLAN' | 'ILLEGAL_ACTION';
  description: string;
  effects: Record<string, any>;
  reportCount?: number;
  predictedConfidence?: number;
  timestamp?: string;
}

export interface AuditEventLogEntry {
  eventId: string;
  timestamp: string;
  eventType: string;
  ruleSetVersion: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  reasons: string[];
  userConsentGiven: boolean;
  systemStateHash: string;
}
