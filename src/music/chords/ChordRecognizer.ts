import { RecognitionCandidate, SemanticChordSymbol } from "../types";
import { QUALITY_DEFINITIONS, NOTE_NAMES_SHARP, NOTE_NAMES_FLAT, pitchClassToMidiValue, midiToPitchClass, formatChordSymbol } from "./ChordSymbol";

export interface RecognitionOptions {
  keyContext?: string;
  prevChord?: string;
  nextChord?: string;
}

export function recognizeChordFromNotes(
  notesOrMidis: Array<number | string>,
  options: RecognitionOptions = {}
): RecognitionCandidate[] {
  if (!notesOrMidis || notesOrMidis.length === 0) {
    return [];
  }

  // Convert all input to MIDI numbers
  const midis: number[] = notesOrMidis.map((n) => {
    if (typeof n === "number") return n;
    // Parse note name like "C4" or "F#3" or "Eb"
    const match = n.match(/^([A-G][#b]?)(-?\d+)?$/i);
    if (!match) return 60;
    const pc = match[1].charAt(0).toUpperCase() + (match[1].slice(1) === "b" ? "b" : match[1].slice(1) === "#" ? "#" : "");
    const oct = match[2] ? parseInt(match[2], 10) : 4;
    return (oct + 1) * 12 + pitchClassToMidiValue(pc);
  }).sort((a, b) => a - b);

  const bassMidi = midis[0];
  const preferFlats = options.keyContext ? ["F", "Bb", "Eb", "Ab", "Db", "Fm", "Bbm", "Ebm"].includes(options.keyContext) : false;
  const bassNote = midiToPitchClass(bassMidi, preferFlats);

  // Extract unique pitch classes (0..11)
  const pitchClasses = Array.from(new Set(midis.map((m) => ((m % 12) + 12) % 12)));

  const candidates: RecognitionCandidate[] = [];

  // Test every possible root (0..11)
  const allRoots = preferFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;

  for (let r = 0; r < 12; r++) {
    const rootName = allRoots[r];
    const rootMidiVal = r;

    // Calculate intervals relative to this root
    const intervalsFromRoot = pitchClasses
      .map((pc) => (pc - rootMidiVal + 12) % 12)
      .sort((a, b) => a - b);

    // Test against all quality definitions
    for (const def of QUALITY_DEFINITIONS) {
      const defPCS = Array.from(new Set(def.intervals.map((i) => i % 12))).sort((a, b) => a - b);

      // Check how well pitchClasses match defPCS
      const matchedCount = intervalsFromRoot.filter((i) => defPCS.includes(i)).length;
      const totalDefCount = defPCS.length;
      const extraCount = intervalsFromRoot.filter((i) => !defPCS.includes(i)).length;

      if (matchedCount === 0) continue;

      // Base confidence score
      let score = (matchedCount / totalDefCount) * 80 - extraCount * 12;

      // Bonus if bass matches root (root position)
      const isBassRoot = bassNote === rootName;
      if (isBassRoot) {
        score += 15;
      } else if (defPCS.includes((pitchClassToMidiValue(bassNote) - rootMidiVal + 12) % 12)) {
        // Bass is a valid chord tone (inversion/slash bass)
        score += 8;
      }

      // Bonus if key context aligns with this root
      if (options.keyContext && options.keyContext.startsWith(rootName)) {
        score += 5;
      }

      // Perfect match bonus
      if (matchedCount === totalDefCount && extraCount === 0) {
        score += 10;
      }

      const clampedScore = Math.max(10, Math.min(99, Math.round(score)));

      if (clampedScore >= 35) {
        let inv = 0;
        let slashBass: string | undefined = undefined;
        if (!isBassRoot) {
          slashBass = bassNote;
          const bassInterval = (pitchClassToMidiValue(bassNote) - rootMidiVal + 12) % 12;
          const idxInChord = defPCS.indexOf(bassInterval);
          inv = idxInChord !== -1 ? idxInChord : 1;
        }

        const chordSymbol: SemanticChordSymbol = {
          root: rootName,
          quality: def.quality,
          extensions: [],
          alterations: [],
          bass: slashBass,
          inversion: inv,
          fullName: `${rootName}${def.canonicalName}${slashBass ? "/" + slashBass : ""}`,
        };

        const desc = isBassRoot
          ? `${rootName} ${def.quality} in root position`
          : `${rootName} ${def.quality} over ${bassNote} bass (${def.formula})`;

        candidates.push({
          chordSymbol,
          confidenceScore: clampedScore,
          description: desc,
          isSlashChord: !isBassRoot,
          bassNote,
        });
      }
    }
  }

  // Deduplicate and sort by confidence score descending
  const uniqueMap = new Map<string, RecognitionCandidate>();
  for (const cand of candidates) {
    const key = cand.chordSymbol.fullName;
    if (!uniqueMap.has(key) || uniqueMap.get(key)!.confidenceScore < cand.confidenceScore) {
      uniqueMap.set(key, cand);
    }
  }

  const sorted = Array.from(uniqueMap.values()).sort((a, b) => b.confidenceScore - a.confidenceScore);

  // Example case: C E G A -> Am7 (72%), C6 (67%)
  return sorted.slice(0, 5);
}

export interface ChordRecognitionResult {
  bestMatch?: {
    symbol: SemanticChordSymbol;
    confidence: number;
  };
  candidates: RecognitionCandidate[];
}

export const ChordRecognizer = {
  recognize(
    notesOrMidis: Array<number | string>,
    options: RecognitionOptions = {}
  ): ChordRecognitionResult {
    const candidates = recognizeChordFromNotes(notesOrMidis, options);
    const top = candidates[0];
    return {
      bestMatch: top
        ? {
            symbol: top.chordSymbol,
            confidence: top.confidenceScore / 100,
          }
        : undefined,
      candidates,
    };
  },
  recognizeFromNotes: recognizeChordFromNotes,
};
