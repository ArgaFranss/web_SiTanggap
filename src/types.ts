export type UrgencyLevel = 'normal' | 'prioritas' | 'darurat';

export type ReportCategory =
  | 'jalan_berlubang'
  | 'lampu_mati'
  | 'pohon_tumbang'
  | 'sampah_menumpuk'
  | 'saluran_tersumbat'
  | 'fasilitas_rusak';

export type DepartmentId =
  | 'pupr'
  | 'dishub'
  | 'pertamanan'
  | 'dlh'
  | 'instansi_terkait';

export interface DepartmentInfo {
  id: DepartmentId;
  name: string;
  fullName: string;
  shortDesc: string;
  contactEmergency: string;
  avatarColor: string;
}

export type ReportStatus =
  | 'terkirim'
  | 'terverifikasi'
  | 'disposisi'
  | 'dalam_pengerjaan'
  | 'selesai'
  | 'ditolak';

export interface PhotoValidationResult {
  isValid: boolean;
  score: number; // 0 - 100
  detectedCategory: string;
  confidenceText: string;
  hasGeotag: boolean;
  geotagCoords?: { lat: number; lng: number };
  detectedElements: string[];
  recommendation: 'accepted' | 'review_required' | 'rejected';
  notes: string;
}

export interface ProgressTimelineStep {
  id: string;
  status: ReportStatus;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  evidencePhotoUrl?: string;
}

export interface NotificationLog {
  id: string;
  ticketId: string;
  channel: 'whatsapp' | 'sms' | 'system';
  recipientPhone: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface CitizenReport {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: ReportCategory;
  urgency: UrgencyLevel;
  departmentId: DepartmentId;
  departmentName: string;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  landmarkNote?: string;
  photoUrl: string;
  photoValidation: PhotoValidationResult;
  reporterName: string;
  reporterPhone: string;
  reporterEmail?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  estimatedSLAHours: number;
  assignedTeam?: string;
  assignedOfficer?: string;
  completionPhotoUrl?: string;
  completionNotes?: string;
  citizenRating?: number;
  citizenFeedback?: string;
  timeline: ProgressTimelineStep[];
}
