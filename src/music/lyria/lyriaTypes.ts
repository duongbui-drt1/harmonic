export type LyriaPreviewMode =
  | "pure_harmony"
  | "styled_preview"
  | "reharmonization"
  | "chord_understanding";

export interface ChordSymbolInput {
  name: string;
  beats?: number;
  romanNumeral?: string;
  functionRole?: string;
}

export interface HarmonicPreviewContext {
  progression: ChordSymbolInput[];
  key: string; // e.g. "C Major"
  mode: "major" | "minor";
  bpm: number;
  timeSignature: string; // "4/4", "3/4", "6/8"
  harmonicFunctions?: string[];
  tensionProfile?: number[];
  genre?: string; // e.g. "J-Pop", "City Pop", "Neo Soul", "Jazz", "Lo-Fi", etc.
  selectedChord?: ChordSymbolInput;
  chordContextMode?: "alone" | "resolution" | "jpop" | "jazz" | "cinematic";
  reharmonizedProgression?: ChordSymbolInput[];
  previewMode: LyriaPreviewMode;
  instrumentation?: string[];
  energy?: "low" | "medium" | "high";
  density?: "sparse" | "moderate" | "dense";
  durationSeconds?: number;
  customInstructions?: string;
  isReharmonizedVariant?: boolean;
}

export interface LyriaAudioResult {
  success: boolean;
  audio?: string; // Base64 encoded audio chunk/file
  mimeType?: string; // e.g. "audio/wav"
  prompt?: string;
  cached?: boolean;
  error?: string;
  isQuotaError?: boolean;
  previewMode?: LyriaPreviewMode;
  lyrics?: string;
}

export interface LyriaStylePreset {
  id: string;
  name: string;
  genreCategory: string;
  description: string;
  instrumentation: string[];
  defaultTempoRange: [number, number];
  moodKeywords: string[];
}
