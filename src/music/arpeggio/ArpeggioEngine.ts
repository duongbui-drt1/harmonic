import { ChordItem } from "../../types";
import { midiToNoteName } from "../../utils/noteNames";

export type ArpeggioPattern =
  | "off"
  | "up"
  | "down"
  | "up_down"
  | "down_up"
  | "up_down_inclusive"
  | "alberti"
  | "fingerpicking"
  | "stairway"
  | "pulse"
  | "random";

export type ArpeggioRate =
  | "1/4"
  | "1/8"
  | "1/8T"
  | "1/16"
  | "1/16T"
  | "1/32";

export interface ArpeggioSettings {
  enabled: boolean;
  pattern: ArpeggioPattern;
  rate: ArpeggioRate;
  octaves: number; // 1, 2, 3, 4
  gate: number; // 0.2 to 2.0 (e.g. 0.8 is 80% duration, >1.0 creates sustain overlap)
  swing: number; // 0.0 to 0.7 (0 = straight)
  accentFirstBeat: boolean;
  humanize: boolean; // Subtle timing & velocity realism
  rootBassNote: boolean; // Anchor with a low root note on downbeat
}

export interface ArpeggioNoteEvent {
  midi: number;
  noteName: string;
  timeOffsetSeconds: number; // Relative to start of chord
  durationSeconds: number;
  velocity: number; // 0.0 - 1.0
  stepIndex: number;
  isBassAccent?: boolean;
}

export interface ArpeggioPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  settings: Partial<ArpeggioSettings>;
}

export const DEFAULT_ARPEGGIO_SETTINGS: ArpeggioSettings = {
  enabled: false,
  pattern: "up",
  rate: "1/16",
  octaves: 2,
  gate: 0.85,
  swing: 0,
  accentFirstBeat: true,
  humanize: false,
  rootBassNote: false,
};

export const ARPEGGIO_PRESETS: ArpeggioPreset[] = [
  {
    id: "classic_up",
    name: "Classic Ascending",
    description: "Tươi sáng, đi lên 2 quãng tám chuẩn synth",
    icon: "↗️",
    settings: {
      enabled: true,
      pattern: "up",
      rate: "1/16",
      octaves: 2,
      gate: 0.85,
      swing: 0,
      accentFirstBeat: true,
      humanize: false,
      rootBassNote: false,
    },
  },
  {
    id: "dreamy_harp",
    name: "Dreamy Harp Cascade",
    description: "Lượn sóng lên xuống 3 quãng tám ngân vang",
    icon: "✨",
    settings: {
      enabled: true,
      pattern: "up_down",
      rate: "1/16",
      octaves: 3,
      gate: 1.3,
      swing: 0.15,
      accentFirstBeat: true,
      humanize: true,
      rootBassNote: true,
    },
  },
  {
    id: "classical_alberti",
    name: "Classical Alberti Bass",
    description: "Kiểu đệm Mozart (Trầm - Bổng - Trung - Bổng)",
    icon: "🎹",
    settings: {
      enabled: true,
      pattern: "alberti",
      rate: "1/8",
      octaves: 1,
      gate: 0.9,
      swing: 0,
      accentFirstBeat: true,
      humanize: false,
      rootBassNote: true,
    },
  },
  {
    id: "fingerpicking_folk",
    name: "Acoustic Fingerpicking",
    description: "Tỉa đàn guitar mộc mạc phong cách P-I-M-A",
    icon: "🎸",
    settings: {
      enabled: true,
      pattern: "fingerpicking",
      rate: "1/8",
      octaves: 1,
      gate: 1.1,
      swing: 0.2,
      accentFirstBeat: true,
      humanize: true,
      rootBassNote: true,
    },
  },
  {
    id: "synth_runner",
    name: "16th Synth Runner",
    description: "Chạy nốt điện tử sôi động, staccato dứt khoát",
    icon: "⚡",
    settings: {
      enabled: true,
      pattern: "up_down",
      rate: "1/16",
      octaves: 2,
      gate: 0.55,
      swing: 0,
      accentFirstBeat: true,
      humanize: false,
      rootBassNote: false,
    },
  },
  {
    id: "triplet_ambient",
    name: "Triplet Ambient Flow",
    description: "Dòng chảy nốt liên ba (1/8T) êm dịu, bay bổng",
    icon: "🌊",
    settings: {
      enabled: true,
      pattern: "up_down_inclusive",
      rate: "1/8T",
      octaves: 2,
      gate: 1.2,
      swing: 0,
      accentFirstBeat: true,
      humanize: true,
      rootBassNote: true,
    },
  },
  {
    id: "bass_pulse",
    name: "Rhythmic Pulse",
    description: "Nhịp đập dồn dập nhấn mạnh nốt gốc",
    icon: "💥",
    settings: {
      enabled: true,
      pattern: "pulse",
      rate: "1/16",
      octaves: 1,
      gate: 0.75,
      swing: 0.1,
      accentFirstBeat: true,
      humanize: false,
      rootBassNote: true,
    },
  },
];

export class ArpeggiatorEngine {
  /**
   * Calculate step duration in seconds for a specific rate at the given BPM
   */
  public static getStepDuration(rate: ArpeggioRate, bpm: number): number {
    const quarterDuration = 60 / Math.max(20, bpm);
    switch (rate) {
      case "1/4":
        return quarterDuration;
      case "1/8":
        return quarterDuration / 2;
      case "1/8T":
        return quarterDuration / 3; // Triplet eighth
      case "1/16":
        return quarterDuration / 4;
      case "1/16T":
        return quarterDuration / 6; // Triplet sixteenth
      case "1/32":
        return quarterDuration / 8;
      default:
        return quarterDuration / 4;
    }
  }

  /**
   * Expand base MIDI notes across specified number of octaves
   */
  public static expandNotes(baseMidis: number[], octaves: number): number[] {
    if (!baseMidis || baseMidis.length === 0) return [60, 64, 67];
    const sorted = [...new Set(baseMidis)].sort((a, b) => a - b);
    const result: number[] = [];

    const safeOctaves = Math.min(4, Math.max(1, octaves));
    for (let oct = 0; oct < safeOctaves; oct++) {
      for (const m of sorted) {
        const transposed = m + oct * 12;
        if (transposed <= 108) {
          // Cap at C8
          result.push(transposed);
        }
      }
    }
    return result.length > 0 ? result : sorted;
  }

  /**
   * Build the repeating sequence index order for a specific pattern
   */
  public static buildPatternIndices(noteCount: number, pattern: ArpeggioPattern): number[] {
    if (noteCount <= 0) return [0];
    if (noteCount === 1) return [0];

    const indices: number[] = [];

    switch (pattern) {
      case "up":
        for (let i = 0; i < noteCount; i++) indices.push(i);
        break;

      case "down":
        for (let i = noteCount - 1; i >= 0; i--) indices.push(i);
        break;

      case "up_down":
        // 0, 1, 2, 3, 2, 1
        for (let i = 0; i < noteCount; i++) indices.push(i);
        for (let i = noteCount - 2; i >= 1; i--) indices.push(i);
        break;

      case "down_up":
        // 3, 2, 1, 0, 1, 2
        for (let i = noteCount - 1; i >= 0; i--) indices.push(i);
        for (let i = 1; i < noteCount - 1; i++) indices.push(i);
        break;

      case "up_down_inclusive":
        // 0, 1, 2, 3, 3, 2, 1, 0
        for (let i = 0; i < noteCount; i++) indices.push(i);
        for (let i = noteCount - 1; i >= 0; i--) indices.push(i);
        break;

      case "alberti":
        // Classical pattern: Low, High, Mid, High
        if (noteCount === 2) {
          indices.push(0, 1, 0, 1);
        } else if (noteCount === 3) {
          indices.push(0, 2, 1, 2);
        } else {
          // 4+ notes: 0, top, mid, top, 0, mid-low, mid-high, top
          const top = noteCount - 1;
          const midHigh = Math.min(top - 1, 2);
          const midLow = 1;
          indices.push(0, top, midHigh, top, 0, midLow, midHigh, top);
        }
        break;

      case "fingerpicking":
        // P-I-M-A style picking: Bass, Middle, Treble, High, Treble, Middle
        if (noteCount === 3) {
          indices.push(0, 1, 2, 1, 2, 1);
        } else if (noteCount >= 4) {
          indices.push(0, 1, 2, 3, 2, 1, 0, 2);
        } else {
          indices.push(0, 1, 0, 1);
        }
        break;

      case "stairway":
        // Ascending cascades with repeated pivots: 0, 1, 2, 1, 3, 2, 1, 2
        for (let i = 0; i < noteCount; i++) {
          indices.push(i);
          if (i > 0) indices.push(i - 1);
        }
        break;

      case "pulse":
        // Root heavy rhythmic pulsing: 0, 0, 1, 2, 0, 0, 2, 3
        if (noteCount >= 3) {
          indices.push(0, 0, 1, 2, 0, 0, 2, Math.min(noteCount - 1, 3));
        } else {
          indices.push(0, 0, 1, 0, 0, 1, 0, 1);
        }
        break;

      case "random":
        for (let i = 0; i < Math.max(8, noteCount * 2); i++) {
          indices.push(Math.floor(Math.random() * noteCount));
        }
        break;

      default:
        for (let i = 0; i < noteCount; i++) indices.push(i);
        break;
    }

    return indices.length > 0 ? indices : [0];
  }

  /**
   * Generate scheduled note events for a single chord duration
   */
  public static generateArpeggioEvents(
    chord: ChordItem,
    totalDurationSeconds: number,
    bpm: number,
    settings: ArpeggioSettings
  ): ArpeggioNoteEvent[] {
    if (!settings.enabled || settings.pattern === "off") {
      return [];
    }

    const rawMidis =
      chord.midiNotes && chord.midiNotes.length > 0 ? chord.midiNotes : [60, 64, 67];
    const expandedNotes = this.expandNotes(rawMidis, settings.octaves);
    const patternIndices = this.buildPatternIndices(expandedNotes.length, settings.pattern);

    const stepDuration = this.getStepDuration(settings.rate, bpm);
    const totalSteps = Math.max(1, Math.floor(totalDurationSeconds / stepDuration));

    const baseVelocity = (chord.velocity !== undefined ? chord.velocity : 80) / 100;
    const events: ArpeggioNoteEvent[] = [];

    // Optional root bass anchor note on downbeat
    if (settings.rootBassNote && rawMidis.length > 0) {
      const rootMidi = Math.min(...rawMidis);
      // Drop an octave lower for deep bass weight if within bounds
      const bassMidi = rootMidi >= 36 ? rootMidi - 12 : rootMidi;
      events.push({
        midi: bassMidi,
        noteName: midiToNoteName(bassMidi),
        timeOffsetSeconds: 0,
        durationSeconds: Math.min(totalDurationSeconds * 0.95, 2.5),
        velocity: Math.min(1.0, baseVelocity * 1.15),
        stepIndex: -1,
        isBassAccent: true,
      });
    }

    for (let step = 0; step < totalSteps; step++) {
      const timeOffset = step * stepDuration;
      if (timeOffset >= totalDurationSeconds - 0.01) break;

      // Calculate swing delay
      let swingDelta = 0;
      if (settings.swing > 0 && step % 2 === 1 && !settings.rate.includes("T")) {
        swingDelta = stepDuration * settings.swing * 0.45;
      }

      // Calculate humanized micro-timing jitter
      let humanizeTiming = 0;
      let humanizeVel = 0;
      if (settings.humanize) {
        humanizeTiming = (Math.random() - 0.5) * 0.006;
        humanizeVel = (Math.random() - 0.5) * 0.08;
      }

      const noteTime = Math.max(0, timeOffset + swingDelta + humanizeTiming);
      if (noteTime >= totalDurationSeconds) break;

      // Note duration scaled by gate
      const noteDuration = Math.max(0.04, stepDuration * Math.max(0.2, settings.gate));

      // Pick MIDI note from pattern
      let noteIndex = 0;
      if (settings.pattern === "random") {
        noteIndex = Math.floor(Math.random() * expandedNotes.length);
      } else {
        noteIndex = patternIndices[step % patternIndices.length];
      }
      const midi = expandedNotes[noteIndex % expandedNotes.length];

      // Velocity accents
      let stepVelocity = baseVelocity;
      const isDownbeat = step === 0;
      const isQuarterBoundary = (step * stepDuration) % (60 / bpm) < 0.01;

      if (settings.accentFirstBeat && isDownbeat) {
        stepVelocity = Math.min(1.0, stepVelocity * 1.2);
      } else if (settings.accentFirstBeat && isQuarterBoundary) {
        stepVelocity = Math.min(1.0, stepVelocity * 1.08);
      }

      // Alberti / Fingerpicking dynamic shape: lower notes louder, mid softer
      if (settings.pattern === "alberti" || settings.pattern === "fingerpicking") {
        if (noteIndex === 0) {
          stepVelocity = Math.min(1.0, stepVelocity * 1.1);
        } else {
          stepVelocity = Math.max(0.3, stepVelocity * 0.92);
        }
      }

      // Apply individual chord note velocity overrides if defined
      if (chord.noteVelocities && chord.noteVelocities[midi] !== undefined) {
        stepVelocity = (stepVelocity + chord.noteVelocities[midi] / 100) / 2;
      }

      stepVelocity = Math.max(0.1, Math.min(1.0, stepVelocity + humanizeVel));

      events.push({
        midi,
        noteName: midiToNoteName(midi),
        timeOffsetSeconds: noteTime,
        durationSeconds: noteDuration,
        velocity: stepVelocity,
        stepIndex: step,
      });
    }

    return events;
  }
}
