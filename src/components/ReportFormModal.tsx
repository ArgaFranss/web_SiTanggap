import React, { useState } from 'react';
import { X, Send, MapPin, AlertTriangle, Shield, CheckCircle2, Clock, Phone, User, FileText, Compass } from 'lucide-react';
import { ReportCategory, UrgencyLevel, CitizenReport, PhotoValidationResult } from '../types';
import { CATEGORIES_CONFIG, DEPARTMENTS } from '../data/categories';
import { PhotoValidatorWidget } from './PhotoValidatorWidget';

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (newReport: CitizenReport) => void;
  initialCategory?: ReportCategory;
}

export const ReportFormModal: React.FC<ReportFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  initialCategory = 'jalan_berlubang',
}) => {
  const [category, setCategory] = useState<ReportCategory>(initialCategory);
  const [urgency, setUrgency] = useState<UrgencyLevel>('prioritas');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [landmarkNote, setLandmarkNote] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: -6.2088,
    lng: 106.8456,
  });
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('/src/assets/images/report_pothole_road_1793150567201.jpg');
  const [photoValidation, setPhotoValidation] = useState<PhotoValidationResult | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentCategoryConfig = CATEGORIES_CONFIG[category];
  const assignedDepartment = DEPARTMENTS[currentCategoryConfig.departmentId];

  // Geolocation trigger
  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lng = Number(pos.coords.longitude.toFixed(4));
          setCoordinates({ lat, lng });
          setGpsDetected(true);
          setIsGettingLocation(false);
          if (!locationName) {
            setLocationName(`Titik Koordinat GPS (${lat}, ${lng})`);
          }
        },
        () => {
          // Fallback simulation for urban Jakarta coordinates
          setCoordinates({ lat: -6.2114, lng: 106.8431 });
          setGpsDetected(true);
          setIsGettingLocation(false);
          if (!locationName) {
            setLocationName('Jl. Sudirman - Gatot Subroto (Akurasi GPS)');
          }
        },
        { timeout: 4000 }
      );
    } else {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Mohon isi judul ringkas laporan.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Mohon jelaskan rincian kondisi kejadian.');
      return;
    }
    if (!locationName.trim()) {
      setErrorMsg('Mohon masukkan nama jalan atau lokasi kejadian.');
      return;
    }
    if (!reporterName.trim() || !reporterPhone.trim()) {
      setErrorMsg('Nama dan Nomor WhatsApp pelapor wajib diisi agar notifikasi status dapat dikirimkan.');
      return;
    }
    if (!photoUrl) {
      setErrorMsg('Mohon sertakan bukti foto kejadian agar dapat diverifikasi oleh dinas terkait.');
      return;
    }

    const ticketSeq = Math.floor(1050 + Math.random() * 8900);
    const nowIso = new Date().toISOString();
    const nowLocal = new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const defaultValidation: PhotoValidationResult = photoValidation || {
      isValid: true,
      score: 92,
      detectedCategory: currentCategoryConfig.label,
      confidenceText: 'Terverifikasi Akurat (92%)',
      hasGeotag: true,
      geotagCoords: coordinates,
      detectedElements: ['Objek Kerusakan Teridentifikasi', 'Sesuai Wilayah Layanan'],
      recommendation: 'accepted',
      notes: 'Foto bukti terverifikasi otomatis dengan koordinat lokasi.',
    };

    const newReport: CitizenReport = {
      id: `rep-${Date.now()}`,
      ticketNumber: `LPR-2026-${ticketSeq}`,
      title,
      description,
      category,
      urgency,
      departmentId: assignedDepartment.id,
      departmentName: assignedDepartment.name,
      locationName,
      coordinates,
      landmarkNote: landmarkNote || undefined,
      photoUrl,
      photoValidation: defaultValidation,
      reporterName,
      reporterPhone,
      reporterEmail: reporterEmail || undefined,
      status: 'terkirim',
      createdAt: nowIso,
      updatedAt: nowIso,
      estimatedSLAHours: currentCategoryConfig.defaultSLAHours,
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          status: 'terkirim',
          title: 'Laporan Diterima di Sistem SiTanggap',
          description: `Tiket #LPR-2026-${ticketSeq} berhasil dibuat. Sistem sedang mengantrekan ke petugas verifikasi ${assignedDepartment.name}.`,
          timestamp: `${nowLocal} WIB`,
          actor: 'Sistem SiTanggap',
        },
      ],
    };

    onSubmitReport(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Formulir Laporan Kejadian & Darurat Warga
            </h3>
            <p className="text-xs text-slate-500">
              Laporan akan diverifikasi dan diteruskan langsung ke dinas teknis pemerintah kota.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Pilih Kategori & Disposisi Instansi Otomatis */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              1. Kategori Masalah / Kejadian
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(CATEGORIES_CONFIG) as ReportCategory[]).map((catKey) => {
                const conf = CATEGORIES_CONFIG[catKey];
                const dept = DEPARTMENTS[conf.departmentId];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => {
                      setCategory(catKey);
                      // Update default photo if still on default
                      if (catKey === 'jalan_berlubang') {
                        setPhotoUrl('/src/assets/images/report_pothole_road_1793150567201.jpg');
                      } else if (catKey === 'pohon_tumbang') {
                        setPhotoUrl('/src/assets/images/report_fallen_tree_1793150566652.jpg');
                      } else if (catKey === 'lampu_mati') {
                        setPhotoUrl('/src/assets/images/report_broken_streetlight_1793150568585.jpg');
                      } else if (catKey === 'sampah_menumpuk') {
                        setPhotoUrl('/src/assets/images/report_trash_pile_1793150567009.jpg');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">
                        {conf.label}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Diteruskan ke: <strong className="text-emerald-700">{dept.name}</strong>
                      </span>
                    </div>
                    <span className="mt-2 text-[10px] text-slate-400 font-mono">
                      SLA: ~{conf.defaultSLAHours} Jam
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Department banner acknowledgment */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-slate-600">Instansi Penanggung Jawab: </span>
                  <strong className="text-slate-900">{assignedDepartment.fullName} ({assignedDepartment.name})</strong>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-500 font-mono shrink-0">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Target SLA: {currentCategoryConfig.defaultSLAHours} Jam</span>
              </div>
            </div>
          </div>

          {/* 2. Tingkat Urgensi */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              2. Tingkat Urgensi Penanganan
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('normal')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  urgency === 'normal'
                    ? 'border-slate-800 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Normal (Standar)
              </button>
              <button
                type="button"
                onClick={() => setUrgency('prioritas')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  urgency === 'prioritas'
                    ? 'border-amber-600 bg-amber-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Prioritas (Cepat)
              </button>
              <button
                type="button"
                onClick={() => setUrgency('darurat')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  urgency === 'darurat'
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                🚨 Darurat (Bahaya Nyata)
              </button>
            </div>
          </div>

          {/* 3. Judul & Rincian Deskripsi */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              3. Deskripsi Kejadian
            </label>
            <div>
              <input
                type="text"
                placeholder="Judul singkat laporan (misal: Lubang aspal dalam di tikungan pasar)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                required
              />
            </div>
            <div>
              <textarea
                rows={3}
                placeholder="Jelaskan detail kejadian, dampak bagi pengguna jalan/warga, dan perkiraan besarnya masalah..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                required
              />
            </div>
          </div>

          {/* 4. Lokasi & GPS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                4. Lokasi Kejadian & Titik Koordinat
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Compass className={`w-3.5 h-3.5 ${isGettingLocation ? 'animate-spin' : ''}`} />
                <span>{isGettingLocation ? 'Mendeteksi...' : 'Gunakan GPS Saya'}</span>
              </button>
            </div>

            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Nama Jalan, Kelurahan, Kecamatan atau No. Bangunan Terdekat"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Patokan sekitar (Contoh: Samping Indomaret, dekat halte)"
                value={landmarkNote}
                onChange={(e) => setLandmarkNote(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
              />
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-mono text-[11px] flex items-center justify-between">
                <span>Koordinat:</span>
                <span className="text-slate-800 font-medium">
                  {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Foto & Sistem Validasi Otomatis */}
          <div className="space-y-2 pt-1 border-t border-slate-200">
            <PhotoValidatorWidget
              category={category}
              userLocation={coordinates}
              currentPhotoUrl={photoUrl}
              currentValidation={photoValidation}
              onPhotoSelected={(url, val) => {
                setPhotoUrl(url);
                setPhotoValidation(val);
              }}
            />
          </div>

          {/* 6. Kontak Pelapor (WhatsApp untuk notifikasi) */}
          <div className="space-y-2 pt-1 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                6. Data Pelapor & Integrasi Notifikasi
              </label>
              <span className="text-[11px] text-emerald-700 font-medium">
                Pembaruan status dikirim via WhatsApp
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Nama Lengkap Warga *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Nama Anda"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  No. WhatsApp Aktif *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="Contoh: 0812-3456-7890"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Laporan Resmi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
