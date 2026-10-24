// Main Application Component with Low-Bandwidth Mode and Module Routing
import React, { useEffect } from 'react';
import { useJourneyStore } from './store/journeyStore.ts';
import { Navbar } from './components/Navbar.tsx';
import { SimulatedDataBanner } from './components/SimulatedDataBanner.tsx';

import { PassengerSetupScreen } from './components/PassengerSetupScreen.tsx';
import { RankedOptionsScreen } from './components/RankedOptionsScreen.tsx';
import { LegDependencyScreen } from './components/LegDependencyScreen.tsx';
import { PlanABCViewScreen } from './components/PlanABCViewScreen.tsx';
import { JourneyViewScreen } from './components/JourneyViewScreen.tsx';
import { LedgerRefundScreen } from './components/LedgerRefundScreen.tsx';
import { TatkalHoldScreen } from './components/TatkalHoldScreen.tsx';
import { DisruptionPanelScreen } from './components/DisruptionPanelScreen.tsx';
import { OfflinePackScreen } from './components/OfflinePackScreen.tsx';
import { ResultsPageScreen } from './components/ResultsPageScreen.tsx';
import { ComplianceRoadmapScreen } from './components/ComplianceRoadmapScreen.tsx';
import { AuditTrailScreen } from './components/AuditTrailScreen.tsx';

export const App: React.FC = () => {
  const { activeTab, lowBandwidthMode, recomputeAll } = useJourneyStore();

  // Initial engine computation on mount
  useEffect(() => {
    recomputeAll();
  }, [recomputeAll]);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        lowBandwidthMode
          ? 'bg-white text-black font-mono selection:bg-black selection:text-white'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Persistent SIMULATED DATA Banner on Every Screen */}
      <SimulatedDataBanner />

      {/* Navigation Header with Skip-to-Content Link */}
      <Navbar />

      {/* Main Landmark with Semantic Role and Target for Skip Link */}
      <main id="main-content" role="main" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 outline-none">
        {activeTab === 'setup' && <PassengerSetupScreen />}
        {activeTab === 'ranking' && <RankedOptionsScreen />}
        {activeTab === 'dependency' && <LegDependencyScreen />}
        {activeTab === 'plans' && <PlanABCViewScreen />}
        {activeTab === 'journey' && <JourneyViewScreen />}
        {activeTab === 'ledger' && <LedgerRefundScreen />}
        {activeTab === 'tatkal' && <TatkalHoldScreen />}
        {activeTab === 'disruptions' && <DisruptionPanelScreen />}
        {activeTab === 'offline' && <OfflinePackScreen />}
        {activeTab === 'results' && <ResultsPageScreen />}
        {activeTab === 'compliance' && <ComplianceRoadmapScreen />}
        {activeTab === 'audit' && <AuditTrailScreen />}
      </main>

      {/* Accessible Footer */}
      <footer role="contentinfo" className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            <strong>Railyug</strong> — Honesty-First Rail Journey Resilience Assistant. SIMULATED DATA ONLY.
          </p>
          <p className="text-slate-500 font-mono text-[11px]">
            WCAG 2.2 AA Verified • Rule Set: rules-v1.0 • Built with Pure TypeScript Engines
          </p>
        </div>
      </footer>
    </div>
  );
};
