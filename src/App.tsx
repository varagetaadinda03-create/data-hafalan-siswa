import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Santri, 
  FilterState, 
  SpreadsheetConfig, 
  DashboardStats 
} from './types';
import { 
  DEFAULT_SHEET_URL, 
  DEFAULT_GID, 
  fetchLiveSpreadsheetData 
} from './services/sheetService';
import { exportSingleSantriPdf } from './services/pdfService';
import { INITIAL_SANTRI_DATA } from './data/fallbackData';

import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { ChartsSection } from './components/ChartsSection';
import { FiltersBar } from './components/FiltersBar';
import { SantriGridView } from './components/SantriGridView';
import { SantriTableView } from './components/SantriTableView';
import { SantriDetailModal } from './components/SantriDetailModal';
import { SheetConfigModal } from './components/SheetConfigModal';
import { PdfExportModal } from './components/PdfExportModal';
import { TvDisplayView } from './components/TvDisplayView';
import { PrayerTimeWidget } from './components/PrayerTimeWidget';

import { 
  LayoutGrid, 
  Table as TableIcon, 
  BarChart3, 
  Sparkles, 
  CheckCircle,
  AlertCircle,
  Layers,
  BookOpen
} from 'lucide-react';

export default function App() {
  // Main Data States
  const [santriList, setSantriList] = useState<Santri[]>(INITIAL_SANTRI_DATA);
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [activeView, setActiveView] = useState<'grid' | 'table' | 'analytics'>('grid');

  // Spreadsheet Configuration & Live Sync State
  const [config, setConfig] = useState<SpreadsheetConfig>({
    sheetUrl: DEFAULT_SHEET_URL,
    gid: DEFAULT_GID,
    autoRefreshInterval: 30, // Default to 30 seconds auto-sync
    lastUpdated: new Date().toISOString(),
    isSyncing: false,
    syncStatus: 'online',
  });

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    kelas: '',
    statusHafalan: '',
    jenisKelamin: '',
    tahsinRange: [0, 100],
    kehadiranRange: [0, 100],
    juzFilter: '',
    statusDisiplin: '',
    sortBy: 'no',
    sortOrder: 'asc',
  });

  // Modal Visibility States
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isPdfMasterOpen, setIsPdfMasterOpen] = useState(false);
  const [isTvModeOpen, setIsTvModeOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync / Fetch Function
  const loadData = useCallback(async (silent = false) => {
    if (!silent) {
      setConfig((prev) => ({ ...prev, isSyncing: true }));
    }
    try {
      const result = await fetchLiveSpreadsheetData(config.sheetUrl, config.gid);
      setSantriList(result.data);
      setConfig((prev) => ({
        ...prev,
        isSyncing: false,
        lastUpdated: result.timestamp,
        syncStatus: result.source === 'fallback' ? 'error' : result.source === 'cache' ? 'cached' : 'online',
      }));
      if (!silent) {
        showToast(
          `Data berhasil disinkronkan (${result.data.length} santri dari ${result.source === 'live' || result.source === 'proxy' ? 'Google Sheets' : 'Cache'})`,
          'success'
        );
      }
    } catch (err: any) {
      setConfig((prev) => ({
        ...prev,
        isSyncing: false,
        syncStatus: 'cached',
        errorMessage: err.message,
      }));
      if (!silent) {
        showToast('Gagal memuat spreadsheet, menampilkan data tersimpan', 'error');
      }
    }
  }, [config.sheetUrl, config.gid]);

  // Initial Load
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Auto-Refresh Polling Timer
  useEffect(() => {
    if (config.autoRefreshInterval <= 0) return;

    const timer = setInterval(() => {
      loadData(true);
    }, config.autoRefreshInterval * 1000);

    return () => clearInterval(timer);
  }, [config.autoRefreshInterval, loadData]);

  // Available Classes List
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    santriList.forEach((s) => {
      if (s.kelas) set.add(s.kelas);
    });
    return Array.from(set).sort();
  }, [santriList]);

  // Filter & Sort Logic
  const filteredSantri = useMemo(() => {
    let list = [...santriList];

    // Search query filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.nama.toLowerCase().includes(query) ||
          s.nis.toLowerCase().includes(query) ||
          s.surahTerakhir.toLowerCase().includes(query) ||
          s.catatan.toLowerCase().includes(query) ||
          s.kelas.toLowerCase().includes(query)
      );
    }

    // Kelas filter
    if (filters.kelas) {
      list = list.filter((s) => s.kelas === filters.kelas);
    }

    // Status Hafalan filter
    if (filters.statusHafalan) {
      list = list.filter((s) => s.statusHafalan.toLowerCase().includes(filters.statusHafalan.toLowerCase()));
    }

    // Gender filter
    if (filters.jenisKelamin) {
      list = list.filter((s) => s.jenisKelamin === filters.jenisKelamin);
    }

    // Sorting
    list.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'nama':
          comparison = a.nama.localeCompare(b.nama);
          break;
        case 'nilaiTahsin':
          comparison = a.nilaiTahsin - b.nilaiTahsin;
          break;
        case 'jumlahHafalan':
          comparison = a.jumlahHafalan - b.jumlahHafalan;
          break;
        case 'kehadiran':
          comparison = a.kehadiran - b.kehadiran;
          break;
        case 'poinDisiplin':
          comparison = a.poinDisiplin - b.poinDisiplin;
          break;
        case 'no':
        default:
          comparison = a.no - b.no;
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [santriList, filters]);

  // Statistics Calculation
  const stats: DashboardStats = useMemo(() => {
    const total = santriList.length || 1;
    const lk = santriList.filter((s) => s.jenisKelamin === 'Laki-laki').length;
    const pr = santriList.filter((s) => s.jenisKelamin === 'Perempuan').length;

    const totalTahsin = santriList.reduce((acc, s) => acc + s.nilaiTahsin, 0);
    const totalKehadiran = santriList.reduce((acc, s) => acc + s.kehadiran, 0);
    const totalHafalan = santriList.reduce((acc, s) => acc + s.jumlahHafalan, 0);
    const totalDisiplin = santriList.reduce((acc, s) => acc + s.poinDisiplin, 0);

    const sangatBaik = santriList.filter((s) => s.statusHafalan.toLowerCase().includes('sangat')).length;
    const baik = santriList.filter((s) => s.statusHafalan.toLowerCase() === 'baik').length;
    const perluBimbingan = santriList.filter((s) => s.statusHafalan.toLowerCase().includes('bimbingan')).length;

    return {
      totalSantri: santriList.length,
      totalLakiLaki: lk,
      totalPerempuan: pr,
      rataTahsin: Math.round(totalTahsin / total),
      rataKehadiran: Math.round(totalKehadiran / total),
      rataHafalanSurah: Math.round(totalHafalan / total),
      targetTercapaiCount: sangatBaik + baik,
      perluBimbinganCount: perluBimbingan,
      sangatBaikCount: sangatBaik,
      baikCount: baik,
      rataPoinDisiplin: Math.round(totalDisiplin / total),
    };
  }, [santriList]);

  // Handle single santri update (e.g. updating photo link, adding new discipline item)
  const handleUpdateSantri = (updated: Santri) => {
    setSantriList((prev) => prev.map((s) => (s.nis === updated.nis ? updated : s)));
    setSelectedSantri(updated);
    showToast(`Data santri ${updated.nama} berhasil diperbarui`, 'success');
  };

  // Single PDF Export Trigger
  const handleExportSinglePdf = (santri: Santri) => {
    try {
      exportSingleSantriPdf(santri);
      showToast(`Rapor PDF ${santri.nama} berhasil diunduh`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal membuat dokumen PDF', 'error');
    }
  };

  // Handle Save Spreadsheet Config
  const handleSaveSheetConfig = async (newUrl: string, newGid: string) => {
    setConfig((prev) => ({
      ...prev,
      sheetUrl: newUrl,
      gid: newGid,
      isSyncing: true,
    }));
    try {
      const result = await fetchLiveSpreadsheetData(newUrl, newGid);
      setSantriList(result.data);
      setConfig((prev) => ({
        ...prev,
        sheetUrl: newUrl,
        gid: newGid,
        isSyncing: false,
        lastUpdated: result.timestamp,
        syncStatus: 'online',
      }));
      showToast(`Berhasil memuat ${result.data.length} santri dari tautan baru!`, 'success');
    } catch (err: any) {
      setConfig((prev) => ({
        ...prev,
        isSyncing: false,
      }));
      showToast(`Gagal: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-in max-w-sm">
          <div
            className={`p-3.5 rounded-xl shadow-xl border text-xs font-medium flex items-center gap-2.5 ${
              toast.type === 'success'
                ? 'bg-slate-900 text-emerald-300 border-emerald-500/40 shadow-emerald-950/50'
                : toast.type === 'error'
                ? 'bg-slate-900 text-rose-300 border-rose-500/40 shadow-rose-950/50'
                : 'bg-slate-900 text-slate-200 border-slate-700 shadow-slate-950/50'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        config={config}
        totalSantri={santriList.length}
        filteredCount={filteredSantri.length}
        activeView={activeView}
        setActiveView={setActiveView}
        onRefresh={() => loadData(false)}
        onOpenConfig={() => setIsConfigOpen(true)}
        onExportMasterPdf={() => setIsPdfMasterOpen(true)}
        onChangeInterval={(sec) => setConfig((prev) => ({ ...prev, autoRefreshInterval: sec }))}
        onOpenTvMode={() => setIsTvModeOpen(true)}
      />

      {/* Main Page Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Jadwal Sholat Kota Jambi & TV Mode Launcher Banner */}
        <PrayerTimeWidget onOpenTvMode={() => setIsTvModeOpen(true)} />

        {/* KPI Statistics Summary */}
        <StatsCards
          stats={stats}
          activeStatusFilter={filters.statusHafalan}
          onFilterStatus={(status) => setFilters((prev) => ({ ...prev, statusHafalan: status }))}
        />

        {/* Analytic Charts Section (Always available or prominent on analytics view) */}
        {activeView === 'analytics' ? (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif text-slate-100">
                  Visualisasi & Analisis Data Santri
                </h2>
                <p className="text-xs text-slate-400">Grafik interaktif distribusi hafalan, tahsin, dan kehadiran</p>
              </div>
            </div>
            <ChartsSection
              santriList={filteredSantri}
              onSelectClass={(cls) => setFilters((prev) => ({ ...prev, kelas: prev.kelas === cls ? '' : cls }))}
              onSelectStatus={(st) => setFilters((prev) => ({ ...prev, statusHafalan: prev.statusHafalan === st ? '' : st }))}
            />
          </div>
        ) : null}

        {/* Filters & Search Toolbar */}
        <FiltersBar
          filters={filters}
          onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
          onReset={() =>
            setFilters({
              searchQuery: '',
              kelas: '',
              statusHafalan: '',
              jenisKelamin: '',
              tahsinRange: [0, 100],
              kehadiranRange: [0, 100],
              juzFilter: '',
              statusDisiplin: '',
              sortBy: 'no',
              sortOrder: 'asc',
            })
          }
          availableClasses={availableClasses}
          totalResults={filteredSantri.length}
        />

        {/* Main Content Renderers based on View */}
        {activeView === 'grid' && (
          <SantriGridView
            santriList={filteredSantri}
            onSelectSantri={(santri) => setSelectedSantri(santri)}
            onExportPdf={handleExportSinglePdf}
          />
        )}

        {activeView === 'table' && (
          <SantriTableView
            santriList={filteredSantri}
            onSelectSantri={(santri) => setSelectedSantri(santri)}
            onExportPdf={handleExportSinglePdf}
          />
        )}

        {activeView === 'analytics' && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-serif">
                Daftar Santri Terfilter ({filteredSantri.length} Santri)
              </h3>
            </div>
            <SantriGridView
              santriList={filteredSantri}
              onSelectSantri={(santri) => setSelectedSantri(santri)}
              onExportPdf={handleExportSinglePdf}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#1e293b]/80 border-t border-slate-800/80 py-5 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Dashboard Monitoring Real-Time • Ma'had Tahfidzul Qur'an</span>
          </div>
          <div>
            Data otomatis tersinkronisasi dengan{' '}
            <a
              href={config.sheetUrl}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 font-semibold hover:underline"
            >
              Google Spreadsheet ID: {config.gid}
            </a>
          </div>
        </div>
      </footer>

      {/* Detail Modal for Selected Santri */}
      <SantriDetailModal
        santri={selectedSantri}
        onClose={() => setSelectedSantri(null)}
        onExportPdf={handleExportSinglePdf}
        onUpdateSantri={handleUpdateSantri}
      />

      {/* Sheet Configuration Modal */}
      <SheetConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentUrl={config.sheetUrl}
        currentGid={config.gid}
        onSave={handleSaveSheetConfig}
      />

      {/* Master PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfMasterOpen}
        onClose={() => setIsPdfMasterOpen(false)}
        allSantri={santriList}
        filteredSantri={filteredSantri}
        currentClassFilter={filters.kelas}
      />

      {/* TV Display View (Digital Signage / Kiosk Fullscreen Mode) */}
      {isTvModeOpen && (
        <TvDisplayView
          santriList={santriList}
          onClose={() => setIsTvModeOpen(false)}
          onSelectSantri={(santri) => {
            setSelectedSantri(santri);
            setIsTvModeOpen(false);
          }}
          sheetLastUpdated={config.lastUpdated}
        />
      )}

    </div>
  );
}
