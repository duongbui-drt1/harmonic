import { TimeSignature, SubdivisionInfo } from "./TimeSignature";
import { ChordItem } from "../../types";

export interface ScheduledChordEvent {
  chordIndex: number;
  chord: ChordItem;
  startTimeSeconds: number;
  durationSeconds: number;
  barIndex: number;
  beatIndex: number;
  subdivisionIndex: number;
  displayBarNumber: number; // 1-based
}

export interface ScheduledMetronomeTick {
  timeSeconds: number;
  pitch: string;
  velocity: number;
  accent: "strong" | "secondary" | "weak";
  barIndex: number;
  subdivisionIndex: number;
  displayNumber: number;
  isDownbeat: boolean;
  isMainBeat: boolean;
}

export interface ProgressionSchedule {
  timeSignature: TimeSignature;
  bpm: number;
  chordEvents: ScheduledChordEvent[];
  metronomeTicks: ScheduledMetronomeTick[];
  totalDurationSeconds: number;
  totalBars: number;
  barDurationSeconds: number;
  loopEndSeconds: number;
}

export class RhythmScheduler {
  /**
   * Builds the complete timeline schedule for chords, loop boundaries, and metronome
   */
  static scheduleProgression(
    chords: ChordItem[],
    timeSignature: TimeSignature,
    bpm: number,
    includeSubdivisionsInMetronome: boolean = true
  ): ProgressionSchedule {
    const barDuration = timeSignature.getBarDuration(bpm);
    const chordEvents: ScheduledChordEvent[] = [];

    let currentAccumulatedSeconds = 0;

    chords.forEach((chord, index) => {
      const chordDuration = timeSignature.getChordDurationInSeconds(chord.beats, bpm);
      const barIndex = Math.floor(currentAccumulatedSeconds / barDuration);
      const timeInBar = currentAccumulatedSeconds % barDuration;

      // Find beat and subdivision in bar
      const subs = timeSignature.getSubdivisions(bpm);
      let closestSubIndex = 0;
      let closestBeatIndex = 0;

      for (let i = 0; i < subs.length; i++) {
        if (subs[i].timeOffsetSeconds <= timeInBar + 0.001) {
          closestSubIndex = subs[i].index;
          closestBeatIndex = subs[i].beatIndex;
        }
      }

      chordEvents.push({
        chordIndex: index,
        chord,
        startTimeSeconds: currentAccumulatedSeconds,
        durationSeconds: chordDuration,
        barIndex,
        beatIndex: closestBeatIndex,
        subdivisionIndex: closestSubIndex,
        displayBarNumber: barIndex + 1,
      });

      currentAccumulatedSeconds += chordDuration;
    });

    const totalDurationSeconds = currentAccumulatedSeconds;
    const totalBars = Math.max(1, Math.ceil(totalDurationSeconds / barDuration));
    const loopEndSeconds = totalBars * barDuration;

    // Generate Metronome Ticks for all bars in the loop
    const metronomeTicks: ScheduledMetronomeTick[] = [];
    const subsPerBar = timeSignature.getSubdivisions(bpm);

    for (let bar = 0; bar < totalBars; bar++) {
      const barStart = bar * barDuration;

      subsPerBar.forEach((sub) => {
        // If not including weak subdivisions in simple meters, only tick main beats
        if (!includeSubdivisionsInMetronome && !timeSignature.isCompound && !timeSignature.isOdd && !sub.isMainBeat) {
          return;
        }

        metronomeTicks.push({
          timeSeconds: barStart + sub.timeOffsetSeconds,
          pitch: sub.clickPitch,
          velocity: sub.accentWeight,
          accent: sub.accent,
          barIndex: bar,
          subdivisionIndex: sub.index,
          displayNumber: sub.displayNumber,
          isDownbeat: sub.index === 0,
          isMainBeat: sub.isMainBeat,
        });
      });
    }

    return {
      timeSignature,
      bpm,
      chordEvents,
      metronomeTicks,
      totalDurationSeconds,
      totalBars,
      barDurationSeconds: barDuration,
      loopEndSeconds,
    };
  }

  /**
   * Determine the active bar, beat, and subdivision at a given playback time
   */
  static getActivePosition(
    elapsedSeconds: number,
    timeSignature: TimeSignature,
    bpm: number
  ): {
    barIndex: number;
    subdivisionIndex: number;
    beatIndex: number;
    accent: "strong" | "secondary" | "weak";
    progressInBar: number;
  } {
    const barDuration = timeSignature.getBarDuration(bpm);
    const positiveElapsed = Math.max(0, elapsedSeconds);
    const barIndex = Math.floor(positiveElapsed / barDuration);
    const timeInBar = positiveElapsed % barDuration;
    const progressInBar = barDuration > 0 ? timeInBar / barDuration : 0;

    const subs = timeSignature.getSubdivisions(bpm);
    let activeSub = subs[0];

    for (let i = 0; i < subs.length; i++) {
      if (subs[i].timeOffsetSeconds <= timeInBar + 0.001) {
        activeSub = subs[i];
      }
    }

    return {
      barIndex,
      subdivisionIndex: activeSub.index,
      beatIndex: activeSub.beatIndex,
      accent: activeSub.accent,
      progressInBar,
    };
  }
}
