import React, { useState } from 'react';
import { X, FileDown, CheckSquare, Square, FileText } from 'lucide-react';
import { Santri } from '../types';
import { exportMasterRekapPdf } from '../services/pdfService';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  allSantri: Santri[];
  filteredSantri: Santri[];
  currentClassFilter?: string;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  allSantri,
  filteredSantri,
  currentClassFilter,
}) => {
  const [reportTitle, setReportTitle] = useState(
    currentClassFilter 
      ? `Laporan Rekapitulasi Capaian Tahfidz Santri - Kelas ${currentClassFilter}`
      : 'Laporan Rekapitulasi Capaian Tahfidz & Evaluasi Santri'
  );
  const [useFilteredOnly, setUseFilteredOnly] = useState(filteredSantri.length < allSantri.length);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    const targetData = useFilteredOnly ? filteredSantri : allSantri;
    try {
      exportMasterRekapPdf(targetData, reportTitle);
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error('PDF export error:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 shadow-xl w-full max-w-md overflow-hidden animate-scale-in text-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif text-slate-100">Ekspor Laporan Master PDF</h3>
              <p className="text-xs text-slate-400">Format tabel resmi siap cetak (A4 Landscape)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <div className="p-5 space-y-4">
          
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Judul Dokumen Laporan
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Cakupan Data yang Diekspor
            </label>
            <div className="space-y-2">
              <label 
                onClick={() => setUseFilteredOnly(false)}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  !useFilteredOnly ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-semibold' : 'bg-slate-900/60 border-slate-700/80 text-slate-400'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!useFilteredOnly ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-slate-500'}`}>
                  {!useFilteredOnly && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="text-xs">
                  <div className={!useFilteredOnly ? 'text-slate-100' : 'text-slate-300'}>Semua Santri Terdata</div>
                  <div className="text-[11px] text-slate-400 font-normal">Total {allSantri.length} Santri</div>
                </div>
              </label>

              <label 
                onClick={() => setUseFilteredOnly(true)}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  useFilteredOnly ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-semibold' : 'bg-slate-900/60 border-slate-700/80 text-slate-400'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${useFilteredOnly ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-slate-500'}`}>
                  {useFilteredOnly && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="text-xs">
                  <div className={useFilteredOnly ? 'text-slate-100' : 'text-slate-300'}>Data Terfilter Saja</div>
                  <div className="text-[11px] text-slate-400 font-normal">{filteredSantri.length} Santri yang tampil saat ini</div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/80 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-slate-200 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Kelengkapan Laporan:
            </div>
            <p>• Header resmi Ma'had Tahfidzul Qur'an</p>
            <p>• Ringkasan metrik statistik (Rata-rata Tahsin, Kehadiran, Status)</p>
            <p>• Tabel komprehensif 12 kolom dengan penomoran halaman otomatis</p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExporting ? 'Memproses PDF...' : 'Unduh File PDF'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
