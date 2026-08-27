import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { Santri } from '../types';
import { PieChart as PieIcon, BarChart2, TrendingUp, Layers } from 'lucide-react';

interface ChartsSectionProps {
  santriList: Santri[];
  onSelectClass?: (kelas: string) => void;
  onSelectStatus?: (status: string) => void;
}

const COLORS = {
  emerald: '#059669',
  teal: '#0d9488',
  amber: '#d97706',
  blue: '#2563eb',
  indigo: '#4f46e5',
  rose: '#e11d48',
};

const STATUS_COLORS: Record<string, string> = {
  'Sangat Baik': '#059669',
  'Baik': '#0284c7',
  'Perlu Bimbingan': '#d97706',
};

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  santriList,
  onSelectClass,
  onSelectStatus,
}) => {
  // 1. Status Hafalan Data
  const statusHafalanData = useMemo(() => {
    const counts: Record<string, number> = {
      'Sangat Baik': 0,
      'Baik': 0,
      'Perlu Bimbingan': 0,
    };

    santriList.forEach((s) => {
      if (s.statusHafalan.toLowerCase().includes('sangat')) counts['Sangat Baik']++;
      else if (s.statusHafalan.toLowerCase().includes('bimbingan')) counts['Perlu Bimbingan']++;
      else counts['Baik']++;
    });

    return [
      { name: 'Sangat Baik', value: counts['Sangat Baik'], color: STATUS_COLORS['Sangat Baik'] },
      { name: 'Baik', value: counts['Baik'], color: STATUS_COLORS['Baik'] },
      { name: 'Perlu Bimbingan', value: counts['Perlu Bimbingan'], color: STATUS_COLORS['Perlu Bimbingan'] },
    ];
  }, [santriList]);

  // 2. Class Comparison Data (Tahsin vs Kehadiran)
  const classComparisonData = useMemo(() => {
    const classMap: Record<
      string,
      { totalTahsin: number; totalKehadiran: number; totalHafalan: number; count: number }
    > = {};

    santriList.forEach((s) => {
      const cls = s.kelas || 'Lainnya';
      if (!classMap[cls]) {
        classMap[cls] = { totalTahsin: 0, totalKehadiran: 0, totalHafalan: 0, count: 0 };
      }
      classMap[cls].totalTahsin += s.nilaiTahsin;
      classMap[cls].totalKehadiran += s.kehadiran;
      classMap[cls].totalHafalan += s.jumlahHafalan;
      classMap[cls].count += 1;
    });

    const orderedClasses = ['VII A', 'VII B', 'VIII A', 'VIII B', 'IX A', 'IX B'];
    const result = Object.keys(classMap)
      .sort((a, b) => {
        const idxA = orderedClasses.indexOf(a);
        const idxB = orderedClasses.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        return a.localeCompare(b);
      })
      .map((cls) => {
        const item = classMap[cls];
        return {
          kelas: cls,
          santriCount: item.count,
          rataTahsin: Math.round(item.totalTahsin / item.count),
          rataKehadiran: Math.round(item.totalKehadiran / item.count),
          rataHafalan: Math.round(item.totalHafalan / item.count),
        };
      });

    return result;
  }, [santriList]);

  // 3. Hafalan Surah Range Distribution
  const hafalanDistributionData = useMemo(() => {
    const ranges = [
      { range: '1-20 Surah', min: 1, max: 20, count: 0 },
      { range: '21-40 Surah', min: 21, max: 40, count: 0 },
      { range: '41-60 Surah', min: 41, max: 60, count: 0 },
      { range: '61-80 Surah', min: 61, max: 80, count: 0 },
      { range: '> 80 Surah', min: 81, max: 114, count: 0 },
    ];

    santriList.forEach((s) => {
      const h = s.jumlahHafalan;
      const found = ranges.find((r) => h >= r.min && h <= r.max);
      if (found) found.count++;
      else if (h > 80) ranges[4].count++;
    });

    return ranges;
  }, [santriList]);

  // 4. Juz Distribution
  const juzDistributionData = useMemo(() => {
    const juzMap: Record<number, number> = {};
    santriList.forEach((s) => {
      juzMap[s.juz] = (juzMap[s.juz] || 0) + 1;
    });

    return Object.entries(juzMap)
      .map(([juz, count]) => ({
        juz: `Juz ${juz}`,
        count,
        rawJuz: parseInt(juz),
      }))
      .sort((a, b) => b.count - a.count);
  }, [santriList]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* Chart 1: Donut Status Hafalan */}
      <div className="bg-[#1e293b] rounded-xl border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-serif">Distribusi Status Hafalan</h3>
              <p className="text-xs text-slate-400">Evaluasi kelancaran & target tasmi' santri</p>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full">
            {santriList.length} Santri
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusHafalanData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                onClick={(entry) => onSelectStatus && onSelectStatus(entry.name)}
                cursor="pointer"
              >
                {statusHafalanData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [`${value} Santri (${Math.round((value / (santriList.length || 1)) * 100)}%)`, name]}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Komparasi Nilai Tahsin & Kehadiran per Kelas */}
      <div className="bg-[#1e293b] rounded-xl border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-serif">Performa Rata-rata per Kelas</h3>
              <p className="text-xs text-slate-400">Perbandingan Nilai Tahsin & Kehadiran (%)</p>
            </div>
          </div>
          <span className="text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
            {classComparisonData.length} Kelas
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={classComparisonData} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(state: any) => {
                if (state && state.activePayload && state.activePayload.length > 0) {
                  const clickedClass = state.activePayload[0].payload.kelas;
                  if (onSelectClass) onSelectClass(clickedClass);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="kelas" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(val: any, name: any) => [
                  name === 'rataTahsin' ? `${val} / 100` : `${val}%`,
                  name === 'rataTahsin' ? 'Rata-rata Tahsin' : 'Rata-rata Kehadiran'
                ]}
              />
              <Legend 
                formatter={(value) => (
                  <span className="text-xs text-slate-300 font-medium">
                    {value === 'rataTahsin' ? 'Nilai Tahsin' : 'Kehadiran (%)'}
                  </span>
                )}
              />
              <Bar dataKey="rataTahsin" fill="#10b981" radius={[4, 4, 0, 0]} name="rataTahsin" cursor="pointer" />
              <Bar dataKey="rataKehadiran" fill="#38bdf8" radius={[4, 4, 0, 0]} name="rataKehadiran" cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Distribusi Hafalan Surah */}
      <div className="bg-[#1e293b] rounded-xl border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-serif">Sebaran Jumlah Hafalan Surah</h3>
              <p className="text-xs text-slate-400">Distribusi rentang total surah yang disetorkan</p>
            </div>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hafalanDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHafalan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(val: any) => [`${val} Santri`, 'Jumlah']}
              />
              <Area type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHafalan)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Sebaran Santri per Target Juz */}
      <div className="bg-[#1e293b] rounded-xl border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-serif">Sebaran Posisi Juz Santri</h3>
              <p className="text-xs text-slate-400">Konsentrasi juz hafalan yang sedang ditempuh</p>
            </div>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={juzDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="juz" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(val: any) => [`${val} Santri`, 'Total Santri']}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
