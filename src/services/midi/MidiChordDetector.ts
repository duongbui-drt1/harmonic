import { NOTE_NAMES_SHARP, NOTE_NAMES_FLAT, midiToNoteName } from "../../utils/noteNames";

export interface ChordPattern {
  quality: string;
  symbol: string;
  vietnameseName: string;
  intervals: number[]; // semitones relative to root
  priority: number;
}

export const MIDI_CHORD_PATTERNS: ChordPattern[] = [
  // Triads
  { quality: "major", symbol: "", vietnameseName: "trưởng", intervals: [0, 4, 7], priority: 100 },
  { quality: "minor", symbol: "m", vietnameseName: "thứ", intervals: [0, 3, 7], priority: 100 },
  { quality: "diminished", symbol: "dim", vietnameseName: "giảm", intervals: [0, 3, 6], priority: 90 },
  { quality: "augmented", symbol: "aug", vietnameseName: "tăng", intervals: [0, 4, 8], priority: 90 },
  { quality: "sus2", symbol: "sus2", vietnameseName: "treo 2", intervals: [0, 2, 7], priority: 85 },
  { quality: "sus4", symbol: "sus4", vietnameseName: "treo 4", intervals: [0, 5, 7], priority: 85 },

  // 7th Chords
  { quality: "major7", symbol: "maj7", vietnameseName: "trưởng bảy", intervals: [0, 4, 7, 11], priority: 95 },
  { quality: "minor7", symbol: "m7", vietnameseName: "thứ bảy", intervals: [0, 3, 7, 10], priority: 95 },
  { quality: "dominant7", symbol: "7", vietnameseName: "át bảy (bảy át)", intervals: [0, 4, 7, 10], priority: 95 },
  { quality: "diminished7", symbol: "dim7", vietnameseName: "giảm bảy", intervals: [0, 3, 6, 9], priority: 90 },
  { quality: "halfDiminished7", symbol: "m7b5", vietnameseName: "nửa giảm bảy", intervals: [0, 3, 6, 10], priority: 90 },
  { quality: "minorMajor7", symbol: "m(maj7)", vietnameseName: "thứ trưởng bảy", intervals: [0, 3, 7, 11], priority: 80 },

  // 6th & Add Chords
  { quality: "6", symbol: "6", vietnameseName: "sáu", intervals: [0, 4, 7, 9], priority: 85 },
  { quality: "minor6", symbol: "m6", vietnameseName: "thứ sáu", intervals: [0, 3, 7, 9], priority: 85 },
  { quality: "add9", symbol: "add9", vietnameseName: "thêm chín", intervals: [0, 2, 4, 7], priority: 85 },
  { quality: "minorAdd9", symbol: "madd9", vietnameseName: "thứ thêm chín", intervals: [0, 2, 3, 7], priority: 85 },

  // 9th Chords
  { quality: "major9", symbol: "maj9", vietnameseName: "trưởng chín", intervals: [0, 2, 4, 7, 11], priority: 80 },
  { quality: "minor9", symbol: "m9", vietnameseName: "thứ chín", intervals: [0, 2, 3, 7, 10], priority: 80 },
  { quality: "dominant9", symbol: "9", vietnameseName: "át chín", intervals: [0, 2, 4, 7, 10], priority: 80 },

  // Power Chords & 5ths
  { quality: "power", symbol: "5", vietnameseName: "quãng năm (power)", intervals: [0, 7], priority: 70 },
];

export interface DetectedMidiChord {
  symbol: string; // e.g. "Cmaj7" or "Am"
  root: string; // e.g. "C"
  quality: string; // e.g. "maj7"
  vietnameseTitle: string; // e.g. "C trưởng bảy (Cmaj7)"
  vietnameseQuality: string; // e.g. "Trưởng bảy"
  inversionText?: string; // e.g. "Đảo thứ nhất (Bass E)"
  bassNote: string; // e.g. "C" or "E"
  isSlashChord: boolean;
  notes: string[]; // e.g. ["C4", "E4", "G4", "B4"]
  pitchClasses: string[]; // e.g. ["C", "E", "G", "B"]
  confidence: number; // 0..1
  formula: string; // e.g. "1 - 3 - 5 - 7"
}

/**
 * Detects chord from an array of currently active MIDI note numbers
 */
export function detectMidiChord(activeMidis: number[]): DetectedMidiChord | null {
  if (!activeMidis || activeMidis.length === 0) {
    return null;
  }

  // Single note
  if (activeMidis.length === 1) {
    const midi = activeMidis[0];
    const pc = ((midi % 12) + 12) % 12;
    const noteName = NOTE_NAMES_SHARP[pc];
    const fullNoteName = midiToNoteName(midi);
    return {
      symbol: noteName,
      root: noteName,
      quality: "single",
      vietnameseTitle: `Nốt đơn ${noteName} (${fullNoteName})`,
      vietnameseQuality: "Nốt đơn",
      bassNote: noteName,
      isSlashChord: false,
      notes: [fullNoteName],
      pitchClasses: [noteName],
      confidence: 1.0,
      formula: "1",
    };
  }

  // Sort ascending by pitch
  const sortedMidis = [...activeMidis].sort((a, b) => a - b);
  const bassMidi = sortedMidis[0];
  const bassPc = ((bassMidi % 12) + 12) % 12;
  const bassNote = NOTE_NAMES_SHARP[bassPc];

  // Unique pitch classes
  const uniquePcs = Array.from(new Set(sortedMidis.map((m) => ((m % 12) + 12) % 12)));

  // Two notes interval detection
  if (uniquePcs.length === 2) {
    const semitones = (uniquePcs[1] - uniquePcs[0] + 12) % 12;
    const root = NOTE_NAMES_SHARP[uniquePcs[0]];
    const intervalNames: Record<number, { vi: string; symbol: string }> = {
      1: { vi: "Quãng 2 thứ (1 nửa cung)", symbol: "m2" },
      2: { vi: "Quãng 2 trưởng (2 nửa cung)", symbol: "M2" },
      3: { vi: "Quãng 3 thứ (3 nửa cung)", symbol: "m3" },
      4: { vi: "Quãng 3 trưởng (4 nửa cung)", symbol: "M3" },
      5: { vi: "Quãng 4 đúng (5 nửa cung)", symbol: "P4" },
      6: { vi: "Quãng 5 giảm / Tritone (6 nửa cung)", symbol: "TT" },
      7: { vi: "Quãng 5 đúng (7 nửa cung)", symbol: "5" },
      8: { vi: "Quãng 6 thứ (8 nửa cung)", symbol: "m6" },
      9: { vi: "Quãng 6 trưởng (9 nửa cung)", symbol: "M6" },
      10: { vi: "Quãng 7 thứ (10 nửa cung)", symbol: "m7" },
      11: { vi: "Quãng 7 trưởng (11 nửa cung)", symbol: "M7" },
    };

    const intervalInfo = intervalNames[semitones] || { vi: "Khoảng quãng", symbol: "" };
    return {
      symbol: `${root}${intervalInfo.symbol}`,
      root,
      quality: "interval",
      vietnameseTitle: `${intervalInfo.vi} (${root} - ${NOTE_NAMES_SHARP[uniquePcs[1]]})`,
      vietnameseQuality: intervalInfo.vi,
      bassNote,
      isSlashChord: false,
      notes: sortedMidis.map((m) => midiToNoteName(m)),
      pitchClasses: uniquePcs.map((pc) => NOTE_NAMES_SHARP[pc]),
      confidence: 0.9,
      formula: `0, +${semitones}`,
    };
  }

  interface Candidate {
    chord: DetectedMidiChord;
    score: number;
  }

  const candidates: Candidate[] = [];

  // Evaluate each pitch class present in the input as candidate root
  for (const rootPc of uniquePcs) {
    const rootName = NOTE_NAMES_SHARP[rootPc];
    const intervalsFromRoot = uniquePcs
      .map((pc) => (pc - rootPc + 12) % 12)
      .sort((a, b) => a - b);

    for (const pat of MIDI_CHORD_PATTERNS) {
      const patIntervals = Array.from(new Set(pat.intervals.map((i) => i % 12))).sort((a, b) => a - b);

      const matchedCount = intervalsFromRoot.filter((i) => patIntervals.includes(i)).length;
      const extraCount = intervalsFromRoot.filter((i) => !patIntervals.includes(i)).length;
      const missingCount = patIntervals.filter((i) => !intervalsFromRoot.includes(i)).length;

      if (matchedCount === 0) continue;

      const isExactMatch = matchedCount === patIntervals.length && extraCount === 0;
      const isSubset = matchedCount === patIntervals.length && extraCount > 0;
      const isMissingTone = extraCount === 0 && missingCount === 1 && patIntervals.length >= 4; // 7th chord with omitted 5th is common

      let score = 0;
      if (isExactMatch) {
        score = 100 + pat.priority;
      } else if (isMissingTone) {
        score = 80 + pat.priority;
      } else if (isSubset) {
        score = 60 + pat.priority - extraCount * 15;
      } else {
        score = (matchedCount / patIntervals.length) * 50 - extraCount * 15;
      }

      const isRootInBass = rootName === bassNote;
      if (isRootInBass) {
        score += 20;
      } else if (patIntervals.includes((bassPc - rootPc + 12) % 12)) {
        // Bass is a recognized chord inversion tone
        score += 10;
      }

      if (score >= 45) {
        const isSlash = !isRootInBass;
        const chordSymbol = `${rootName}${pat.symbol}${isSlash ? "/" + bassNote : ""}`;

        let inversionText = undefined;
        if (isSlash) {
          const bassInterval = (bassPc - rootPc + 12) % 12;
          if (bassInterval === 3 || bassInterval === 4) {
            inversionText = "Đảo thứ nhất (Bass nốt quãng ba)";
          } else if (bassInterval === 6 || bassInterval === 7) {
            inversionText = "Đảo thứ hai (Bass nốt quãng năm)";
          } else if (bassInterval === 9 || bassInterval === 10 || bassInterval === 11) {
            inversionText = "Đảo thứ ba (Bass nốt quãng bảy)";
          } else {
            inversionText = `Bass ${bassNote}`;
          }
        }

        const viTitle = `${rootName} ${pat.vietnameseName} (${rootName}${pat.symbol})${
          isSlash ? ` / ${bassNote}` : ""
        }`;

        candidates.push({
          score,
          chord: {
            symbol: chordSymbol,
            root: rootName,
            quality: pat.quality,
            vietnameseTitle: viTitle,
            vietnameseQuality: pat.vietnameseName.charAt(0).toUpperCase() + pat.vietnameseName.slice(1),
            inversionText,
            bassNote,
            isSlashChord: isSlash,
            notes: sortedMidis.map((m) => midiToNoteName(m)),
            pitchClasses: uniquePcs.map((pc) => NOTE_NAMES_SHARP[pc]),
            confidence: Math.min(1.0, Math.max(0.2, score / 150)),
            formula: pat.intervals.join(" - "),
          },
        });
      }
    }
  }

  if (candidates.length === 0) {
    return {
      symbol: "Chưa nhận diện",
      root: bassNote,
      quality: "unknown",
      vietnameseTitle: "Chưa nhận diện được hợp âm",
      vietnameseQuality: "Không xác định",
      bassNote,
      isSlashChord: false,
      notes: sortedMidis.map((m) => midiToNoteName(m)),
      pitchClasses: uniquePcs.map((pc) => NOTE_NAMES_SHARP[pc]),
      confidence: 0.1,
      formula: "",
    };
  }

  // Return highest score candidate
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].chord;
}
