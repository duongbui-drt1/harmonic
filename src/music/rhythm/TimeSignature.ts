/**
 * TimeSignature Model
 *
 * Generic, mathematically sound representation of musical meter,
 * separating time signature, beat unit, subdivision, accent grouping, and tempo.
 */

export type BeatUnit =
  | "half"           // Half note (2 quarter notes) - e.g. 2/2
  | "quarter"        // Quarter note (1 quarter note) - e.g. 4/4, 3/4, 2/4, 5/4
  | "eighth"         // Eighth note (0.5 quarter note) - e.g. 3/8, 7/8
  | "dotted-quarter" // Dotted quarter note (1.5 quarter notes = 3 eighths) - e.g. 6/8, 9/8, 12/8
  | "dotted-half";   // Dotted half note (3 quarter notes)

export type AccentLevel = "strong" | "secondary" | "weak";

export type MeterClassification =
  | "simple-duple"
  | "simple-triple"
  | "simple-quadruple"
  | "compound-duple"
  | "compound-triple"
  | "compound-quadruple"
  | "complex-odd"
  | "cut-time"
  | "custom";

export type MeterCategory = "basic" | "extended" | "advanced" | "custom";

export interface SubdivisionInfo {
  /** 0-based index of subdivision within the measure (e.g. 0..5 in 6/8) */
  index: number;
  /** 1-based display number (e.g. 1..6) */
  displayNumber: number;
  /** 0-based index of the main beat this subdivision belongs to */
  beatIndex: number;
  /** Whether this subdivision is the start of a main beat / accent group */
  isMainBeat: boolean;
  /** Index of the accent group (0-based) */
  groupIndex: number;
  /** Position within the current accent group (0-based) */
  indexInGroup: number;
  /** Accent level: 'strong' (downbeat), 'secondary' (group pulse), 'weak' */
  accent: AccentLevel;
  /** Numerical weight (0.0 to 1.0) for velocity / visual pulse scaling */
  accentWeight: number;
  /** Metronome pitch suggestion (e.g. C6 for strong, G5 for secondary, E5 for weak) */
  clickPitch: string;
  /** Time offset in seconds from the start of the bar for a given BPM */
  timeOffsetSeconds: number;
}

export interface BeatInfo {
  /** 0-based index of main beat in measure */
  index: number;
  /** 1-based display number */
  displayNumber: number;
  /** Number of subdivisions inside this beat (e.g. 3 in 6/8, 2 in 4/4, 2 or 3 in 7/8) */
  subdivisionCount: number;
  /** Accent level of the beat */
  accent: AccentLevel;
  /** Time offset in seconds from the start of the bar */
  timeOffsetSeconds: number;
  /** Duration of this specific beat in seconds */
  durationSeconds: number;
}

export interface TimeSignatureConfig {
  numerator: number;
  denominator: number;
  name?: string; // Defaults to `${numerator}/${denominator}`
  category?: MeterCategory;
  classification?: MeterClassification;
  beatUnit: BeatUnit;
  /** Default accent grouping expressed in subdivision counts (e.g. [3, 3] for 6/8, [2, 2, 3] for 7/8) */
  defaultGrouping: number[];
  /** Alternative accent groupings available (e.g. [[2,2,3], [2,3,2], [3,2,2]] for 7/8) */
  availableGroupings?: number[][];
  description?: string;
}

export class TimeSignature {
  readonly numerator: number;
  readonly denominator: number;
  readonly name: string;
  readonly category: MeterCategory;
  readonly classification: MeterClassification;
  readonly beatUnit: BeatUnit;
  readonly grouping: number[];
  readonly availableGroupings: number[][];
  readonly description: string;

  constructor(config: TimeSignatureConfig, customGrouping?: number[]) {
    this.numerator = config.numerator;
    this.denominator = config.denominator;
    this.name = config.name || `${config.numerator}/${config.denominator}`;
    this.category = config.category || "basic";
    this.classification = config.classification || this.deduceClassification();
    this.beatUnit = config.beatUnit;
    this.availableGroupings = config.availableGroupings || [config.defaultGrouping];
    this.description = config.description || "";

    // Validate or apply custom grouping
    if (customGrouping && customGrouping.length > 0) {
      const sum = customGrouping.reduce((a, b) => a + b, 0);
      const expectedSum = config.defaultGrouping.reduce((a, b) => a + b, 0);
      if (sum === expectedSum) {
        this.grouping = [...customGrouping];
      } else {
        this.grouping = [...config.defaultGrouping];
      }
    } else {
      this.grouping = [...config.defaultGrouping];
    }
  }

  private deduceClassification(): MeterClassification {
    const { numerator, denominator } = this;
    if (denominator === 8) {
      if (numerator === 6) return "compound-duple";
      if (numerator === 9) return "compound-triple";
      if (numerator === 12) return "compound-quadruple";
      if (numerator === 3) return "simple-triple";
      if (numerator === 7 || numerator === 5) return "complex-odd";
    }
    if (denominator === 4) {
      if (numerator === 2) return "simple-duple";
      if (numerator === 3) return "simple-triple";
      if (numerator === 4) return "simple-quadruple";
      if (numerator === 5) return "complex-odd";
    }
    if (denominator === 2 && numerator === 2) {
      return "cut-time";
    }
    return "custom";
  }

  /**
   * Total number of smallest musical subdivisions per bar.
   * For eighth-based meters (6/8, 9/8, 12/8, 7/8, 3/8) = numerator (6, 9, 12, 7, 3).
   * For quarter-based meters (4/4, 3/4, 2/4, 5/4), eighth subdivision = numerator * 2 or beat unit count.
   * Based on grouping sum, this equals the grouping sum.
   */
  get totalSubdivisionsPerBar(): number {
    if (this.denominator === 8) {
      return this.numerator;
    }
    if (this.grouping && Array.isArray(this.grouping) && this.grouping.length > 0) {
      return this.grouping.reduce((sum, g) => sum + g, 0);
    }
    return this.numerator;
  }

  /**
   * Number of main felt beats per bar.
   * For compound meters (6/8 -> 2, 9/8 -> 3, 12/8 -> 4).
   * For additive meters (7/8 with 2+2+3 -> 3 pulses).
   * For simple meters (4/4 -> 4, 3/4 -> 3, 2/4 -> 2, 2/2 -> 2, 5/4 -> 5 or 2 pulses).
   */
  get beatsPerBar(): number {
    return this.grouping.length;
  }

  /**
   * Is this a compound meter (e.g. 6/8, 9/8, 12/8)?
   */
  get isCompound(): boolean {
    return (
      this.denominator === 8 &&
      (this.numerator === 6 || this.numerator === 9 || this.numerator === 12)
    );
  }

  /**
   * Is this an irregular / odd meter (e.g. 5/4, 7/8)?
   */
  get isOdd(): boolean {
    return this.classification === "complex-odd" || this.numerator === 5 || this.numerator === 7;
  }

  /**
   * String representation of accent grouping, e.g. "3+3", "2+2+3", "3+3+3"
   */
  get groupingDisplay(): string {
    return this.grouping.join("+");
  }

  /**
   * Returns a clone with a specific grouping applied
   */
  withGrouping(newGrouping: number[]): TimeSignature {
    return new TimeSignature(
      {
        numerator: this.numerator,
        denominator: this.denominator,
        name: this.name,
        category: this.category,
        classification: this.classification,
        beatUnit: this.beatUnit,
        defaultGrouping: this.grouping,
        availableGroupings: this.availableGroupings,
        description: this.description,
      },
      newGrouping
    );
  }

  // ==========================================
  // TEMPO & DURATION CALCULATIONS
  // ==========================================

  /**
   * Duration of one beat unit (in seconds) at given BPM.
   * BPM is defined as beats per minute for this meter's beatUnit.
   */
  getBeatUnitDuration(bpm: number): number {
    const safeBpm = Math.max(10, bpm);
    return 60 / safeBpm;
  }

  /**
   * Duration of one subdivision (in seconds) at given BPM.
   */
  getSubdivisionDuration(bpm: number): number {
    const beatUnitSec = this.getBeatUnitDuration(bpm);
    switch (this.beatUnit) {
      case "dotted-quarter":
        // 1 dotted quarter = 3 eighth subdivisions
        return beatUnitSec / 3;
      case "quarter":
        // For simple quarter meters where grouping is in quarter notes (e.g. [1,1,1,1] in 4/4)
        if (this.denominator === 4 && this.grouping.every((g) => g === 1 || g === 2 || g === 3)) {
          // If grouping is [1,1,1,1] in 4/4, subdivision is quarter note (or eighth if subdivided)
          return beatUnitSec;
        }
        return beatUnitSec;
      case "half":
        // 1 half note beat = 2 quarter subdivisions
        return beatUnitSec / 2;
      case "eighth":
        // In 7/8 or 3/8 with eighth beat unit: 1 subdivision = 1 eighth note
        return beatUnitSec;
      default:
        return beatUnitSec;
    }
  }

  /**
   * Total duration of one complete measure/bar (in seconds) at given BPM.
   */
  getBarDuration(bpm: number): number {
    const subSec = this.getSubdivisionDuration(bpm);
    return subSec * this.totalSubdivisionsPerBar;
  }

  /**
   * Duration of a chord in seconds based on its beats value.
   * If chord.beats represents beats (e.g. 4 beats in 4/4 = 1 bar, 3 beats in 3/4 = 1 bar,
   * 2 beats in 6/8 = 1 bar, 7 subdivisions in 7/8 = 1 bar):
   */
  getChordDurationInSeconds(chordBeats: number, bpm: number): number {
    const safeBeats = Math.max(0.25, chordBeats);
    const subDuration = this.getSubdivisionDuration(bpm);
    const beatUnitDuration = this.getBeatUnitDuration(bpm);

    if (this.isCompound) {
      // In compound meters (6/8, 9/8, 12/8):
      // If chordBeats is 1 or 2 (meaning 1 or 2 dotted quarter beats):
      if (safeBeats <= this.beatsPerBar && Number.isInteger(safeBeats)) {
        return safeBeats * beatUnitDuration;
      }
      // If chordBeats matches subdivision count (e.g. 3 or 6 in 6/8):
      if (safeBeats === this.numerator) {
        return this.getBarDuration(bpm);
      }
      return safeBeats * beatUnitDuration;
    }

    if (this.name === "7/8") {
      // In 7/8, if chordBeats is 7 (1 bar) or group counts (2, 3):
      if (safeBeats === 7) {
        return this.getBarDuration(bpm);
      }
      if (safeBeats <= 3 && Number.isInteger(safeBeats)) {
        // Pulse groups (e.g. 2 eighths or 3 eighths)
        return safeBeats * subDuration;
      }
      return safeBeats * subDuration;
    }

    if (this.name === "2/2") {
      // In 2/2, 2 beats = 1 bar = 2 * half note duration
      return safeBeats * beatUnitDuration;
    }

    // Default for simple meters (2/4, 3/4, 4/4, 5/4):
    return safeBeats * beatUnitDuration;
  }

  /**
   * Calculates loop boundary duration (in seconds) for a progression.
   * Rounds up to the nearest bar boundary if required so loops are musically clean.
   */
  calculateLoopDuration(totalChordSeconds: number, bpm: number): {
    totalSeconds: number;
    totalBars: number;
    barDuration: number;
  } {
    const barDuration = this.getBarDuration(bpm);
    const totalBars = Math.max(1, Math.ceil(totalChordSeconds / barDuration));
    const totalSeconds = totalBars * barDuration;
    return {
      totalSeconds,
      totalBars,
      barDuration,
    };
  }

  // ==========================================
  // SUBDIVISION & ACCENT ANALYSIS
  // ==========================================

  /**
   * Returns complete structured information for every subdivision in a single bar.
   */
  getSubdivisions(bpm: number): SubdivisionInfo[] {
    const subDuration = this.getSubdivisionDuration(bpm);
    const result: SubdivisionInfo[] = [];

    let currentSubIndex = 0;
    let accumulatedTime = 0;

    this.grouping.forEach((groupSize, groupIndex) => {
      for (let i = 0; i < groupSize; i++) {
        const isFirstInBar = currentSubIndex === 0;
        const isFirstInGroup = i === 0;

        let accent: AccentLevel = "weak";
        let accentWeight = 0.35;
        let clickPitch = "E5";

        if (isFirstInBar) {
          accent = "strong";
          accentWeight = 1.0;
          clickPitch = "C6";
        } else if (isFirstInGroup) {
          accent = "secondary";
          accentWeight = 0.7;
          clickPitch = "G5";
        } else {
          accent = "weak";
          accentWeight = 0.35;
          clickPitch = "E5";
        }

        result.push({
          index: currentSubIndex,
          displayNumber: currentSubIndex + 1,
          beatIndex: groupIndex,
          isMainBeat: isFirstInGroup,
          groupIndex,
          indexInGroup: i,
          accent,
          accentWeight,
          clickPitch,
          timeOffsetSeconds: accumulatedTime,
        });

        accumulatedTime += subDuration;
        currentSubIndex++;
      }
    });

    return result;
  }

  /**
   * Returns high-level main beats for the measure.
   */
  getBeats(bpm: number): BeatInfo[] {
    const subDuration = this.getSubdivisionDuration(bpm);
    const result: BeatInfo[] = [];
    let accumulatedTime = 0;

    this.grouping.forEach((groupSize, groupIndex) => {
      const isFirst = groupIndex === 0;
      const accent: AccentLevel = isFirst ? "strong" : "secondary";
      const durationSeconds = groupSize * subDuration;

      result.push({
        index: groupIndex,
        displayNumber: groupIndex + 1,
        subdivisionCount: groupSize,
        accent,
        timeOffsetSeconds: accumulatedTime,
        durationSeconds,
      });

      accumulatedTime += durationSeconds;
    });

    return result;
  }

  /**
   * Metronome click events for one measure at given BPM.
   */
  getMetronomeClicks(bpm: number, includeSubdivisions: boolean = false): Array<{
    timeOffset: number;
    pitch: string;
    velocity: number;
    accent: AccentLevel;
    displayNumber: number;
    isDownbeat: boolean;
  }> {
    if (includeSubdivisions || this.isCompound || this.isOdd) {
      // Compound meters (6/8, 9/8, 12/8) and odd meters (7/8) click subdivisions with grouping accents
      return this.getSubdivisions(bpm).map((sub) => ({
        timeOffset: sub.timeOffsetSeconds,
        pitch: sub.clickPitch,
        velocity: sub.accentWeight,
        accent: sub.accent,
        displayNumber: sub.displayNumber,
        isDownbeat: sub.index === 0,
      }));
    }

    // Simple meters click on main beats
    const beats = this.getBeats(bpm);
    return beats.map((b) => ({
      timeOffset: b.timeOffsetSeconds,
      pitch: b.index === 0 ? "C6" : "G5",
      velocity: b.index === 0 ? 1.0 : 0.65,
      accent: b.accent,
      displayNumber: b.displayNumber,
      isDownbeat: b.index === 0,
    }));
  }

  /**
   * Returns Tone.js compatible timeSignature array [num, den]
   */
  getToneTimeSignature(): [number, number] {
    return [this.numerator, this.denominator];
  }

  /**
   * Formats meter name and grouping (e.g. "6/8 (3+3)" or "7/8 (2+2+3)")
   */
  formatMeter(): string {
    if (this.isCompound || this.isOdd) {
      return `${this.name} (${this.groupingDisplay})`;
    }
    return this.name;
  }
}
