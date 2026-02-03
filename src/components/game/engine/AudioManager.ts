import type { VoiceLine, SoundEffect } from './types';

export class AudioManager {
  private voices: Map<VoiceLine, HTMLAudioElement> = new Map();
  private audioCtx: AudioContext | null = null;
  private muted: boolean = false;
  private lastTauntTime: number = 0;
  private unlocked: boolean = false;

  constructor() {
    if (typeof window === 'undefined') return;

    // Load voice files
    const voiceFiles: VoiceLine[] = ['beware', 'run', 'escape', 'see', 'ideas', 'coward', 'laugh'];
    voiceFiles.forEach((name) => {
      const audio = new Audio(`/audio/voice-${name}.mp3`);
      audio.preload = 'auto';
      audio.load();
      this.voices.set(name, audio);
    });
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;

    // Unlock audio context
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    // Unlock voice audio
    this.voices.forEach((audio) => {
      audio.play().then(() => audio.pause()).catch(() => {});
      audio.currentTime = 0;
    });
  }

  playVoice(name: VoiceLine): void {
    if (this.muted) return;

    const audio = this.voices.get(name);
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.9;
      audio.play().catch(() => {});
    }
  }

  playRandomTaunt(phase: 'wave' | 'boss'): void {
    const now = Date.now();
    if (now - this.lastTauntTime < 4000) return;
    this.lastTauntTime = now;

    const taunts: VoiceLine[] = phase === 'boss'
      ? ['coward', 'laugh', 'ideas', 'run', 'escape']
      : ['run', 'escape', 'see', 'ideas', 'coward'];

    const taunt = taunts[Math.floor(Math.random() * taunts.length)];
    if (taunt) this.playVoice(taunt);
  }

  // Synthesized sound effects for immediate response
  playSound(type: SoundEffect): void {
    if (this.muted || !this.audioCtx) return;

    const ctx = this.audioCtx;
    if (ctx.state === 'suspended') ctx.resume();

    try {
      switch (type) {
        case 'tick':
          this.playTone(ctx, 600, 0.03, 'sine', 0.02);
          break;
        case 'select':
          this.playTone(ctx, 523, 0.1, 'sine', 0.08);
          this.playTone(ctx, 784, 0.15, 'sine', 0.12, 0.08);
          break;
        case 'launch':
          this.playTone(ctx, 262, 0.1, 'sawtooth', 0.05);
          this.playTone(ctx, 330, 0.1, 'sawtooth', 0.05, 0.05);
          this.playTone(ctx, 392, 0.1, 'sawtooth', 0.05, 0.1);
          this.playTone(ctx, 523, 0.2, 'sawtooth', 0.1, 0.15);
          this.playTone(ctx, 659, 0.25, 'sawtooth', 0.15, 0.2);
          break;
        case 'navigate':
          this.playTone(ctx, 800, 0.05, 'square', 0.03);
          this.playTone(ctx, 1000, 0.03, 'square', 0.02, 0.02);
          break;
        case 'countdown':
          this.playTone(ctx, 440, 0.1, 'square', 0.08);
          break;
        case 'hit':
          this.playNoise(ctx, 0.1, 0.05);
          this.playTone(ctx, 200, 0.15, 'sawtooth', 0.05);
          break;
        case 'explosion':
          this.playNoise(ctx, 0.3, 0.2);
          this.playTone(ctx, 80, 0.3, 'sawtooth', 0.15);
          this.playTone(ctx, 60, 0.2, 'sine', 0.2, 0.1);
          break;
        case 'pickup':
          this.playTone(ctx, 880, 0.1, 'sine', 0.05);
          this.playTone(ctx, 1100, 0.1, 'sine', 0.05, 0.05);
          this.playTone(ctx, 1320, 0.15, 'sine', 0.08, 0.1);
          break;
        case 'damage':
          this.playNoise(ctx, 0.15, 0.08);
          this.playTone(ctx, 150, 0.2, 'sawtooth', 0.1);
          break;
      }
    } catch (e) {
      // Audio not available
    }
  }

  private playTone(
    ctx: AudioContext,
    freq: number,
    volume: number,
    type: OscillatorType,
    duration: number,
    delay: number = 0
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.value = freq;

    const startTime = ctx.currentTime + delay;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  private playNoise(ctx: AudioContext, volume: number, duration: number): void {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();

    source.buffer = buffer;
    source.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    source.start();
  }
}
