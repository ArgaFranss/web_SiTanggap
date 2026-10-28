import React from 'react';
import { ShieldCheck, User, Building2, Bell, AlertCircle, PlusCircle } from 'lucide-react';

interface NavbarProps {
  currentView: 'citizen' | 'admin';
  onSwitchView: (view: 'citizen' | 'admin') => void;
  onOpenReportModal: () => void;
  onNavigateToTracking?: () => void;
  activeTicketsCount: number;
  unreadNotifsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSwitchView,
  onOpenReportModal,
  onNavigateToTracking,
  activeTicketsCount,
  unreadNotifsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSwitchView('citizen')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  SiTanggap
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block">
                  Lapor Warga Real-Time
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSwitchView('citizen')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'citizen' ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              Layanan Warga
            </button>
            <button
              onClick={() => {
                onSwitchView('citizen');
                if (onNavigateToTracking) onNavigateToTracking();
              }}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span>Pantau Status Laporan</span>
              {activeTicketsCount > 0 && (
                <span className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono tabular-nums">
                  {activeTicketsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onSwitchView('admin')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentView === 'admin' ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Portal Admin Dinas</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* View Switcher Toggle */}
            <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs font-medium">
              <button
                onClick={() => onSwitchView('citizen')}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  currentView === 'citizen'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Warga</span>
              </button>
              <button
                onClick={() => onSwitchView('admin')}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Admin Dinas</span>
              </button>
            </div>

            {/* Quick Report CTA */}
            {currentView === 'citizen' ? (
              <button
                onClick={onOpenReportModal}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Lapor Sekarang</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Pusat Komando Dinas Aktif</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
