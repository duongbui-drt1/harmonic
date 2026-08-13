export interface ChordNote {
  midi: number; // e.g. 60
  name: string; // e.g. "C"
  octave: number; // e.g. 4
  fullName: string; // e.g. "C4"
  isAccidental: boolean;
}

export interface ChordItem {
  id: string;
  name: string; // e.g. "Am7", "G", "Cmaj7"
  root: string; // e.g. "A", "G", "C"
  quality: string; // e.g. "m7", "major", "maj7"
  beats: number; // 1, 2, 4
  notes: string[]; // e.g. ["A3", "C4", "E4", "G4"]
  midiNotes: number[]; // e.g. [57, 60, 64, 67]
  romanNumeral?: string; // e.g. "vi", "I", "V7"
  velocity?: number; // 1 to 100% (default 80)
  sustain?: number; // 25 to 200% (default 100)
  noteVelocities?: Record<number, number>; // midi -> 1..100
  noteSustains?: Record<number, number>; // midi -> 25..200
}

export interface Progression {
  id: string;
  name: string;
  key: string; // e.g. "C"
  mode: "major" | "minor";
  bpm: number;
  timeSignature: "3/4" | "4/4" | "6/8";
  chords: ChordItem[];
  createdAt: number;
}

export type InstrumentType =
  | "piano"
  | "acoustic_guitar"
  | "electric_guitar"
  | "strings"
  | "drums";

export type AppTheme = "dark" | "light" | "girly";

export interface PresetProgression {
  id: string;
  title: string;
  genre: string;
  instrument?: InstrumentType;
  description: string;
  key: string;
  mode: "major" | "minor";
  bpm: number;
  timeSignature: "3/4" | "4/4" | "6/8";
  chords: Array<{ name: string; beats: number }>;
}

export interface GuitarFingering {
  chordName: string;
  frets: number[]; // 6 strings from low E to high E, -1 for muted, 0 for open
  fingers: number[]; // 0 for none/open, 1-4 for index to pinky
  barre?: { fret: number; startString: number; endString: number };
  capo?: boolean;
  baseFret?: number;
}

export interface AIAnalysisResult {
  key: string;
  romanAnalysis: string;
  emotionalCharacter: string;
  genreFit: string[];
  suggestedMelodyDirection: string;
  lyricMoodKeywords: string[];
  harmonicInsights: string;
}

export interface AIGenerationResult {
  key: string;
  mode: "major" | "minor";
  chords: Array<{ name: string; beats: number }>;
  explanation: string;
  mood: string;
  suggestedGenres: string[];
}
