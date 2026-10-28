import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CitizenHome } from './components/CitizenHome';
import { TrackingView } from './components/TrackingView';
import { AdminDashboard } from './components/AdminDashboard';
import { ReportFormModal } from './components/ReportFormModal';
import { CitizenReport, NotificationLog, ReportCategory } from './types';
import { INITIAL_REPORTS } from './data/mockReports';
import { createNotificationLog } from './utils/notificationService';
import { ShieldCheck, MessageSquare, CheckCircle2, RotateCcw } from 'lucide-react';

const STORAGE_KEY_REPORTS = 'sitanggap_reports_v1';
const STORAGE_KEY_NOTIFS = 'sitanggap_notifs_v1';

export default function App() {
  // Current active main view: 'citizen' or 'admin'
  const [currentView, setCurrentView] = useState<'citizen' | 'admin'>('citizen');
  // Citizen internal view: 'home' or 'tracking'
  const [citizenSubView, setCitizenSubView] = useState<'home' | 'tracking'>('home');
  // Selected ticket for tracking
  const [selectedTicketNumber, setSelectedTicketNumber] = useState<string>('LPR-2026-1049');
  // Report form modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [initialModalCategory, setInitialModalCategory] = useState<ReportCategory>('jalan_berlubang');

  // Reports state from localStorage
  const [reports, setReports] = useState<CitizenReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_REPORTS;
  });

  // Notification logs state
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    // Generate initial sample log
    const sample = INITIAL_REPORTS[0];
    return [
      createNotificationLog(sample, 'dalam_pengerjaan', 'Tim Bina Marga Unit 2 telah tiba di lokasi dengan aspal dingin.'),
    ];
  });

  // Live Toast notification state
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; phone?: string } | null>(null);

  // Sync reports to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.error('Failed to save reports to localStorage', e);
    }
  }, [reports]);

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notificationLogs));
    } catch (e) {
      console.error('Failed to save notifications to localStorage', e);
    }
  }, [notificationLogs]);

  // Handle new report submission from citizen
  const handleAddNewReport = (newReport: CitizenReport) => {
    setReports((prev) => [newReport, ...prev]);
    setSelectedTicketNumber(newReport.ticketNumber);
    setCitizenSubView('tracking');

    // Auto-create initial confirmation notification log
    const initialLog = createNotificationLog(newReport, 'terkirim');
    setNotificationLogs((prev) => [initialLog, ...prev]);

    // Show live Toast
    setToastMessage({
      title: 'Laporan Berhasil Diterbitkan!',
      desc: `No. Tiket #${newReport.ticketNumber} diteruskan ke ${newReport.departmentName}. Notifikasi otomatis dikirimkan ke WhatsApp Anda.`,
      phone: newReport.reporterPhone,
    });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Handle report update from Admin Dashboard
  const handleUpdateReport = (updatedReport: CitizenReport) => {
    setReports((prev) =>
      prev.map((r) => (r.id === updatedReport.id ? updatedReport : r))
    );

    // Show live Toast
    setToastMessage({
      title: 'Progres Tiket Diperbarui Petugas',
      desc: `Status #${updatedReport.ticketNumber} diubah menjadi: ${updatedReport.status.toUpperCase()}. Pesan otomatis terkirim ke warga.`,
      phone: updatedReport.reporterPhone,
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add notification log
  const handleAddNotificationLog = (newLog: NotificationLog) => {
    setNotificationLogs((prev) => [newLog, ...prev]);
  };

  // Handle citizen rating & review
  const handleRateReport = (reportId: string, rating: number, feedback: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              citizenRating: rating,
              citizenFeedback: feedback,
            }
          : r
      )
    );
  };

  // Reset to initial demo data
  const handleResetDemoData = () => {
    setReports(INITIAL_REPORTS);
    const sample = INITIAL_REPORTS[0];
    setNotificationLogs([
      createNotificationLog(sample, 'dalam_pengerjaan', 'Tim Bina Marga Unit 2 telah tiba di lokasi dengan aspal dingin.'),
    ]);
    setSelectedTicketNumber('LPR-2026-1049');
    setToastMessage({
      title: 'Data Demo Direset',
      desc: 'Dataset telah dikembalikan ke kondisi awal dengan sampel foto beresolusi tinggi.',
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Quick navigation to tracking
  const handleNavigateToTracking = (ticketNum?: string) => {
    if (ticketNum) {
      setSelectedTicketNumber(ticketNum);
    }
    setCitizenSubView('tracking');
  };

  // Open report modal with optional preselected category
  const handleOpenReportModal = (category?: ReportCategory) => {
    if (category) {
      setInitialModalCategory(category);
    }
    setIsReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onSwitchView={(v) => {
          setCurrentView(v);
          if (v === 'citizen' && citizenSubView === 'tracking') {
            // keep tracking or stay
          }
        }}
        onOpenReportModal={() => handleOpenReportModal()}
        onNavigateToTracking={() => handleNavigateToTracking()}
        activeTicketsCount={reports.filter((r) => r.status !== 'selesai').length}
        unreadNotifsCount={notificationLogs.length}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'citizen' ? (
          <div>
            {/* View Sub-Tabs (Beranda vs Pantau Status) */}
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCitizenSubView('home')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    citizenSubView === 'home'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Beranda & Lapor Darurat
                </button>
                <button
                  type="button"
                  onClick={() => setCitizenSubView('tracking')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    citizenSubView === 'tracking'
                      ? 'bg-emerald-700 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>Pantau Status & Notifikasi</span>
                  <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.2 rounded">
                    #{selectedTicketNumber.replace('LPR-2026-', '')}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleOpenReportModal()}
                className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 hidden sm:block cursor-pointer"
              >
                + Formulir Laporan Baru
              </button>
            </div>

            {/* Sub-View Render */}
            {citizenSubView === 'home' ? (
              <CitizenHome
                reports={reports}
                onOpenReportModal={handleOpenReportModal}
                onTrackTicket={(ticket) => handleNavigateToTracking(ticket)}
              />
            ) : (
              <TrackingView
                reports={reports}
                selectedTicketNumber={selectedTicketNumber}
                onSelectTicket={(ticket) => setSelectedTicketNumber(ticket)}
                onRateReport={handleRateReport}
                onNewReportClick={() => handleOpenReportModal()}
              />
            )}
          </div>
        ) : (
          /* Government Admin Portal */
          <AdminDashboard
            reports={reports}
            onUpdateReport={handleUpdateReport}
            notificationLogs={notificationLogs}
            onAddNotificationLog={handleAddNotificationLog}
          />
        )}
      </main>

      {/* Global Interactive Report Modal */}
      <ReportFormModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleAddNewReport}
        initialCategory={initialModalCategory}
      />

      {/* Floating Real-Time Status Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700 flex items-start gap-3 animate-slide-up">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-white text-xs">{toastMessage.title}</h4>
            <p className="text-slate-300 mt-0.5 leading-relaxed">{toastMessage.desc}</p>
            {toastMessage.phone && (
              <p className="text-[11px] text-emerald-400 mt-1 font-mono">
                WhatsApp: {toastMessage.phone}
              </p>
            )}
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Clean Municipal Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-800">
              SiTanggap Kota — Sistem Pelayanan Aduan Darurat Masyarakat
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Dinas PUPR</span>
            <span>·</span>
            <span>Dinas Perhubungan</span>
            <span>·</span>
            <span>Dinas Pertamanan</span>
            <span>·</span>
            <span>Dinas Lingkungan Hidup</span>
            <span>·</span>
            <button
              onClick={handleResetDemoData}
              className="text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset data ke default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data Demo</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
