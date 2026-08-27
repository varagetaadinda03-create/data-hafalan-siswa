import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  X, 
  Sparkles, 
  BookOpen, 
  Award, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Bell, 
  Tv, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Building,
  UserCheck
} from 'lucide-react';
import { Santri } from '../types';
import { calculateJambiPrayerTimes, PrayerScheduleData, PrayerTime } from '../services/prayerTimeService';
import { adzanAudioService } from '../services/audioService';
import { getAvatarUrl } from '../services/sheetService';

interface TvDisplayViewProps {
  santriList: Santri[];
  onClose: () => void;
  onSelectSantri?: (santri: Santri) => void;
  sheetLastUpdated?: string | null;
}

const ROTATION_INTERVAL_OPTIONS = [
  { label: '5 Detik', value: 5 },
  { label: '10 Detik (Standar)', value: 10 },
  { label: '15 Detik', value: 15 },
  { label: '20 Detik', value: 20 },
  { label: '30 Detik', value: 30 },
];

export const TvDisplayView: React.FC<TvDisplayViewProps> = ({
  santriList,
  onClose,
  onSelectSantri,
  sheetLastUpdated,
}) => {
  // Navigation & Rotation state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [intervalSeconds, setIntervalSeconds] = useState(10);
  const [timerProgress, setTimerProgress] = useState(0);
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Prayer Time & Clock state for Kota Jambi
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [prayerData, setPrayerData] = useState<PrayerScheduleData>(() => calculateJambiPrayerTimes(new Date()));

  // Audio Adzan state
  const [isAudioMuted, setIsAudioMuted] = useState(adzanAudioService.getIsMuted());
  const [isPlayingAdzan, setIsPlayingAdzan] = useState(false);
  const [showAdzanModal, setShowAdzanModal] = useState(false);
  const [activeAdzanPrayer, setActiveAdzanPrayer] = useState<PrayerTime | null>(null);
  const [hasUnlockedAudio, setHasUnlockedAudio] = useState(false);

  // Track prayer times that have already triggered adzan today to prevent repeat triggers
  const triggeredPrayersRef = useRef<Set<string>>(new Set());

  // Filtered santri list for TV mode
  const filteredList = useMemo(() => {
    if (selectedClassFilter === 'ALL') return santriList;
    return santriList.filter((s) => s.kelas === selectedClassFilter);
  }, [santriList, selectedClassFilter]);

  const activeSantri = filteredList[currentIndex] || santriList[0];

  // Distinct class list for filtering
  const classOptions = useMemo(() => {
    const set = new Set(santriList.map((s) => s.kelas).filter(Boolean));
    return ['ALL', ...Array.from(set).sort()];
  }, [santriList]);

  // Update clock & prayer times every second
  useEffect(() => {
    const clockTimer = setInterval(() => {
      const now = new Date();
      setCurrentDate(now);
      const computed = calculateJambiPrayerTimes(now);
      setPrayerData(computed);

      // Check if current time matches any prayer time for Jambi (exact minute)
      const currentHoursMins = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayKey = `${now.toDateString()}_${currentHoursMins}`;

      computed.prayers.forEach((prayer) => {
        // Trigger for Subuh, Dzuhur, Ashar, Maghrib, Isya
        if (
          ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'].includes(prayer.name) &&
          prayer.time === currentHoursMins &&
          !triggeredPrayersRef.current.has(`${todayKey}_${prayer.name}`)
        ) {
          triggeredPrayersRef.current.add(`${todayKey}_${prayer.name}`);
          triggerAdzan(prayer);
        }
      });
    }, 1000);

    return () => clearInterval(clockTimer);
  }, []);

  // Listen to audio service state
  useEffect(() => {
    const unsubscribe = adzanAudioService.subscribe((playing) => {
      setIsPlayingAdzan(playing);
    });
    return () => unsubscribe();
  }, []);

  // 10-Second Auto-rotation Timer with smooth visual progress
  useEffect(() => {
    if (isPaused || filteredList.length <= 1) {
      setTimerProgress(0);
      return;
    }

    const stepMs = 100;
    const totalSteps = (intervalSeconds * 1000) / stepMs;
    let stepCount = 0;

    const rotationInterval = setInterval(() => {
      stepCount++;
      setTimerProgress((stepCount / totalSteps) * 100);

      if (stepCount >= totalSteps) {
        stepCount = 0;
        setTimerProgress(0);
        setCurrentIndex((prev) => (prev + 1) % filteredList.length);
      }
    }, stepMs);

    return () => clearInterval(rotationInterval);
  }, [isPaused, intervalSeconds, filteredList.length, currentIndex]);

  // Adjust index when filteredList changes
  useEffect(() => {
    if (currentIndex >= filteredList.length) {
      setCurrentIndex(0);
    }
  }, [filteredList.length, currentIndex]);

  // Trigger Adzan function
  const triggerAdzan = (prayer: PrayerTime) => {
    setActiveAdzanPrayer(prayer);
    setShowAdzanModal(true);
    if (!isAudioMuted) {
      adzanAudioService.play();
    }
  };

  const handleTestAdzan = () => {
    adzanAudioService.unlockAudio();
    setHasUnlockedAudio(true);
    const fakePrayer: PrayerTime = {
      name: prayerData.nextPrayer?.name || 'Maghrib',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(),
      isPassed: false,
      isNext: true,
      arabicName: prayerData.nextPrayer?.arabicName || 'المغرب',
    };
    triggerAdzan(fakePrayer);
  };

  const handleToggleMute = () => {
    const nextState = !isAudioMuted;
    setIsAudioMuted(nextState);
    adzanAudioService.setMuted(nextState);
    if (!nextState && !hasUnlockedAudio) {
      adzanAudioService.unlockAudio();
      setHasUnlockedAudio(true);
    }
  };

  const handleDismissAdzan = () => {
    adzanAudioService.stop();
    setShowAdzanModal(false);
    setActiveAdzanPrayer(null);
  };

  // Fullscreen handlers
  const handleToggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        if (containerRef.current) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (err) {
        console.warn('Fullscreen error:', err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handlePrev = () => {
    setTimerProgress(0);
    setCurrentIndex((prev) => (prev === 0 ? filteredList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setTimerProgress(0);
    setCurrentIndex((prev) => (prev + 1) % filteredList.length);
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Sangat Baik':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-950/50">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sangat Baik</span>
          </span>
        );
      case 'Baik':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
            <Check className="w-3.5 h-3.5" />
            <span>Baik</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Flame className="w-3.5 h-3.5" />
            <span>Perlu Bimbingan</span>
          </span>
        );
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#0a0f1d] text-slate-100 flex flex-col justify-between overflow-hidden select-none font-sans"
    >
      {/* Background ambient Islamic geometry glow */}
      <div className="absolute inset-0 bg-radial from-emerald-950/20 via-[#0a0f1d] to-[#060913] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER BAR (TV SIGNAGE HEADER) */}
      <header className="relative z-20 bg-slate-900/90 border-b border-slate-800/90 px-5 sm:px-8 py-3.5 backdrop-blur-md flex items-center justify-between shadow-xl">
        
        {/* Left: Brand & Ma'had Identity */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-500/30">
            <BookOpen className="w-6 h-6 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Tv className="w-3 h-3 animate-pulse" />
                <span>DISPLAY TV LIVE</span>
              </span>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-serif">
                Ma'had Tahfidzul Qur'an
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Monitoring Hafalan & Akhlak Santri Real-Time</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold">{filteredList.length} Santri Aktif</span>
            </p>
          </div>
        </div>

        {/* Center: Realtime City & Adzan Status Badge */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-medium">Kota Jambi (WIB)</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {prayerData.nextPrayer ? (
              <span>
                <strong className="text-emerald-400 font-bold">{prayerData.countdownText}</strong> menuju <strong className="text-white">{prayerData.nextPrayer.name}</strong> ({prayerData.nextPrayer.time})
              </span>
            ) : (
              <span>Waktu Sholat Aktif</span>
            )}
          </div>
        </div>

        {/* Right: Clock & Top Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Digital Clock Large */}
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-emerald-400 drop-shadow-sm">
              {currentDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-end gap-1.5">
              <span>{prayerData.dateStr}</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-300/90 font-serif">{prayerData.hijriDate}</span>
            </div>
          </div>

          {/* Quick Sound & TV Action Buttons */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-800">
            
            {/* Audio Toggle */}
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl border transition-all ${
                !isAudioMuted 
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400 shadow-sm' 
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={isAudioMuted ? 'Suara Adzan Senyap (Klik untuk aktifkan)' : 'Suara Adzan Aktif'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-bounce" />}
            </button>

            {/* Test Adzan Button */}
            <button
              onClick={handleTestAdzan}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
              title="Putar uji coba suara adzan Kota Jambi"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Uji Adzan</span>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              title="Layar Penuh TV"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Exit TV Mode Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 transition-colors ml-1"
              title="Keluar dari Tampilan TV"
            >
              <X className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      {/* 10-SECOND ROTATION TIMER PROGRESS BAR */}
      <div className="w-full bg-slate-950 h-1.5 relative overflow-hidden z-20">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-100 ease-linear shadow-sm"
          style={{ width: `${timerProgress}%` }}
        />
      </div>

      {/* MAIN SHOWCASE CONTENT (HERO ROTATING SANTRI + JADWAL SHOLAT & STATS) */}
      <main className="relative z-10 flex-1 p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 overflow-y-auto lg:overflow-hidden items-stretch">
        
        {/* LEFT/MAIN COLUMN: ACTIVE ROTATING SANTRI HERO SHOWCASE */}
        <div className="flex-1 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {activeSantri && (
              <motion.div
                key={activeSantri.nis}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex-1 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Background watermarked juz icon */}
                <div className="absolute right-6 -bottom-10 opacity-5 pointer-events-none">
                  <BookOpen className="w-96 h-96 text-emerald-300" />
                </div>

                {/* Top Section: Photo & Identity */}
                <div>
                  
                  {/* Category / Position Tag */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-800/80 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-bold">
                        NIS: {activeSantri.nis}
                      </span>
                      <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                        Kelas {activeSantri.kelas}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium">
                        {activeSantri.jenisKelamin}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(activeSantri.statusHafalan)}
                      <span className="text-xs text-slate-400 font-mono">
                        Santri #{activeSantri.no} dari {filteredList.length}
                      </span>
                    </div>
                  </div>

                  {/* Profile Center Layout */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 lg:gap-8">
                    
                    {/* Large Spotlight Photo */}
                    <div className="relative shrink-0">
                      <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden ring-4 ring-emerald-500/40 shadow-2xl shadow-emerald-950/80 bg-slate-950">
                        <img
                          src={activeSantri.fotoUrl}
                          alt={activeSantri.nama}
                          onError={(e) => {
                            e.currentTarget.src = getAvatarUrl(activeSantri.nama, activeSantri.no);
                          }}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Floating Badge */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1 rounded-full text-xs font-bold bg-slate-950 border border-emerald-500/50 text-emerald-300 shadow-xl flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Juz {activeSantri.juz}</span>
                      </div>
                    </div>

                    {/* Name & Academic Highlights */}
                    <div className="flex-1 text-center sm:text-left space-y-4">
                      <div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif text-white tracking-tight">
                          {activeSantri.nama}
                        </h2>
                        <p className="text-sm sm:text-base text-emerald-400 font-medium mt-1 flex items-center justify-center sm:justify-start gap-2">
                          <span>Surah Terakhir: <strong className="text-white font-bold">{activeSantri.surahTerakhir}</strong></span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-300">{activeSantri.jumlahHafalan} Surah Terhafal</span>
                        </p>
                      </div>

                      {/* 3 Metric Badges */}
                      <div className="grid grid-cols-3 gap-3 max-w-xl">
                        
                        {/* Nilai Tahsin */}
                        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center sm:text-left">
                          <div className="text-[11px] text-slate-400 font-medium">Nilai Tahsin</div>
                          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
                            {activeSantri.nilaiTahsin}
                            <span className="text-xs text-slate-500 font-normal ml-0.5">/100</span>
                          </div>
                        </div>

                        {/* Kehadiran */}
                        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center sm:text-left">
                          <div className="text-[11px] text-slate-400 font-medium">Kehadiran Halaqah</div>
                          <div className="text-xl sm:text-2xl font-black text-blue-400 mt-0.5">
                            {activeSantri.kehadiran}%
                          </div>
                        </div>

                        {/* Poin Disiplin */}
                        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center sm:text-left">
                          <div className="text-[11px] text-slate-400 font-medium">Kedisiplinan</div>
                          <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
                            {activeSantri.poinDisiplin}
                            <span className="text-xs text-slate-500 font-normal ml-0.5">pts</span>
                          </div>
                        </div>

                      </div>

                      {/* Musyrif Note Box */}
                      <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-200">Catatan Musyrif Pembina: </span>
                          <span className="text-slate-300 italic">"{activeSantri.catatan}"</span>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

                {/* Bottom Section: 30 Juz Map & Pembina Details */}
                <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-4">
                  
                  {/* 30 Juz Mini Grid */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                        Peta Progres 30 Juz Al-Qur'an
                      </span>
                      <span className="font-mono text-emerald-400">Juz {activeSantri.juz} Sedang Berjalan</span>
                    </div>

                    <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
                        const isCurrent = juzNum === activeSantri.juz;
                        const isDone = juzNum > activeSantri.juz; // Typical reversed sequence (Juz 30 -> 1)
                        
                        return (
                          <div
                            key={juzNum}
                            className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                              isCurrent
                                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 animate-pulse font-black scale-105'
                                : isDone
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-950 text-slate-500 border border-slate-800'
                            }`}
                            title={`Juz ${juzNum}`}
                          >
                            {juzNum}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Wali Kelas, Asrama & Target Info */}
                  <div className="flex items-center justify-between flex-wrap gap-3 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>Wali: <strong className="text-slate-200">{activeSantri.waliKelas || "Ust. Pembina Halaqah"}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-teal-400" />
                      <span>Asrama: <strong className="text-slate-200">{activeSantri.kamarAsrama || "Gedung Asrama Santri"}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Target: <strong className="text-amber-300">{activeSantri.targetJuzBerikutnya || "Penyelesaian Juz"}</strong></span>
                    </div>
                  </div>

                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: JADWAL SHOLAT KOTA JAMBI & UP-NEXT QUEUE */}
        <div className="w-full lg:w-96 flex flex-col gap-5 shrink-0">
          
          {/* JADWAL SHOLAT KOTA JAMBI REAL-TIME CARD */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-serif">Jadwal Sholat Kota Jambi</h3>
                  <p className="text-[11px] text-slate-400">WIB (UTC+7) • Standar Kemenag RI</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                WIB
              </span>
            </div>

            {/* Prayer Times Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {prayerData.prayers.map((prayer) => {
                const isNext = prayer.isNext;
                return (
                  <div
                    key={prayer.name}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      isNext
                        ? 'bg-gradient-to-r from-emerald-950 to-teal-950 border-emerald-500/80 text-white shadow-lg ring-1 ring-emerald-500/50 scale-[1.02]'
                        : prayer.isPassed
                        ? 'bg-slate-950/50 border-slate-800/60 text-slate-500'
                        : 'bg-slate-950/90 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${isNext ? 'text-emerald-300 font-extrabold' : ''}`}>
                          {prayer.name}
                        </span>
                        {isNext && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-serif">{prayer.arabicName}</div>
                    </div>
                    <div className={`text-sm font-mono font-black ${isNext ? 'text-emerald-400 text-base' : 'text-slate-200'}`}>
                      {prayer.time}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Countdown Banner */}
            {prayerData.nextPrayer && (
              <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-slate-950 to-emerald-950/60 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span className="text-slate-300">Menuju <strong className="text-white">{prayerData.nextPrayer.name}</strong></span>
                </div>
                <div className="text-base font-black font-mono text-emerald-400">
                  {prayerData.countdownText}
                </div>
              </div>
            )}

          </div>

          {/* UP-NEXT SANTRI ROTATION QUEUE */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 shadow-2xl backdrop-blur-md flex-1 flex flex-col justify-between">
            
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800 text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Antrean Santri Berikutnya (Rotasi 10s)
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{currentIndex + 1}/{filteredList.length}</span>
              </div>

              {/* Next 4 Santri preview */}
              <div className="space-y-2">
                {[1, 2, 3, 4].map((offset) => {
                  const targetIdx = (currentIndex + offset) % filteredList.length;
                  const item = filteredList[targetIdx];
                  if (!item) return null;

                  return (
                    <button
                      key={`${item.nis}-${offset}`}
                      onClick={() => {
                        setTimerProgress(0);
                        setCurrentIndex(targetIdx);
                      }}
                      className="w-full p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800/80 flex items-center gap-3 transition-colors text-left group"
                    >
                      <img
                        src={item.fotoUrl}
                        alt={item.nama}
                        onError={(e) => {
                          e.currentTarget.src = getAvatarUrl(item.nama, item.no);
                        }}
                        className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                          {item.nama}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>Kelas {item.kelas}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-semibold">Juz {item.juz}</span>
                          <span>•</span>
                          <span>{item.surahTerakhir}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        +{offset * intervalSeconds}s
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Class Filter Selector inside TV view */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Filter Kelas Rotasi TV:
              </label>
              <select
                value={selectedClassFilter}
                onChange={(e) => {
                  setSelectedClassFilter(e.target.value);
                  setCurrentIndex(0);
                  setTimerProgress(0);
                }}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-emerald-500 font-medium cursor-pointer"
              >
                {classOptions.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'Semua Kelas (100 Santri)' : `Kelas ${c}`}
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>

      </main>

      {/* BOTTOM FOOTER BAR (RUNNING TEXT TICKER & TV CONTROLLER) */}
      <footer className="relative z-20 bg-slate-900/95 border-t border-slate-800 px-4 sm:px-8 py-3 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        
        {/* Left: Running Marquee / Ticker */}
        <div className="flex-1 flex items-center gap-3 overflow-hidden w-full sm:w-auto">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
            <Sparkles className="w-3 h-3" />
            <span>Mutiara Qur'an</span>
          </span>
          <div className="overflow-hidden whitespace-nowrap relative flex-1 text-xs text-slate-300 font-medium">
            <div className="inline-block animate-marquee">
              "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ" — Sebaik-baik kalian adalah orang yang mempelajari Al-Qur'an dan mengajarkannya (HR. Bukhari) • Waktu Sholat Wilayah Kota Jambi Otomatis Diperbarui • Target Semester: Minimal 2 Juz Mutqin • Jagalah adab dan murojaah setiap bakda sholat maktubah • Ma'had Tahfidzul Qur'an Jambi
            </div>
          </div>
        </div>

        {/* Right: Controller Buttons (Interval, Pause/Play, Prev, Next) */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Interval Selector */}
          <select
            value={intervalSeconds}
            onChange={(e) => {
              setIntervalSeconds(Number(e.target.value));
              setTimerProgress(0);
            }}
            className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-300 focus:outline-emerald-500 cursor-pointer font-medium"
            title="Kecepatan Pergantian Santri"
          >
            {ROTATION_INTERVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Previous Santri */}
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Santri Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
              isPaused
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
            }`}
            title={isPaused ? 'Lanjutkan Rotasi 10 Detik' : 'Jeda Rotasi'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Jeda (Paused)' : 'Auto 10s'}</span>
          </button>

          {/* Next Santri */}
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Santri Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>

      </footer>

      {/* FULLSCREEN ADZAN NOTIFICATION MODAL OVERLAY */}
      <AnimatePresence>
        {showAdzanModal && activeAdzanPrayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#060913]/95 backdrop-blur-xl flex items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-2xl w-full bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-emerald-950/80 relative overflow-hidden"
            >
              {/* Islamic Calligraphy Accent Banner */}
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-xl shadow-emerald-950 ring-4 ring-emerald-400/40 mb-6">
                <Bell className="w-10 h-10 text-emerald-100 animate-bounce" />
              </div>

              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>KOTA JAMBI & SEKITARNYA (WIB)</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-white tracking-tight">
                  WAKTU SHOLAT {activeAdzanPrayer.name.toUpperCase()} TELAH TIBA
                </h2>

                <div className="text-2xl sm:text-3xl font-serif text-amber-300 my-4 drop-shadow-md">
                  {activeAdzanPrayer.arabicName}
                </div>

                <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 my-2">
                  {activeAdzanPrayer.time} WIB
                </div>

                {/* Call to prayer reminder */}
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  "Mari bersegera mengambil wudhu, menghentikan seluruh aktivitas, dan menunaikan sholat berjamaah di masjid."
                </p>

                {/* Audio Status */}
                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={handleToggleMute}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      !isAudioMuted
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-bounce" />}
                    <span>{isAudioMuted ? 'Suara Senyap (Aktifkan)' : 'Suara Adzan Berjalan'}</span>
                  </button>

                  <button
                    onClick={handleDismissAdzan}
                    className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 transition-colors"
                  >
                    Tutup / Lanjutkan TV
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
