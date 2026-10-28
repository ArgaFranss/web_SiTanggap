import React, { useState } from 'react';
import { 
  Building2, Filter, Search, CheckCircle2, Clock, AlertTriangle, 
  Send, Camera, ShieldCheck, Eye, RefreshCw, MessageSquare, 
  ArrowUpRight, Check, X, FileText, ChevronRight, User, Phone, MapPin
} from 'lucide-react';
import { CitizenReport, DepartmentId, ReportStatus, UrgencyLevel, NotificationLog } from '../types';
import { CATEGORIES_CONFIG, DEPARTMENTS } from '../data/categories';
import { generateNotificationMessage, createNotificationLog } from '../utils/notificationService';

interface AdminDashboardProps {
  reports: CitizenReport[];
  onUpdateReport: (updatedReport: CitizenReport) => void;
  notificationLogs: NotificationLog[];
  onAddNotificationLog: (log: NotificationLog) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reports,
  onUpdateReport,
  notificationLogs,
  onAddNotificationLog,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTicket, setActiveTicket] = useState<CitizenReport | null>(reports[0] || null);
  
  // Progress edit states for active ticket
  const [editStatus, setEditStatus] = useState<ReportStatus>(reports[0]?.status || 'terkirim');
  const [editTeam, setEditTeam] = useState<string>(reports[0]?.assignedTeam || '');
  const [editOfficer, setEditOfficer] = useState<string>(reports[0]?.assignedOfficer || '');
  const [editRemarks, setEditRemarks] = useState<string>('');
  const [editAfterPhoto, setEditAfterPhoto] = useState<string>(reports[0]?.completionPhotoUrl || '');
  
  // Notification modal / toast
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifSentNotice, setNotifSentNotice] = useState(false);

  // Sync edit state when active ticket changes
  const handleSelectTicket = (rep: CitizenReport) => {
    setActiveTicket(rep);
    setEditStatus(rep.status);
    setEditTeam(rep.assignedTeam || '');
    setEditOfficer(rep.assignedOfficer || '');
    setEditRemarks('');
    setEditAfterPhoto(rep.completionPhotoUrl || '');
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (selectedDept !== 'all' && r.departmentId !== selectedDept) return false;
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    if (selectedUrgency !== 'all' && r.urgency !== selectedUrgency) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.ticketNumber.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.locationName.toLowerCase().includes(q) ||
        r.reporterName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // KPI Calculations
  const totalCount = reports.length;
  const emergencyCount = reports.filter((r) => r.urgency === 'darurat').length;
  const inProgressCount = reports.filter((r) => r.status === 'dalam_pengerjaan' || r.status === 'disposisi').length;
  const completedCount = reports.filter((r) => r.status === 'selesai').length;
  const pendingValidationCount = reports.filter((r) => r.status === 'terkirim').length;

  // Handle Save Progress & Dispatch
  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;

    const nowLocal = new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const statusTitleMap: Record<ReportStatus, string> = {
      terkirim: 'Status Dikembalikan ke Diterima',
      terverifikasi: 'Foto & Titik Kerusakan Divalidasi Petugas',
      disposisi: `Disposisi Surat Tugas ke ${activeTicket.departmentName}`,
      dalam_pengerjaan: `Tim Lapangan Ditugaskan: ${editTeam || 'Regu Reaksi Cepat'}`,
      selesai: 'Pekerjaan di Lokasi Telah Tuntas',
      ditolak: 'Laporan Dinyatakan Tidak Sesuai Kriteria',
    };

    const newTimelineItem = {
      id: `tl-${Date.now()}`,
      status: editStatus,
      title: statusTitleMap[editStatus],
      description: editRemarks || `Pembaruan status operasional oleh ${editOfficer || 'Admin Dinas'}.`,
      timestamp: `${nowLocal} WIB`,
      actor: editOfficer || 'Admin Dinas SiTanggap',
      evidencePhotoUrl: editStatus === 'selesai' ? editAfterPhoto : undefined,
    };

    const updated: CitizenReport = {
      ...activeTicket,
      status: editStatus,
      assignedTeam: editTeam || activeTicket.assignedTeam,
      assignedOfficer: editOfficer || activeTicket.assignedOfficer,
      completionNotes: editRemarks || activeTicket.completionNotes,
      completionPhotoUrl: editAfterPhoto || activeTicket.completionPhotoUrl,
      updatedAt: new Date().toISOString(),
      timeline: [newTimelineItem, ...activeTicket.timeline],
    };

    onUpdateReport(updated);
    setActiveTicket(updated);

    // Auto-create notification log for the citizen
    const log = createNotificationLog(updated, editStatus, editRemarks);
    onAddNotificationLog(log);

    setNotifSentNotice(true);
    setTimeout(() => setNotifSentNotice(false), 3500);
  };

  // Quick verify photo action
  const handleVerifyPhoto = (isValid: boolean) => {
    if (!activeTicket) return;
    const updated: CitizenReport = {
      ...activeTicket,
      status: isValid ? 'terverifikasi' : 'ditolak',
      photoValidation: {
        ...activeTicket.photoValidation,
        isValid,
        recommendation: isValid ? 'accepted' : 'rejected',
        notes: isValid
          ? 'Divalidasi langsung oleh petugas dinas: Foto sesuai dan akurat.'
          : 'Ditolak petugas dinas: Foto tidak jelas atau bukan fasilitas publik.',
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateReport(updated);
    setActiveTicket(updated);
    setEditStatus(isValid ? 'terverifikasi' : 'ditolak');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Metrics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Pemerintah Kota</span>
              <span>·</span>
              <span className="font-semibold text-emerald-800">Pusat Pengendali Pengaduan & Tanggap Darurat</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Dashboard Admin & Disposisi Antar-Dinas
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">
              Terakhir diperbarui: Real-time
            </span>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-500 block">Total Tiket Masuk</span>
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums block mt-1">
              {totalCount}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Semua instansi kota</span>
          </div>

          <div className="p-3.5 bg-red-50 rounded-xl border border-red-200">
            <span className="text-xs font-semibold text-red-800 block">Darurat Aktif</span>
            <span className="text-2xl font-bold text-red-700 font-mono tabular-nums block mt-1">
              {emergencyCount}
            </span>
            <span className="text-[11px] text-red-600 mt-1 block">Wajib respon &lt; 2 jam</span>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-xs font-semibold text-amber-800 block">Perlu Verifikasi</span>
            <span className="text-2xl font-bold text-amber-700 font-mono tabular-nums block mt-1">
              {pendingValidationCount}
            </span>
            <span className="text-[11px] text-amber-600 mt-1 block">Cek bukti foto</span>
          </div>

          <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-xs font-semibold text-blue-800 block">Sedang Pengerjaan</span>
            <span className="text-2xl font-bold text-blue-700 font-mono tabular-nums block mt-1">
              {inProgressCount}
            </span>
            <span className="text-[11px] text-blue-600 mt-1 block">Tim di lokasi</span>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 col-span-2 sm:col-span-1">
            <span className="text-xs font-semibold text-emerald-800 block">Selesai Ditangani</span>
            <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums block mt-1">
              {completedCount}
            </span>
            <span className="text-[11px] text-emerald-600 mt-1 block">Foto perbaikan valid</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Split: Left (Filter & Ticket List), Right (Detail, Photo Validation & Auto-Notification) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Filter & Tickets Queue */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari tiket, lokasi, nama warga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Department Filter Pills */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Filter Dinas Instansi:
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedDept('all')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                    selectedDept === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua
                </button>
                {Object.values(DEPARTMENTS).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDept(d.id)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                      selectedDept === d.id
                        ? 'bg-emerald-700 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Status & Urgency Dropdowns */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Status Tiket
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-700 bg-white"
                >
                  <option value="all">Semua Status</option>
                  <option value="terkirim">Terkirim (Baru)</option>
                  <option value="terverifikasi">Terverifikasi</option>
                  <option value="disposisi">Disposisi</option>
                  <option value="dalam_pengerjaan">Dalam Pengerjaan</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Urgensi
                </label>
                <select
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-700 bg-white"
                >
                  <option value="all">Semua Urgensi</option>
                  <option value="darurat">Darurat Saja</option>
                  <option value="prioritas">Prioritas</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ticket Queue List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Menampilkan {filteredReports.length} laporan</span>
              <span>Urutan waktu pelaporan</span>
            </div>

            {filteredReports.map((report) => {
              const isSelected = activeTicket?.id === report.id;
              const dept = DEPARTMENTS[report.departmentId];
              return (
                <div
                  key={report.id}
                  onClick={() => handleSelectTicket(report)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-600'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                      <span className="font-bold text-slate-900">#{report.ticketNumber}</span>
                      <span>·</span>
                      <span className="text-emerald-700 font-sans font-semibold">{dept.name}</span>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        report.urgency === 'darurat'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : report.urgency === 'prioritas'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {report.urgency}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                    {report.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-2 line-clamp-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{report.locationName}</span>
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500">
                      Pelapor: <strong className="text-slate-700">{report.reporterName}</strong>
                    </span>

                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase ${
                        report.status === 'selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : report.status === 'dalam_pengerjaan'
                          ? 'bg-blue-100 text-blue-800'
                          : report.status === 'disposisi'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {report.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 cols): Detailed Inspector, Photo Validation & Progress Engine */}
        <div className="lg:col-span-7 space-y-5">
          {activeTicket ? (
            <>
              {/* Notification Flash Banner */}
              {notifSentNotice && (
                <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs flex items-center justify-between shadow-sm animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Status berhasil diperbarui! Pesan notifikasi otomatis telah dikirim ke WhatsApp warga (<strong>{activeTicket.reporterPhone}</strong>).
                    </span>
                  </div>
                  <button
                    onClick={() => setNotifSentNotice(false)}
                    className="text-white hover:text-emerald-100 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* 1. Header & Urgency Controller */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
                      <span className="font-bold text-slate-900 text-base">#{activeTicket.ticketNumber}</span>
                      <span>·</span>
                      <span className="font-sans font-semibold text-emerald-800">
                        {activeTicket.departmentName}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">
                      {activeTicket.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNotifModal(true)}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kirim Pesan Otomatis</span>
                    </button>
                  </div>
                </div>

                {/* Citizen Contacts */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Nama Warga:</span>
                    <span className="font-semibold text-slate-900">{activeTicket.reporterName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">WhatsApp:</span>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        generateNotificationMessage(activeTicket, activeTicket.status)
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono font-semibold text-emerald-700 hover:underline block"
                    >
                      {activeTicket.reporterPhone} ↗
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Waktu Masuk:</span>
                    <span className="font-mono text-slate-700">
                      {new Date(activeTicket.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      WIB
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Photo Validation & Forensic Panel */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Sistem Validasi Bukti Foto Kejadian</span>
                  </h3>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded font-mono tabular-nums ${
                      activeTicket.photoValidation.isValid
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    Akurasi: {activeTicket.photoValidation.score}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo Display */}
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                    <img
                      src={activeTicket.photoUrl}
                      alt="Foto Bukti Warga"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      Koordinat Geotag: {activeTicket.coordinates.lat.toFixed(4)}, {activeTicket.coordinates.lng.toFixed(4)}
                    </div>
                  </div>

                  {/* Forensic Details */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Kesesuaian Kategori:</span>
                        <strong className="text-slate-800">{activeTicket.photoValidation.detectedCategory}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Integritas Geotag:</span>
                        <span className="font-semibold text-emerald-700 font-mono">Cocok dengan Lokasi</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Rekomendasi AI:</span>
                        <span className="font-semibold text-emerald-800 uppercase text-[10px]">
                          {activeTicket.photoValidation.recommendation}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600">
                      <strong>Objek Visual Teridentifikasi: </strong>
                      <span>{activeTicket.photoValidation.detectedElements.join(', ')}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 italic">
                      "{activeTicket.photoValidation.notes}"
                    </p>

                    {/* Quick validation overrides */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleVerifyPhoto(true)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Validasi Disetujui</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerifyPhoto(false)}
                        className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Tolak Bukti
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Progress Update & Dispatch Form */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Update Progres Penanganan & Disposisi Petugas
                </h3>

                <form onSubmit={handleSaveProgress} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium text-slate-700 block mb-1">
                        Ubah Tahapan Status Tiket *
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as ReportStatus)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white font-medium"
                      >
                        <option value="terkirim">1. Laporan Masuk / Diterima</option>
                        <option value="terverifikasi">2. Terverifikasi (Foto & Lokasi Valid)</option>
                        <option value="disposisi">3. Disposisi ke Dinas Terkait</option>
                        <option value="dalam_pengerjaan">4. Dalam Pengerjaan Lapangan</option>
                        <option value="selesai">5. Selesai Ditangani</option>
                        <option value="ditolak">X. Ditolak / Tidak Memenuhi Syarat</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-medium text-slate-700 block mb-1">
                        Tim Lapangan Ditugaskan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Regu Bina Marga Unit 2"
                        value={editTeam}
                        onChange={(e) => setEditTeam(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium text-slate-700 block mb-1">
                        Nama Petugas Penanggung Jawab
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Ir. Hendra Pratama"
                        value={editOfficer}
                        onChange={(e) => setEditOfficer(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-slate-700 block mb-1">
                        Foto Pasca Penanganan (Jika Selesai)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="URL foto / gunakan foto bukti"
                          value={editAfterPhoto}
                          onChange={(e) => setEditAfterPhoto(e.target.value)}
                          className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setEditAfterPhoto(activeTicket.photoUrl)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] whitespace-nowrap cursor-pointer"
                        >
                          Pakai Sampel
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-slate-700 block mb-1">
                      Catatan Resmi Petugas (Akan dikirimkan dalam notifikasi warga)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Tim telah selesai menambal lubang dengan aspal hotmix 2 lapis dan jalan kembali aman dilalui."
                      value={editRemarks}
                      onChange={(e) => setEditRemarks(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[11px] text-slate-500">
                      Menyimpan otomatis memicu pengiriman pesan WhatsApp ke warga.
                    </span>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Simpan Progres & Kirim Notifikasi</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* 4. Log Notifikasi Tiket Ini */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Log Integrasi Pesan Otomatis (WhatsApp)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Status terkirim ke {activeTicket.reporterPhone}
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notificationLogs
                    .filter((l) => l.ticketId === activeTicket.id)
                    .map((log) => (
                      <div
                        key={log.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-emerald-800">WhatsApp Terkirim</span>
                          <span className="font-mono text-slate-400">{log.timestamp}</span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-line font-mono text-[11px] bg-white p-2 rounded border border-slate-100">
                          {log.message}
                        </p>
                      </div>
                    ))}
                  {notificationLogs.filter((l) => l.ticketId === activeTicket.id).length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2">
                      Belum ada notifikasi manual yang dikirim untuk tiket ini.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
              Pilih salah satu tiket di sebelah kiri untuk melihat detail dan memperbarui progres.
            </div>
          )}
        </div>
      </div>

      {/* Auto-Notification Modal Trigger */}
      {showNotifModal && activeTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Kirim Pesan Notifikasi Otomatis ke Warga</span>
              </h3>
              <button
                onClick={() => setShowNotifModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-600">
                Pesan ini akan disimulasikan dan dikirim langsung ke WhatsApp pelapor:
              </p>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 font-mono text-slate-800 whitespace-pre-line text-[11px] leading-relaxed max-h-60 overflow-y-auto">
                {generateNotificationMessage(activeTicket, activeTicket.status, activeTicket.completionNotes)}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowNotifModal(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const log = createNotificationLog(activeTicket, activeTicket.status, 'Pemberitahuan manual dari dispatcher');
                  onAddNotificationLog(log);
                  setShowNotifModal(false);
                  setNotifSentNotice(true);
                  setTimeout(() => setNotifSentNotice(false), 3000);
                  const msg = encodeURIComponent(generateNotificationMessage(activeTicket, activeTicket.status));
                  window.open(`https://wa.me/?text=${msg}`, '_blank');
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim via WhatsApp Resmi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
