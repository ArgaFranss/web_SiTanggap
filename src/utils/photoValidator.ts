import { PhotoValidationResult, ReportCategory } from '../types';
import { CATEGORIES_CONFIG } from '../data/categories';

export async function validateReportPhoto(
  fileOrUrl: File | string,
  category: ReportCategory,
  userLocation?: { lat: number; lng: number }
): Promise<PhotoValidationResult> {
  // Simulate image processing and AI feature extraction
  return new Promise((resolve) => {
    setTimeout(() => {
      const config = CATEGORIES_CONFIG[category];
      const isFile = typeof fileOrUrl !== 'string';
      const fileName = isFile ? fileOrUrl.name.toLowerCase() : fileOrUrl.toLowerCase();

      // Check if file seems invalid or test cases
      const isBlurry = fileName.includes('blur') || fileName.includes('buram');
      const isIrrelevant = fileName.includes('kucing') || fileName.includes('selfie') || fileName.includes('food');

      if (isBlurry) {
        resolve({
          isValid: false,
          score: 42,
          detectedCategory: 'Objek Tidak Jelas / Buram',
          confidenceText: 'Kualitas Rendah (42%)',
          hasGeotag: true,
          geotagCoords: userLocation || { lat: -6.2088, lng: 106.8456 },
          detectedElements: ['Gambar tidak fokus', 'Pencahayaan rendah'],
          recommendation: 'review_required',
          notes: 'Foto terdeteksi buram atau minim cahaya. Petugas lapangan mungkin kesulitan mengidentifikasi kerusakan.',
        });
        return;
      }

      if (isIrrelevant) {
        resolve({
          isValid: false,
          score: 28,
          detectedCategory: 'Objek Tidak Terkait Kerusakan Publik',
          confidenceText: 'Tidak Cocok (28%)',
          hasGeotag: false,
          detectedElements: ['Bukan infrastruktur publik'],
          recommendation: 'rejected',
          notes: 'Objek gambar tidak cocok dengan kategori laporan darurat publik.',
        });
        return;
      }

      // Normal valid photo inspection
      const elementsMap: Record<ReportCategory, string[]> = {
        jalan_berlubang: ['Permukaan Aspal Retak', 'Kawah Lubang Jalan Terbuka', 'Kondisi Marka Jalan Sekitar'],
        lampu_mati: ['Tiang Listrik/PJU Terdeteksi', 'Fiting/Bohlam Lampu Pecah', 'Persimpangan/Trotoar'],
        pohon_tumbang: ['Batang/Dahan Kayu Menghalangi', 'Dedawanan Runtuh', 'Kabel/Jalur Jalan Terhalang'],
        sampah_menumpuk: ['Tumpukan Plastik/Residu Padat', 'Pinggir Bahu Jalan / TPS Liar', 'Volume Sampah Meluap'],
        saluran_tersumbat: ['Mulut Gorong-Gorong Tertutup', 'Sedimen Lumpur / Air Keruh', 'Limpasan Air ke Jalan'],
        fasilitas_rusak: ['Kerangka Fasilitas Publik', 'Retakan/Baut Lepas', 'Struktur Fisik Terganggu'],
      };

      const baseScore = Math.floor(88 + Math.random() * 10); // 88 - 97
      const coords = userLocation || {
        lat: -6.2088 + (Math.random() - 0.5) * 0.02,
        lng: 106.8456 + (Math.random() - 0.5) * 0.02,
      };

      resolve({
        isValid: true,
        score: baseScore,
        detectedCategory: config.label,
        confidenceText: `Terverifikasi Akurat (${baseScore}%)`,
        hasGeotag: true,
        geotagCoords: coords,
        detectedElements: elementsMap[category] || ['Objek Infrastruktur Valid'],
        recommendation: 'accepted',
        notes: `Foto tajam, pencahayaan memadai, geotag valid di area perkotaan. Objek sesuai kategori ${config.label}.`,
      });
    }, 700);
  });
}
