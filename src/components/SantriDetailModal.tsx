import React, { useState } from 'react';
import { 
  X, 
  Trophy, 
  Award, 
  ShieldCheck, 
  BookOpen, 
  Calendar, 
  Phone, 
  Building2, 
  UserCheck, 
  FileDown, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Clock, 
  Flame, 
  Medal,
  Star,
  Check,
  Camera,
  Link as LinkIcon,
  ExternalLink,
  Copy,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Santri, CatatanDisiplinItem } from '../types';
import { getAvatarUrl, normalizePhotoUrl } from '../services/sheetService';

interface SantriDetailModalProps {
  santri: Santri | null;
  onClose: () => void;
  onExportPdf: (santri: Santri) => void;
  onUpdateSantri?: (updated: Santri) => void;
}

export const SantriDetailModal: React.FC<SantriDetailModalProps> = ({
  santri,
  onClose,
  onExportPdf,
  onUpdateSantri,
}) => {
  const [activeTab, setActiveTab] = useState<'akademik' | 'prestasi' | 'disiplin' | 'roadmap'>('akademik');
  const [newCatatanText, setNewCatatanText] = useState('');
  const [newCatatanKategori, setNewCatatanKategori] = useState<'Ibadah' | 'Kedisiplinan' | 'Kerapihan'>('Ibadah');
  const [newCatatanPoin, setNewCatatanPoin] = useState<number>(5);

  // Photo Link Editing States
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [photoInputUrl, setPhotoInputUrl] = useState(santri?.fotoUrl || '');
  const [copiedPhotoLink, setCopiedPhotoLink] = useState(false);

  if (!santri) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#059669', '#d97706', '#2563eb', '#10b981', '#f59e0b'],
    });
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateSantri) return;
    const normalized = normalizePhotoUrl(photoInputUrl, santri.nama, santri.no);
    const updated: Santri = {
      ...santri,
      fotoUrl: normalized,
    };
    onUpdateSantri(updated);
    setIsEditingPhoto(false);
  };

  const handleCopyPhotoLink = () => {
    navigator.clipboard.writeText(santri.fotoUrl);
    setCopiedPhotoLink(true);
    setTimeout(() => setCopiedPhotoLink(false), 2000);
  };

  const handleResetToAvatar = () => {
    const avatar = getAvatarUrl(santri.nama, santri.no);
    setPhotoInputUrl(avatar);
    if (onUpdateSantri) {
      onUpdateSantri({
        ...santri,
        fotoUrl: avatar,
      });
      setIsEditingPhoto(false);
    }
  };

  const handleAddDisiplin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatatanText.trim() || !onUpdateSantri) return;

    const newItem: CatatanDisiplinItem = {
      id: `dis-${Date.now()}`,
      tanggal: new Date().toISOString().split('T')[0],
      kategori: newCatatanKategori,
      tipe: newCatatanPoin >= 0 ? 'positif' : 'peringatan',
      deskripsi: newCatatanText.trim(),
      poin: newCatatanPoin,
      musyrif: santri.waliKelas,
    };

    const newPoinTotal = Math.min(100, Math.max(0, santri.poinDisiplin + newCatatanPoin));
    let newStatus: 'Sangat Tertib' | 'Tertib' | 'Cukup' | 'Pembinaan' = 'Tertib';
    if (newPoinTotal >= 92) newStatus = 'Sangat Tertib';
    else if (newPoinTotal >= 80) newStatus = 'Tertib';
    else if (newPoinTotal >= 70) newStatus = 'Cukup';
    else newStatus = 'Pembinaan';

    const updated: Santri = {
      ...santri,
      poinDisiplin: newPoinTotal,
      statusDisiplin: newStatus,
      catatanDisiplinList: [newItem, ...santri.catatanDisiplinList],
    };

    onUpdateSantri(updated);
    setNewCatatanText('');
  };

  const getStatusBadge = (status: string) => {
    if (status.toLowerCase().includes('sangat')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          <Sparkles className="w-3.5 h-3.5" />
          Sangat Baik
        </span>
      );
    }
    if (status.toLowerCase().includes('bimbingan')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <AlertCircle className="w-3.5 h-3.5" />
          Perlu Bimbingan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Baik
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in">
      <div 
        className="bg-[#1e293b] rounded-2xl border border-slate-700/80 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-in text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header with Islamic Accent */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-5 sm:p-6 relative border-b border-slate-800">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Tutup Detail"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 pr-10">
            {/* Large Photo / Avatar with Edit Trigger */}
            <div className="relative shrink-0 group">
              <img
                src={santri.fotoUrl}
                alt={santri.nama}
                onError={(e) => {
                  e.currentTarget.src = getAvatarUrl(santri.nama, santri.no);
                }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-slate-700/80 shadow-xl"
              />
              <span 
                className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold border-2 border-slate-900 ${
                  santri.jenisKelamin === 'Perempuan' ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {santri.jenisKelamin}
              </span>

              {/* Hover Edit Overlay */}
              <button
                onClick={() => {
                  setPhotoInputUrl(santri.fotoUrl);
                  setIsEditingPhoto(!isEditingPhoto);
                }}
                className="absolute inset-0 rounded-2xl bg-slate-950/70 text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer"
                title="Klik untuk ubah Link Foto"
              >
                <Camera className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-semibold">Ubah Foto</span>
              </button>
            </div>

            {/* Profile Titles */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-slate-800 text-emerald-400 text-xs font-mono px-2.5 py-0.5 rounded-md border border-slate-700">
                  {santri.nis}
                </span>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-2.5 py-0.5 rounded-md">
                  Kelas {santri.kelas}
                </span>
                {getStatusBadge(santri.statusHafalan)}
              </div>

              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-slate-100">
                  {santri.nama}
                </h2>
                <button
                  onClick={() => {
                    setPhotoInputUrl(santri.fotoUrl);
                    setIsEditingPhoto(!isEditingPhoto);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 transition-colors"
                  title="Perbarui tautan foto santri"
                >
                  <LinkIcon className="w-3 h-3 text-emerald-400" />
                  <span>{isEditingPhoto ? 'Tutup Edit Foto' : 'Link Foto'}</span>
                </button>
              </div>

              <div className="mt-2 flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  {santri.kamarAsrama}
                </span>
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Wali: {santri.waliKelas}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {santri.kontakWali}
                </span>
              </div>
            </div>

            {/* Action Buttons inside Header */}
            <div className="flex sm:flex-col gap-2 shrink-0 mt-3 sm:mt-0 w-full sm:w-auto">
              <button
                onClick={() => onExportPdf(santri)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-950/40 active:scale-95"
              >
                <FileDown className="w-4 h-4 text-white" />
                <span>Unduh Rapor PDF</span>
              </button>
              <button
                onClick={triggerConfetti}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                title="Apresiasi Prestasi Santri"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Apresiasi</span>
              </button>
            </div>

          </div>

          {/* Photo Link Editor Panel (Collapsible) */}
          {isEditingPhoto && (
            <div className="mt-4 pt-4 border-t border-slate-800 bg-slate-900/90 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-slate-200">Perbarui Link Foto Santri</h4>
                </div>
                <span className="text-[11px] text-slate-400">Mendukung link langsung & Google Drive</span>
              </div>

              <form onSubmit={handleSavePhoto} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="url"
                      value={photoInputUrl}
                      onChange={(e) => setPhotoInputUrl(e.target.value)}
                      placeholder="https://... (URL Foto atau link Google Drive sharing)"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-emerald-500 font-mono"
                      required
                    />
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetToAvatar}
                      className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
                      title="Kembalikan ke Avatar Inisial Bawaan"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Avatar</span>
                    </button>
                  </div>
                </div>

                {/* Quick Link Info & Actions */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCopyPhotoLink}
                      className="hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedPhotoLink ? 'Link Tersalin!' : 'Salin Link Foto Saat Ini'}</span>
                    </button>
                    {santri.fotoUrl && (
                      <a
                        href={santri.fotoUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Buka di Tab Baru</span>
                      </a>
                    )}
                  </div>
                  <span className="text-slate-500 text-[10px]">
                    Tip: Jika menggunakan Google Drive, ubah izin file ke "Anyone with link".
                  </span>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('akademik')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'akademik'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Capaian Tahfidz & Tahsin</span>
          </button>

          <button
            onClick={() => setActiveTab('prestasi')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'prestasi'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Riwayat Prestasi ({santri.prestasiList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('disiplin')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'disiplin'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Catatan Disiplin ({santri.poinDisiplin} Poin)</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'roadmap'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Roadmap 30 Juz</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-900/60">
          
          {/* TAB 1: AKADEMIK & TAHFIDZ */}
          {activeTab === 'akademik' && (
            <div className="space-y-6">
              
              {/* Top Stats 4 Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                
                <div className="bg-[#1e293b] p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Surah Terakhir</span>
                  <p className="text-base font-bold text-slate-100 mt-1 truncate">{santri.surahTerakhir}</p>
                  <span className="text-xs font-semibold text-emerald-400">Juz {santri.juz}</span>
                </div>

                <div className="bg-[#1e293b] p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Jumlah Hafalan</span>
                  <p className="text-base font-bold text-slate-100 mt-1">{santri.jumlahHafalan} Surah</p>
                  <span className="text-xs text-slate-400">{Math.round((santri.jumlahHafalan / 114) * 100)}% dari Qur'an</span>
                </div>

                <div className="bg-[#1e293b] p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Nilai Tahsin</span>
                  <p className="text-base font-bold text-blue-400 mt-1">{santri.nilaiTahsin} / 100</p>
                  <span className="text-xs font-semibold text-blue-400">
                    {santri.nilaiTahsin >= 90 ? 'Mumtaz (A)' : santri.nilaiTahsin >= 80 ? 'Jayyid (B)' : 'Cukup (C)'}
                  </span>
                </div>

                <div className="bg-[#1e293b] p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Presensi Halaqah</span>
                  <p className="text-base font-bold text-teal-400 mt-1">{santri.kehadiran}%</p>
                  <span className="text-xs font-semibold text-teal-400">Sangat Disiplin</span>
                </div>

              </div>

              {/* Parameter Tahsin Breakdown */}
              <div className="bg-[#1e293b] p-4.5 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3.5 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Rincian Evaluasi Kompetensi Tajwid & Fashahah
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span>Makharijul Huruf (Ketepatan Tempat Keluarnya Huruf)</span>
                      <strong className="text-slate-100">{santri.makhrajScore} / 100</strong>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${santri.makhrajScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span>Ahkamut Tajwid (Hukum Mad, Nun/Mim Mati, Ghunnah, Qalqalah)</span>
                      <strong className="text-slate-100">{santri.tajwidScore} / 100</strong>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${santri.tajwidScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                      <span>Kelancaran, Waqaf & Ibtida' (Tartil & Irama)</span>
                      <strong className="text-slate-100">{santri.kelancaranScore} / 100</strong>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${santri.kelancaranScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Musyrif Note & Guidance */}
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4.5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Catatan & Arahan Musyrif Halaqah
                      </h4>
                      <span className="text-[11px] font-medium text-emerald-400">{santri.waliKelas}</span>
                    </div>
                    <p className="text-sm font-serif italic text-emerald-200 mt-1">
                      "{santri.catatan}"
                    </p>
                    <p className="text-xs text-emerald-300/80 mt-2">
                      Target pekanan: Memantapkan hafalan surah <strong>{santri.surahTerakhir}</strong> serta persiapan tasmi' 1/2 juz di hadapan musyrif.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRESTASI & PENGHARGAAN */}
          {activeTab === 'prestasi' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 font-serif">Riwayat Penghargaan & Prestasi</h4>
                  <p className="text-xs text-slate-400">Daftar capaian prestasi santri selama menempuh pendidikan di pondok.</p>
                </div>
                <button
                  onClick={triggerConfetti}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rayakan</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {santri.prestasiList.map((prestasi, idx) => (
                  <div
                    key={prestasi.id || idx}
                    className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-all flex items-start gap-4 shadow-sm"
                  >
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                      {prestasi.iconType === 'trophy' ? (
                        <Trophy className="w-6 h-6" />
                      ) : prestasi.iconType === 'medal' ? (
                        <Medal className="w-6 h-6" />
                      ) : (
                        <Star className="w-6 h-6" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          {prestasi.peringkat}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">{prestasi.tingkat}</span>
                          <span>•</span>
                          <span>Tahun {prestasi.tahun}</span>
                        </div>
                      </div>

                      <h5 className="text-sm font-bold text-slate-100 mt-1 font-serif">
                        {prestasi.judul}
                      </h5>

                      <p className="text-xs text-slate-300 mt-1">
                        {prestasi.keterangan}
                      </p>

                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                          Kategori: {prestasi.kategori}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CATATAN DISIPLIN PRIBADI */}
          {activeTab === 'disiplin' && (
            <div className="space-y-5">
              
              {/* Discipline Score Overview */}
              <div className="bg-[#1e293b] p-4.5 rounded-xl border border-slate-800 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 font-serif">Indeks Kedisiplinan & Akhlak</h4>
                    <p className="text-xs text-slate-400">Pemantauan perilaku, ibadah yaumiyah, dan kepatuhan asrama</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-400 font-serif">{santri.poinDisiplin} / 100</div>
                    <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                      Status: {santri.statusDisiplin}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Input Catatan Baru Musyrif */}
              <form onSubmit={handleAddDisiplin} className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 shadow-sm">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  Tambah Catatan Disiplin / Apresiasi Musyrif
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Tulis deskripsi catatan kedisiplinan..."
                      value={newCatatanText}
                      onChange={(e) => setNewCatatanText(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-emerald-500"
                    />
                  </div>
                  <div>
                    <select
                      value={newCatatanKategori}
                      onChange={(e) => setNewCatatanKategori(e.target.value as any)}
                      className="w-full px-2.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-medium focus:outline-emerald-500"
                    >
                      <option value="Ibadah">Kategori: Ibadah</option>
                      <option value="Kedisiplinan">Kategori: Kedisiplinan</option>
                      <option value="Kerapihan">Kategori: Kerapihan</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newCatatanPoin}
                      onChange={(e) => setNewCatatanPoin(Number(e.target.value))}
                      className="w-24 px-2 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-semibold focus:outline-emerald-500"
                    >
                      <option value={5}>+5 Poin (Apresiasi)</option>
                      <option value={3}>+3 Poin (Baik)</option>
                      <option value={-2}>-2 Poin (Teguran)</option>
                      <option value={-5}>-5 Poin (Pelanggaran)</option>
                    </select>
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </form>

              {/* Log Catatan Disiplin List */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Riwayat Catatan Ketertiban & Karakter
                </h5>
                {santri.catatanDisiplinList.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      item.tipe === 'positif'
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                        : item.tipe === 'peringatan'
                        ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                        : 'bg-[#1e293b] border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      {item.tipe === 'positif' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-100 font-serif">
                          {item.kategori}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              item.poin >= 0
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {item.poin >= 0 ? `+${item.poin}` : item.poin} Poin
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{item.tanggal}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{item.deskripsi}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Dicatat oleh: <strong className="text-slate-300">{item.musyrif}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: ROADMAP 30 JUZ */}
          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-100 font-serif">Peta Capaian 30 Juz Al-Qur'an</h4>
                <p className="text-xs text-slate-400">Visualisasi status kelulusan tasmi' per Juz</p>
              </div>

              {/* 30 Juz Visual Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
                  const isCurrent = juzNum === santri.juz;
                  const isCompleted = juzNum > santri.juz || (santri.juz === 30 && santri.jumlahHafalan > 25 && juzNum === 30);

                  return (
                    <div
                      key={juzNum}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between ${
                        isCurrent
                          ? 'bg-amber-500/20 border-amber-400/80 text-amber-300 ring-2 ring-amber-400/30 shadow-sm'
                          : isCompleted
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-800/80 border-slate-700/60 text-slate-500'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold block">JUZ</span>
                      <span className="text-base font-bold my-0.5">{juzNum}</span>
                      <span className="text-[9px] font-semibold block">
                        {isCurrent ? 'Sedang' : isCompleted ? 'Mutqin' : 'Rencana'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-4 text-xs pt-2">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                  Khatam / Mutqin
                </span>
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
                  Sedang Ditempuh
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <span className="w-3 h-3 rounded bg-slate-700 inline-block" />
                  Target Selanjutnya
                </span>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-900/90 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Data diverifikasi oleh Ma'had Tahfidz Real-Time System</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
