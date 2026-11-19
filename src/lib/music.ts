/**
 * Soft background music.
 * - 'melody': a royalty-free, procedurally generated veena-style melody over a tanpura drone (Web Audio, no files).
 * - 'custom': plays a user supplied mp3 URL.
 * Browsers only allow audio after a user gesture, so start() must be called from a tap.
 */
export class MusicPlayer {
  private ctx?: AudioContext;
  private master?: GainNode;
  private timer?: number;
  private nextTime = 0;
  private step = 0;
  private audio?: HTMLAudioElement;
  private droneNodes: OscillatorNode[] = [];
  playing = false;

  constructor(private mode: 'melody' | 'custom' | 'none', private url?: string) {}

  start() {
    if (this.mode === 'none' || this.playing) return;
    this.playing = true;
    if (this.mode === 'custom' && this.url) {
      if (!this.audio) {
        this.audio = new Audio(this.url);
        this.audio.loop = true;
        this.audio.volume = 0;
      }
      this.audio.play().catch(() => (this.playing = false));
      this.fadeAudio(0.55);
      return;
    }
    this.startSynth();
  }

  stop() {
    if (!this.playing) return;
    this.playing = false;
    if (this.audio) {
      this.fadeAudio(0, () => this.audio?.pause());
      return;
    }
    if (this.ctx && this.master) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(0, t, 0.3);
    }
    window.clearInterval(this.timer);
    setTimeout(() => {
      this.droneNodes.forEach((o) => { try { o.stop(); } catch { /* noop */ } });
      this.droneNodes = [];
    }, 1500);
  }

  toggle() {
    this.playing ? this.stop() : this.start();
    return this.playing;
  }

  dispose() {
    this.stop();
    setTimeout(() => this.ctx?.close().catch(() => {}), 1600);
  }

  private fadeAudio(target: number, done?: () => void) {
    const a = this.audio!;
    const startV = a.volume;
    const t0 = performance.now();
    const tick = () => {
      const k = Math.min(1, (performance.now() - t0) / 1200);
      a.volume = startV + (target - startV) * k;
      if (k < 1) requestAnimationFrame(tick);
      else done?.();
    };
    tick();
  }

  private startSynth() {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!this.ctx) this.ctx = new AC();
    const ctx = this.ctx!;
    ctx.resume();
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.gain.setTargetAtTime(0.32, ctx.currentTime, 1.2);

    // simple echo "reverb"
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.38;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2400;
    delay.connect(fb).connect(lp).connect(delay);
    this.master.connect(ctx.destination);
    delay.connect(this.master);
    (this as any).fx = delay;

    // tanpura drone: Sa - Pa - Sa
    const base = 146.83; // D3
    [base / 2, base * 0.75, base].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.05 - i * 0.01;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.18 + i * 0.07;
      const lg = ctx.createGain();
      lg.gain.value = 0.02;
      lfo.connect(lg).connect(g.gain);
      o.connect(g).connect(this.master!);
      o.start();
      lfo.start();
      this.droneNodes.push(o, lfo);
    });

    this.nextTime = ctx.currentTime + 0.3;
    this.step = 0;
    this.timer = window.setInterval(() => this.schedule(), 100);
  }

  // Mohanam (major pentatonic) phrases, in scale degrees
  private phrases = [
    [0, 1, 2, 4, 3, 2, 1, -1],
    [2, 3, 4, 5, 4, 3, 2, -1],
    [4, 5, 7, 5, 4, 3, 2, 1],
    [2, 1, 0, -1, 1, 2, 0, -1],
    [3, 4, 5, 4, 3, 2, 3, -1],
    [5, 4, 3, 2, 1, 2, 0, -1],
  ];
  private scale = [0, 2, 4, 7, 9, 12, 14, 16];

  private schedule() {
    const ctx = this.ctx!;
    const beat = 0.42;
    while (this.nextTime < ctx.currentTime + 0.6) {
      const phrase = this.phrases[Math.floor(this.step / 8) % this.phrases.length];
      const deg = phrase[this.step % 8];
      if (deg >= 0) this.pluck(293.66 * Math.pow(2, this.scale[deg] / 12), this.nextTime, this.step % 8 === 0 ? 0.22 : 0.15);
      // gentle bell every bar
      if (this.step % 16 === 0) this.pluck(587.33 * 2, this.nextTime, 0.03, 3.5);
      this.nextTime += this.step % 8 === 7 ? beat * 2 : beat;
      this.step++;
    }
  }

  private pluck(freq: number, t: number, vol: number, decay = 1.6) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o.type = 'triangle';
    o2.type = 'sine';
    o.frequency.value = freq;
    o2.frequency.value = freq * 2.005;
    // little slide (gamaka) into the note
    o.frequency.setValueAtTime(freq * 0.985, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + 0.07);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    const g2 = ctx.createGain();
    g2.gain.value = 0.25;
    o.connect(g);
    o2.connect(g2).connect(g);
    g.connect(this.master!);
    g.connect((this as any).fx);
    o.start(t);
    o2.start(t);
    o.stop(t + decay + 0.1);
    o2.stop(t + decay + 0.1);
  }
}
