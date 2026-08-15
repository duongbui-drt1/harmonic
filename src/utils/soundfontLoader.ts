import * as Tone from "tone";
import { InstrumentType } from "../types";

const SOUNDFONT_NAMES: Record<InstrumentType, string> = {
  piano: "acoustic_grand_piano",
  acoustic_guitar: "acoustic_guitar_nylon",
  electric_guitar: "electric_guitar_clean",
  strings: "violin",
  drums: "taiko_drum",
};

// Fast CDN endpoints with fallback
const SOUNDFONT_SOURCES = [
  (name: string) => `https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/${name}-mp3.js`,
  (name: string) => `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${name}-mp3.js`,
  (name: string) => `https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/MusyngKite/${name}-mp3.js`,
];

const samplerCache: Partial<Record<InstrumentType, Tone.Sampler>> = {};
const rawSamplesCache: Partial<Record<InstrumentType, Record<string, string>>> = {};

// Strategic anchor pitch classes across octaves to reduce decode overhead from 88 notes to ~20 notes.
// Tone.Sampler automatically repitches and interpolates intermediate semitones instantly with studio fidelity.
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
  maxSamples: number = 24
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

  // Fallback to strided selection if key names differ (e.g. MIDI note numbers or lowercase)
  if (Object.keys(result).length < 8) {
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
 * Creates a high-fidelity synthesized instrument fallback
 * Ensures 0ms latency and 100% reliability even if soundfonts are loading or offline
 */
export function createFallbackSynth(instrument: InstrumentType): Tone.PolySynth {
  switch (instrument) {
    case "piano":
      return new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle8" },
        envelope: {
          attack: 0.005,
          decay: 1.2,
          sustain: 0.25,
          release: 1.2,
        },
        volume: 0,
      });

    case "acoustic_guitar":
    case "electric_guitar":
      return new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle4" },
        envelope: {
          attack: 0.003,
          decay: 0.9,
          sustain: 0.15,
          release: 0.8,
        },
        volume: 0,
      });

    case "strings":
      return new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth8" },
        envelope: {
          attack: 0.12,
          decay: 0.6,
          sustain: 0.7,
          release: 1.4,
        },
        volume: -2,
      });

    case "drums":
    default:
      return new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: {
          attack: 0.002,
          decay: 0.3,
          sustain: 0,
          release: 0.2,
        },
        volume: 0,
      });
  }
}

export async function loadSoundfontSampleMap(
  instrument: InstrumentType,
  onProgress?: (progress: number) => void
): Promise<Record<string, string> | null> {
  if (rawSamplesCache[instrument]) {
    onProgress?.(100);
    return rawSamplesCache[instrument]!;
  }

  const name = SOUNDFONT_NAMES[instrument];
  if (!name) return null;

  for (let i = 0; i < SOUNDFONT_SOURCES.length; i++) {
    const getUrl = SOUNDFONT_SOURCES[i];
    const url = getUrl(name);

    try {
      onProgress?.(15 + i * 10);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        continue;
      }
      onProgress?.(50);

      const text = await response.text();
      onProgress?.(70);

      // Extract JSON object from JS soundfont file (MIDI.Soundfont.instrument_name = { ... })
      const soundfontPos = text.indexOf("MIDI.Soundfont.");
      const startIdx = soundfontPos !== -1 ? text.indexOf("{", soundfontPos) : text.indexOf("{\"");
      const endIdx = text.lastIndexOf("}");

      if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
        continue;
      }

      let jsonStr = text.substring(startIdx, endIdx + 1);
      jsonStr = jsonStr.replace(/,\s*\}$/, "}");

      const samples = JSON.parse(jsonStr) as Record<string, string>;
      rawSamplesCache[instrument] = samples;
      onProgress?.(100);
      return samples;
    } catch {
      // Try next source
      continue;
    }
  }

  console.warn(`Could not load external soundfont for ${instrument}, using synthesis engine`);
  return null;
}

export async function createInstrumentSampler(
  instrument: InstrumentType,
  onProgress?: (status: { message: string; percent: number }) => void
): Promise<Tone.Sampler | null> {
  if (samplerCache[instrument] && samplerCache[instrument]?.loaded) {
    onProgress?.({ message: `${instrument} ready`, percent: 100 });
    return samplerCache[instrument]!;
  }

  onProgress?.({ message: `Fetching ${instrument} soundfont...`, percent: 20 });
  const fullSampleMap = await loadSoundfontSampleMap(instrument, (p) => {
    onProgress?.({ message: `Downloading ${instrument} samples...`, percent: 20 + p * 0.4 });
  });

  if (!fullSampleMap || Object.keys(fullSampleMap).length === 0) {
    onProgress?.({ message: `${instrument} synthesis ready`, percent: 100 });
    return null;
  }

  // Subsample to ~20 anchor samples so WebAudio decodes in <300ms instead of timing out
  const sampleMap = subsampleSampleMap(fullSampleMap, 24);

  onProgress?.({ message: `Decoding audio buffers for ${instrument}...`, percent: 75 });

  return new Promise((resolve) => {
    let resolved = false;

    // Generous safety timer of 12s
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn(`Tone.Sampler load timed out for ${instrument}, using fallback`);
        resolve(null);
      }
    }, 12000);

    try {
      const sampler = new Tone.Sampler({
        urls: sampleMap,
        onload: () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            onProgress?.({ message: `${instrument} loaded successfully`, percent: 100 });
            sampler.volume.value = 3; // Balanced gain
            samplerCache[instrument] = sampler;
            resolve(sampler);
          }
        },
        onerror: (err) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            console.warn(`Error in Tone.Sampler for ${instrument}:`, err);
            resolve(null);
          }
        },
      });
    } catch (e) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        console.warn(`Tone.Sampler instantiation error:`, e);
        resolve(null);
      }
    }
  });
}

