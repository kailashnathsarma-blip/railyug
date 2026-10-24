// Accessible Modal for Prepared Summary Handoff to Official IRCTC Channel
import React, { useState } from 'react';
import { RankedItineraryOption } from '../types/index.ts';
import {
  ExternalLink,
  Copy,
  Check,
  X,
  AlertTriangle,
  Train,
  Users,
  ShieldAlert,
} from 'lucide-react';

interface IRCTCHandOffModalProps {
  option: RankedItineraryOption;
  onClose: () => void;
}

export const IRCTCHandOffModal: React.FC<IRCTCHandOffModalProps> = ({
  option,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const summaryText = `--- RAILYUG PREPARED IRCTC BOOKING SPECIFICATION ---
Option: ${option.name}
Train 1: 12951 Mumbai Rajdhani (Confirmed B3)
Alternative Leg 2: ${option.legs[1]?.trainNumber || '12401'} - ${option.legs[1]?.trainName || 'Nanda Devi Express'}
Travel Class: 3A / CC
Passengers:
1. Rameshwar Sharma (72, Male, Senior Citizen, Lower Berth Required, Wheelchair requested)
2. Sunita Sharma (44, Female, Linked Caregiver to P1)
3. Aarav Sharma (4, Male, Infant with Guardian)
4. Priya Sharma (28, Female, Side Lower / Accessible Berth)
5. Vikram Sharma (26, Male, Flexible Berth)

Total Estimated Railway Fare: ₹${option.totalFareINR}
Simulated Cut-off Deadline: ${option.deadlineIso}

DISCLAIMER: Railyug does not book tickets directly. Take this prepared specification to https://irctc.co.in or your official ticketing agent.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="handoff-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-railway-navy text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Train className="w-6 h-6 text-railway-saffron" aria-hidden="true" />
            <div>
              <h2 id="handoff-dialog-title" className="text-lg font-bold">
                Prepared Summary for Official IRCTC Booking
              </h2>
              <p className="text-xs text-blue-200">
                Principle 1 Honesty: Hand-off to official Indian Railways ticketing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 focus:ring-2 focus:ring-railway-saffron"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Warning Badge */}
        <div className="bg-amber-100 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2 text-xs text-amber-950 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
          <span>
            <strong>NO LIVE BOOKING INTEGRATION:</strong> Railyug is an analytical decision assistant. You must complete real payments and ticket generation through official IRCTC channels.
          </span>
        </div>

        {/* Prepared Text Box */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label htmlFor="prepared-summary-textarea" className="block text-xs font-bold text-slate-700 mb-1">
              Copy-Paste Specification for IRCTC / Station Counter:
            </label>
            <textarea
              id="prepared-summary-textarea"
              readOnly
              value={summaryText}
              rows={12}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-railway-saffron selection:bg-railway-saffron selection:text-white"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-950 flex items-start gap-2">
            <Users className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong>Passenger Co-location Verification:</strong>
              <p className="mt-0.5 text-slate-600">
                P1 and P2 co-reservation instructions are embedded. Ensure at booking time that Senior Citizen quota or Lower Berth preference is selected for P1.
              </p>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-railway-navy hover:bg-railway-blue text-white rounded-lg text-xs font-bold flex items-center gap-1.5 focus:ring-2 focus:ring-railway-saffron"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" aria-hidden="true" />
                Copy Booking Specification
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <a
              href="https://www.irctc.co.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-railway-saffron hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 focus:ring-2 focus:ring-railway-blue"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              Open Official IRCTC Portal
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 focus:ring-2 focus:ring-slate-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
