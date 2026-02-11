const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUT_DIR = path.resolve(process.cwd(), 'assets/sfx');

function clamp(v, min = -1, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function envelope(t, dur, a = 0.004, d = 0.03, s = 0.75, r = 0.05) {
  if (t < 0 || t > dur) return 0;
  if (t < a) return t / a;
  if (t < a + d) {
    const x = (t - a) / d;
    return 1 - (1 - s) * x;
  }
  if (t < dur - r) return s;
  const x = (t - (dur - r)) / r;
  return s * (1 - x);
}

function makeTrack(durationSec, synthFn) {
  const n = Math.ceil(durationSec * SAMPLE_RATE);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    samples[i] = clamp(synthFn(t));
  }
  return samples;
}

function mixTracks(durationSec, parts) {
  const n = Math.ceil(durationSec * SAMPLE_RATE);
  const samples = new Float32Array(n);
  for (const part of parts) {
    for (let i = 0; i < n; i += 1) {
      const t = i / SAMPLE_RATE;
      samples[i] += part(t);
    }
  }

  let peak = 0;
  for (let i = 0; i < n; i += 1) {
    peak = Math.max(peak, Math.abs(samples[i]));
  }
  const norm = peak > 0.95 ? 0.95 / peak : 1;
  for (let i = 0; i < n; i += 1) {
    samples[i] = clamp(samples[i] * norm);
  }
  return samples;
}

function sine(freq, t) {
  return Math.sin(2 * Math.PI * freq * t);
}

function square(freq, t) {
  return Math.sign(Math.sin(2 * Math.PI * freq * t));
}

function lerp(a, b, x) {
  return a + (b - a) * x;
}

function writeWavMono16(filePath, samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) >> 3;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = samples.length * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < samples.length; i += 1) {
    const s = clamp(samples[i]);
    const int = s < 0 ? Math.round(s * 32768) : Math.round(s * 32767);
    buffer.writeInt16LE(int, offset);
    offset += 2;
  }

  fs.writeFileSync(filePath, buffer);
}

function noise(seedObj) {
  seedObj.v = (seedObj.v * 1664525 + 1013904223) >>> 0;
  return (seedObj.v / 0xffffffff) * 2 - 1;
}

function buildSounds() {
  const seed = { v: 0xdeadbeef };

  const sounds = {
    'ui-click': (() => {
      const d = 0.08;
      return mixTracks(d, [
        (t) => {
          const x = t / d;
          const f = lerp(1700, 980, x);
          return 0.5 * sine(f, t) * envelope(t, d, 0.002, 0.02, 0.65, 0.03);
        },
        (t) => 0.08 * noise(seed) * envelope(t, d, 0.001, 0.01, 0.2, 0.02),
      ]);
    })(),

    'item-pick': (() => {
      const d = 0.18;
      return mixTracks(d, [
        (t) => 0.30 * sine(880, t) * envelope(t, d, 0.004, 0.03, 0.7, 0.05),
        (t) => (t > 0.05 ? 0.28 * sine(1174, t - 0.05) * envelope(t - 0.05, d - 0.05, 0.003, 0.02, 0.68, 0.05) : 0),
        (t) => (t > 0.10 ? 0.26 * sine(1568, t - 0.10) * envelope(t - 0.10, d - 0.10, 0.003, 0.02, 0.65, 0.05) : 0),
      ]);
    })(),

    'modal-open': (() => {
      const d = 0.13;
      return mixTracks(d, [
        (t) => {
          const x = t / d;
          const f = lerp(340, 560, x);
          return 0.33 * sine(f, t) * envelope(t, d, 0.004, 0.03, 0.72, 0.04);
        },
        (t) => {
          const x = t / d;
          const f = lerp(520, 760, x);
          return 0.18 * sine(f, t) * envelope(t, d, 0.002, 0.02, 0.6, 0.03);
        },
      ]);
    })(),

    'modal-close': (() => {
      const d = 0.11;
      return mixTracks(d, [
        (t) => {
          const x = t / d;
          const f = lerp(620, 360, x);
          return 0.32 * sine(f, t) * envelope(t, d, 0.004, 0.02, 0.7, 0.04);
        },
      ]);
    })(),

    'safe-input': (() => {
      const d = 0.09;
      return mixTracks(d, [
        (t) => 0.35 * sine(740, t) * envelope(t, d, 0.002, 0.02, 0.55, 0.03),
      ]);
    })(),

    'safe-ok': (() => {
      const d = 0.36;
      return mixTracks(d, [
        (t) => 0.28 * sine(660, t) * envelope(t, d, 0.005, 0.04, 0.65, 0.07),
        (t) => (t > 0.10 ? 0.27 * sine(880, t - 0.10) * envelope(t - 0.10, d - 0.10, 0.004, 0.03, 0.65, 0.07) : 0),
        (t) => (t > 0.20 ? 0.25 * sine(1108, t - 0.20) * envelope(t - 0.20, d - 0.20, 0.004, 0.03, 0.62, 0.06) : 0),
      ]);
    })(),

    'safe-ng': (() => {
      const d = 0.24;
      return mixTracks(d, [
        (t) => 0.26 * square(180, t) * envelope(t, d, 0.001, 0.02, 0.5, 0.06),
        (t) => 0.20 * sine(160, t) * envelope(t, d, 0.002, 0.02, 0.6, 0.05),
        (t) => 0.04 * noise(seed) * envelope(t, d, 0.001, 0.01, 0.3, 0.03),
      ]);
    })(),

    'door-unlock': (() => {
      const d = 0.34;
      return mixTracks(d, [
        (t) => 0.20 * sine(420, t) * envelope(t, d, 0.002, 0.03, 0.45, 0.10),
        (t) => (t > 0.08 ? 0.18 * sine(630, t - 0.08) * envelope(t - 0.08, d - 0.08, 0.002, 0.03, 0.5, 0.08) : 0),
        (t) => 0.07 * noise(seed) * envelope(t, d, 0.001, 0.01, 0.2, 0.05),
      ]);
    })(),

    'win': (() => {
      const d = 0.72;
      return mixTracks(d, [
        (t) => 0.23 * sine(523.25, t) * envelope(t, d, 0.01, 0.06, 0.7, 0.12),
        (t) => (t > 0.14 ? 0.22 * sine(659.25, t - 0.14) * envelope(t - 0.14, d - 0.14, 0.01, 0.05, 0.7, 0.10) : 0),
        (t) => (t > 0.28 ? 0.21 * sine(783.99, t - 0.28) * envelope(t - 0.28, d - 0.28, 0.01, 0.05, 0.65, 0.10) : 0),
        (t) => (t > 0.42 ? 0.20 * sine(1046.5, t - 0.42) * envelope(t - 0.42, d - 0.42, 0.01, 0.04, 0.65, 0.10) : 0),
      ]);
    })(),
  };

  return sounds;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const sounds = buildSounds();
  const keys = Object.keys(sounds);
  for (const key of keys) {
    const wavPath = path.join(OUT_DIR, `${key}.wav`);
    writeWavMono16(wavPath, sounds[key]);
  }
  console.log(`Generated ${keys.length} wav files in ${OUT_DIR}`);
}

main();
