/**
 * Romantic Audio Engine:
 * - Plays custom audio files / MP3s with playlist support
 * - Automatically advances to next song in playlist when track ends
 * - Provides built-in gentle acoustic piano & harp melodies via Web Audio API
 */

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private customAudio: HTMLAudioElement | null = null;
  private volume: number = 0.75;
  private loopInterval: number | null = null;
  private noteTimeouts: number[] = [];
  private currentTime: number = 0;
  private duration: number = 72; // loop for built-in romantic melody
  private timerInterval: number | null = null;
  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;
  private onPlayStateChangeCallback: ((playing: boolean) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;
  private builtInTrackVariant: number = 0;

  constructor() {
    // Lazy initialized
  }

  private initAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.customAudio) {
      this.customAudio.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setTrackEndedCallback(cb: () => void) {
    this.onEndedCallback = cb;
  }

  public setCustomAudio(url: string | null, variant: number = 0) {
    this.stop();
    this.builtInTrackVariant = variant;

    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }

    if (url) {
      this.customAudio = new Audio(url);
      this.customAudio.volume = this.volume;
      this.customAudio.addEventListener('timeupdate', () => {
        if (this.customAudio && this.onTimeUpdateCallback) {
          this.currentTime = this.customAudio.currentTime;
          this.duration = this.customAudio.duration || 180;
          this.onTimeUpdateCallback(this.currentTime, this.duration);
        }
      });
      this.customAudio.addEventListener('ended', () => {
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      });
    }
  }

  public subscribe(onPlayState: (playing: boolean) => void, onTimeUpdate: (current: number, total: number) => void) {
    this.onPlayStateChangeCallback = onPlayState;
    this.onTimeUpdateCallback = onTimeUpdate;
  }

  public async play(): Promise<boolean> {
    this.initAudioContext();

    if (this.customAudio) {
      try {
        await this.customAudio.play();
        this.isPlaying = true;
        this.onPlayStateChangeCallback?.(true);
        return true;
      } catch (err) {
        console.warn('Custom audio playback blocked:', err);
        return false;
      }
    }

    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        return false;
      }
    }

    this.isPlaying = true;
    this.onPlayStateChangeCallback?.(true);
    this.startRomanticComposition();
    this.startTimeTracker();
    return true;
  }

  public pause() {
    this.isPlaying = false;
    this.onPlayStateChangeCallback?.(false);

    if (this.customAudio) {
      this.customAudio.pause();
    }

    this.clearScheduledNotes();
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public stop() {
    this.pause();
    this.currentTime = 0;
    if (this.customAudio) {
      this.customAudio.currentTime = 0;
    }
    this.onTimeUpdateCallback?.(0, this.duration);
  }

  public seek(seconds: number) {
    this.currentTime = Math.max(0, Math.min(this.duration, seconds));
    if (this.customAudio) {
      this.customAudio.currentTime = this.currentTime;
    }
    this.onTimeUpdateCallback?.(this.currentTime, this.duration);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private startTimeTracker() {
    if (this.timerInterval) window.clearInterval(this.timerInterval);
    this.timerInterval = window.setInterval(() => {
      if (!this.isPlaying) return;
      if (!this.customAudio) {
        this.currentTime += 0.5;
        if (this.currentTime >= this.duration) {
          this.currentTime = 0;
          if (this.onEndedCallback) {
            this.onEndedCallback();
          }
        }
        this.onTimeUpdateCallback?.(this.currentTime, this.duration);
      }
    }, 500);
  }

  private clearScheduledNotes() {
    this.noteTimeouts.forEach((t) => window.clearTimeout(t));
    this.noteTimeouts = [];
    if (this.loopInterval) {
      window.clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }

  private startRomanticComposition() {
    this.clearScheduledNotes();

    const playFullPattern = () => {
      if (!this.isPlaying || !this.ctx) return;

      const progression = this.builtInTrackVariant === 1
        ? [
            // Midnight Rose Waltz: Am -> Em -> Fmaj7 -> G
            { bass: 220.00, chord: [261.63, 329.63, 440.00], arp: [329.63, 440.0, 523.25, 659.25] },
            { bass: 164.81, chord: [196.00, 246.94, 329.63], arp: [246.94, 329.63, 392.0, 493.88] },
            { bass: 174.61, chord: [261.63, 329.63, 349.23], arp: [261.63, 349.23, 440.0, 523.25] },
            { bass: 196.00, chord: [246.94, 293.66, 392.00], arp: [293.66, 392.0, 493.88, 587.33] },
          ]
        : this.builtInTrackVariant === 2
        ? [
            // Porcelain Whispers: D -> G -> Bm -> A
            { bass: 146.83, chord: [220.00, 293.66, 369.99], arp: [293.66, 369.99, 440.0, 587.33] },
            { bass: 196.00, chord: [246.94, 293.66, 392.00], arp: [246.94, 392.0, 493.88, 587.33] },
            { bass: 123.47, chord: [220.00, 293.66, 369.99], arp: [246.94, 369.99, 440.0, 493.88] },
            { bass: 220.00, chord: [277.18, 329.63, 440.00], arp: [277.18, 329.63, 440.0, 554.37] },
          ]
        : [
            // Track 0: Golden Petals & Starlight (Fmaj7 -> Dm9 -> Bbmaj7 -> C9sus4)
            { bass: 174.61, chord: [261.63, 329.63, 349.23, 440.00], arp: [349.23, 440.0, 523.25, 659.25, 523.25, 440.0] },
            { bass: 146.83, chord: [220.00, 261.63, 329.63, 349.23], arp: [293.66, 349.23, 440.0, 523.25, 440.0, 349.23] },
            { bass: 116.54, chord: [233.08, 293.66, 349.23, 440.00], arp: [233.08, 349.23, 440.0, 466.16, 440.0, 349.23] },
            { bass: 130.81, chord: [196.00, 261.63, 293.66, 349.23], arp: [261.63, 293.66, 392.0, 523.25, 392.0, 293.66] },
          ];

      let chordTime = 0;
      const stepDuration = 3.6;

      progression.forEach((ch) => {
        const tBass = window.setTimeout(() => {
          if (!this.isPlaying) return;
          this.playPianoNote(ch.bass, 0.45, 3.2, 'triangle');
        }, chordTime * 1000);
        this.noteTimeouts.push(tBass);

        const tChord = window.setTimeout(() => {
          if (!this.isPlaying) return;
          ch.chord.forEach((freq, idx) => {
            this.playWarmPad(freq, 0.12, 3.0, idx * 0.05);
          });
        }, chordTime * 1000);
        this.noteTimeouts.push(tChord);

        ch.arp.forEach((freq, aIdx) => {
          const tArp = window.setTimeout(() => {
            if (!this.isPlaying) return;
            this.playHarpNote(freq, 0.28, 1.8);
          }, (chordTime + aIdx * 0.55) * 1000);
          this.noteTimeouts.push(tArp);
        });

        chordTime += stepDuration;
      });
    };

    playFullPattern();
    const loopDurationMs = 4 * 3.6 * 1000;
    this.loopInterval = window.setInterval(playFullPattern, loopDurationMs);
  }

  private playPianoNote(freq: number, gainVal: number, duration: number, type: OscillatorType = 'triangle') {
    if (!this.ctx || !this.isPlaying) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + duration);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const netVol = gainVal * this.volume;
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(netVol, this.ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration + 0.1);
    } catch {
      // Cleanup
    }
  }

  private playWarmPad(freq: number, gainVal: number, duration: number, delay: number = 0) {
    if (!this.ctx || !this.isPlaying) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

      const netVol = gainVal * this.volume;
      const startT = this.ctx.currentTime + delay;
      gain.gain.setValueAtTime(0.0001, startT);
      gain.gain.linearRampToValueAtTime(netVol, startT + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startT);
      osc.stop(startT + duration + 0.1);
    } catch {
      // Ignore
    }
  }

  private playHarpNote(freq: number, gainVal: number, duration: number) {
    if (!this.ctx || !this.isPlaying) return;
    try {
      const osc = this.ctx.createOscillator();
      const oscSub = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(freq * 2, this.ctx.currentTime);

      const netVol = gainVal * this.volume;
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(netVol, this.ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      oscSub.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      oscSub.start();
      osc.stop(this.ctx.currentTime + duration + 0.1);
      oscSub.stop(this.ctx.currentTime + duration + 0.1);
    } catch {
      // Ignore
    }
  }
}

export const romanticAudio = new RomanticAudioEngine();
