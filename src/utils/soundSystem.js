// Sound system for Gods Of The Realms — War of Worlds
// Placeholder audio using Web Audio API tones.
// Replace with real audio files later.

let audioCtx = null;
let enabled = true;
let volume = 0.3;

function getContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(frequency, duration, type = 'sine') {
  if (!enabled) return;
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

// --- Sound Events ---

export const SFX = {
  attack: () => playTone(220, 0.15, 'sawtooth'),
  crit: () => { playTone(330, 0.1, 'sawtooth'); setTimeout(() => playTone(440, 0.15, 'sawtooth'), 50); },
  heal: () => playTone(523, 0.2, 'sine'),
  buff: () => playTone(440, 0.15, 'triangle'),
  debuff: () => playTone(165, 0.2, 'square'),
  death: () => playTone(110, 0.4, 'sawtooth'),
  revive: () => { playTone(330, 0.1, 'sine'); setTimeout(() => playTone(440, 0.1, 'sine'), 100); setTimeout(() => playTone(660, 0.2, 'sine'), 200); },
  stun: () => playTone(200, 0.1, 'square'),
  turnStart: () => playTone(660, 0.08, 'sine'),
  battleStart: () => { playTone(330, 0.15, 'sine'); setTimeout(() => playTone(440, 0.15, 'sine'), 150); setTimeout(() => playTone(660, 0.2, 'sine'), 300); },
  victory: () => { playTone(523, 0.15, 'sine'); setTimeout(() => playTone(659, 0.15, 'sine'), 150); setTimeout(() => playTone(784, 0.3, 'sine'), 300); },
  defeat: () => { playTone(330, 0.2, 'sawtooth'); setTimeout(() => playTone(220, 0.2, 'sawtooth'), 200); setTimeout(() => playTone(165, 0.4, 'sawtooth'), 400); },
  summon: () => { playTone(262, 0.1, 'sine'); setTimeout(() => playTone(330, 0.1, 'sine'), 80); setTimeout(() => playTone(392, 0.1, 'sine'), 160); setTimeout(() => playTone(523, 0.2, 'sine'), 240); },
  click: () => playTone(880, 0.05, 'sine'),
  error: () => playTone(150, 0.15, 'square'),
  levelUp: () => { playTone(440, 0.1, 'sine'); setTimeout(() => playTone(554, 0.1, 'sine'), 100); setTimeout(() => playTone(660, 0.15, 'sine'), 200); setTimeout(() => playTone(880, 0.25, 'sine'), 300); },
  starUp: () => { playTone(523, 0.1, 'sine'); setTimeout(() => playTone(659, 0.1, 'sine'), 80); setTimeout(() => playTone(784, 0.1, 'sine'), 160); setTimeout(() => playTone(1047, 0.3, 'sine'), 240); setTimeout(() => playTone(1319, 0.2, 'sine'), 360); },
  awaken: () => { playTone(262, 0.15, 'triangle'); setTimeout(() => playTone(330, 0.15, 'triangle'), 120); setTimeout(() => playTone(392, 0.15, 'triangle'), 240); setTimeout(() => playTone(523, 0.15, 'triangle'), 360); setTimeout(() => playTone(660, 0.2, 'sine'), 480); setTimeout(() => playTone(784, 0.3, 'sine'), 600); },
  achievement: () => { playTone(784, 0.1, 'sine'); setTimeout(() => playTone(988, 0.1, 'sine'), 100); setTimeout(() => playTone(1175, 0.15, 'sine'), 200); setTimeout(() => playTone(1568, 0.3, 'sine'), 300); },
  dailyClaim: () => { playTone(523, 0.1, 'triangle'); setTimeout(() => playTone(659, 0.1, 'triangle'), 80); setTimeout(() => playTone(784, 0.2, 'triangle'), 160); },
  presetSave: () => { playTone(440, 0.08, 'sine'); setTimeout(() => playTone(554, 0.08, 'sine'), 60); setTimeout(() => playTone(660, 0.12, 'sine'), 120); },
  presetLoad: () => playTone(660, 0.1, 'sine'),
};

// --- Controls ---

export function setVolume(v) { volume = Math.max(0, Math.min(1, v)); }
export function getVolume() { return volume; }
export function setEnabled(e) { enabled = e; }
export function isEnabled() { return enabled; }
export function resumeAudio() {
  const ctx = getContext();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}
