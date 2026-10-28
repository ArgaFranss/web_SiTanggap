import { DepartmentId, DepartmentInfo, ReportCategory } from '../types';

export const DEPARTMENTS: Record<DepartmentId, DepartmentInfo> = {
  pupr: {
    id: 'pupr',
    name: 'Dinas PUPR',
    fullName: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    shortDesc: 'Menangani infrastruktur jalan, jembatan, dan jaringan drainase/saluran air kota.',
    contactEmergency: '(021) 500-PUPR / 112',
    avatarColor: 'bg-amber-600',
  },
  dishub: {
    id: 'dishub',
    name: 'Dinas Perhubungan',
    fullName: 'Dinas Perhubungan & Penerangan Jalan',
    shortDesc: 'Menangani kelancaran lalu lintas, marka jalan, dan penerangan jalan umum (PJU).',
    contactEmergency: '(021) 500-DISHUB',
    avatarColor: 'bg-blue-600',
  },
  pertamanan: {
    id: 'pertamanan',
    name: 'Dinas Pertamanan',
    fullName: 'Dinas Perumahan Rakyat & Kawasan Permukiman serta Pertamanan',
    shortDesc: 'Menangani pohon rawan tumbang, pemangkasan dahan bahaya, dan ruang terbuka hijau.',
    contactEmergency: '(021) 500-PARK',
    avatarColor: 'bg-emerald-600',
  },
  dlh: {
    id: 'dlh',
    name: 'Dinas Lingkungan Hidup',
    fullName: 'Dinas Lingkungan Hidup & Kebersihan Kota',
    shortDesc: 'Menangani tumpukan sampah liar, TPS liar, dan pencemaran kebersihan lingkungan.',
    contactEmergency: '(021) 500-BERSIH',
    avatarColor: 'bg-teal-600',
  },
  instansi_terkait: {
    id: 'instansi_terkait',
    name: 'Instansi Terkait',
    fullName: 'Satpol PP & Dinas Pengelola Fasilitas Umum',
    shortDesc: 'Menangani kerusakan halte, bangku taman, jembatan penyeberangan orang (JPO), dan fasilitas umum lainnya.',
    contactEmergency: '(021) 500-FASUM',
    avatarColor: 'bg-purple-600',
  },
};

export interface CategoryMetadata {
  id: ReportCategory;
  label: string;
  departmentId: DepartmentId;
  defaultSLAHours: number;
  description: string;
  iconName: string;
  photoTip: string;
  sampleKeywords: string[];
}

export const CATEGORIES_CONFIG: Record<ReportCategory, CategoryMetadata> = {
  jalan_berlubang: {
    id: 'jalan_berlubang',
    label: 'Jalan Berlubang',
    departmentId: 'pupr',
    defaultSLAHours: 6,
    description: 'Aspal amblas, lubang jalan berbahaya bagi pengendara roda 2 & roda 4.',
    iconName: 'AlertTriangle',
    photoTip: 'Ambil foto memperlihatkan kedalaman lubang dan situasi jalan sekitarnya.',
    sampleKeywords: ['aspal', 'lubang', 'retak', 'jalan rusak', 'kerikil'],
  },
  lampu_mati: {
    id: 'lampu_mati',
    label: 'Lampu Jalan Mati / PJU Rusak',
    departmentId: 'dishub',
    defaultSLAHours: 12,
    description: 'Penerangan Jalan Umum mati saat malam hari atau tiang lampu berisiko roboh.',
    iconName: 'LightbulbOff',
    photoTip: 'Sertakan foto nomor ID tiang lampu (jika terlihat) dan kondisi sekitar tiang.',
    sampleKeywords: ['tiang lampu', 'bohlam', 'kabel putus', 'kegelapan', 'pju'],
  },
  pohon_tumbang: {
    id: 'pohon_tumbang',
    label: 'Pohon Tumbang / Ranting Bahaya',
    departmentId: 'pertamanan',
    defaultSLAHours: 2,
    description: 'Dahan rapuh menggantung, pohon tumbang menutup badan jalan atau menimpa fasilitas.',
    iconName: 'TreePine',
    photoTip: 'Potret pohon dari jarak yang memperlihatkan potensi bahaya bagi jalan atau kabel listrik.',
    sampleKeywords: ['pohon', 'dahan patah', 'ranting', 'akar', 'daun'],
  },
  sampah_menumpuk: {
    id: 'sampah_menumpuk',
    label: 'Sampah Menumpuk Liar',
    departmentId: 'dlh',
    defaultSLAHours: 8,
    description: 'Timbunan sampah di trotoar, pinggir jalan protokol, atau TPS yang meluap bau menyengat.',
    iconName: 'Trash2',
    photoTip: 'Foto timbunan sampah beserta patokan lokasi terdekat agar truk armada sampah mudah menemukan.',
    sampleKeywords: ['kantong plastik', 'limbah', 'timbunan', 'kontainer sampah', 'bau'],
  },
  saluran_tersumbat: {
    id: 'saluran_tersumbat',
    label: 'Saluran Air / Drainase Tersumbat',
    departmentId: 'pupr',
    defaultSLAHours: 4,
    description: 'Gorong-gorong mampet, sedimentasi lumpur tebal, atau air meluap ke badan jalan saat hujan.',
    iconName: 'Droplets',
    photoTip: 'Potret mulut selokan/drainase dan genangan air yang ditimbulkan.',
    sampleKeywords: ['gorong-gorong', 'selokan', 'genangan', 'lumpur', 'air meluap'],
  },
  fasilitas_rusak: {
    id: 'fasilitas_rusak',
    label: 'Fasilitas Umum Rusak',
    departmentId: 'instansi_terkait',
    defaultSLAHours: 24,
    description: 'Halte bus rusak, jembatan penyeberangan (JPO) berlubang, pagar pembatas jalan roboh, dsb.',
    iconName: 'Wrench',
    photoTip: 'Ambil foto bagian yang rusak secara spesifik dan tampilan utuh fasilitas umum tersebut.',
    sampleKeywords: ['halte', 'jembatan', 'pagar', 'rambu', 'fasilitas umum'],
  },
};
