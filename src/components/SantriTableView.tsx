import React from 'react';
import { Santri } from '../types';
import { Eye, FileDown, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { getAvatarUrl } from '../services/sheetService';

interface SantriTableViewProps {
  santriList: Santri[];
  onSelectSantri: (santri: Santri) => void;
  onExportPdf: (santri: Santri) => void;
}

export const SantriTableView: React.FC<SantriTableViewProps> = ({
  santriList,
  onSelectSantri,
  onExportPdf,
}) => {
  if (santriList.length === 0) {
    return (
      <div className="bg-[#1e293b] rounded-xl border border-slate-800 p-12 text-center my-6">
        <h3 className="text-base font-bold text-slate-200">Tidak ada santri yang sesuai</h3>
        <p className="text-xs text-slate-400 mt-1">Coba atur ulang kata kunci atau filter.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    if (status.toLowerCase().includes('sangat')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <Sparkles className="w-2.5 h-2.5" />
          Sangat Baik
        </span>
      );
    }
    if (status.toLowerCase().includes('bimbingan')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <AlertCircle className="w-2.5 h-2.5" />
          Perlu Bimbingan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
        <CheckCircle2 className="w-2.5 h-2.5" />
        Baik
      </span>
    );
  };

  return (
    <div className="bg-[#1e293b] rounded-xl border border-slate-800 shadow-sm overflow-hidden mb-10">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-3.5 text-center w-12">No</th>
              <th className="py-3 px-4">Santri</th>
              <th className="py-3 px-3 text-center">Kelas</th>
              <th className="py-3 px-3.5">Surah Terakhir</th>
              <th className="py-3 px-3 text-center">Juz</th>
              <th className="py-3 px-3.5 text-center">Jml Hafalan</th>
              <th className="py-3 px-3.5 text-center">Status</th>
              <th className="py-3 px-3.5 text-center">Nilai Tahsin</th>
              <th className="py-3 px-3 text-center">Kehadiran</th>
              <th className="py-3 px-4">Catatan Halaqah</th>
              <th className="py-3 px-3.5 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {santriList.map((santri) => (
              <tr 
                key={santri.nis} 
                className="hover:bg-slate-800/50 transition-colors group"
              >
                {/* No */}
                <td className="py-3 px-3.5 text-center font-mono text-slate-500">
                  {santri.no}
                </td>

                {/* Photo & Name */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={santri.fotoUrl}
                      alt={santri.nama}
                      onError={(e) => {
                        e.currentTarget.src = getAvatarUrl(santri.nama, santri.no);
                      }}
                      className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                      loading="lazy"
                    />
                    <div>
                      <div 
                        onClick={() => onSelectSantri(santri)}
                        className="font-bold text-slate-100 hover:text-emerald-400 cursor-pointer font-serif transition-colors text-xs sm:text-sm"
                      >
                        {santri.nama}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                        <span>{santri.nis}</span>
                        <span>•</span>
                        <span>{santri.jenisKelamin}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Kelas */}
                <td className="py-3 px-3 text-center">
                  <span className="font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                    {santri.kelas}
                  </span>
                </td>

                {/* Surah Terakhir */}
                <td className="py-3 px-3.5 font-medium text-slate-200">
                  {santri.surahTerakhir}
                </td>

                {/* Juz */}
                <td className="py-3 px-3 text-center font-bold text-emerald-400">
                  Juz {santri.juz}
                </td>

                {/* Jumlah Hafalan */}
                <td className="py-3 px-3.5 text-center">
                  <span className="font-bold text-slate-100">{santri.jumlahHafalan}</span>
                  <span className="text-[10px] text-slate-400 block">Surah</span>
                </td>

                {/* Status */}
                <td className="py-3 px-3.5 text-center">
                  {getStatusBadge(santri.statusHafalan)}
                </td>

                {/* Nilai Tahsin */}
                <td className="py-3 px-3.5 text-center">
                  <span 
                    className={`inline-block px-2 py-0.5 rounded font-bold text-xs border ${
                      santri.nilaiTahsin >= 90
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : santri.nilaiTahsin >= 80
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {santri.nilaiTahsin}
                  </span>
                </td>

                {/* Kehadiran */}
                <td className="py-3 px-3 text-center font-semibold text-teal-400">
                  {santri.kehadiran}%
                </td>

                {/* Catatan */}
                <td className="py-3 px-4 max-w-[200px] truncate text-slate-400 italic text-[11px]" title={santri.catatan}>
                  "{santri.catatan}"
                </td>

                {/* Actions */}
                <td className="py-3 px-3.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onSelectSantri(santri)}
                      className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      title="Lihat Detail Profil Santri"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onExportPdf(santri)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      title="Ekspor Rapor PDF"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
