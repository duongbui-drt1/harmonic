import { ChordItem } from "../../types";
import { HarmonicPreviewContext, LyriaPreviewMode } from "./lyriaTypes";
import { classifyHarmonicFunction } from "../harmony/FunctionClassifier";
import { calculateHarmonicTension } from "../harmony/TensionEngine";
import { generateHarmonicMutations } from "../harmony/HarmonicMutator";

export function createHarmonicPreviewContext(params: {
  chords: ChordItem[];
  keyName: string; // e.g. "C Major"
  bpm: number;
  timeSignature: string;
  previewMode?: LyriaPreviewMode;
  genreId?: string;
  selectedChord?: ChordItem;
  chordContextMode?: "alone" | "resolution" | "jpop" | "jazz" | "cinematic";
  customInstructions?: string;
  durationSeconds?: number;
}): HarmonicPreviewContext {
  const {
    chords,
    keyName,
    bpm,
    timeSignature,
    previewMode = "pure_harmony",
    genreId = "pure_harmony",
    selectedChord,
    chordContextMode = "alone",
    customInstructions,
    durationSeconds = 15,
  } = params;

  // Extract root and mode from keyName
  const keyParts = keyName.split(" ");
  const keyRoot = keyParts[0] || "C";
  const mode = keyParts[1]?.toLowerCase() === "minor" ? "minor" : "major";

  // Calculate deterministic functions & tension
  const functions = chords.map((c, i) => {
    const nextChord = chords[i + 1]?.name;
    const analysis = classifyHarmonicFunction(c.name, keyRoot, mode, nextChord);
    return analysis.role;
  });

  const tensionScores = chords.map((c) => {
    return calculateHarmonicTension(c.name, keyRoot, mode).totalScore;
  });

  // Calculate mutated progression if reharmonization mode
  let reharmonizedChords: Array<{ name: string; beats?: number }> = [];
  if (chords.length > 0) {
    const mutations = generateHarmonicMutations(
      chords.map((c) => ({ name: c.name, beats: c.beats })),
      keyRoot
    );
    if (mutations.length > 0) {
      reharmonizedChords = mutations[0].mutatedChords;
    }
  }

  return {
    progression: chords.map((c) => ({
      name: c.name,
      beats: c.beats,
      romanNumeral: c.romanNumeral,
    })),
    key: keyName,
    mode,
    bpm,
    timeSignature,
    harmonicFunctions: functions,
    tensionProfile: tensionScores,
    genre: genreId,
    selectedChord: selectedChord
      ? { name: selectedChord.name, beats: selectedChord.beats, romanNumeral: selectedChord.romanNumeral }
      : undefined,
    chordContextMode,
    reharmonizedProgression: reharmonizedChords.map((c) => ({ name: c.name, beats: c.beats })),
    previewMode,
    durationSeconds,
    customInstructions,
  };
}
