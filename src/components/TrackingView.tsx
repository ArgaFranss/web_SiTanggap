import React, { useState } from 'react';
import { 
  Search, CheckCircle2, Clock, MapPin, Building2, AlertTriangle, ShieldCheck, 
  MessageSquare, Star, ArrowRight, Share2, Copy, Check, Eye, User, Phone
} from 'lucide-react';
import { CitizenReport, ReportStatus } from '../types';
import { CATEGORIES_CONFIG, DEPARTMENTS } from '../data/categories';
import { generateNotificationMessage } from '../utils/notificationService';

interface TrackingViewProps {
  reports: CitizenReport[];
  selectedTicketNumber?: string;
  onSelectTicket: (ticketNum: string) => void;
  onRateReport: (reportId: string, rating: number, feedback: string) => void;
  onNewReportClick: () => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  reports,
  selectedTicketNumber,
  onSelectTicket,
  onRateReport,
  onNewReportClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [userRating, setUserRating] = useState<number>(5);
  const [userFeedback, setUserFeedback] = useState('');
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);

  // Active selected report or first one
  const activeReport = 
    reports.find((r) => r.ticketNumber === selectedTicketNumber) || 
    reports[0];

  const filteredReports = reports.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.ticketNumber.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.reporterPhone.includes(q) ||
      r.locationName.toLowerCase().includes(q)
    );
  });

  const getStatusStepIndex = (status: ReportStatus): number => {
    switch (status) {
      case 'terkirim':
        return 0;
      case 'terverifikasi':
        return 1;
      case 'disposisi':
        return 2;
      case 'dalam_pengerjaan':
        return 3;
      case 'selesai':
        return 4;
      case 'ditolak':
        return -1;
      default:
        return 0;
    }
  };

  const steps = [
    { title: 'Diterima', desc: 'Tiket dicatat di sistem' },
    { title: 'Verifikasi Foto', desc: 'Cek bukti & geotag' },
    { title: 'Disposisi Dinas', desc: 'Diteruskan ke instansi' },
    { title: 'Pengerjaan', desc: 'Tim teknis di lapangan' },
    { title: 'Selesai', desc: 'Tuntas & foto hasil' },
  ];

  const handleCopyNotification = () => {
    if (!activeReport) return;
    const msg = generateNotificationMessage(activeReport, activeReport.status);
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    if (!activeReport) return;
    const msg = encodeURIComponent(generateNotificationMessage(activeReport, activeReport.status));
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;
    onRateReport(activeReport.id, userRating, userFeedback);
    setShowFeedbackSuccess(true);
    setTimeout(() => setShowFeedbackSuccess(false), 3000);
  };

  if (!activeReport) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-slate-600 mb-4">Belum ada laporan yang terdaftar.</p>
        <button
          onClick={onNewReportClick}
          className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
        >
          Buat Laporan Pertama
        </button>
      </div>
    );
  }

  const activeStepIdx = getStatusStepIndex(activeReport.status);
  const currentCat = CATEGORIES_CONFIG[activeReport.category];
  const currentDept = DEPARTMENTS[activeReport.departmentId];

  return (
    <div className="space-y-6">
      {/* Search and Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari No. Tiket (#LPR-2026-...) / No. HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* Quick horizontal ticket pills */}
        <div className="w-full md:w-auto overflow-x-auto flex items-center gap-2 pb-1 md:pb-0">
          <span className="text-xs text-slate-500 whitespace-nowrap">Daftar Tiket:</span>
          {filteredReports.map((rep) => {
            const isSelected = rep.ticketNumber === activeReport.ticketNumber;
            return (
              <button
                key={rep.id}
                onClick={() => onSelectTicket(rep.ticketNumber)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                #{rep.ticketNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Ticket Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Progress Stepper, Ticket Details, Timeline, Before/After */}
        <div className="lg:col-span-8 space-y-6">
          {/* Ticket Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
                  <span className="font-bold text-slate-900 text-sm">#{activeReport.ticketNumber}</span>
                  <span>·</span>
                  <span>{new Date(activeReport.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>·</span>
                  <span className="font-sans font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {currentDept.name}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {activeReport.title}
                </h2>
              </div>

              {/* Urgency Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                    activeReport.urgency === 'darurat'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : activeReport.urgency === 'prioritas'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Urgensi: {activeReport.urgency}
                </span>
              </div>
            </div>

            {/* Visual 5-Step Stepper */}
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Progres Penanganan Real-Time
              </p>
              <div className="grid grid-cols-5 gap-1 relative">
                {steps.map((st, i) => {
                  const isDone = activeStepIdx >= i;
                  const isCurrent = activeStepIdx === i;
                  return (
                    <div key={i} className="flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        } ${isCurrent ? 'ring-4 ring-emerald-100 scale-105' : ''}`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      <span className={`text-[11px] font-bold leading-tight ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                        {st.title}
                      </span>
                      <span className="hidden sm:block text-[10px] text-slate-500 mt-0.5">
                        {st.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Meta Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block">Titik Lokasi:</span>
                  <span className="font-medium text-slate-800">{activeReport.locationName}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block">Dinas Bertugas:</span>
                  <span className="font-medium text-slate-800">{activeReport.departmentName}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block">Target SLA Tanggap:</span>
                  <span className="font-medium text-slate-800 font-mono">~{activeReport.estimatedSLAHours} Jam</span>
                </div>
              </div>
            </div>

            {/* Description quote */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700">
              <p className="font-semibold text-slate-900 mb-1">Rincian Laporan Warga:</p>
              <p className="leading-relaxed">{activeReport.description}</p>
              {activeReport.landmarkNote && (
                <p className="text-[11px] text-slate-500 mt-1 italic">
                  Patokan: {activeReport.landmarkNote}
                </p>
              )}
            </div>
          </div>

          {/* Before & After Photo Evidence Comparison */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Bukti Foto Penanganan (Sebelum vs Sesudah)
              </h3>
              <span className="text-xs text-slate-500">Transparansi Pekerjaan Dinas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo Before */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">1. Foto Kejadian (Warga)</span>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Terverifikasi Akurat
                  </span>
                </div>
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                  <img
                    src={activeReport.photoUrl}
                    alt="Foto Awal Laporan"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    Skor AI: {activeReport.photoValidation.score}/100
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  {activeReport.photoValidation.notes}
                </p>
              </div>

              {/* Photo After / In Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">2. Hasil Tindak Lanjut Petugas</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    activeReport.status === 'selesai'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {activeReport.status === 'selesai' ? 'Pekerjaan Tuntas' : 'Sedang Ditangani'}
                  </span>
                </div>

                {activeReport.status === 'selesai' ? (
                  <div className="aspect-video rounded-xl overflow-hidden bg-emerald-50 border border-emerald-200 relative">
                    <img
                      src={activeReport.completionPhotoUrl || activeReport.photoUrl}
                      alt="Foto Hasil Selesai"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-emerald-950/20"></div>
                    <div className="absolute bottom-2 left-2 bg-emerald-800/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      Verifikasi Akhir Tuntas
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-center">
                    <Clock className="w-8 h-8 text-amber-500 mb-2 animate-pulse" />
                    <p className="text-xs font-semibold text-slate-800">
                      Foto Pasca-Perbaikan Sedang Disiapkan
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                      Petugas dinas ({activeReport.assignedTeam || activeReport.departmentName}) akan mengunggah dokumentasi saat selesai.
                    </p>
                  </div>
                )}

                {activeReport.completionNotes && (
                  <p className="text-[11px] text-emerald-800 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                    <strong>Catatan Penyelesaian: </strong> {activeReport.completionNotes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Official Timeline Log */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Riwayat Tindak Lanjut & Catatan Petugas
            </h3>
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {activeReport.timeline.map((item, idx) => (
                <div key={item.id} className="relative pl-7 group">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 border-2 border-white absolute left-1.5 top-1"></span>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.title}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{item.timestamp}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{item.description}</p>
                    <div className="pt-1 text-[11px] text-slate-500">
                      Oleh: <strong className="text-slate-700">{item.actor}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): User Notification Hub, WhatsApp Simulation, and Citizen Rating */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notification Hub Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Notifikasi Status Warga</span>
              </h3>
              <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Live WhatsApp
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Setiap perubahan status tiket memicu pesan otomatis ke nomor WhatsApp pelapor:
              <strong className="block text-slate-800 font-mono mt-0.5">{activeReport.reporterPhone} ({activeReport.reporterName})</strong>
            </p>

            {/* WhatsApp Phone Mockup Bubble */}
            <div className="bg-emerald-800/10 p-3.5 rounded-xl border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-emerald-900 font-semibold border-b border-emerald-200/60 pb-1.5">
                <span>SiTanggap Official Bot</span>
                <span className="font-mono text-[10px] text-slate-500">Baru Saja</span>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-2xs border border-emerald-100 text-xs font-sans text-slate-800 whitespace-pre-line leading-relaxed">
                {generateNotificationMessage(activeReport, activeReport.status, activeReport.completionNotes)}
              </div>
            </div>

            {/* Action Buttons for Notification */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Buka Pesan di WhatsApp Warga</span>
              </button>

              <button
                type="button"
                onClick={handleCopyNotification}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Teks Pesan Disalin!' : 'Salin Teks Pesan Otomatis'}</span>
              </button>
            </div>
          </div>

          {/* Citizen Feedback & Rating (if status is 'selesai') */}
          {activeReport.status === 'selesai' && (
            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Ulasan Kepuasan Warga
                </h3>
              </div>

              {activeReport.citizenRating ? (
                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= (activeReport.citizenRating || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="text-slate-700 font-bold ml-1 font-mono">
                      {activeReport.citizenRating}/5
                    </span>
                  </div>
                  <p className="text-slate-700 italic">
                    "{activeReport.citizenFeedback || 'Layanan tanggap dan cepat.'}"
                  </p>
                  <p className="text-[10px] text-emerald-800">
                    Terima kasih atas penilaian Anda!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitRating} className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Bantu dinas meningkatkan kualitas layanan dengan memberikan ulasan kinerja tim lapangan:
                  </p>

                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setUserRating(s)}
                        className="cursor-pointer p-1"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            s <= userRating
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      {userRating} Bintang
                    </span>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Bagaimana hasil penanganan tim dinas di lokasi?"
                    value={userFeedback}
                    onChange={(e) => setUserFeedback(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                  />

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Kirim Penilaian Warga
                  </button>

                  {showFeedbackSuccess && (
                    <p className="text-[11px] text-emerald-700 font-medium text-center">
                      Ulasan berhasil dikirim ke pimpinan dinas!
                    </p>
                  )}
                </form>
              )}
            </div>
          )}

          {/* Quick FAQ / Emergency Numbers */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-800">Kontak Darurat Terpadu</h4>
            <div className="space-y-1 text-slate-600 text-[11px]">
              <div className="flex justify-between">
                <span>Call Center Darurat Kota:</span>
                <strong className="text-slate-900 font-mono">112 (Bebas Pulsa)</strong>
              </div>
              <div className="flex justify-between">
                <span>Pusat Pengaduan PUPR:</span>
                <strong className="text-slate-900 font-mono">158</strong>
              </div>
              <div className="flex justify-between">
                <span>Dishub Derek & PJU:</span>
                <strong className="text-slate-900 font-mono">(021) 345-1234</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
