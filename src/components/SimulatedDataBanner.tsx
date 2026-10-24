// Persistent Simulated Data Warning Banner
import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const SimulatedDataBanner: React.FC<{ compact?: boolean }> = ({ compact }) => {
  return (
    <div
      role="region"
      aria-label="Simulation Environment Disclaimer"
      className={`bg-amber-500 text-slate-950 px-4 py-2 flex items-center justify-between font-medium text-xs sm:text-sm border-b-2 border-amber-600 shadow-sm ${
        compact ? 'py-1 text-xs' : ''
      }`}
    >
      <div className="flex items-center space-x-2.5 max-w-7xl mx-auto w-full">
        <span className="flex items-center bg-black text-amber-300 font-bold px-2 py-0.5 rounded text-xs tracking-wider uppercase">
          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" aria-hidden="true" />
          SIMULATED DATA
        </span>
        <span className="truncate">
          All train schedules, waitlists, platform status, and refunds are generated synthetically. Railyug is a journey resilience assistant and does not replace official IRCTC booking channels.
        </span>
      </div>
    </div>
  );
};
