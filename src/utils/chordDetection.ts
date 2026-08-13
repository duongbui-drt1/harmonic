import { NOTE_NAMES_SHARP, NOTE_NAMES_FLAT } from "./noteNames";

interface Pattern {
  quality: string;
  symbol: string;
  intervals: number[];
}

const PATTERNS: Pattern[] = [
  { quality: "Major", symbol: "", intervals: [0, 4, 7] },
  { quality: "Minor", symbol: "m", intervals: [0, 3, 7] },
  { quality: "Dominant 7th", symbol: "7", intervals: [0, 4, 7, 10] },
  { quality: "Major 7th", symbol: "maj7", intervals: [0, 4, 7, 11] },
  { quality: "Minor 7th", symbol: "m7", intervals: [0, 3, 7, 10] },
  { quality: "Diminished", symbol: "dim", intervals: [0, 3, 6] },
  { quality: "Diminished 7th", symbol: "dim7", intervals: [0, 3, 6, 9] },
  { quality: "Half-Diminished", symbol: "m7b5", intervals: [0, 3, 6, 10] },
  { quality: "Augmented", symbol: "aug", intervals: [0, 4, 8] },
  { quality: "Sus2", symbol: "sus2", intervals: [0, 2, 7] },
  { quality: "Sus4", symbol: "sus4", intervals: [0, 5, 7] },
  { quality: "Add9", symbol: "add9", intervals: [0, 2, 4, 7] },
  { quality: "mAdd9", symbol: "madd9", intervals: [0, 2, 3, 7] },
  { quality: "Major 6th", symbol: "6", intervals: [0, 4, 7, 9] },
  { quality: "Minor 6th", symbol: "m6", intervals: [0, 3, 7, 9] },
  { quality: "9th", symbol: "9", intervals: [0, 2, 4, 7, 10] },
  { quality: "Major 9th", symbol: "maj9", intervals: [0, 2, 4, 7, 11] },
  { quality: "Minor 9th", symbol: "m9", intervals: [0, 2, 3, 7, 10] },
];

export interface DetectedChord {
  name: string; // e.g. "Cmaj7"
  root: string; // e.g. "C"
  quality: string; // e.g. "maj7"
  fullQualityName: string; // e.g. "Major 7th"
  confidence: number;
}

export function detectChordFromMidiNotes(midiNotes: number[]): DetectedChord | null {
  if (!midiNotes || midiNotes.length === 0) return null;

  // Single note
  if (midiNotes.length === 1) {
    const pc = (midiNotes[0] % 12 + 12) % 12;
    const rootName = NOTE_NAMES_SHARP[pc];
    return {
      name: rootName,
      root: rootName,
      quality: "",
      fullQualityName: "Single Note",
      confidence: 1,
    };
  }

  // Get unique pitch classes (0-11) sorted
  const pitchClasses = Array.from(new Set(midiNotes.map((m) => (m % 12 + 12) % 12))).sort((a, b) => a - b);

  // Try each pitch class in the input as candidate root
  for (const rootPc of pitchClasses) {
    const relativeIntervals = Array.from(
      new Set(pitchClasses.map((pc) => (pc - rootPc + 12) % 12))
    ).sort((a, b) => a - b);

    // Test against patterns
    for (const pat of PATTERNS) {
      const patIntervals = Array.from(new Set(pat.intervals.map((i) => i % 12))).sort((a, b) => a - b);
      if (
        patIntervals.length === relativeIntervals.length &&
        patIntervals.every((val, idx) => val === relativeIntervals[idx])
      ) {
        const rootName = NOTE_NAMES_SHARP[rootPc];
        return {
          name: `${rootName}${pat.symbol}`,
          root: rootName,
          quality: pat.symbol,
          fullQualityName: pat.quality,
          confidence: 1,
        };
      }
    }
  }

  // Fallback: search for best partial match
  for (const rootPc of pitchClasses) {
    const relativeIntervals = Array.from(
      new Set(pitchClasses.map((pc) => (pc - rootPc + 12) % 12))
    ).sort((a, b) => a - b);

    for (const pat of PATTERNS) {
      const patIntervals = Array.from(new Set(pat.intervals.map((i) => i % 12))).sort((a, b) => a - b);
      const isSubset = patIntervals.every((i) => relativeIntervals.includes(i));
      if (isSubset) {
        const rootName = NOTE_NAMES_SHARP[rootPc];
        return {
          name: `${rootName}${pat.symbol}`,
          root: rootName,
          quality: pat.symbol,
          fullQualityName: pat.quality,
          confidence: 0.8,
        };
      }
    }
  }

  // If no match found, output pitch names
  const rootPc = pitchClasses[0];
  const rootName = NOTE_NAMES_SHARP[rootPc];
  return {
    name: `${rootName} (Custom)`,
    root: rootName,
    quality: "Custom",
    fullQualityName: "Custom Cluster",
    confidence: 0.5,
  };
}
