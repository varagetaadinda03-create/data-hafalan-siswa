import React, { useState } from 'react';
import { 
  BookOpen, 
  RefreshCw, 
  FileDown, 
  Settings, 
  Wifi, 
  WifiOff, 
  Calendar, 
  Layers, 
  LayoutGrid, 
  Table as TableIcon,
  BarChart3,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { SpreadsheetConfig } from '../types';

interface HeaderProps {
  config: SpreadsheetConfig;
  totalSantri: number;
  filteredCount: number;
  activeView: 'grid' | 'table' | 'analytics';
  setActiveView: (view: 'grid' | 'table' | 'analytics') => void;
  onRefresh: () => Promise<void>;
  onOpenConfig: () => void;
  onExportMasterPdf: () => void;
  onChangeInterval: (seconds: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  totalSantri,
  filteredCount,
  activeView,
  setActiveView,
  onRefresh,
  onOpenConfig,
  onExportMasterPdf,
  onChangeInterval,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const getSyncStatusBadge = () => {
    switch (config.syncStatus) {
      case 'online':
      case 'syncing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Wifi className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Google Sheets</span>
          </span>
        );
      case 'cached':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Mode Cache</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline</span>
          </span>
        );
    }
  };

  const formatLastSync = (isoString: string | null) => {
    if (!isoString) return 'Belum pernah';
    const date = new Date(isoString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <header className="bg-[#1e293b]/95 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 shadow-md">
      {/* Top Notification / Accent Bar */}
      <div className="bg-slate-900/90 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium text-slate-200">Sistem Monitoring Tahfidz & Tahsin Santri Real-Time</span>
          <span className="text-slate-400 hidden md:inline">• Terhubung ke Spreadsheet Resmi Ma'had</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <a 
            href={config.sheetUrl} 
            target="_blank" 
            rel="noreferrer"
            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors underline-offset-2 hover:underline"
            title="Buka Google Sheets di tab baru"
          >
            <span>Buka Sheet</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 shrink-0">
              <BookOpen className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight font-serif">
                  Dashboard Monitoring Santri
                </h1>
                {getSyncStatusBadge()}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Ma'had Tahfidzul Qur'an</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">{filteredCount === totalSantri ? `${totalSantri} Santri Terdata` : `Menampilkan ${filteredCount} dari ${totalSantri} Santri`}</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-slate-400 hidden sm:inline">Update: {formatLastSync(config.lastUpdated)}</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar & Controls */}
          <div className="flex items-center flex-wrap gap-2.5 justify-between lg:justify-end">
            
            {/* View Switcher Tabs */}
            <div className="bg-slate-900/90 p-1 rounded-lg border border-slate-700/60 flex items-center">
              <button
                id="btn-view-grid"
                onClick={() => setActiveView('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeView === 'grid'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tampilan Kartu Foto Santri"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kartu Foto</span>
              </button>
              <button
                id="btn-view-table"
                onClick={() => setActiveView('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeView === 'table'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tampilan Tabel Data"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabel Data</span>
              </button>
              <button
                id="btn-view-analytics"
                onClick={() => setActiveView('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeView === 'analytics'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tampilan Visualisasi Grafik"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grafik Analitik</span>
              </button>
            </div>

            {/* Auto-sync Interval Selector */}
            <div className="relative">
              <select
                id="select-autosync-interval"
                value={config.autoRefreshInterval}
                onChange={(e) => onChangeInterval(Number(e.target.value))}
                className="bg-slate-900/90 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 pr-6 font-medium focus:outline-emerald-500 cursor-pointer"
                title="Interval Sinkronisasi Otomatis"
              >
                <option value={0}>Auto-sync: Mati</option>
                <option value={15}>Auto-sync: 15s</option>
                <option value={30}>Auto-sync: 30s</option>
                <option value={60}>Auto-sync: 1m</option>
                <option value={300}>Auto-sync: 5m</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              id="btn-refresh-data"
              onClick={handleRefreshClick}
              disabled={isRefreshing || config.isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
              title="Perbarui Data Sekarang"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || config.isSyncing ? 'animate-spin text-emerald-400' : 'text-slate-300'}`} />
              <span className="hidden sm:inline">Sinkronkan</span>
            </button>

            {/* Export PDF Master Button */}
            <button
              id="btn-export-master-pdf"
              onClick={onExportMasterPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 transition-all active:scale-95"
              title="Ekspor Laporan Lengkap PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Ekspor PDF</span>
            </button>

            {/* Config & Settings Button */}
            <button
              id="btn-sheet-settings"
              onClick={onOpenConfig}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-700 transition-colors"
              title="Pengaturan URL Spreadsheet & Sumber Data"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
