import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle2, AlertTriangle, XCircle, Sparkles, RefreshCw, Info, Image as ImageIcon } from 'lucide-react';
import { PhotoValidationResult, ReportCategory } from '../types';
import { CATEGORIES_CONFIG } from '../data/categories';
import { validateReportPhoto } from '../utils/photoValidator';

interface PhotoValidatorWidgetProps {
  category: ReportCategory;
  userLocation?: { lat: number; lng: number };
  onPhotoSelected: (photoUrl: string, validation: PhotoValidationResult) => void;
  currentPhotoUrl?: string;
  currentValidation?: PhotoValidationResult | null;
}

const PRESET_SAMPLE_PHOTOS: { label: string; category: ReportCategory; url: string }[] = [
  {
    label: 'Foto Nyata: Jalan Berlubang',
    category: 'jalan_berlubang',
    url: '/src/assets/images/report_pothole_road_1793150567201.jpg',
  },
  {
    label: 'Foto Nyata: Pohon Tumbang',
    category: 'pohon_tumbang',
    url: '/src/assets/images/report_fallen_tree_1793150566652.jpg',
  },
  {
    label: 'Foto Nyata: Lampu Jalan PJU',
    category: 'lampu_mati',
    url: '/src/assets/images/report_broken_streetlight_1793150568585.jpg',
  },
  {
    label: 'Foto Nyata: Sampah Menumpuk',
    category: 'sampah_menumpuk',
    url: '/src/assets/images/report_trash_pile_1793150567009.jpg',
  },
];

export const PhotoValidatorWidget: React.FC<PhotoValidatorWidgetProps> = ({
  category,
  userLocation,
  onPhotoSelected,
  currentPhotoUrl,
  currentValidation,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>(currentPhotoUrl || '');
  const [validationResult, setValidationResult] = useState<PhotoValidationResult | null>(
    currentValidation || null
  );

  const handleRunValidation = async (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setAnalyzing(true);
    try {
      const res = await validateReportPhoto(photoUrl, category, userLocation);
      setValidationResult(res);
      onPhotoSelected(photoUrl, res);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      handleRunValidation(url);
    }
  };

  // If category changed, update validation if photo already selected
  useEffect(() => {
    if (selectedPhoto && !validationResult) {
      handleRunValidation(selectedPhoto);
    }
  }, [category]);

  const categoryConfig = CATEGORIES_CONFIG[category];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-emerald-600" />
          <span>Foto Bukti Kejadian (Wajib)</span>
        </label>
        <span className="text-xs text-slate-500">
          Sistem Validasi Akurasi Otomatis
        </span>
      </div>

      {/* Preset Quick Select for rapid testing or real photo upload */}
      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-600 font-medium mb-2">
          Pilih sampel bukti foto nyata di lapangan untuk uji cepat:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_SAMPLE_PHOTOS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleRunValidation(preset.url)}
              className={`p-1.5 rounded-md border text-left transition-all text-xs flex flex-col items-center gap-1 cursor-pointer ${
                selectedPhoto === preset.url
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <img
                src={preset.url}
                alt={preset.label}
                referrerPolicy="no-referrer"
                className="w-full h-14 object-cover rounded"
              />
              <span className="text-[11px] truncate w-full text-center">
                {preset.label.replace('Foto Nyata: ', '')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Box & Preview */}
      <div className="relative border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-4 transition-colors bg-white">
        {selectedPhoto ? (
          <div className="space-y-3">
            <div className="relative aspect-video max-h-56 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
              <img
                src={selectedPhoto}
                alt="Bukti Laporan"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {analyzing && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                  <RefreshCw className="w-8 h-8 animate-spin mb-2 text-emerald-400" />
                  <p className="text-xs font-semibold">Memverifikasi Keaslian & Deteksi Objek...</p>
                  <p className="text-[11px] text-slate-300">Memeriksa resolusi, geotag GPS, dan kesesuaian kategori</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <label className="text-xs font-medium text-emerald-700 hover:text-emerald-800 cursor-pointer flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                <span>Ganti Foto dari Kamera / File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => handleRunValidation(selectedPhoto)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Validasi Ulang</span>
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center py-6 cursor-pointer text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Ambil Foto / Unggah Bukti Kejadian
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Mendukung file JPG, PNG, atau jepret langsung dari kamera ponsel.
            </p>
            <div className="mt-3 px-3 py-1.5 rounded-md bg-slate-100 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">
              Pilih Berkas Foto
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Validation Result Box */}
      {validationResult && !analyzing && (
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            validationResult.isValid
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              {validationResult.isValid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Hasil Validasi Bukti Foto
                  </h4>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded font-mono tabular-nums ${
                      validationResult.isValid
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Skor: {validationResult.score}/100
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1">
                  {validationResult.notes}
                </p>

                {/* Detected visual elements */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-medium text-slate-600">Elemen Terdeteksi:</span>
                  {validationResult.detectedElements.map((el, i) => (
                    <span
                      key={i}
                      className="bg-white/80 border border-slate-200 px-2 py-0.5 rounded text-slate-700"
                    >
                      {el}
                    </span>
                  ))}
                </div>

                {/* Geotag status */}
                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Geotag Koordinat Tersemat:</span>
                  <span className="font-mono text-slate-700">
                    {validationResult.geotagCoords
                      ? `${validationResult.geotagCoords.lat.toFixed(4)}, ${validationResult.geotagCoords.lng.toFixed(4)}`
                      : 'Terverifikasi Sesuai Radius Laporan'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photography Guide Tip */}
      <div className="text-[11px] text-slate-500 flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-700">Tips Petugas Dinas: </span>
          <span>{categoryConfig.photoTip}</span>
        </div>
      </div>
    </div>
  );
};
