import React from 'react';
import { 
  Users, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck, 
  BookMarked 
} from 'lucide-react';
import { DashboardStats } from '../types';

interface StatsCardsProps {
  stats: DashboardStats;
  onFilterStatus?: (status: string) => void;
  activeStatusFilter?: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ 
  stats, 
  onFilterStatus,
  activeStatusFilter 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      
      {/* Card 1: Total Santri */}
      <div 
        id="card-stat-total"
        className="bg-[#1e293b] rounded-xl border border-slate-800 p-4.5 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Total Santri</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1 font-serif">{stats.totalSantri}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-emerald-400">Ikhwan: {stats.totalLakiLaki}</span>
          <span className="text-slate-600">•</span>
          <span className="font-medium text-teal-400">Akhwat: {stats.totalPerempuan}</span>
        </div>
      </div>

      {/* Card 2: Rata-rata Tahsin */}
      <div 
        id="card-stat-tahsin"
        className="bg-[#1e293b] rounded-xl border border-slate-800 p-4.5 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Rata-rata Tahsin</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold text-slate-100 font-serif">{stats.rataTahsin}</h3>
              <span className="text-xs text-slate-500 font-medium">/ 100</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">
            Predikat: <strong className="text-blue-400 font-bold">{stats.rataTahsin >= 85 ? 'Jayyid Jiddan' : 'Jayyid'}</strong>
          </span>
          <span className="inline-flex items-center text-blue-400 text-[11px] font-semibold">
            Target &gt; 80
          </span>
        </div>
      </div>

      {/* Card 3: Kehadiran Halaqah */}
      <div 
        id="card-stat-kehadiran"
        className="bg-[#1e293b] rounded-xl border border-slate-800 p-4.5 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Presensi Kehadiran</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <h3 className="text-2xl font-bold text-slate-100 font-serif">{stats.rataKehadiran}%</h3>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-teal-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, stats.rataKehadiran)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
            <span>Tingkat Disiplin</span>
            <span className="font-semibold text-teal-400">Tinggi</span>
          </div>
        </div>
      </div>

      {/* Card 4: Capaian & Status Hafalan */}
      <div 
        id="card-stat-hafalan"
        className="bg-[#1e293b] rounded-xl border border-slate-800 p-4.5 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Status Hafalan</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold text-emerald-400 font-serif">
                {stats.sangatBaikCount + stats.baikCount}
              </h3>
              <span className="text-xs text-slate-400 font-medium">Tercapai Target</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <BookMarked className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => onFilterStatus && onFilterStatus(activeStatusFilter === 'Sangat Baik' ? '' : 'Sangat Baik')}
            className={`font-semibold transition-colors ${activeStatusFilter === 'Sangat Baik' ? 'text-emerald-300 underline' : 'text-emerald-400 hover:text-emerald-300'}`}
          >
            Sgt Baik: {stats.sangatBaikCount}
          </button>
          <span className="text-slate-600">•</span>
          <button
            onClick={() => onFilterStatus && onFilterStatus(activeStatusFilter === 'Perlu Bimbingan' ? '' : 'Perlu Bimbingan')}
            className={`font-semibold transition-colors ${activeStatusFilter === 'Perlu Bimbingan' ? 'text-amber-300 underline' : 'text-amber-400 hover:text-amber-300'}`}
          >
            Bimbingan: {stats.perluBimbinganCount}
          </button>
        </div>
      </div>

      {/* Card 5: Kedisiplinan & Akhlak */}
      <div 
        id="card-stat-disiplin"
        className="bg-[#1e293b] rounded-xl border border-slate-800 p-4.5 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Indeks Kedisiplinan</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold text-slate-100 font-serif">{stats.rataPoinDisiplin}</h3>
              <span className="text-xs text-slate-500 font-medium">Poin / 100</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-400">Kategori Utama</span>
          <span className="font-semibold text-indigo-400">Tertib & Teladan</span>
        </div>
      </div>

    </div>
  );
};
