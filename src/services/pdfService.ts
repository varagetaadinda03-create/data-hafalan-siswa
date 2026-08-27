import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Santri } from '../types';

export function exportSingleSantriPdf(santri: Santri) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [15, 76, 58]; // Deep Islamic Emerald
  const goldColor: [number, number, number] = [197, 145, 50]; // Gold Accent
  const darkGray: [number, number, number] = [40, 45, 55];
  const lightGray: [number, number, number] = [245, 247, 250];

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 32, 'F');

  // Gold line
  doc.setFillColor(...goldColor);
  doc.rect(0, 32, 210, 2, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text("MA'HAD TAHFIDZUL QUR'AN WA TAHSIIN", 105, 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('LEMBAR EVALUASI CAPAIAN TAHFIDZ, TAHSIN & KEDISIPLINAN SANTRI', 105, 18, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Tahun Ajaran 2026/2027 • Sistem Monitoring Real-Time Pondok Pesantren', 105, 24, { align: 'center' });

  // Student Info Box
  doc.setFillColor(...lightGray);
  doc.roundedRect(14, 40, 182, 38, 3, 3, 'F');
  doc.setDrawColor(210, 215, 225);
  doc.roundedRect(14, 40, 182, 38, 3, 3, 'S');

  // Left Column Info
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('INFORMASI BIODATA SANTRI', 20, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  doc.text(`Nama Lengkap   : `, 20, 56);
  doc.setFont('helvetica', 'bold');
  doc.text(`${santri.nama}`, 52, 56);

  doc.setFont('helvetica', 'normal');
  doc.text(`NIS                     : ${santri.nis}`, 20, 63);
  doc.text(`Kelas / Tingkat   : ${santri.kelas} (${santri.jenisKelamin})`, 20, 70);

  // Right Column Info
  doc.text(`Wali Kelas       : ${santri.waliKelas}`, 115, 56);
  doc.text(`Gedung Asrama: ${santri.kamarAsrama}`, 115, 63);
  doc.text(`Kontak Wali     : ${santri.kontakWali}`, 115, 70);

  // Capaian Tahfidz & Tahsin Section
  doc.setFillColor(...primaryColor);
  doc.roundedRect(14, 84, 182, 7, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text("I. REKAPITULASI CAPAIAN TAHFIDZ & EVALUASI TAHSIN", 20, 89);

  // Metrics Grid Boxes
  const metricsY = 96;
  const cardWidth = 42;
  const cardHeight = 22;

  // Box 1: Surah & Juz
  doc.setFillColor(240, 249, 245);
  doc.roundedRect(14, metricsY, cardWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(180, 220, 205);
  doc.roundedRect(14, metricsY, cardWidth, cardHeight, 2, 2, 'S');
  doc.setTextColor(15, 76, 58);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('SURAH TERAKHIR', 35, metricsY + 6, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`${santri.surahTerakhir}`, 35, metricsY + 12, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Juz ${santri.juz}`, 35, metricsY + 17, { align: 'center' });

  // Box 2: Total Hafalan
  doc.setFillColor(240, 249, 245);
  doc.roundedRect(60, metricsY, cardWidth, cardHeight, 2, 2, 'F');
  doc.roundedRect(60, metricsY, cardWidth, cardHeight, 2, 2, 'S');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL HAFALAN', 81, metricsY + 6, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`${santri.jumlahHafalan} Surah`, 81, metricsY + 13, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Status: ${santri.statusHafalan}`, 81, metricsY + 18, { align: 'center' });

  // Box 3: Nilai Tahsin
  doc.setFillColor(240, 249, 245);
  doc.roundedRect(106, metricsY, cardWidth, cardHeight, 2, 2, 'F');
  doc.roundedRect(106, metricsY, cardWidth, cardHeight, 2, 2, 'S');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('NILAI TAHSIN', 127, metricsY + 6, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`${santri.nilaiTahsin} / 100`, 127, metricsY + 13, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    santri.nilaiTahsin >= 90 ? 'Predikat: Mumtaz (A)' : santri.nilaiTahsin >= 80 ? 'Predikat: Jayyid Jiddan (B)' : 'Predikat: Maqbul (C)',
    127,
    metricsY + 18,
    { align: 'center' }
  );

  // Box 4: Kehadiran
  doc.setFillColor(240, 249, 245);
  doc.roundedRect(152, metricsY, cardWidth + 2, cardHeight, 2, 2, 'F');
  doc.roundedRect(152, metricsY, cardWidth + 2, cardHeight, 2, 2, 'S');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('KEHADIRAN HALAQAH', 174, metricsY + 6, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`${santri.kehadiran}%`, 174, metricsY + 13, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Disiplin Absensi', 174, metricsY + 18, { align: 'center' });

  // Sub-scores Breakdown & Catatan Halaqah
  const subScoreY = 124;
  doc.setFillColor(...lightGray);
  doc.roundedRect(14, subScoreY, 182, 22, 2, 2, 'F');
  doc.setDrawColor(210, 215, 225);
  doc.roundedRect(14, subScoreY, 182, 22, 2, 2, 'S');

  doc.setTextColor(...darkGray);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Rincian Parameter Tahsin:', 20, subScoreY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `• Makharijul Huruf: ${santri.makhrajScore}/100    • Ahkamut Tajwid: ${santri.tajwidScore}/100    • Kelancaran & Waqaf: ${santri.kelancaranScore}/100`,
    20,
    subScoreY + 13
  );
  doc.setFont('helvetica', 'bold');
  doc.text('Catatan Musyrif Halaqah:', 20, subScoreY + 19);
  doc.setFont('helvetica', 'normal');
  doc.text(`"${santri.catatan}"`, 66, subScoreY + 19);

  // Prestasi Section
  const prestasiSectionY = 152;
  doc.setFillColor(...primaryColor);
  doc.roundedRect(14, prestasiSectionY, 182, 7, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('II. RIWAYAT PRESTASI & PENGHARGAAN SANTRI', 20, prestasiSectionY + 5);

  const prestasiRows = santri.prestasiList.map((p, idx) => [
    `${idx + 1}`,
    p.judul,
    p.kategori,
    p.tingkat,
    p.peringkat,
    p.tahun,
  ]);

  autoTable(doc, {
    startY: prestasiSectionY + 9,
    head: [['No', 'Nama Prestasi / Penghargaan', 'Kategori', 'Tingkat', 'Peringkat', 'Tahun']],
    body: prestasiRows.length > 0 ? prestasiRows : [['1', 'Santri Teladan Disiplin Halaqah', 'Kedisiplinan', 'Internal Pondok', 'Aktif', '2026']],
    theme: 'striped',
    headStyles: {
      fillColor: [30, 95, 75],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 72 },
      2: { halign: 'center', cellWidth: 26 },
      3: { halign: 'center', cellWidth: 32 },
      4: { halign: 'center', cellWidth: 26 },
      5: { halign: 'center', cellWidth: 16 },
    },
    margin: { left: 14, right: 14 },
  });

  // Catatan Disiplin Section
  const currentY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFillColor(...primaryColor);
  doc.roundedRect(14, currentY, 182, 7, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(
    `III. CATATAN KEDISIPLINAN & AKHLAK PRIBADI (Poin: ${santri.poinDisiplin}/100 • Status: ${santri.statusDisiplin})`,
    20,
    currentY + 5
  );

  const disiplinRows = santri.catatanDisiplinList.map((d, idx) => [
    `${idx + 1}`,
    d.tanggal,
    d.kategori,
    d.deskripsi,
    d.poin > 0 ? `+${d.poin}` : `${d.poin}`,
    d.musyrif,
  ]);

  autoTable(doc, {
    startY: currentY + 9,
    head: [['No', 'Tanggal', 'Kategori', 'Deskripsi Catatan Disiplin', 'Poin', 'Musyrif Penilai']],
    body: disiplinRows,
    theme: 'striped',
    headStyles: {
      fillColor: [45, 110, 85],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 24 },
      2: { halign: 'center', cellWidth: 26 },
      3: { cellWidth: 68 },
      4: { halign: 'center', cellWidth: 16 },
      5: { cellWidth: 38 },
    },
    margin: { left: 14, right: 14 },
  });

  // Signatures Section at bottom
  const sigY = Math.min((doc as any).lastAutoTable.finalY + 8, 250);
  doc.setTextColor(...darkGray);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');

  const formattedDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  doc.text(`Diterbitkan pada: ${formattedDate}`, 14, sigY);

  doc.text('Mengetahui,', 20, sigY + 6);
  doc.text('Orang Tua / Wali Santri', 20, sigY + 11);
  doc.text('( .................................... )', 20, sigY + 28);

  doc.text('Musyrif / Pembina Halaqah,', 85, sigY + 6);
  doc.text(`${santri.waliKelas}`, 85, sigY + 11);
  doc.text('( .................................... )', 85, sigY + 28);

  doc.text("Mudir Ma'had Tahfidz,", 150, sigY + 6);
  doc.text("K.H. Abdullah Syafi'i, M.A.", 150, sigY + 11);
  doc.text('( .................................... )', 150, sigY + 28);

  // Footer note
  doc.setFontSize(7);
  doc.setTextColor(130, 135, 145);
  doc.text(
    `* Dokumen ini dibuat otomatis oleh Sistem Monitoring Tahfidz Real-Time • ID: ${santri.nis}-${Date.now().toString(36)}`,
    105,
    290,
    { align: 'center' }
  );

  doc.save(`Laporan_Evaluasi_${santri.nis}_${santri.nama.replace(/\s+/g, '_')}.pdf`);
}

export function exportMasterRekapPdf(santriList: Santri[], title = 'Laporan Rekapitulasi Data Evaluasi Santri') {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [15, 76, 58];
  const goldColor: [number, number, number] = [197, 145, 50];

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 297, 26, 'F');
  doc.setFillColor(...goldColor);
  doc.rect(0, 26, 297, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text("MA'HAD TAHFIDZUL QUR'AN - SISTEM MONITORING REAL-TIME", 148.5, 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(title.toUpperCase(), 148.5, 16, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`Total Santri: ${santriList.length} Orang • Waktu Cetak: ${new Date().toLocaleString('id-ID')}`, 148.5, 21, {
    align: 'center',
  });

  // Calculate quick summary metrics
  const avgTahsin = Math.round(santriList.reduce((acc, s) => acc + s.nilaiTahsin, 0) / (santriList.length || 1));
  const avgKehadiran = Math.round(santriList.reduce((acc, s) => acc + s.kehadiran, 0) / (santriList.length || 1));
  const sangatBaik = santriList.filter((s) => s.statusHafalan.toLowerCase().includes('sangat')).length;
  const baik = santriList.filter((s) => s.statusHafalan.toLowerCase() === 'baik').length;
  const perluBimbingan = santriList.filter((s) => s.statusHafalan.toLowerCase().includes('bimbingan')).length;

  // Mini summary bar
  doc.setFillColor(242, 247, 244);
  doc.roundedRect(14, 30, 269, 12, 1.5, 1.5, 'F');
  doc.setTextColor(15, 76, 58);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `RINGKASAN:  Rata-rata Tahsin: ${avgTahsin}/100   |   Rata-rata Kehadiran: ${avgKehadiran}%   |   Status: Sangat Baik (${sangatBaik}), Baik (${baik}), Perlu Bimbingan (${perluBimbingan})`,
    18,
    37.5
  );

  const tableData = santriList.map((s) => [
    s.no,
    s.nis,
    s.nama,
    s.kelas,
    s.jenisKelamin === 'Laki-laki' ? 'L' : 'P',
    s.surahTerakhir,
    `Juz ${s.juz}`,
    `${s.jumlahHafalan} Surah`,
    s.statusHafalan,
    s.nilaiTahsin,
    `${s.kehadiran}%`,
    s.catatan,
  ]);

  autoTable(doc, {
    startY: 45,
    head: [
      [
        'No',
        'NIS',
        'Nama Santri',
        'Kelas',
        'JK',
        'Surah Terakhir',
        'Juz',
        'Jml Hafalan',
        'Status Hafalan',
        'Tahsin',
        'Hadir',
        'Catatan Halaqah',
      ],
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 76, 58],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', cellWidth: 20 },
      2: { cellWidth: 44, fontStyle: 'bold' },
      3: { halign: 'center', cellWidth: 14 },
      4: { halign: 'center', cellWidth: 8 },
      5: { cellWidth: 28 },
      6: { halign: 'center', cellWidth: 14 },
      7: { halign: 'center', cellWidth: 22 },
      8: { halign: 'center', cellWidth: 26 },
      9: { halign: 'center', cellWidth: 14 },
      10: { halign: 'center', cellWidth: 14 },
      11: { cellWidth: 57 },
    },
    margin: { left: 14, right: 14, bottom: 16 },
    didDrawPage: (data) => {
      // Footer page number
      const pageStr = `Halaman ${data.pageNumber} dari ${(doc as any).internal.getNumberOfPages()}`;
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text(pageStr, 148.5, 202, { align: 'center' });
    },
  });

  doc.save(`Rekapitulasi_Santri_Tahfidz_${Date.now()}.pdf`);
}
