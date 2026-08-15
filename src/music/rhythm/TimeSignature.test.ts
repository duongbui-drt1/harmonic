import { describe, it, expect } from "vitest";
import { RhythmRegistry } from "./RhythmRegistry";
import { TimeSignature } from "./TimeSignature";
import { RhythmScheduler } from "./RhythmScheduler";
import { ChordItem } from "../../types";

describe("TimeSignature and Rhythm Engine Full Audit", () => {
  it("verifies 4/4 simple quadruple meter calculations", () => {
    const ts44 = RhythmRegistry.getTimeSignature("4/4");
    expect(ts44.numerator).toBe(4);
    expect(ts44.denominator).toBe(4);
    expect(ts44.beatsPerBar).toBe(4);
    expect(ts44.totalSubdivisionsPerBar).toBe(4);

    // At 120 BPM: quarter note = 0.5s, bar = 2.0s
    expect(ts44.getBeatUnitDuration(120)).toBeCloseTo(0.5, 3);
    expect(ts44.getBarDuration(120)).toBeCloseTo(2.0, 3);

    const clicks = ts44.getMetronomeClicks(120);
    expect(clicks.length).toBe(4);
    expect(clicks[0].isDownbeat).toBe(true);
    expect(clicks[0].pitch).toBe("C6");
    expect(clicks[1].isDownbeat).toBe(false);
  });

  it("verifies 3/4 simple triple meter calculations", () => {
    const ts34 = RhythmRegistry.getTimeSignature("3/4");
    expect(ts34.numerator).toBe(3);
    expect(ts34.denominator).toBe(4);
    expect(ts34.beatsPerBar).toBe(3);
    expect(ts34.getBarDuration(120)).toBeCloseTo(1.5, 3);
  });

  it("verifies 6/8 compound duple (3+3 grouping)", () => {
    const ts68 = RhythmRegistry.getTimeSignature("6/8");
    expect(ts68.numerator).toBe(6);
    expect(ts68.denominator).toBe(8);
    expect(ts68.isCompound).toBe(true);
    expect(ts68.grouping).toEqual([3, 3]);
    expect(ts68.beatsPerBar).toBe(2); // 2 main dotted-quarter pulses
    expect(ts68.totalSubdivisionsPerBar).toBe(6);

    // At 120 BPM (dotted-quarter = 0.5s): eighth subdivision = 0.5/3 = 0.1667s, bar = 1.0s
    expect(ts68.getBeatUnitDuration(120)).toBeCloseTo(0.5, 3);
    expect(ts68.getSubdivisionDuration(120)).toBeCloseTo(0.5 / 3, 3);
    expect(ts68.getBarDuration(120)).toBeCloseTo(1.0, 3);

    const subs = ts68.getSubdivisions(120);
    expect(subs.length).toBe(6);
    expect(subs[0].accent).toBe("strong");
    expect(subs[3].accent).toBe("secondary");
    expect(subs[1].accent).toBe("weak");
  });

  it("verifies 7/8 complex odd meter with additive groupings (2+2+3, 3+2+2)", () => {
    const ts78 = RhythmRegistry.getTimeSignature("7/8", [2, 2, 3]);
    expect(ts78.numerator).toBe(7);
    expect(ts78.denominator).toBe(8);
    expect(ts78.isOdd).toBe(true);
    expect(ts78.grouping).toEqual([2, 2, 3]);
    expect(ts78.totalSubdivisionsPerBar).toBe(7);

    const subs = ts78.getSubdivisions(120);
    expect(subs.length).toBe(7);
    expect(subs[0].accent).toBe("strong"); // First pulse (index 0)
    expect(subs[2].accent).toBe("secondary"); // Second pulse (index 2)
    expect(subs[4].accent).toBe("secondary"); // Third pulse (index 4)

    // Alternative grouping: 3+2+2
    const ts78Alt = ts78.withGrouping([3, 2, 2]);
    expect(ts78Alt.grouping).toEqual([3, 2, 2]);
    const subsAlt = ts78Alt.getSubdivisions(120);
    expect(subsAlt[0].accent).toBe("strong");
    expect(subsAlt[3].accent).toBe("secondary");
    expect(subsAlt[5].accent).toBe("secondary");
  });

  it("verifies 9/8 and 12/8 compound meters", () => {
    const ts98 = RhythmRegistry.getTimeSignature("9/8");
    expect(ts98.isCompound).toBe(true);
    expect(ts98.grouping).toEqual([3, 3, 3]);
    expect(ts98.totalSubdivisionsPerBar).toBe(9);

    const ts128 = RhythmRegistry.getTimeSignature("12/8");
    expect(ts128.isCompound).toBe(true);
    expect(ts128.grouping).toEqual([3, 3, 3, 3]);
    expect(ts128.totalSubdivisionsPerBar).toBe(12);
  });

  it("schedules a complete multi-chord progression accurately with RhythmScheduler", () => {
    const ts44 = RhythmRegistry.getTimeSignature("4/4");
    const chords: ChordItem[] = [
      { id: "1", name: "C", root: "C", quality: "major", beats: 4, notes: ["C4", "E4", "G4"], midiNotes: [60, 64, 67] },
      { id: "2", name: "G", root: "G", quality: "major", beats: 4, notes: ["G3", "B3", "D4"], midiNotes: [55, 59, 62] },
      { id: "3", name: "Am", root: "A", quality: "minor", beats: 4, notes: ["A3", "C4", "E4"], midiNotes: [57, 60, 64] },
      { id: "4", name: "F", root: "F", quality: "major", beats: 4, notes: ["F3", "A3", "C4"], midiNotes: [53, 57, 60] },
    ];

    const schedule = RhythmScheduler.scheduleProgression(chords, ts44, 120, true);
    expect(schedule.chordEvents.length).toBe(4);
    expect(schedule.chordEvents[0].startTimeSeconds).toBeCloseTo(0, 3);
    expect(schedule.chordEvents[1].startTimeSeconds).toBeCloseTo(2.0, 3);
    expect(schedule.chordEvents[2].startTimeSeconds).toBeCloseTo(4.0, 3);
    expect(schedule.chordEvents[3].startTimeSeconds).toBeCloseTo(6.0, 3);
    expect(schedule.totalDurationSeconds).toBeCloseTo(8.0, 3);
    expect(schedule.loopEndSeconds).toBeCloseTo(8.0, 3);
    expect(schedule.totalBars).toBe(4);
  });
});
