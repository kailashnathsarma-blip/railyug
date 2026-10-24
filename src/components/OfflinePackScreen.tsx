// Screen 10: Offline Journey Pack, Sync Conflict Resolution, and Tier 2 Utilities
import React, { useState } from 'react';
import { useJourneyStore } from '../store/journeyStore.ts';
import {
  FileCheck,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Shield,
  Train,
  ArrowRight,
  GitCompare,
  UserCheck,
  FileText,
} from 'lucide-react';

export const OfflinePackScreen: React.FC = () => {
  const { legs, passengers, ruleSetVersion, lowBandwidthMode } = useJourneyStore();

  // Simulated Sync Conflict State
  const [syncStatus, setSyncStatus] = useState<'IN_SYNC' | 'CONFLICT_DETECTED' | 'RESOLVED'>('CONFLICT_DETECTED');
  const [offlinePackDownloaded, setOfflinePackDownloaded] = useState(false);

  // Name Mismatch Detector State (Tier 2)
  const [name1, setName1] = useState('Vikram Sharma');
  const [name2, setName2] = useState('Vikram K Sharma');

  // Mutual Consent Seat Swap State (Tier 2)
  const [seatSwapState, setSeatSwapState] = useState<{
    passengerA: string;
    seatA: string;
    passengerB: string;
    seatB: string;
    consentA: boolean;
    consentB: boolean;
    status: string;
  }>({
    passengerA: 'P4 (Priya Sharma)',
    seatA: 'Coach B3, Berth 15 (Side Lower)',
    passengerB: 'Co-passenger (Unrelated Adult)',
    seatB: 'Coach B3, Berth 13 (Middle Berth)',
    consentA: true,
    consentB: true,
    status: 'MUTUAL_CONSENT_ACKNOWLEDGED',
  });

  // Simple string similarity for name mismatch detector
  const computeSimilarity = (s1: string, s2: string): number => {
    const a = s1.trim().toLowerCase();
    const b = s2.trim().toLowerCase();
    if (a === b) return 1.0;
    let matches = 0;
    const setA = new Set(a.split(' '));
    const setB = new Set(b.split(' '));
    for (const word of setA) {
      if (setB.has(word)) matches++;
    }
    return Number((matches / Math.max(setA.size, setB.size)).toFixed(2));
  };

  const nameSimilarity = computeSimilarity(name1, name2);

  const handleDownloadPack = () => {
    setOfflinePackDownloaded(true);
    setTimeout(() => setOfflinePackDownloaded(false), 3000);
  };

  const handleResolveConflict = () => {
    setSyncStatus('RESOLVED');
  };

  return (
    <section aria-labelledby="offline-pack-heading" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 id="offline-pack-heading" className="text-2xl font-bold text-railway-blue flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-railway-saffron" aria-hidden="true" />
            Offline Journey Pack & Three-Way Sync Conflict Resolution
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Complete self-contained pocket pack. Operates in zero-connectivity environments with clear precedence: newer official railway data wins on sync.
          </p>
        </div>

        <button
          onClick={handleDownloadPack}
          className="px-4 py-2 bg-railway-navy hover:bg-railway-blue text-white rounded-lg text-xs font-bold transition-all shadow-sm focus:ring-2 focus:ring-railway-saffron flex items-center gap-1.5 self-start md:self-auto"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          {offlinePackDownloaded ? 'Pocket Pack Exported!' : 'Export Encrypted Offline Pack (JSON)'}
        </button>
      </div>

      {/* Sync Conflict Resolution Panel */}
      <div
        role="region"
        aria-label="Offline Sync Conflict Summary"
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-amber-600" aria-hidden="true" />
            <h2 className="text-base font-bold text-slate-900">
              Station Mesh Sync & Conflict Resolution
            </h2>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
              syncStatus === 'CONFLICT_DETECTED'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {syncStatus === 'CONFLICT_DETECTED' ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
                Sync Conflict Detected (1 Field)
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                Synced: Official Data Precedence Enforced
              </>
            )}
          </span>
        </div>

        {syncStatus === 'CONFLICT_DETECTED' ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              A background sync conflict occurred between cached offline notes and official railway feeds. <strong>Principle: Official data always wins; local traveler edits become attached notes.</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <span className="font-bold text-blue-950 block mb-1">
                  Incoming Official Railway Update (Version 2026.10.25-1800):
                </span>
                <p className="text-slate-800">
                  <strong>Departure Platform for Train 2 (12059):</strong> Platform 4 → <strong>Platform 6</strong> (due to rake shunting).
                </p>
                <span className="text-[11px] text-blue-700 block mt-1">Source: Official Station Master Feed (Authoritative)</span>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-950 block mb-1">
                  Local Traveler Note (Created Offline):
                </span>
                <p className="text-slate-800">
                  "Family porter waiting at Platform 4 water booth with wheelchair."
                </p>
                <span className="text-[11px] text-amber-700 block mt-1">Source: Local Device Edit (Preserved as Note)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-700 flex items-center justify-between">
              <span>Resolution: Official Platform 6 is adopted. Porter note is flagged to re-route porter to PF 6.</span>
              <button
                onClick={handleResolveConflict}
                className="px-3 py-1.5 bg-railway-navy text-white rounded text-xs font-bold hover:bg-railway-blue"
              >
                Apply Precedence Rule (Sync Cleanly)
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 rounded-lg text-xs text-emerald-950 border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>
              All local records reconciled. Official platform status (PF 6) updated with local porter notification attached. No silent overwrite occurred.
            </span>
          </div>
        )}
      </div>

      {/* Offline Pocket Journey Pack Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-railway-navy" aria-hidden="true" />
          Offline Pocket Pack Snapshot (Accessible Without Internet)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Confirmed Berth Allocation */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">
              Confirmed Berths (Leg 1: 12951)
            </span>
            <ul className="space-y-1 font-mono text-slate-700">
              <li>P1 (Rameshwar): Coach B3, Berth 12 (LB)</li>
              <li>P2 (Sunita): Coach B3, Berth 11 (MB)</li>
              <li>P3 (Aarav): Coach B3, With P1/P2</li>
              <li>P4 (Priya): Coach B3, Berth 15 (SL)</li>
              <li>P5 (Vikram): Coach B3, Berth 16 (SU)</li>
            </ul>
          </div>

          {/* Emergency Helplines & Contacts */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">
              Emergency Railway Contacts
            </span>
            <ul className="space-y-1 text-slate-700">
              <li className="flex justify-between">
                <span>Railway Security Helpline:</span>
                <span className="font-bold font-mono">139</span>
              </li>
              <li className="flex justify-between">
                <span>Kota Station Div Supr:</span>
                <span className="font-bold font-mono">0744-2467000</span>
              </li>
              <li className="flex justify-between">
                <span>Div Handicap Assistance:</span>
                <span className="font-bold font-mono">0744-2467055</span>
              </li>
              <li className="flex justify-between">
                <span>IRCTC Executive Lounge:</span>
                <span className="font-bold font-mono">0744-2467888</span>
              </li>
            </ul>
          </div>

          {/* Fallback Plan Specification */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">
              Guaranteed Fallback Directive
            </span>
            <p className="text-slate-600 leading-relaxed">
              If Train 1 exceeds 45m delay, group immediately disembarks at Kota and proceeds to IRCTC Retiring Room. TDR filed under Reason "Missed Connection".
            </p>
            <span className="text-[11px] text-blue-700 font-semibold block">
              Pack Rule-Set Version: {ruleSetVersion}
            </span>
          </div>
        </div>
      </div>

      {/* Tier 2: Name Mismatch Detector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <UserCheck className="w-5 h-5 text-railway-navy" aria-hidden="true" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Tier 2: Name Mismatch Detector (Normalized String Similarity)
            </h2>
            <p className="text-xs text-slate-500">
              Detects spelling discrepancies across multi-leg tickets to preempt ID inspection friction by TTEs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label htmlFor="ticket-name-1" className="font-bold text-slate-700 block mb-1">
              Ticket 1 Passenger Name (Leg 1):
            </label>
            <input
              id="ticket-name-1"
              type="text"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-railway-saffron"
            />
          </div>

          <div>
            <label htmlFor="ticket-name-2" className="font-bold text-slate-700 block mb-1">
              Ticket 2 Passenger Name (Leg 2):
            </label>
            <input
              id="ticket-name-2"
              type="text"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-railway-saffron"
            />
          </div>
        </div>

        <div
          role="region"
          aria-label="Name Mismatch Analysis"
          className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2 text-amber-950"
        >
          <div className="flex justify-between items-center font-bold">
            <span>Normalized String Match Score:</span>
            <span className="font-mono text-sm">{Math.round(nameSimilarity * 100)}% Match</span>
          </div>
          <p>
            <strong>Consequence:</strong> Discrepancy between "{name1}" and "{name2}" may trigger manual verification by the traveling ticket examiner (TTE) or risk being deemed an invalid ticket without matching Government photo ID.
          </p>
          <p className="text-slate-700 border-t border-amber-200 pt-2">
            <strong>Authorized Railway Correction Path:</strong> Visit the Station Master / Chief Reservation Supervisor at originating station MMCT with original Govt Photo ID (Aadhaar/Passport) at least 24 hours prior to departure for official endorse stamp. <em>(Railyug cannot promise official railway outcome).</em>
          </p>
        </div>
      </div>

      {/* Tier 2: Mutual-Consent Seat Exchange with Compliance Notice */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Shield className="w-5 h-5 text-blue-700" aria-hidden="true" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Tier 2: Mutual-Consent Seat Exchange for Family Proximity
            </h2>
            <p className="text-xs text-slate-500">
              Facilitates informal courtesy swaps so caregivers remain adjacent to mobility-impaired passengers.
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-300 p-3 rounded-lg text-xs text-red-950 font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" aria-hidden="true" />
          <span>
            COMPLIANCE NOTICE: An informal seat exchange between willing passengers is a courtesy agreement only. It DOES NOT alter official railway chart records, ticket validity, or insurance entitlements.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block">Family Traveler:</span>
            <p className="text-slate-700 mt-1">{seatSwapState.passengerA}</p>
            <p className="font-mono text-[11px] text-slate-500 mt-0.5">Holding: {seatSwapState.seatA}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block">Co-Passenger:</span>
            <p className="text-slate-700 mt-1">{seatSwapState.passengerB}</p>
            <p className="font-mono text-[11px] text-slate-500 mt-0.5">Holding: {seatSwapState.seatB}</p>
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-950 border border-blue-200 flex items-center justify-between">
          <span className="font-semibold">
            Status: Mutual consent verified on-board. Sunita and Rameshwar seated together.
          </span>
          <span className="text-[11px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded">
            COURTESY SWAP ONLY
          </span>
        </div>
      </div>
    </section>
  );
};
