import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Bell, 
  Volume2, 
  VolumeX, 
  Tv, 
  Sparkles, 
  Play, 
  MapPin 
} from 'lucide-react';
import { calculateJambiPrayerTimes, PrayerScheduleData, PrayerTime } from '../services/prayerTimeService';
import { adzanAudioService } from '../services/audioService';

interface PrayerTimeWidgetProps {
  onOpenTvMode: () => void;
}

export const PrayerTimeWidget: React.FC<PrayerTimeWidgetProps> = ({ onOpenTvMode }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerData, setPrayerData] = useState<PrayerScheduleData>(() => calculateJambiPrayerTimes(new Date()));
  const [isAudioMuted, setIsAudioMuted] = useState(adzanAudioService.getIsMuted());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setPrayerData(calculateJambiPrayerTimes(now));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSound = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    adzanAudioService.setMuted(next);
    if (!next) {
      adzanAudioService.unlockAudio();
    }
  };

  const handleTestSound = () => {
    adzanAudioService.unlockAudio();
    adzanAudioService.play();
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/40 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Left: Jambi Location & Real-time Clock */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-md">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Jadwal Sholat Kota Jambi (WIB)
              </span>
              <span className="text-[10.5px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {prayerData.nextPrayer ? (
                <span>
                  Menuju <strong className="text-white font-semibold">{prayerData.nextPrayer.name}</strong> ({prayerData.nextPrayer.time} WIB) dalam <strong className="text-emerald-400 font-mono font-bold">{prayerData.countdownText}</strong>
                </span>
              ) : (
                <span>Waktu Sholat Aktif</span>
              )}
            </p>
          </div>
        </div>

        {/* Center: Prayer Schedule Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 lg:pb-0 scrollbar-thin">
          {prayerData.prayers
            .filter((p) => p.name !== 'Imsak' && p.name !== 'Terbit')
            .map((p) => {
              const isNext = p.isNext;
              return (
                <div
                  key={p.name}
                  className={`px-2.5 py-1.5 rounded-xl text-xs border flex items-center gap-2 whitespace-nowrap transition-all ${
                    isNext
                      ? 'bg-emerald-950/90 border-emerald-500 text-white font-bold shadow-md ring-1 ring-emerald-500/40 scale-105'
                      : p.isPassed
                      ? 'bg-slate-950/60 border-slate-800/80 text-slate-500'
                      : 'bg-slate-950/90 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className={isNext ? 'text-emerald-300' : ''}>{p.name}</span>
                  <span className={`font-mono ${isNext ? 'text-emerald-400 font-black' : 'text-slate-400'}`}>
                    {p.time}
                  </span>
                </div>
              );
            })}
        </div>

        {/* Right: Audio Control & TV Mode Action */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
          
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              !isAudioMuted
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
            title={isAudioMuted ? 'Aktifkan Suara Adzan' : 'Suara Adzan Aktif'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAudioMuted ? 'Adzan Bisu' : 'Adzan Aktif'}</span>
          </button>

          {/* Test Sound */}
          <button
            onClick={handleTestSound}
            className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-900 transition-colors"
            title="Tes Audio Adzan"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* Big TV Mode Launcher Button */}
          <button
            onClick={onOpenTvMode}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-950/40 transition-all active:scale-95 cursor-pointer ml-1"
          >
            <Tv className="w-4 h-4" />
            <span>Mode TV (Auto 10s)</span>
          </button>

        </div>

      </div>
    </div>
  );
};
