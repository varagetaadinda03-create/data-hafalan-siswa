// Prayer Times Service for Kota Jambi (WIB / UTC+7)
// Coordinates: Lat -1.6101, Long 103.6131, Timezone UTC+7

export interface PrayerTime {
  name: 'Imsak' | 'Subuh' | 'Terbit' | 'Dzuhur' | 'Ashar' | 'Maghrib' | 'Isya';
  time: string; // HH:mm
  timestamp: Date;
  isPassed: boolean;
  isNext: boolean;
  arabicName: string;
}

export interface PrayerScheduleData {
  city: string;
  dateStr: string;
  hijriDate: string;
  prayers: PrayerTime[];
  nextPrayer: PrayerTime | null;
  countdownText: string;
  countdownSeconds: number;
}

// Convert degrees to radians and vice versa
const degToRad = (deg: number) => (deg * Math.PI) / 180;
const radToDeg = (rad: number) => (rad * 180) / Math.PI;

// Astronomical calculation for prayer times (Kemenag RI Standard)
export function calculateJambiPrayerTimes(date: Date = new Date()): PrayerScheduleData {
  const lat = -1.6101; // Kota Jambi Latitude (South)
  const lng = 103.6131; // Kota Jambi Longitude (East)
  const timezone = 7; // WIB (UTC+7)

  // Day of year
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Sun's declination and equation of time
  const B = (360 / 365) * (dayOfYear - 81);
  const B_rad = degToRad(B);
  
  const eot = 9.87 * Math.sin(2 * B_rad) - 7.53 * Math.cos(B_rad) - 1.5 * Math.sin(B_rad); // in minutes
  const declination = 23.45 * Math.sin(degToRad((360 / 365) * (dayOfYear - 81))); // in degrees
  const dec_rad = degToRad(declination);
  const lat_rad = degToRad(lat);

  // Solar noon (Dzuhur) in local time
  const noonMinutes = 12 * 60 - lng * 4 + timezone * 60 - eot;

  // Fajr (Subuh) angle = -20 degrees (Kemenag standard)
  const fajrAngle = -20;
  const fajrCosHourAngle = (Math.sin(degToRad(fajrAngle)) - Math.sin(lat_rad) * Math.sin(dec_rad)) /
    (Math.cos(lat_rad) * Math.cos(dec_rad));
  const fajrHourAngle = radToDeg(Math.acos(Math.max(-1, Math.min(1, fajrCosHourAngle)))) * 4;

  // Sunrise (Terbit) angle = -0.833 degrees
  const sunriseAngle = -0.833;
  const sunriseCosHourAngle = (Math.sin(degToRad(sunriseAngle)) - Math.sin(lat_rad) * Math.sin(dec_rad)) /
    (Math.cos(lat_rad) * Math.cos(dec_rad));
  const sunriseHourAngle = radToDeg(Math.acos(Math.max(-1, Math.min(1, sunriseCosHourAngle)))) * 4;

  // Asr shadow ratio (Shafi'i / Indonesian standard = 1 + tan|lat - dec|)
  const asrAlt = radToDeg(Math.atan(1 / (1 + Math.tan(Math.abs(lat_rad - dec_rad)))));
  const asrCosHourAngle = (Math.sin(degToRad(asrAlt)) - Math.sin(lat_rad) * Math.sin(dec_rad)) /
    (Math.cos(lat_rad) * Math.cos(dec_rad));
  const asrHourAngle = radToDeg(Math.acos(Math.max(-1, Math.min(1, asrCosHourAngle)))) * 4;

  // Maghrib angle = -0.833 degrees (sunset) + ihtiyat
  const sunsetHourAngle = sunriseHourAngle;

  // Isha angle = -18 degrees (Kemenag standard)
  const ishaAngle = -18;
  const ishaCosHourAngle = (Math.sin(degToRad(ishaAngle)) - Math.sin(lat_rad) * Math.sin(dec_rad)) /
    (Math.cos(lat_rad) * Math.cos(dec_rad));
  const ishaHourAngle = radToDeg(Math.acos(Math.max(-1, Math.min(1, ishaCosHourAngle)))) * 4;

  // Times in minutes with Ihtiyat (safety buffer ~2-3 mins)
  const subuhMin = noonMinutes - fajrHourAngle + 2;
  const imsakMin = subuhMin - 10;
  const terbitMin = noonMinutes - sunriseHourAngle;
  const dzuhurMin = noonMinutes + 2;
  const asharMin = noonMinutes + asrHourAngle + 2;
  const maghribMin = noonMinutes + sunsetHourAngle + 2;
  const ishaMin = noonMinutes + ishaHourAngle + 2;

  const toTimeObj = (minutes: number, name: PrayerTime['name'], arabicName: string): PrayerTime => {
    const totalMinutes = (minutes + 24 * 60) % (24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    
    const pDate = new Date(date);
    pDate.setHours(hours, mins, 0, 0);

    const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    const isPassed = date.getTime() >= pDate.getTime();

    return {
      name,
      time: timeStr,
      timestamp: pDate,
      isPassed,
      isNext: false,
      arabicName,
    };
  };

  const rawPrayers: PrayerTime[] = [
    toTimeObj(imsakMin, 'Imsak', 'الإمساك'),
    toTimeObj(subuhMin, 'Subuh', 'الفجر'),
    toTimeObj(terbitMin, 'Terbit', 'الشروق'),
    toTimeObj(dzuhurMin, 'Dzuhur', 'الظهر'),
    toTimeObj(asharMin, 'Ashar', 'العصر'),
    toTimeObj(maghribMin, 'Maghrib', 'المغرب'),
    toTimeObj(ishaMin, 'Isya', 'العشاء'),
  ];

  // Find next upcoming prayer
  let nextPrayer: PrayerTime | null = null;
  for (const p of rawPrayers) {
    if (!p.isPassed && p.name !== 'Imsak' && p.name !== 'Terbit') {
      nextPrayer = p;
      p.isNext = true;
      break;
    }
  }

  // If all prayers passed today, next is Subuh tomorrow
  if (!nextPrayer) {
    const tomorrowSubuh = toTimeObj(subuhMin, 'Subuh', 'الفجر');
    tomorrowSubuh.timestamp.setDate(tomorrowSubuh.timestamp.getDate() + 1);
    tomorrowSubuh.isPassed = false;
    tomorrowSubuh.isNext = true;
    nextPrayer = tomorrowSubuh;
  }

  // Calculate countdown
  let countdownText = '00:00:00';
  let countdownSeconds = 0;
  if (nextPrayer) {
    const diffMs = nextPrayer.timestamp.getTime() - date.getTime();
    if (diffMs > 0) {
      countdownSeconds = Math.floor(diffMs / 1000);
      const h = Math.floor(countdownSeconds / 3600);
      const m = Math.floor((countdownSeconds % 3600) / 60);
      const s = countdownSeconds % 60;
      countdownText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  }

  // Hijri Date estimation (approximation based on Islamic Umm al-Qura calendar)
  const hijriDate = getEstimatedHijriDate(date);

  const dateStr = date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    city: 'Kota Jambi, Jambi (WIB)',
    dateStr,
    hijriDate,
    prayers: rawPrayers,
    nextPrayer,
    countdownText,
    countdownSeconds,
  };
}

// Simple Hijri calendar converter
function getEstimatedHijriDate(date: Date): string {
  try {
    const intlHijri = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
    return `${intlHijri} H`;
  } catch {
    return '1447 H';
  }
}
