// Audio Service for Adzan in Kota Jambi
// Handles audio loading, autoplay unlocking, synthesized fallback, and playback events

class AdzanAudioService {
  private audioElement: HTMLAudioElement | null = null;
  private isUnlocked: boolean = false;
  private isMuted: boolean = false;
  private volume: number = 0.85;
  private isPlaying: boolean = false;
  private listeners: Set<(playing: boolean) => void> = new Set();
  
  // High quality adzan audio sources with fallbacks
  private audioUrls: string[] = [
    'https://cdn.islamic.network/audio/adthan/makkah.mp3',
    'https://www.islamcan.com/audio/adhan/azan1.mp3',
    'https://media.sd.ma/assabile/adhan_34578/makkah_adhan.mp3',
    'https://cdn.aladhan.com/audio/adhans/makkah.mp3',
  ];
  private currentUrlIdx: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    try {
      this.audioElement = new Audio();
      this.audioElement.preload = 'auto';
      this.audioElement.volume = this.volume;
      this.audioElement.src = this.audioUrls[this.currentUrlIdx];

      this.audioElement.onended = () => {
        this.isPlaying = false;
        this.notifyListeners();
      };

      this.audioElement.onerror = () => {
        console.warn('Adzan audio error on URL', this.audioUrls[this.currentUrlIdx]);
        // Try next URL fallback
        if (this.currentUrlIdx < this.audioUrls.length - 1) {
          this.currentUrlIdx++;
          if (this.audioElement) {
            this.audioElement.src = this.audioUrls[this.currentUrlIdx];
            if (this.isPlaying) {
              this.audioElement.play().catch(() => this.playSynthesizedAdzan());
            }
          }
        } else {
          this.playSynthesizedAdzan();
        }
      };
    } catch (e) {
      console.warn('Audio element initialization warning:', e);
    }
  }

  public unlockAudio(): boolean {
    if (this.isUnlocked) return true;
    try {
      if (!this.audioElement) this.initAudio();
      if (this.audioElement) {
        // Play silent sound to unlock browser autoplay policy
        const prevVolume = this.audioElement.volume;
        this.audioElement.volume = 0.01;
        const promise = this.audioElement.play();
        if (promise !== undefined) {
          promise
            .then(() => {
              if (this.audioElement) {
                this.audioElement.pause();
                this.audioElement.currentTime = 0;
                this.audioElement.volume = prevVolume;
              }
              this.isUnlocked = true;
            })
            .catch(() => {
              // Still unlock web audio context
              this.isUnlocked = true;
            });
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  public getIsUnlocked(): boolean {
    return this.isUnlocked;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.audioElement) {
      this.audioElement.muted = muted;
    }
    if (muted && this.isPlaying) {
      this.stop();
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public subscribe(fn: (playing: boolean) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => fn(this.isPlaying));
  }

  public async play(): Promise<boolean> {
    if (this.isMuted) return false;
    this.unlockAudio();

    this.isPlaying = true;
    this.notifyListeners();

    if (!this.audioElement) {
      this.initAudio();
    }

    if (this.audioElement) {
      try {
        this.audioElement.currentTime = 0;
        this.audioElement.volume = this.volume;
        await this.audioElement.play();
        return true;
      } catch (err) {
        console.warn('Audio play failed, playing synthesized adzan tone:', err);
        this.playSynthesizedAdzan();
        return true;
      }
    } else {
      this.playSynthesizedAdzan();
      return true;
    }
  }

  public stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.isPlaying = false;
    this.notifyListeners();
  }

  // Synthesized melodic chime for Adzan alert fallback
  private playSynthesizedAdzan() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Traditional Maqam Bayati tone progression (D - E - F - G - A)
      const notes = [293.66, 329.63, 349.23, 392.00, 440.00, 392.00, 349.23, 293.66];
      let delay = 0;

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.3 * this.volume, ctx.currentTime + delay + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 2.0);

        delay += 1.2;
      });

      setTimeout(() => {
        this.isPlaying = false;
        this.notifyListeners();
      }, (delay + 2) * 1000);
    } catch {
      this.isPlaying = false;
      this.notifyListeners();
    }
  }
}

export const adzanAudioService = new AdzanAudioService();
