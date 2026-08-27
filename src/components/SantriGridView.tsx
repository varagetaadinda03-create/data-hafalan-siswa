import React from 'react';
import { 
  Award, 
  BookOpen, 
  FileDown, 
  Eye, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Trophy,
  Sparkles
} from 'lucide-react';
import { Santri } from '../types';
import { getAvatarUrl } from '../services/sheetService';

interface SantriGridViewProps {
  santriList: Santri[];
  onSelectSantri: (santri: Santri) => void;
  onExportPdf: (santri: Santri) => void;
}

export const SantriGridView: React.FC<SantriGridViewProps> = ({
  santriList,
  onSelectSantri,
  onExportPdf,
}) => {
  if (santriList.length === 0) {
    return (
      <div className="bg-[#1e293b] rounded-xl border border-slate-800 p-12 text-center my-6">
        <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-500 mb-3 border border-slate-800">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-200">Tidak ada santri yang cocok</h3>
        <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter yang dipilih.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    if (status.toLowerCase().includes('sangat')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Sangat Baik
        </span>
      );
    }
    if (status.toLowerCase().includes('bimbingan')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          Perlu Bimbingan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
        <CheckCircle2 className="w-3 h-3 text-blue-400" />
        Baik
      </span>
    );
  };

  const getTahsinBadgeClass = (score: number) => {
    if (score >= 90) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold';
    if (score >= 80) return 'bg-blue-500/10 text-blue-400 border-blue-500/30 font-semibold';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-semibold';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
      {santriList.map((santri) => {
        const topPrestasi = santri.prestasiList[0];

        return (
          <div
            key={santri.nis}
            id={`santri-card-${santri.nis}`}
            className="bg-[#1e293b] rounded-xl border border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-slate-700"
          >
            {/* Card Header & Avatar */}
            <div className="p-4.5">
              
              <div className="flex items-start gap-3.5">
                {/* Photo / Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={santri.fotoUrl}
                    alt={santri.nama}
                    onError={(e) => {
                      e.currentTarget.src = getAvatarUrl(santri.nama, santri.no);
                    }}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-700/80 shadow-md"
                    loading="lazy"
                  />
                  <span 
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 text-[9px] flex items-center justify-center font-bold ${
                      santri.jenisKelamin === 'Perempuan' ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'
                    }`}
                    title={santri.jenisKelamin}
                  >
                    {santri.jenisKelamin === 'Perempuan' ? 'P' : 'L'}
                  </span>
                </div>

                {/* Name & Basic Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900/90 border border-slate-700/60 px-1.5 py-0.5 rounded">
                      {santri.nis}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      {santri.kelas}
                    </span>
                  </div>

                  <h3 
                    onClick={() => onSelectSantri(santri)}
                    className="text-sm font-bold text-slate-100 truncate mt-1 cursor-pointer group-hover:text-emerald-400 transition-colors font-serif"
                    title={santri.nama}
                  >
                    {santri.nama}
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    {getStatusBadge(santri.statusHafalan)}
                  </div>
                </div>
              </div>

              {/* Hafalan & Tahsin Metrics Box */}
              <div className="mt-4 bg-slate-900/70 rounded-lg p-3 border border-slate-800 space-y-2">
                
                {/* Surah Terakhir & Juz */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    Surah Terakhir:
                  </span>
                  <span className="font-bold text-slate-200">
                    {santri.surahTerakhir} <span className="text-emerald-400 font-medium">(Juz {santri.juz})</span>
                  </span>
                </div>

                {/* Jumlah Hafalan Progress */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Progres Hafalan:</span>
                    <span className="font-bold text-slate-200">{santri.jumlahHafalan} / 114 Surah</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (santri.jumlahHafalan / 114) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Tahsin & Kehadiran Bar */}
                <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Nilai Tahsin:</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs border ${getTahsinBadgeClass(santri.nilaiTahsin)}`}>
                      {santri.nilaiTahsin}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <span>Hadir:</span>
                    <strong className="text-teal-400">{santri.kehadiran}%</strong>
                  </div>
                </div>

              </div>

              {/* Prestasi & Catatan Snippet */}
              <div className="mt-3 space-y-1.5 text-xs">
                {topPrestasi && (
                  <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                    <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate font-medium text-[11px]" title={topPrestasi.judul}>
                      {topPrestasi.judul}
                    </span>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 italic truncate pl-1 border-l-2 border-slate-700" title={santri.catatan}>
                  "{santri.catatan}"
                </p>
              </div>

            </div>

            {/* Card Footer Actions */}
            <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex items-center gap-2">
              <button
                id={`btn-detail-${santri.nis}`}
                onClick={() => onSelectSantri(santri)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors active:scale-98"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Detail Profil</span>
              </button>

              <button
                id={`btn-pdf-${santri.nis}`}
                onClick={() => onExportPdf(santri)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                title="Cetak Rapor Santri (PDF)"
              >
                <FileDown className="w-4 h-4" />
              </button>
            </div>

          </div>
        );
      })}
    </div>
  );
};
