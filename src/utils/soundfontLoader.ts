import * as Tone from "tone";
import { InstrumentType } from "../types";

const SOUNDFONT_URLS: Record<InstrumentType, string> = {
  piano: "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/acoustic_grand_piano-mp3.js",
  acoustic_guitar: "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/acoustic_guitar_nylon-mp3.js",
  electric_guitar: "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/electric_guitar_clean-mp3.js",
  strings: "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/violin-mp3.js",
  drums: "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/taiko_drum-mp3.js",
};

const samplerCache: Partial<Record<InstrumentType, Tone.Sampler>> = {};
const rawSamplesCache: Partial<Record<InstrumentType, Record<string, string>>> = {};

export async function loadSoundfontSampleMap(
  instrument: InstrumentType,
  onProgress?: (progress: number) => void
): Promise<Record<string, string>> {
  if (rawSamplesCache[instrument]) {
    onProgress?.(100);
    return rawSamplesCache[instrument]!;
  }

  const url = SOUNDFONT_URLS[instrument];
  onProgress?.(10);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load SoundFont for ${instrument}: ${response.statusText}`);
  }
  onProgress?.(40);

  const text = await response.text();
  onProgress?.(70);

  // Extract JSON object from JS soundfont file (MIDI.Soundfont.instrument_name = { ... })
  const soundfontPos = text.indexOf("MIDI.Soundfont.");
  const startIdx = soundfontPos !== -1 ? text.indexOf("{", soundfontPos) : text.indexOf("{\"");
  const endIdx = text.lastIndexOf("}");

  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
    throw new Error(`Invalid SoundFont format for ${instrument}`);
  }

  let jsonStr = text.substring(startIdx, endIdx + 1);
  // Clean trailing comma before closing brace if present
  jsonStr = jsonStr.replace(/,\s*\}$/, "}");

  const samples = JSON.parse(jsonStr) as Record<string, string>;

  rawSamplesCache[instrument] = samples;
  onProgress?.(100);
  return samples;
}

export async function createInstrumentSampler(
  instrument: InstrumentType,
  onProgress?: (status: { message: string; percent: number }) => void
): Promise<Tone.Sampler> {
  if (samplerCache[instrument]) {
    onProgress?.({ message: `${instrument} ready`, percent: 100 });
    return samplerCache[instrument]!;
  }

  onProgress?.({ message: `Fetching ${instrument} soundfont...`, percent: 20 });
  const sampleMap = await loadSoundfontSampleMap(instrument, (p) => {
    onProgress?.({ message: `Downloading ${instrument} samples...`, percent: 20 + p * 0.4 });
  });

  onProgress?.({ message: `Decoding audio buffers for ${instrument}...`, percent: 70 });

  return new Promise((resolve, reject) => {
    const sampler = new Tone.Sampler({
      urls: sampleMap,
      onload: () => {
        onProgress?.({ message: `${instrument} loaded successfully`, percent: 100 });
        sampler.volume.value = 6; // High gain boost for soundfont samples
        samplerCache[instrument] = sampler;
        resolve(sampler);
      },
      onerror: (err) => {
        console.error(`Error loading Tone.Sampler for ${instrument}`, err);
        reject(err);
      },
    }).toDestination();
  });
}
