import React, { useState } from 'react';
import { X, Check, RefreshCw, ExternalLink, AlertCircle, Link, Database } from 'lucide-react';
import { DEFAULT_SHEET_URL, DEFAULT_GID, fetchLiveSpreadsheetData } from '../services/sheetService';

interface SheetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  currentGid: string;
  onSave: (url: string, gid: string) => Promise<void>;
}

export const SheetConfigModal: React.FC<SheetConfigModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  currentGid,
  onSave,
}) => {
  const [url, setUrl] = useState(currentUrl);
  const [gid, setGid] = useState(currentGid);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetchLiveSpreadsheetData(url, gid);
      setTestResult({
        success: true,
        message: `Koneksi Berhasil! Terdeteksi ${res.data.length} baris santri (Sumber: ${res.source}).`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Gagal menghubungkan: ${err.message || 'Periksa apakah spreadsheet memiliki akses Siapa saja yang memiliki tautan'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(url, gid);
    onClose();
  };

  const handleResetDefault = () => {
    setUrl(DEFAULT_SHEET_URL);
    setGid(DEFAULT_GID);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 shadow-xl w-full max-w-lg overflow-hidden animate-scale-in text-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif text-slate-100">Pengaturan Sumber Data Spreadsheet</h3>
              <p className="text-xs text-slate-400">Hubungkan link Google Spreadsheet langsung</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-slate-400" />
              URL Lengkap Google Spreadsheet
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-emerald-500 font-mono"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Pastikan akses Spreadsheet diatur ke <strong className="text-slate-300">"Anyone with the link can view"</strong> (Siapa saja yang memiliki tautan dapat melihat).
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Sheet ID Tab (GID)
            </label>
            <input
              type="text"
              value={gid}
              onChange={(e) => setGid(e.target.value)}
              placeholder="1885896530"
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-emerald-500 font-mono"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Angka setelah tanda <code className="bg-slate-800 text-emerald-400 px-1 py-0.5 rounded border border-slate-700">gid=</code> pada URL tab spreadsheet Anda.
            </p>
          </div>

          {/* Supported Columns Guide */}
          <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Dukungan Kolom Foto Santri Otomatis:</span>
            </div>
            <p className="text-slate-400 text-[10.5px]">
              Tambahkan kolom <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">Link Foto</code> atau <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">Foto Santri</code> di spreadsheet Anda. Sistem otomatis mendukung link gambar langsung maupun tautan berbagi <strong className="text-emerald-400">Google Drive</strong>!
            </p>
          </div>

          {/* Test Status Message */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                testResult.success
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                  : 'bg-red-950/40 text-red-300 border-red-800/60'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Actions Button Row */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Menguji...' : 'Uji Koneksi'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefault}
                className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Reset Default
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
              >
                Simpan & Muat Ulang
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
