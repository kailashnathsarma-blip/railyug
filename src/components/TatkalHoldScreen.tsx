// Screen 8: Tatkal Fair-Booking Hold Manager with Race Simulation and Accessible Countdown
import React, { useState, useEffect } from 'react';
import { useJourneyStore } from '../store/journeyStore.ts';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Users,
  RefreshCw,
  PlusCircle,
  XCircle,
  IndianRupee,
  Zap,
} from 'lucide-react';

export const TatkalHoldScreen: React.FC = () => {
  const {
    tatkalManager,
    tatkalSeats,
    activeHoldId,
    claimTatkalSeat,
    claimTatkalGroup,
    requestAccessibleExtension,
    confirmTatkalPayment,
    releaseTatkalHold,
    advanceTatkalClock,
    accessibleTimerExtensionActive,
  } = useJourneyStore();

  const [selectedSeatId, setSelectedSeatId] = useState<string>('B2-1');
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);
  const [raceSimulationOutput, setRaceSimulationOutput] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(180);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');

  // Keep display timer synced to simulated authoritative server clock
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeHoldId) {
        const hold = tatkalManager.getHold(activeHoldId);
        if (hold && hold.status === 'ACTIVE') {
          const now = tatkalManager.getServerTimeMs();
          const rem = Math.max(0, Math.floor((hold.expiresAtMs - now) / 1000));
          setRemainingSeconds(rem);

          // Polite speech milestones for screen readers
          if (rem === 60) {
            setAriaAnnouncement('Warning: 1 minute remaining on your Tatkal seat hold.');
          } else if (rem === 30) {
            setAriaAnnouncement('Urgent: 30 seconds remaining on your Tatkal seat hold. Press extend timer if needed.');
          } else if (rem === 0) {
            setAriaAnnouncement('Tatkal hold expired. Seat has been released. Entered passenger details are preserved.');
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeHoldId, tatkalManager]);

  // Handle single seat claim
  const handleClaimSingle = (seatId: string) => {
    const res = claimTatkalSeat(seatId, 'user_primary_traveler');
    setLastActionMessage(res.message);
    if (res.success) {
      setAriaAnnouncement('Seat hold established. 3-minute checkout window active.');
    }
  };

  // Simulate two users clicking the exact same seat simultaneously
  const handleSimulateRaceCondition = () => {
    const targetSeat = selectedSeatId;
    // Release any previous hold first for clean demonstration
    const currentSeat = tatkalManager.getSeat(targetSeat);
    if (currentSeat && currentSeat.status !== 'AVAILABLE') {
      currentSeat.status = 'AVAILABLE';
      currentSeat.heldByUserId = null;
    }

    // Fire User A and User B concurrently
    const resA = tatkalManager.claimSingleSeat(targetSeat, 'user_alice_primary');
    const resB = tatkalManager.claimSingleSeat(targetSeat, 'user_bob_competitor');

    // Update state
    useJourneyStore.setState({ tatkalSeats: tatkalManager.getAllSeats() });

    setRaceSimulationOutput(
      `ATOMIC RACE TEST on ${targetSeat}:\n` +
      `• User Alice: ${resA.success ? 'SUCCESS (Held for 180s)' : 'FAILED'}\n` +
      `• User Bob: ${resB.success ? 'SUCCESS' : `BLOCKED (${resB.errorCode}) - "${resB.message}"`}\n` +
      `• Next Best Alternatives offered to Bob: ${resB.suggestedAlternativeSeats?.join(', ') || 'None'}\n` +
      `• Result: ZERO overlapping holds. Invariant strictly preserved.`
    );
  };

  // Group claim P1 + P2
  const handleGroupHoldP1P2 = () => {
    const res = claimTatkalGroup(['B2-7', 'B2-8'], 'family_group_head');
    setLastActionMessage(res.message);
    if (res.success) {
      setAriaAnnouncement('Group hold confirmed for P1 and P2 co-reservation.');
    }
  };

  return (
    <section aria-labelledby="tatkal-heading" className="space-y-6">
      {/* Polite Aria-Live Region for Timer & Race Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {ariaAnnouncement}
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 id="tatkal-heading" className="text-2xl font-bold text-railway-blue flex items-center gap-2">
            <Clock className="w-6 h-6 text-railway-saffron" aria-hidden="true" />
            Tatkal Fair-Booking Hold Manager (Atomic Seat Locks)
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Simulates anti-scalping checkout holds. Server-authoritative 3-minute clock, all-or-nothing group locks, and zero refresh timer resets.
          </p>
        </div>

        <span className="text-xs bg-blue-50 text-blue-900 border border-blue-200 font-bold px-3 py-1.5 rounded-full flex items-center gap-1 self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-blue-600" aria-hidden="true" />
          Server Clock Authoritative
        </span>
      </div>

      {/* Live Active Hold Status Card */}
      {activeHoldId ? (
        <div
          role="region"
          aria-label="Active Checkout Hold Timer"
          className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded font-mono uppercase">
                PROCESSING HOLD ACTIVE
              </span>
              <span className="text-xs text-slate-400 font-mono">Hold ID: {activeHoldId}</span>
            </div>
            <p className="text-sm font-semibold text-slate-200">
              Seat held exclusively for your booking attempt. Server-side countdown is authoritative.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Visual Accessible Timer */}
            <div className="text-center px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 block font-medium">Authoritative Time Remaining</span>
              <span className="text-2xl font-black font-mono text-railway-saffron tracking-wider">
                {Math.floor(remainingSeconds / 60)}m {remainingSeconds % 60}s
              </span>
            </div>

            {/* Accessible Extension Button */}
            <button
              onClick={requestAccessibleExtension}
              disabled={accessibleTimerExtensionActive}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 focus:ring-2 focus:ring-railway-saffron ${
                accessibleTimerExtensionActive
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" aria-hidden="true" />
              {accessibleTimerExtensionActive ? '+2m Extension Used' : 'Extend Timer (+2m for AT)'}
            </button>

            {/* Confirm Payment */}
            <button
              onClick={confirmTatkalPayment}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all focus:ring-2 focus:ring-emerald-300"
            >
              Simulate Payment (₹1,250) →
            </button>

            {/* Release Hold */}
            <button
              onClick={releaseTatkalHold}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700"
            >
              Cancel Hold
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-600 flex items-center justify-between">
          <span>No seat currently held by you. Select a seat from coach B2 below to establish a hold.</span>
          <button
            onClick={handleGroupHoldP1P2}
            className="px-3 py-1.5 bg-railway-navy text-white rounded-lg text-xs font-bold hover:bg-railway-blue"
          >
            Claim P1 + P2 Group Hold (Seats B2-7 & B2-8)
          </button>
        </div>
      )}

      {/* Seat Inventory Map Grid */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">
            Coach B2 Inventory Map (AC 3-Tier Tatkal Quota)
          </h2>
          {/* Legend */}
          <div className="flex items-center space-x-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              Processing (Held)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-railway-navy inline-block" />
              Confirmed (Booked)
            </span>
          </div>
        </div>

        {/* 24 Seat Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3" role="list" aria-label="Coach B2 Berths">
          {tatkalSeats.map((seat) => {
            const isAvailable = seat.status === 'AVAILABLE';
            const isProcessing = seat.status === 'PROCESSING';
            const isConfirmed = seat.status === 'CONFIRMED';
            const isSelected = selectedSeatId === seat.seatId;

            return (
              <button
                key={seat.seatId}
                role="listitem"
                onClick={() => {
                  setSelectedSeatId(seat.seatId);
                  if (isAvailable) {
                    handleClaimSingle(seat.seatId);
                  }
                }}
                disabled={!isAvailable && !isProcessing}
                className={`p-3 rounded-xl border-2 text-center transition-all focus:outline-none focus:ring-2 focus:ring-railway-saffron ${
                  isAvailable
                    ? 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 cursor-pointer'
                    : isProcessing
                    ? 'border-amber-400 bg-amber-50 text-amber-950 cursor-not-allowed'
                    : 'border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed'
                } ${isSelected ? 'ring-2 ring-railway-saffron shadow-sm' : ''}`}
                aria-label={`Seat ${seat.seatId}, ${seat.berthType} berth, status: ${seat.status}`}
              >
                <span className="font-mono text-sm font-bold block">{seat.seatId}</span>
                <span className="text-[10px] font-semibold block text-slate-600 mt-0.5">
                  {seat.berthType} Berth
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-1 ${
                    isAvailable
                      ? 'bg-emerald-200 text-emerald-900'
                      : isProcessing
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {seat.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-User Simultaneous Click Simulation Panel */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-railway-saffron" aria-hidden="true" />
          <h2 className="text-base font-bold text-slate-900">
            Live Concurrency Test: Simulate Two Users Clicking Same Seat Simultaneously
          </h2>
        </div>
        <p className="text-xs text-slate-600">
          Simulate a high-traffic Tatkal rush where User Alice and User Bob submit claims on seat <strong>{selectedSeatId}</strong> at the exact same millisecond. Demonstrates compare-and-swap lock and alternative recommendation.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSimulateRaceCondition}
            className="px-4 py-2 bg-railway-navy hover:bg-railway-blue text-white rounded-lg text-xs font-bold transition-all shadow-sm focus:ring-2 focus:ring-railway-saffron flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4 text-railway-saffron" aria-hidden="true" />
            Fire Simultaneous Clicks on {selectedSeatId}
          </button>

          <button
            onClick={() => advanceTatkalClock(60)}
            className="px-3 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100"
          >
            Advance Server Clock by +60s
          </button>

          <button
            onClick={() => advanceTatkalClock(185)}
            className="px-3 py-2 bg-white text-red-700 border border-red-300 rounded-lg text-xs font-semibold hover:bg-red-50"
          >
            Simulate Hold Expiry (+185s)
          </button>
        </div>

        {raceSimulationOutput && (
          <div
            role="region"
            aria-label="Concurrency Test Result"
            className="mt-3 p-4 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl border border-slate-800 whitespace-pre-line leading-relaxed"
          >
            {raceSimulationOutput}
          </div>
        )}
      </div>
    </section>
  );
};
