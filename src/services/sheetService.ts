import Papa from 'papaparse';
import { INITIAL_SANTRI_DATA } from '../data/fallbackData';
import { CatatanDisiplinItem, PrestasiItem, Santri } from '../types';

export const DEFAULT_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1mLT5PTyuIIz_vYdHCi5HaLZHJfIftLvOSyVUjQfGqlQ/edit?gid=1885896530#gid=1885896530';
export const DEFAULT_SHEET_ID = '1mLT5PTyuIIz_vYdHCi5HaLZHJfIftLvOSyVUjQfGqlQ';
export const DEFAULT_GID = '1885896530';

const LOCAL_STORAGE_KEY = 'pesantren_santri_data_cache';
const LOCAL_STORAGE_TIME_KEY = 'pesantren_santri_data_last_sync';

export function getExportUrl(sheetUrlOrId: string, gid = DEFAULT_GID): string {
  let sheetId = sheetUrlOrId;
  let targetGid = gid;

  if (sheetUrlOrId.includes('/d/')) {
    const match = sheetUrlOrId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      sheetId = match[1];
    }
  }

  if (sheetUrlOrId.includes('gid=')) {
    const gidMatch = sheetUrlOrId.match(/gid=([0-9]+)/);
    if (gidMatch && gidMatch[1]) {
      targetGid = gidMatch[1];
    }
  }

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${targetGid}`;
}

const waliMap: Record<string, { wali: string; asrama: string }> = {
  'VII A': { wali: 'Ust. Ahmad Dahlan, Lc.', asrama: 'Asrama Bilal bin Rabah - K.101' },
  'VII B': { wali: 'Ust. Mansyur Hidayat, S.Pd.I.', asrama: 'Asrama Abu Bakar Ash-Shiddiq - K.104' },
  'VIII A': { wali: 'Ust. Farhan Al-Ghifari, Al-Hafidz', asrama: 'Asrama Umar bin Khattab - K.202' },
  'VIII B': { wali: 'Ust. Rahmatullah, S.Th.I.', asrama: 'Asrama Utsman bin Affan - K.205' },
  'IX A': { wali: 'Ust. Dr. H. Zainuddin, M.Ag.', asrama: 'Asrama Ali bin Abi Thalib - K.301' },
  'IX B': { wali: 'Ust. M. Ridwan, Lc., M.H.', asrama: 'Asrama Khalid bin Walid - K.303' },
};

export function getAvatarUrl(nama: string, index: number): string {
  const bgColors = ['059669', '0d9488', '2563eb', '4f46e5', '7c3aed', '0284c7', '16a34a', 'b45309', 'd97706', '0891b2'];
  const bg = bgColors[index % bgColors.length];
  const encoded = encodeURIComponent(nama);
  return `https://ui-avatars.com/api/?name=${encoded}&background=${bg}&color=ffffff&size=256&bold=true&font-size=0.38`;
}

export function normalizePhotoUrl(rawUrl: string | undefined | null, nama: string, index: number): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return getAvatarUrl(nama, index);
  }

  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === '-' || trimmed === 'null' || trimmed === 'undefined') {
    return getAvatarUrl(nama, index);
  }

  // Check if it is a Google Drive Link
  if (trimmed.includes('drive.google.com')) {
    // Pattern 1: /file/d/FILE_ID
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
    }
    // Pattern 2: ?id=FILE_ID or &id=FILE_ID
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }
    // Pattern 3: /open?id=FILE_ID
    const openMatch = trimmed.match(/\/open\?id=([a-zA-Z0-9_-]+)/);
    if (openMatch && openMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${openMatch[1]}`;
    }
  }

  // If it's a standard HTTP/HTTPS link or data URI, return trimmed
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  return getAvatarUrl(nama, index);
}

export function parseCsvToSantri(csvText: string): Santri[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (!result.data || result.data.length === 0) {
    throw new Error('Data CSV kosong atau tidak valid');
  }

  const santriList: Santri[] = result.data.map((row, idx) => {
    // Helper to get field value by checking multiple key variations case-insensitively
    const getField = (...keys: string[]): string => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
          return String(row[k]).trim();
        }
      }
      // Case-insensitive & normalized search
      const rowKeys = Object.keys(row);
      for (const k of keys) {
        const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        const match = rowKeys.find((rk) => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === normK);
        if (match && row[match] !== undefined && row[match] !== null && String(row[match]).trim() !== '') {
          return String(row[match]).trim();
        }
      }
      return '';
    };

    const no = parseInt(getField('No', 'no', 'Nomor', 'id') || `${idx + 1}`) || idx + 1;
    const nis = getField('NIS', 'nis', 'Nomor Induk', 'No Induk') || `PSQ2026${String(no).padStart(3, '0')}`;
    const nama = getField('Nama Siswa', 'Nama', 'nama', 'Nama Lengkap', 'Santri') || `Santri ${no}`;
    const kelas = getField('Kelas', 'kelas', 'Tingkat') || 'VII A';
    const jenisKelamin = (getField('Jenis Kelamin', 'Gender', 'jk') || 'Laki-laki').toLowerCase().includes('perempuan')
      ? 'Perempuan'
      : 'Laki-laki';
    const surahTerakhir = getField('Surah Terakhir', 'Surat Terakhir', 'Surah', 'Surat') || 'Al-Fatihah';
    const juz = parseInt(getField('Juz', 'juz') || '30') || 30;
    const jumlahHafalan = parseInt(getField('Jumlah Hafalan (Surah)', 'Jumlah Hafalan', 'Hafalan', 'Total Hafalan') || '20') || 20;
    const statusHafalan = getField('Status Hafalan', 'Status') || (jumlahHafalan >= 60 ? 'Sangat Baik' : 'Baik');
    const nilaiTahsin = parseInt(getField('Nilai Tahsin', 'Tahsin', 'Nilai', 'Skor Tahsin') || '80') || 80;
    const kehadiran = parseInt(getField('Kehadiran (%)', 'Kehadiran', 'Absensi', 'Presensi') || '90') || 90;
    const catatan = getField('Catatan', 'catatan', 'Keterangan', 'Catatan Musyrif') || 'Target hafalan tercapai';

    // Check for Link Foto from multiple variations
    const rawPhoto = getField(
      'link foto',
      'Link Foto',
      'link_foto',
      'Link Foto Santri',
      'Foto',
      'foto',
      'Foto Santri',
      'URL Foto',
      'url_foto',
      'Photo',
      'photo',
      'Photo URL',
      'Image',
      'image',
      'Avatar',
      'Link Photo',
      'Gambar',
      'Foto Profil'
    );

    const fotoUrl = normalizePhotoUrl(rawPhoto, nama, idx);

    const waliInfo = waliMap[kelas] || {
      wali: 'Ust. Pembina Halaqah, S.Pd.I.',
      asrama: 'Gedung Asrama Santri',
    };

    const makhrajScore = Math.min(100, Math.max(65, Math.round(nilaiTahsin + ((idx % 5) - 2))));
    const tajwidScore = Math.min(100, Math.max(65, Math.round(nilaiTahsin + (((idx + 2) % 5) - 2))));
    const kelancaranScore = Math.min(100, Math.max(65, Math.round(nilaiTahsin + (((idx + 4) % 5) - 2))));

    const poinDisiplin = Math.min(
      100,
      Math.max(70, Math.round(kehadiran * 0.7 + nilaiTahsin * 0.3 + (idx % 3) * 2))
    );
    let statusDisiplin: 'Sangat Tertib' | 'Tertib' | 'Cukup' | 'Pembinaan' = 'Tertib';
    if (poinDisiplin >= 92) statusDisiplin = 'Sangat Tertib';
    else if (poinDisiplin >= 80) statusDisiplin = 'Tertib';
    else if (poinDisiplin >= 70) statusDisiplin = 'Cukup';
    else statusDisiplin = 'Pembinaan';

    const prestasiList: PrestasiItem[] = [];
    if (nilaiTahsin >= 90 || jumlahHafalan >= 60 || statusHafalan === 'Sangat Baik') {
      prestasiList.push({
        id: `prestasi-${nis}-1`,
        judul: `Juara ${(idx % 3) + 1} Musabaqah Hifdzil Qur'an Kategori Juz ${juz === 30 ? '30' : 'Terbuka'}`,
        kategori: 'Tahfidz',
        tingkat: idx % 2 === 0 ? 'Kabupaten/Kota' : 'Internal Pondok',
        tahun: '2026',
        peringkat: `Juara ${(idx % 3) + 1}`,
        keterangan: "Mempertahankan kelancaran hafalan dengan predikat Mumtaz dalam tasmi' akbar santri.",
        iconType: 'trophy',
      });
      prestasiList.push({
        id: `prestasi-${nis}-2`,
        judul: 'Bintang Teladan Tahsin & Tajwid Terbaik',
        kategori: 'Tahsin',
        tingkat: 'Internal Pondok',
        tahun: '2026',
        peringkat: 'Predikat A+',
        keterangan: 'Penguasaan kaidah Mad, Gunnah, dan Makharijul Huruf sangat fasih dan tartil.',
        iconType: 'award',
      });
    } else if (nilaiTahsin >= 80 || statusHafalan === 'Baik') {
      prestasiList.push({
        id: `prestasi-${nis}-1`,
        judul: `Piagam Kelulusan Ujian Tahfidz ${jumlahHafalan} Surah`,
        kategori: 'Tahfidz',
        tingkat: 'Internal Pondok',
        tahun: '2026',
        peringkat: 'Lulus Mumtaz',
        keterangan: `Tuntas menyetorkan hafalan surah ${surahTerakhir} secara bertahap kepada musyrif.`,
        iconType: 'medal',
      });
    }

    prestasiList.push({
      id: `prestasi-${nis}-last`,
      judul: 'Penghargaan Disiplin Shalat Berjamaah & Ibadah Yaumiyah',
      kategori: 'Kedisiplinan',
      tingkat: 'Internal Pondok',
      tahun: '2026',
      peringkat: 'Santri Istiqomah',
      keterangan: 'Konsisten hadir di shaf pertama masjid dan istiqomah tilawah mandiri.',
      iconType: 'star',
    });

    const catatanDisiplinList: CatatanDisiplinItem[] = [
      {
        id: `dis-${nis}-1`,
        tanggal: '2026-08-24',
        kategori: 'Ibadah',
        tipe: 'positif',
        deskripsi: 'Hadir tepat waktu dan istiqomah shalat Subuh berjamaah di shaf depan masjid.',
        poin: 5,
        musyrif: 'Ust. Ridwan Kamil, S.Ag.',
      },
      {
        id: `dis-${nis}-2`,
        tanggal: '2026-08-20',
        kategori: 'Kedisiplinan',
        tipe: 'positif',
        deskripsi: "Menyelesaikan target murojaah harian ba'da Ashar dengan tertib dan khidmat.",
        poin: 5,
        musyrif: waliInfo.wali,
      },
    ];

    if (catatan.toLowerCase().includes('bimbingan') || catatan.toLowerCase().includes('tajwid')) {
      catatanDisiplinList.push({
        id: `dis-${nis}-3`,
        tanggal: '2026-08-15',
        kategori: 'Kedisiplinan',
        tipe: 'peringatan',
        deskripsi: `Catatan Halaqah: ${catatan}. Diberikan sesi talaqqi tambahan 15 menit.`,
        poin: -2,
        musyrif: waliInfo.wali,
      });
    } else {
      catatanDisiplinList.push({
        id: `dis-${nis}-3`,
        tanggal: '2026-08-16',
        kategori: 'Kerapihan',
        tipe: 'positif',
        deskripsi: 'Kamar dan lemari asrama selalu rapi saat inspeksi berkala musyrif.',
        poin: 3,
        musyrif: 'Tim Pembina Asrama',
      });
    }

    const phoneRand = 1000 + ((no * 73) % 9000);

    return {
      no,
      nis,
      nama,
      kelas,
      jenisKelamin,
      surahTerakhir,
      juz,
      jumlahHafalan,
      statusHafalan,
      nilaiTahsin,
      kehadiran,
      catatan,
      fotoUrl,
      poinDisiplin,
      statusDisiplin,
      prestasiList,
      catatanDisiplinList,
      waliKelas: waliInfo.wali,
      kontakWali: `+62 812-${(1000 + no * 17) % 9000}-${phoneRand}`,
      kamarAsrama: waliInfo.asrama,
      targetJuzBerikutnya: `Juz ${juz > 1 ? juz - 1 : 30}`,
      makhrajScore,
      tajwidScore,
      kelancaranScore,
    };
  });

  return santriList;
}

export async function fetchLiveSpreadsheetData(
  sheetUrl = DEFAULT_SHEET_URL,
  gid = DEFAULT_GID
): Promise<{ data: Santri[]; source: 'live' | 'proxy' | 'cache' | 'fallback'; timestamp: string }> {
  const exportUrl = getExportUrl(sheetUrl, gid);
  const now = new Date().toISOString();

  // Strategy 1: Fetch via local backend proxy
  try {
    const proxyUrl = `/api/sheet-data?url=${encodeURIComponent(exportUrl)}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const csvText = await response.text();
      if (csvText && csvText.includes(',')) {
        const santriList = parseCsvToSantri(csvText);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(santriList));
          localStorage.setItem(LOCAL_STORAGE_TIME_KEY, now);
        } catch {
          // ignore storage error
        }
        return { data: santriList, source: 'proxy', timestamp: now };
      }
    }
  } catch (proxyErr) {
    console.warn('Backend proxy fetch failed, trying direct fetch:', proxyErr);
  }

  // Strategy 2: Direct Client-Side Fetch
  try {
    const response = await fetch(exportUrl, {
      headers: {
        Accept: 'text/csv,text/plain,*/*',
      },
    });
    if (response.ok) {
      const csvText = await response.text();
      if (csvText && csvText.includes(',')) {
        const santriList = parseCsvToSantri(csvText);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(santriList));
          localStorage.setItem(LOCAL_STORAGE_TIME_KEY, now);
        } catch {
          // ignore storage error
        }
        return { data: santriList, source: 'live', timestamp: now };
      }
    }
  } catch (directErr) {
    console.warn('Direct fetch failed, checking local cache:', directErr);
  }

  // Strategy 3: Check LocalStorage Cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    const cachedTime = localStorage.getItem(LOCAL_STORAGE_TIME_KEY) || now;
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { data: parsed, source: 'cache', timestamp: cachedTime };
      }
    }
  } catch {
    // ignore
  }

  // Strategy 4: Built-in initial fallback dataset
  return {
    data: INITIAL_SANTRI_DATA,
    source: 'fallback',
    timestamp: now,
  };
}
