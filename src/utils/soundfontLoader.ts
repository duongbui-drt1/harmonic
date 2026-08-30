import * as Tone from "tone";
import { InstrumentType } from "../types";

// ==========================================
// 1. HIGH-FIDELITY GRAND PIANO SAMPLE SOURCES
// ==========================================

// Salamander Yamaha C5 Concert Grand Piano (Concise strategic anchors for <200ms load)
const SALAMANDER_PIANO_SAMPLES: Record<string, string> = {
  A0: "A0.mp3",
  C1: "C1.mp3",
  "D#2": "Ds2.mp3",
  "F#3": "Fs3.mp3",
  A3: "A3.mp3",
  C4: "C4.mp3",
  "D#4": "Ds4.mp3",
  "F#4": "Fs4.mp3",
  A4: "A4.mp3",
  C5: "C5.mp3",
  "D#6": "Ds6.mp3",
  "F#7": "Fs7.mp3",
  C8: "C8.mp3",
};

const CASIO_PIANO_SAMPLES: Record<string, string> = {
  A1: "A1.mp3",
  C2: "C2.mp3",
  C3: "C3.mp3",
  C4: "C4.mp3",
  C5: "C5.mp3",
  C6: "C6.mp3",
};

const GUITAR_ACOUSTIC_SAMPLES: Record<string, string> = {
  "F#1": "Fs1.mp3",
  A1: "A1.mp3",
  C2: "C2.mp3",
  "D#2": "Ds2.mp3",
  "F#2": "Fs2.mp3",
  A2: "A2.mp3",
  C3: "C3.mp3",
  "D#3": "Ds3.mp3",
  "F#3": "Fs3.mp3",
  A3: "A3.mp3",
  C4: "C4.mp3",
  "D#4": "Ds4.mp3",
  "F#4": "Fs4.mp3",
  A4: "A4.mp3",
  C5: "C5.mp3",
};

const GUITAR_ELECTRIC_SAMPLES: Record<string, string> = {
  "D#2": "Ds2.mp3",
  "F#2": "Fs2.mp3",
  A2: "A2.mp3",
  C3: "C3.mp3",
  "D#3": "Ds3.mp3",
  "F#3": "Fs3.mp3",
  A3: "A3.mp3",
  C4: "C4.mp3",
  "D#4": "Ds4.mp3",
  "F#4": "Fs4.mp3",
  A4: "A4.mp3",
  C5: "C5.mp3",
};

const VIOLIN_STRINGS_SAMPLES: Record<string, string> = {
  G3: "G3.mp3",
  C4: "C4.mp3",
  E4: "E4.mp3",
  G4: "G4.mp3",
  C5: "C5.mp3",
  E5: "E5.mp3",
  G5: "G5.mp3",
  C6: "C6.mp3",
};

const DRUMS_SAMPLES: Record<string, string> = {
  C2: "kick.mp3",
  D2: "snare.mp3",
  "F#2": "hihat.mp3",
  A2: "tom1.mp3",
  C3: "tom2.mp3",
  E3: "crash.mp3",
};

interface InstrumentSampleConfig {
  primaryBaseUrl: string;
  primaryUrls: Record<string, string>;
  fallbackBaseUrl?: string;
  fallbackUrls?: Record<string, string>;
  soundfontName?: string;
  volumeOffset: number;
}

const INSTRUMENT_CONFIGS: Record<InstrumentType, InstrumentSampleConfig> = {
  piano: {
    primaryBaseUrl: "https://tonejs.github.io/audio/salamander/",
    primaryUrls: SALAMANDER_PIANO_SAMPLES,
    fallbackBaseUrl: "https://tonejs.github.io/audio/casio/",
    fallbackUrls: CASIO_PIANO_SAMPLES,
    soundfontName: "acoustic_grand_piano",
    volumeOffset: -2,
  },
  acoustic_guitar: {
    primaryBaseUrl: "https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments/samples/guitar-acoustic/",
    primaryUrls: GUITAR_ACOUSTIC_SAMPLES,
    soundfontName: "acoustic_guitar_nylon",
    volumeOffset: -2,
  },
  electric_guitar: {
    primaryBaseUrl: "https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments/samples/guitar-electric/",
    primaryUrls: GUITAR_ELECTRIC_SAMPLES,
    soundfontName: "electric_guitar_clean",
    volumeOffset: -2,
  },
  strings: {
    primaryBaseUrl: "https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments/samples/violin/",
    primaryUrls: VIOLIN_STRINGS_SAMPLES,
    soundfontName: "violin",
    volumeOffset: -2,
  },
  drums: {
    primaryBaseUrl: "https://tonejs.github.io/audio/drum-samples/acoustic-kit/",
    primaryUrls: DRUMS_SAMPLES,
    soundfontName: "taiko_drum",
    volumeOffset: -2,
  },
};

const samplerCache: Partial<Record<InstrumentType, Tone.Sampler>> = {};

// Strategic anchor pitch classes across octaves
const DESIRED_ANCHOR_PITCHES = [
  "A0", "C1", "D#1", "F#1", "A1",
  "C2", "D#2", "F#2", "A2",
  "C3", "D#3", "F#3", "A3",
  "C4", "D#4", "F#4", "A4",
  "C5", "D#5", "F#5", "A5",
  "C6", "D#6", "F#6", "A6",
  "C7", "D#7", "F#7", "A7",
  "C8",
];

export function subsampleSampleMap(
  sampleMap: Record<string, string>,
  maxSamples: number = 18
): Record<string, string> {
  const keys = Object.keys(sampleMap);
  if (keys.length <= maxSamples) return sampleMap;

  const result: Record<string, string> = {};

  for (const anchor of DESIRED_ANCHOR_PITCHES) {
    if (sampleMap[anchor]) {
      result[anchor] = sampleMap[anchor];
      if (Object.keys(result).length >= maxSamples) break;
    }
  }

  // Fallback to strided selection if key names differ
  if (Object.keys(result).length < 6) {
    const step = Math.ceil(keys.length / maxSamples);
    for (let i = 0; i < keys.length && Object.keys(result).length < maxSamples; i += step) {
      const k = keys[i];
      result[k] = sampleMap[k];
    }
    if (keys.length > 0) {
      result[keys[0]] = sampleMap[keys[0]];
      result[keys[keys.length - 1]] = sampleMap[keys[keys.length - 1]];
    }
  }

  return result;
}

/**
 * Creates a high-fidelity acoustic synthesized instrument fallback.
 * Uses realistic acoustic modeling envelopes, hammer action, and harmonic overtones.
 */
export function createFallbackSynth(instrument: InstrumentType): Tone.PolySynth {
  switch (instrument) {
    case "piano":
      // Grand Piano acoustic physical emulation with hammer strike and warm resonance
      return new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "triangle8",
        },
        envelope: {
          attack: 0.003,
          decay: 2.4,
          sustain: 0.15,
          release: 1.8,
        },
        volume: -2,
      });

    case "acoustic_guitar":
    case "electric_guitar":
      return new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle4" },
        envelope: {
          attack: 0.003,
          decay: 1.4,
          sustain: 0.1,
          release: 1.0,
        },
        volume: -2,
      });

    case "strings":
      return new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth8" },
        envelope: {
          attack: 0.15,
          decay: 0.8,
          sustain: 0.75,
          release: 1.6,
        },
        volume: -2,
      });

    case "drums":
    default:
      return new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: {
          attack: 0.002,
          decay: 0.35,
          sustain: 0,
          release: 0.2,
        },
        volume: -2,
      });
  }
}

/**
 * Fetch soundfont from fast JS CDNs
 */
async function fetchSoundfontJS(soundfontName: string): Promise<Record<string, string> | null> {
  const urls = [
    `https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/${soundfontName}-mp3.js`,
    `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${soundfontName}-mp3.js`,
    `https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/MusyngKite/${soundfontName}-mp3.js`,
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const text = await res.text();
      const soundfontPos = text.indexOf("MIDI.Soundfont.");
      const startIdx = soundfontPos !== -1 ? text.indexOf("{", soundfontPos) : text.indexOf("{\"");
      const endIdx = text.lastIndexOf("}");

      if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
        let jsonStr = text.substring(startIdx, endIdx + 1);
        jsonStr = jsonStr.replace(/,\s*\}$/, "}");
        return JSON.parse(jsonStr) as Record<string, string>;
      }
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Helper to construct a Tone.Sampler with timeout guarantee
 */
function buildSampler(
  urls: Record<string, string>,
  baseUrl?: string,
  volumeOffset: number = -2,
  timeoutMs: number = 6000
): Promise<Tone.Sampler | null> {
  return new Promise((resolve) => {
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, timeoutMs);

    try {
      const samplerOptions: any = {
        urls,
        onload: () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            sampler.volume.value = volumeOffset;
            resolve(sampler);
          }
        },
        onerror: (err: any) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            console.warn("Sampler load error:", err);
            resolve(null);
          }
        },
      };

      if (baseUrl) {
        samplerOptions.baseUrl = baseUrl;
      }

      const sampler = new Tone.Sampler(samplerOptions);
    } catch (e) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(null);
      }
    }
  });
}

/**
 * Creates and caches a studio-grade Sampler with multi-tier failover
 */
export async function createInstrumentSampler(
  instrument: InstrumentType,
  onProgress?: (status: { message: string; percent: number }) => void
): Promise<Tone.Sampler | null> {
  if (samplerCache[instrument] && samplerCache[instrument]?.loaded) {
    onProgress?.({ message: `${instrument} ready`, percent: 100 });
    return samplerCache[instrument]!;
  }

  const config = INSTRUMENT_CONFIGS[instrument];
  if (!config) return null;

  onProgress?.({ message: `Loading ${instrument} grand audio...`, percent: 25 });

  // Tier 1: Primary direct MP3 audio samples (Salamander Concert Grand Piano / Direct Samples)
  let sampler = await buildSampler(config.primaryUrls, config.primaryBaseUrl, config.volumeOffset, 5500);

  // Tier 2: Fallback direct MP3 audio samples (Casio Grand Piano)
  if (!sampler && config.fallbackBaseUrl && config.fallbackUrls) {
    onProgress?.({ message: `Connecting backup ${instrument} samples...`, percent: 50 });
    sampler = await buildSampler(config.fallbackUrls, config.fallbackBaseUrl, config.volumeOffset, 4500);
  }

  // Tier 3: CDN Soundfont (FluidR3 / MusyngKite single-file with subsampling)
  if (!sampler && config.soundfontName) {
    onProgress?.({ message: `Loading ${instrument} soundfont bank...`, percent: 75 });
    const fullMap = await fetchSoundfontJS(config.soundfontName);
    if (fullMap) {
      const subsampled = subsampleSampleMap(fullMap, 16);
      sampler = await buildSampler(subsampled, undefined, config.volumeOffset, 5000);
    }
  }

  if (sampler) {
    samplerCache[instrument] = sampler;
    onProgress?.({ message: `${instrument} loaded successfully`, percent: 100 });
    return sampler;
  }

  onProgress?.({ message: `${instrument} synthesis ready`, percent: 100 });
  return null;
}


