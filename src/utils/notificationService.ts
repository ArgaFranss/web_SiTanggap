import { CitizenReport, NotificationLog, ReportStatus } from '../types';

export function generateNotificationMessage(
  report: CitizenReport,
  status: ReportStatus,
  customNote?: string
): string {
  const statusLabels: Record<ReportStatus, string> = {
    terkirim: '✅ LAPORAN DITERIMA',
    terverifikasi: '🔍 BUKTI FOTO & LOKASI TERVERIFIKASI',
    disposisi: '📋 DIDISPOSISIKAN KE DINAS TERKAIT',
    dalam_pengerjaan: '🛠️ TIM TEKNIS SEDANG MENANGANI DI LOKASI',
    selesai: '🎉 PENANGANAN SELESAI',
    ditolak: '❌ LAPORAN DITOLAK / TIDAK VALID',
  };

  const statusDescriptions: Record<ReportStatus, string> = {
    terkirim: `Halo Bpk/Ibu ${report.reporterName}, laporan Anda terkait "${report.title}" telah diterima di sistem SiTanggap.`,
    terverifikasi: `Halo Bpk/Ibu ${report.reporterName}, bukti foto & lokasi laporan Anda telah diverifikasi oleh tim operator dan dinyatakan VALID.`,
    disposisi: `Halo Bpk/Ibu ${report.reporterName}, laporan Anda telah didisposisikan kepada ${report.departmentName} untuk ditindaklanjuti.`,
    dalam_pengerjaan: `Halo Bpk/Ibu ${report.reporterName}, tim lapangan (${report.assignedTeam || report.departmentName}) saat ini sedang bekerja memperbaiki masalah di lokasi.`,
    selesai: `Halo Bpk/Ibu ${report.reporterName}, pengerjaan untuk laporan Anda telah SELESAI ditangani dengan baik oleh ${report.departmentName}.`,
    ditolak: `Halo Bpk/Ibu ${report.reporterName}, mohon maaf laporan Anda belum dapat diproses karena bukti foto atau lokasi tidak memenuhi syarat verifikasi.`,
  };

  let msg = `*PEMBERITAHUAN RESMI SITANGGAP KOTA*\n`;
  msg += `------------------------------------\n`;
  msg += `Status: ${statusLabels[status]}\n`;
  msg += `No. Tiket: #${report.ticketNumber}\n`;
  msg += `Instansi Penanggung Jawab: ${report.departmentName}\n`;
  msg += `Lokasi: ${report.locationName}\n\n`;
  msg += `${statusDescriptions[status]}\n`;

  if (customNote) {
    msg += `\n*Catatan Petugas:* ${customNote}\n`;
  }

  if (status === 'dalam_pengerjaan' && report.assignedOfficer) {
    msg += `*Petugas Lapangan:* ${report.assignedOfficer}\n`;
  }

  msg += `\nPantau perkembangan langsung melalui portal SiTanggap.\nTerima kasih atas kepedulian Anda menjaga kota kita! 🇮🇩`;

  return msg;
}

export function createNotificationLog(
  report: CitizenReport,
  status: ReportStatus,
  customNote?: string
): NotificationLog {
  return {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ticketId: report.id,
    channel: 'whatsapp',
    recipientPhone: report.reporterPhone,
    message: generateNotificationMessage(report, status, customNote),
    timestamp: new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    status: 'delivered',
  };
}
