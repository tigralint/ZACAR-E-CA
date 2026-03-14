/**
 * ZACAR-E-CA · Audio Engine
 * 
 * Persistent audio landscape:
 * - 18.98 Hz infrasound drone (anxiety-inducing subconscious pressure)
 * - Layered whisper textures
 * - Level-specific audio bus for plugging in additional sounds
 * 
 * Requires user gesture to initialize (browser autoplay policy).
 */

export class AudioEngine {
  constructor() {
    /** @type {AudioContext|null} */
    this.ctx = null;
    this.masterGain = null;
    this.droneGain = null;
    this.whisperGain = null;
    this.levelBus = null;

    this._droneOsc = null;
    this._droneOsc2 = null;
    this._whisperNodes = [];
    this._started = false;
    this._intensity = 0.5;
  }

  /**
   * Initialize AudioContext on user gesture.
   * Must be called from a click/keydown event handler.
   */
  async init() {
    if (this._started) return;

    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Master output
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.6;
    this.masterGain.connect(this.ctx.destination);

    // Drone bus
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0.25;
    this.droneGain.connect(this.masterGain);

    // Whisper bus
    this.whisperGain = this.ctx.createGain();
    this.whisperGain.gain.value = 0.08;
    this.whisperGain.connect(this.masterGain);

    // Level-specific bus (levels plug their audio nodes here)
    this.levelBus = this.ctx.createGain();
    this.levelBus.connect(this.masterGain);

    // Binaural / Anxiety Generator
    this._anxietyFreq = 100;
    this._binauralOscL = this.ctx.createOscillator();
    this._binauralOscR = this.ctx.createOscillator();
    this._binauralGain = this.ctx.createGain();
    this._merger = this.ctx.createChannelMerger(2);
    
    this._binauralOscL.frequency.value = this._anxietyFreq;
    this._binauralOscR.frequency.value = this._anxietyFreq + 7; // 7Hz Alpha/Theta border
    this._binauralGain.gain.value = 0;
    
    this._binauralOscL.connect(this._merger, 0, 0);
    this._binauralOscR.connect(this._merger, 0, 1);
    this._merger.connect(this._binauralGain);
    this._binauralGain.connect(this.masterGain);
    
    this._binauralOscL.start();
    this._binauralOscR.start();

    this._setupDrone();
    this._setupWhispers();

    this._started = true;
  }

  /**
   * 18.98 Hz infrasound — below conscious hearing threshold
   */
  _setupDrone() {
    this._droneOsc = this.ctx.createOscillator();
    this._droneOsc.type = 'sine';
    this._droneOsc.frequency.value = 18.98;
    this._droneOsc.connect(this.droneGain);
    this._droneOsc.start();

    this._droneOsc2 = this.ctx.createOscillator();
    this._droneOsc2.type = 'sine';
    this._droneOsc2.frequency.value = 19.03; 
    this._droneOsc2.connect(this.droneGain);
    this._droneOsc2.start();
  }

  /**
   * Synthetic whisper layer.
   */
  _setupWhispers() {
    const createWhisperVoice = (freq, q, interval) => {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = freq;
      bandpass.Q.value = q;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 1 / interval;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.3;

      const modGain = this.ctx.createGain();
      modGain.gain.value = 0.5;

      lfo.connect(lfoGain);
      lfoGain.connect(modGain.gain);
      source.connect(bandpass);
      bandpass.connect(modGain);
      modGain.connect(this.whisperGain);

      source.start();
      lfo.start();
      this._whisperNodes.push(source, bandpass, lfo, lfoGain, modGain);
    };

    createWhisperVoice(800, 12, 3.7);
    createWhisperVoice(2200, 8, 5.3);
    createWhisperVoice(3500, 15, 7.1);
  }

  setAnxiety(level) {
    if (this._binauralGain) {
      this._binauralGain.gain.linearRampToValueAtTime(
        level * 0.4,
        this.ctx.currentTime + 1
      );
    }
  }

  setIntensity(value) {
    this._intensity = Math.max(0, Math.min(1, value));
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(
        this._intensity * 0.6,
        this.ctx.currentTime + 0.5
      );
    }
  }

  setDroneLevel(value) {
    if (this.droneGain) {
      this.droneGain.gain.linearRampToValueAtTime(
        Math.max(0, Math.min(1, value)),
        this.ctx.currentTime + 0.3
      );
    }
  }

  setWhisperLevel(value) {
    if (this.whisperGain) {
      this.whisperGain.gain.linearRampToValueAtTime(
        Math.max(0, Math.min(1, value)),
        this.ctx.currentTime + 0.3
      );
    }
  }

  getContext() {
    return this.ctx;
  }

  getLevelBus() {
    return this.levelBus;
  }

  /**
   * Clean up all audio resources.
   */
  destroy() {
    if (this._droneOsc) this._droneOsc.stop();
    if (this._droneOsc2) this._droneOsc2.stop();
    this._whisperNodes.forEach(node => {
      if (node.stop) node.stop();
      node.disconnect();
    });
    if (this.ctx) this.ctx.close();
    this._started = false;
  }
}
