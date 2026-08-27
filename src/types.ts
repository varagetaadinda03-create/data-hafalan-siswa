export interface Santri {
  no: number;
  nis: string;
  nama: string;
  kelas: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  surahTerakhir: string;
  juz: number;
  jumlahHafalan: number;
  statusHafalan: 'Sangat Baik' | 'Baik' | 'Perlu Bimbingan' | string;
  nilaiTahsin: number;
  kehadiran: number;
  catatan: string;
  // Enriched detail attributes
  fotoUrl: string;
  poinDisiplin: number;
  statusDisiplin: 'Sangat Tertib' | 'Tertib' | 'Cukup' | 'Pembinaan';
  prestasiList: PrestasiItem[];
  catatanDisiplinList: CatatanDisiplinItem[];
  waliKelas: string;
  kontakWali: string;
  kamarAsrama: string;
  targetJuzBerikutnya: string;
  makhrajScore: number;
  tajwidScore: number;
  kelancaranScore: number;
}

export interface PrestasiItem {
  id: string;
  judul: string;
  kategori: 'Tahfidz' | 'Tahsin' | 'Akademik' | 'Kedisiplinan' | 'Bahasa' | 'Lainnya';
  tingkat: 'Internal Pondok' | 'Kecamatan' | 'Kabupaten/Kota' | 'Provinsi' | 'Nasional';
  tahun: string;
  peringkat: string;
  keterangan: string;
  iconType: 'trophy' | 'medal' | 'star' | 'award' | 'book';
}

export interface CatatanDisiplinItem {
  id: string;
  tanggal: string;
  kategori: 'Ibadah' | 'Kerapihan' | 'Kedisiplinan' | 'Bahasa' | 'Pelanggaran Ringan' | 'Apresiasi';
  tipe: 'positif' | 'peringatan' | 'netral';
  deskripsi: string;
  poin: number;
  musyrif: string;
}

export interface FilterState {
  searchQuery: string;
  kelas: string;
  statusHafalan: string;
  jenisKelamin: string;
  tahsinRange: [number, number];
  kehadiranRange: [number, number];
  juzFilter: string;
  statusDisiplin: string;
  sortBy: 'no' | 'nama' | 'nilaiTahsin' | 'jumlahHafalan' | 'kehadiran' | 'poinDisiplin';
  sortOrder: 'asc' | 'desc';
}

export interface SpreadsheetConfig {
  sheetUrl: string;
  gid: string;
  autoRefreshInterval: number; // in seconds, 0 = off
  lastUpdated: string | null;
  isSyncing: boolean;
  syncStatus: 'online' | 'cached' | 'error' | 'syncing';
  errorMessage?: string;
}

export interface DashboardStats {
  totalSantri: number;
  totalLakiLaki: number;
  totalPerempuan: number;
  rataTahsin: number;
  rataKehadiran: number;
  rataHafalanSurah: number;
  targetTercapaiCount: number;
  perluBimbinganCount: number;
  sangatBaikCount: number;
  baikCount: number;
  rataPoinDisiplin: number;
}
