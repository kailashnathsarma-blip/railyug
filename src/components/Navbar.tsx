// Accessible Navigation Bar with Skip-Link and Low-Bandwidth Toggle
import React from 'react';
import { useJourneyStore } from '../store/journeyStore.ts';
import {
  Train,
  Users,
  Sliders,
  GitFork,
  Compass,
  CreditCard,
  Clock,
  Radio,
  FileCheck,
  BarChart3,
  BookOpen,
  FileText,
  Wifi,
  WifiOff,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    lowBandwidthMode,
    setLowBandwidthMode,
    ruleSetVersion,
    activeDisruptionIds,
  } = useJourneyStore();

  const navItems = [
    { id: 'setup', label: '1. Family Setup', icon: Users },
    { id: 'ranking', label: '2. Ranked Options', icon: Sliders },
    { id: 'dependency', label: '3. Leg Dependency', icon: GitFork },
    { id: 'plans', label: '4. Plans A / B / C', icon: Compass },
    { id: 'journey', label: '5. Journey Status', icon: Train },
    { id: 'ledger', label: '7. Ledger & Refunds', icon: CreditCard },
    { id: 'tatkal', label: '8. Tatkal Hold', icon: Clock },
    { id: 'disruptions', label: '9. Disruptions (20)', icon: Radio, count: activeDisruptionIds.length },
    { id: 'offline', label: '10. Offline Pack', icon: FileCheck },
    { id: 'results', label: '11. Evaluation & Brier', icon: BarChart3 },
    { id: 'compliance', label: '12. Roadmap & Rules', icon: BookOpen },
    { id: 'audit', label: 'Audit Trail', icon: FileText },
  ];

  return (
    <>
      {/* Skip to Main Content Link for Screen Readers & Keyboard Nav */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-railway-saffron focus:text-white focus:font-bold focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-600 focus:rounded"
      >
        Skip to main content
      </a>

      <header role="banner" className="bg-railway-blue text-white shadow-md border-b border-railway-navy">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-railway-navy rounded-lg border border-blue-900/60 flex items-center justify-center">
              <Train className="w-6 h-6 text-railway-saffron" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white">Railyug</span>
                <span className="text-xs bg-railway-navy text-blue-200 border border-blue-800 px-2 py-0.5 rounded font-mono font-semibold">
                  {ruleSetVersion}
                </span>
              </div>
              <p className="text-xs text-blue-200 font-normal">
                Resilient Rail Journey Decision Assistant
              </p>
            </div>
          </div>

          {/* Accessible Controls: Low-Bandwidth Mode & Status */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
              role="switch"
              aria-checked={lowBandwidthMode}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-railway-saffron ${
                lowBandwidthMode
                  ? 'bg-amber-400 text-black border-amber-500 ring-2 ring-amber-300'
                  : 'bg-railway-navy text-blue-100 border-blue-800 hover:bg-railway-lightBlue'
              }`}
            >
              {lowBandwidthMode ? (
                <WifiOff className="w-4 h-4 text-black" aria-hidden="true" />
              ) : (
                <Wifi className="w-4 h-4 text-blue-300" aria-hidden="true" />
              )}
              <span>{lowBandwidthMode ? 'Low-Bandwidth: ON' : 'Low-Bandwidth Mode'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav
          aria-label="Application Modules"
          className="bg-railway-navy border-t border-blue-950 overflow-x-auto scrollbar-thin"
        >
          <div className="max-w-7xl mx-auto px-2 flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-railway-saffron focus:rounded-t ${
                    isActive
                      ? 'border-railway-saffron text-white bg-railway-lightBlue/40'
                      : 'border-transparent text-blue-200 hover:text-white hover:bg-railway-lightBlue/20'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-railway-saffron' : 'text-blue-300'}`} aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="ml-1 bg-railway-alertRed text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </header>
    </>
  );
};
