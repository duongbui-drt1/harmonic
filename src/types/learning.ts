import { ChordItem, InstrumentType, TimeSignatureString } from "../types";

export type LessonStep = "listen" | "visualize" | "explain" | "experiment" | "challenge";

export interface NoteItem {
  name: string;      // e.g. "C4"
  midi: number;      // e.g. 60
  label?: string;    // e.g. "Root", "3rd", "5th"
  color?: string;    // custom highlight color
}

export interface AudioExampleItem {
  id: string;
  label: string;
  description?: string;
  notes?: NoteItem[];
  chordName?: string;
  chords?: ChordItem[];
  type: "single_note" | "interval" | "chord" | "arpeggio" | "scale" | "progression" | "meter";
  arpeggioPattern?: string;
  timeSignature?: TimeSignatureString;
  timeSignatureGrouping?: number[];
  bpm?: number;
}

export interface ComparisonItem {
  id: string;
  title: string;
  description: string;
  optionA: {
    label: string;
    sublabel: string;
    example: AudioExampleItem;
    highlightMidis?: number[];
  };
  optionB: {
    label: string;
    sublabel: string;
    example: AudioExampleItem;
    highlightMidis?: number[];
  };
  whyDifferenceMatters: string;
  theoryDetails?: string;
}

export interface ChallengeQuestion {
  id: string;
  question: string;
  subtext?: string;
  audioPrompt: AudioExampleItem;
  options: {
    label: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  hint?: string;
}

export interface LessonData {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  level: "Level 1 — Musical Foundations" | "Level 2 — Harmony in Motion";
  category: "notes" | "intervals" | "chords" | "scales" | "harmony" | "rhythm" | "voice_leading";
  estimatedMinutes: number;
  conceptTags: string[];
  summary: string;

  // Step 1: Listen
  listenExamples: AudioExampleItem[];
  listenGuidance: string;

  // Step 2: Visualize
  visualizeNotes: NoteItem[];
  visualizeTitle: string;
  visualizeCaption: string;
  highlightedMidis?: number[];
  keyboardRange?: { minMidi: number; maxMidi: number };

  // Step 3: Explain
  beginnerExplanation: string;
  bulletPoints: string[];
  whyItWorks: string;
  theoryDetails?: string; // Progressive disclosure

  // Step 4: Experiment
  experimentTitle: string;
  experimentPrompt: string;
  experimentType:
    | "interactive_piano"
    | "interval_builder"
    | "chord_builder"
    | "major_minor_toggle"
    | "scale_player"
    | "key_chords"
    | "progression_tweak"
    | "tension_resolution"
    | "inversion_picker"
    | "arpeggio_patterns"
    | "meter_grooves"
    | "voice_leading_compare";
  experimentDefaultItem?: any;

  // Comparisons (if applicable)
  comparison?: ComparisonItem;

  // Step 5: Challenge
  challenge: ChallengeQuestion;
}

export interface EarTrainingStats {
  totalAttempted: number;
  totalCorrect: number;
  byCategory: Record<
    string,
    {
      attempted: number;
      correct: number;
    }
  >;
  streak: number;
}

export interface UserLearningProgress {
  completedLessons: string[];
  conceptsMastered: string[];
  earTraining: EarTrainingStats;
  lastLessonId: string | null;
  lastActiveTimestamp: number;
}
