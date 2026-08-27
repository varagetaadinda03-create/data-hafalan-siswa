import React from 'react';
import { 
  Search, 
  Filter, 
  X, 
  ArrowUpDown, 
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';
import { FilterState } from '../types';

interface FiltersBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  availableClasses: string[];
  totalResults: number;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  availableClasses,
  totalResults,
}) => {
  const hasActiveFilters = 
    filters.searchQuery !== '' ||
    filters.kelas !== '' ||
    filters.statusHafalan !== '' ||
    filters.jenisKelamin !== '' ||
    filters.tahsinRange[0] > 0 ||
    filters.kehadiranRange[0] > 0 ||
    filters.statusDisiplin !== '';

  return (
    <div className="bg-[#1e293b] rounded-xl border border-slate-800 p-4 mb-6 shadow-sm">
      
      {/* Top Search & Primary Filters Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 justify-between">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-santri"
            type="text"
            placeholder="Cari nama santri, NIS, surah terakhir..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-8 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:bg-slate-900 focus:outline-emerald-500 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Dropdown Filters */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Kelas Dropdown */}
          <select
            id="filter-kelas"
            value={filters.kelas}
            onChange={(e) => onFilterChange({ kelas: e.target.value })}
            className="bg-slate-900/90 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 font-medium focus:bg-slate-900 focus:outline-emerald-500"
          >
            <option value="">Semua Kelas</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>Kelas {cls}</option>
            ))}
          </select>

          {/* Status Hafalan Dropdown */}
          <select
            id="filter-status-hafalan"
            value={filters.statusHafalan}
            onChange={(e) => onFilterChange({ statusHafalan: e.target.value })}
            className="bg-slate-900/90 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 font-medium focus:bg-slate-900 focus:outline-emerald-500"
          >
            <option value="">Semua Status</option>
            <option value="Sangat Baik">Sangat Baik</option>
            <option value="Baik">Baik</option>
            <option value="Perlu Bimbingan">Perlu Bimbingan</option>
          </select>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700 rounded-lg px-2 py-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="sort-by-select"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none pr-1"
            >
              <option value="no">No Urut</option>
              <option value="nama">Nama (A-Z)</option>
              <option value="nilaiTahsin">Tahsin Tertinggi</option>
              <option value="jumlahHafalan">Hafalan Terbanyak</option>
              <option value="kehadiran">Kehadiran Tertinggi</option>
              <option value="poinDisiplin">Poin Disiplin</option>
            </select>
            <button
              onClick={() => onFilterChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
              className="px-1.5 py-0.5 text-[11px] font-bold text-slate-300 hover:text-emerald-400 rounded bg-slate-800"
              title={filters.sortOrder === 'asc' ? 'Menaik (A-Z / Rendah ke Tinggi)' : 'Menurun (Z-A / Tinggi ke Rendah)'}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              id="btn-reset-filters"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
              title="Reset semua filter"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

        </div>
      </div>

      {/* Class Pills & Secondary Tags */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center flex-wrap gap-1.5 justify-between">
        
        {/* Class Pills */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 mr-1">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            Kelas:
          </span>
          <button
            onClick={() => onFilterChange({ kelas: '' })}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              filters.kelas === ''
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            Semua
          </button>
          {availableClasses.map((cls) => (
            <button
              key={cls}
              onClick={() => onFilterChange({ kelas: filters.kelas === cls ? '' : cls })}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                filters.kelas === cls
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        {/* Results Counter */}
        <div className="text-xs text-slate-400 font-semibold ml-auto">
          Ditemukan <strong className="text-emerald-400 font-bold">{totalResults}</strong> santri
        </div>

      </div>

    </div>
  );
};
