export type PitchClass =
  | "C"
  | "C#"
  | "Db"
  | "D"
  | "D#"
  | "Eb"
  | "E"
  | "F"
  | "F#"
  | "Gb"
  | "G"
  | "G#"
  | "Ab"
  | "A"
  | "A#"
  | "Bb"
  | "B";

export type ChordQuality =
  | "major"
  | "minor"
  | "diminished"
  | "augmented"
  | "sus2"
  | "sus4"
  | "dominant7"
  | "major7"
  | "minor7"
  | "diminished7"
  | "halfDiminished7"
  | "6"
  | "minor6"
  | "add9"
  | "minorAdd9"
  | "dominant9"
  | "major9"
  | "minor9"
  | "dominant11"
  | "minor11"
  | "major11"
  | "dominant13"
  | "minor13"
  | "major13"
  | "alteredDominant"
  | "susDominant"
  | "power";

export type Extension =
  | "6"
  | "m6"
  | "7"
  | "maj7"
  | "m7"
  | "add9"
  | "madd9"
  | "9"
  | "maj9"
  | "m9"
  | "11"
  | "m11"
  | "maj11"
  | "13"
  | "m13"
  | "maj13";

export type Alteration = "b5" | "#5" | "b9" | "#9" | "#11" | "b13" | "sus2" | "sus4";

export interface SemanticChordSymbol {
  root: string;
  quality: ChordQuality;
  extensions: Extension[];
  alterations: Alteration[];
  bass?: string;
  inversion?: number; // 0 = root position, 1 = 1st, 2 = 2nd, 3 = 3rd
  fullName: string;
}

export interface RecognitionCandidate {
  chordSymbol: SemanticChordSymbol;
  confidenceScore: number; // 0 to 100%
  description: string;
  isSlashChord: boolean;
  bassNote: string;
}

export type HarmonicFunctionRole =
  | "Tonic"
  | "Predominant"
  | "Dominant"
  | "Passing"
  | "Substitute"
  | "Borrowed"
  | "Secondary Dominant"
  | "Secondary Leading-Tone"
  | "Chromatic Color"
  | "Ambiguous";

export interface HarmonicFunctionAnalysis {
  chordName: string;
  role: HarmonicFunctionRole;
  explanation: string;
  tendencyToResolveTo?: string;
  colorHex: string;
}

export interface DetailedRomanNumeral {
  roman: string; // e.g. "V7/ii", "bVI", "ii7"
  type: "diatonic" | "secondary_dominant" | "secondary_leading" | "borrowed" | "tritone_sub" | "backdoor" | "chromatic_mediant" | "passing" | "pivot";
  explanation: string;
  functionRole: HarmonicFunctionRole;
  appliedTarget?: string;
}

export interface VoiceLeadingNoteMotion {
  fromNote: string;
  toNote: string;
  fromMidi: number;
  toMidi: number;
  semitones: number; // positive = ascending, negative = descending, 0 = common tone
  motionType: "common_tone" | "step_up" | "step_down" | "leap_up" | "leap_down";
}

export interface VoiceLeadingComparison {
  chordA: string;
  chordB: string;
  noteMotions: VoiceLeadingNoteMotion[];
  commonTones: string[];
  totalSemitoneMovement: number;
  averageMovement: number;
  smoothnessScore: number; // 0 to 100%
  parallel5thsOrOctaves: boolean;
}

export interface SmootherVoicingOption {
  voicingName: string;
  midiNotes: number[];
  noteNames: string[];
  inversion: number;
  totalMovement: number;
  smoothnessScore: number;
}

export interface TensionScore {
  chordName: string;
  totalScore: number; // 0 to 100%
  dissonance: number;
  dominantDrive: number;
  chromaticism: number;
  instability: number;
  distanceFromTonic: number;
  explanation: string;
}

export interface MutationVariant {
  title: string;
  category:
    | "Borrowed Chord"
    | "Secondary Dominant"
    | "Secondary Leading Tone"
    | "Tritone Substitution"
    | "Inversion / Slash Bass"
    | "Chromatic Approach"
    | "Upper Extension"
    | "Altered Dominant"
    | "Modal Interchange"
    | "Passing Chord"
    | "Backdoor Resolution";
  originalChords: string[];
  mutatedChords: Array<{ name: string; beats: number }>;
  theoryExplanation: string;
  harmonicImpact: string;
}

export interface WhatIfOption {
  title: string;
  originalChord: string;
  targetChord: string;
  category: string;
  theoreticalExplanation: string;
  expectedEffect: string;
}

export interface DiagnosisReport {
  overallScore: number; // 0 to 100
  pros: string[];
  warnings: string[];
  suggestions: string[];
  keyMetrics: {
    diatonicRatio: number;
    harmonicVariety: number;
    tensionResolutionBalance: number;
    basslineSmoothness: number;
  };
}

export interface ModulationEvent {
  barNumber: number;
  fromKey: string;
  toKey: string;
  modulationType: "pivot_chord" | "secondary_dominant" | "common_tone" | "direct" | "chromatic";
  pivotChordName?: string;
  confidence: number;
  explanation: string;
}

export interface BasslineAnalysis {
  notes: string[];
  contour: "ascending" | "descending" | "pedal" | "stepwise" | "leap" | "contrary" | "chromatic";
  smoothnessScore: number;
  hasPedalTone: boolean;
  pedalNote?: string;
  suggestions: string[];
}

export interface GenreHarmonyProfile {
  id: string;
  name: string;
  description: string;
  preferredChordTypes: string[];
  commonProgressions: string[][];
  extensionWeight: number; // 0 to 1
  borrowedWeight: number; // 0 to 1
  chromaticismWeight: number; // 0 to 1
  typicalBpmRange: [number, number];
  characteristicCadences: string[];
}
