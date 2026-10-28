import React, { useState } from 'react';
import { 
  AlertTriangle, LightbulbOff, TreePine, Trash2, Droplets, Wrench, 
  ArrowRight, Search, ShieldCheck, CheckCircle2, Clock, Phone, MapPin, 
  Sparkles, Camera, MessageSquare, ChevronRight
} from 'lucide-react';
import { CitizenReport, ReportCategory } from '../types';
import { CATEGORIES_CONFIG, DEPARTMENTS } from '../data/categories';

interface CitizenHomeProps {
  reports: CitizenReport[];
  onOpenReportModal: (category?: ReportCategory) => void;
  onTrackTicket: (ticketNumber: string) => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({
  reports,
  onOpenReportModal,
  onTrackTicket,
}) => {
  const [ticketSearch, setTicketSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSearch.trim()) return;
    onTrackTicket(ticketSearch.trim());
  };

  const getCategoryIcon = (catId: ReportCategory) => {
    switch (catId) {
      case 'jalan_berlubang':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'lampu_mati':
        return <LightbulbOff className="w-5 h-5 text-blue-600" />;
      case 'pohon_tumbang':
        return <TreePine className="w-5 h-5 text-emerald-600" />;
      case 'sampah_menumpuk':
        return <Trash2 className="w-5 h-5 text-teal-600" />;
      case 'saluran_tersumbat':
        return <Droplets className="w-5 h-5 text-cyan-600" />;
      case 'fasilitas_rusak':
        return <Wrench className="w-5 h-5 text-purple-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-slate-600" />;
    }
  };

  const categoryImages: Record<ReportCategory, string> = {
    jalan_berlubang: '/src/assets/images/report_pothole_road_1793150567201.jpg',
    pohon_tumbang: '/src/assets/images/report_fallen_tree_1793150566652.jpg',
    lampu_mati: '/src/assets/images/report_broken_streetlight_1793150568585.jpg',
    sampah_menumpuk: '/src/assets/images/report_trash_pile_1793150567009.jpg',
    saluran_tersumbat: '/src/assets/images/report_pothole_road_1793150567201.jpg',
    fasilitas_rusak: '/src/assets/images/report_broken_streetlight_1793150568585.jpg',
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sistem Layanan Tanggap Cepat & Aduan Warga 24 Jam</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Laporkan Kejadian Darurat Kota Secara Real-Time.
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
            Sampaikan kerusakan fasilitas umum atau bahaya darurat di lingkungan Anda.
            Sistem otomatis memverifikasi bukti foto dan mendisposisikan langsung ke dinas penanggung jawab terkait.
          </p>

          {/* Quick Ticket Lookup Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Masukkan Nomor Tiket (Contoh: LPR-2026-1049)..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0"
            >
              Pantau Laporan
            </button>
            <button
              type="button"
              onClick={() => onOpenReportModal()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer shrink-0"
            >
              + Buat Laporan Baru
            </button>
          </form>

          {/* Quick Stats Strip */}
          <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-100 max-w-lg text-xs">
            <div>
              <span className="text-slate-500 block">Respon Darurat</span>
              <span className="text-base font-bold text-slate-900 font-mono">&lt; 2 Jam</span>
            </div>
            <div>
              <span className="text-slate-500 block">Validasi Foto AI</span>
              <span className="text-base font-bold text-emerald-700 font-mono">98.4% Akurat</span>
            </div>
            <div>
              <span className="text-slate-500 block">Notifikasi Warga</span>
              <span className="text-base font-bold text-slate-900">WhatsApp Real-Time</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Categories with Direct Department Mapping */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Pilih Kategori Kejadian
            </h2>
            <p className="text-xs text-slate-500">
              Laporan otomatis diteruskan ke dinas teknis berwenang sesuai regulasi pemerintah kota.
            </p>
          </div>
          <span className="text-xs text-emerald-700 font-semibold">
            Klik salah satu kategori untuk langsung melapor
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(CATEGORIES_CONFIG) as ReportCategory[]).map((catKey) => {
            const config = CATEGORIES_CONFIG[catKey];
            const dept = DEPARTMENTS[config.departmentId];
            const imgSrc = categoryImages[catKey];

            return (
              <div
                key={catKey}
                onClick={() => onOpenReportModal(catKey)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={config.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-900 flex items-center gap-1.5 shadow-2xs">
                      {getCategoryIcon(catKey)}
                      <span>{config.label}</span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      SLA: ~{config.defaultSLAHours} Jam
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Dinas Tujuan:</span>
                      <strong className="text-emerald-800 font-semibold">{dept.name}</strong>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {config.description}
                    </p>
                  </div>
                </div>

                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                  <span>Lapor Kerusakan Ini</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Explainer: Transparansi Notifikasi & Validasi Foto */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
            Transparansi Layanan Publik
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Bagaimana Warga Mengetahui Progres Penanganan?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Tidak ada lagi laporan yang hilang tanpa kabar. SiTanggap mengintegrasikan sistem notifikasi otomatis WhatsApp dan validasi foto multi-tahap.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-sm font-bold text-white">Validasi Foto Akurat</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Foto bukti dianalisis keasliannya dan dicocokkan dengan koordinat geotag lokasi kejadian secara otomatis.
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="text-sm font-bold text-white">Disposisi Instansi Otomatis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tiket langsung dialokasikan ke dinas terkait (PUPR, Dishub, DLH, Pertamanan) tanpa birokrasi manual.
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="text-sm font-bold text-white">Notifikasi WhatsApp Real-Time</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Warga otomatis menerima pesan WhatsApp di setiap fase: Diterima, Verifikasi, Tim Meluncur, dan Selesai.
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="text-sm font-bold text-white">Foto Bukti Selesai & Rating</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Petugas mengunggah foto perbaikan selesai. Warga dapat memberi penilaian bintang dan ulasan kinerja dinas.
            </p>
          </div>
        </div>
      </section>

      {/* Live Recent Reports Stream */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Laporan Terkini di Kota
            </h2>
            <p className="text-xs text-slate-500">
              Pantau laporan aktif yang sedang ditangani oleh dinas pemerintah.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.slice(0, 4).map((rep) => {
            const dept = DEPARTMENTS[rep.departmentId];
            return (
              <div
                key={rep.id}
                onClick={() => onTrackTicket(rep.ticketNumber)}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-slate-900">#{rep.ticketNumber}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase ${
                        rep.status === 'selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rep.status === 'dalam_pengerjaan'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rep.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-2">
                    {rep.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{rep.locationName}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-semibold">{dept.name}</span>
                  <span className="text-slate-400 flex items-center gap-0.5">
                    Detail <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
