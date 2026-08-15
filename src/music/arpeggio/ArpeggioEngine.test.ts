import { describe, it, expect } from "vitest";
import { ArpeggiatorEngine, DEFAULT_ARPEGGIO_SETTINGS, ArpeggioSettings } from "./ArpeggioEngine";
import { ChordItem } from "../../types";

describe("ArpeggioEngine Full Functional and Math Audit", () => {
  it("calculates exact step duration for various rate divisions", () => {
    // 120 BPM -> 1 quarter note = 0.5s
    expect(ArpeggiatorEngine.getStepDuration("1/4", 120)).toBeCloseTo(0.5, 3);
    expect(ArpeggiatorEngine.getStepDuration("1/8", 120)).toBeCloseTo(0.25, 3);
    expect(ArpeggiatorEngine.getStepDuration("1/8T", 120)).toBeCloseTo(0.5 / 3, 3);
    expect(ArpeggiatorEngine.getStepDuration("1/16", 120)).toBeCloseTo(0.125, 3);
    expect(ArpeggiatorEngine.getStepDuration("1/16T", 120)).toBeCloseTo(0.5 / 6, 3);
    expect(ArpeggiatorEngine.getStepDuration("1/32", 120)).toBeCloseTo(0.0625, 3);
  });

  it("expands chord MIDI notes across multiple octaves correctly", () => {
    const baseMidis = [60, 64, 67]; // C4, E4, G4
    const oct1 = ArpeggiatorEngine.expandNotes(baseMidis, 1);
    expect(oct1).toEqual([60, 64, 67]);

    const oct2 = ArpeggiatorEngine.expandNotes(baseMidis, 2);
    expect(oct2).toEqual([60, 64, 67, 72, 76, 79]);

    const oct3 = ArpeggiatorEngine.expandNotes(baseMidis, 3);
    expect(oct3).toEqual([60, 64, 67, 72, 76, 79, 84, 88, 91]);
  });

  it("builds correct note index patterns for various arpeggiator modes", () => {
    // up: 0, 1, 2
    expect(ArpeggiatorEngine.buildPatternIndices(3, "up")).toEqual([0, 1, 2]);

    // down: 2, 1, 0
    expect(ArpeggiatorEngine.buildPatternIndices(3, "down")).toEqual([2, 1, 0]);

    // up_down: 0, 1, 2, 1 (avoids repeating boundary notes)
    expect(ArpeggiatorEngine.buildPatternIndices(3, "up_down")).toEqual([0, 1, 2, 1]);

    // up_down_inclusive: 0, 1, 2, 2, 1, 0
    expect(ArpeggiatorEngine.buildPatternIndices(3, "up_down_inclusive")).toEqual([0, 1, 2, 2, 1, 0]);

    // alberti: 0, 2, 1, 2 for 3 notes (Low - High - Mid - High)
    expect(ArpeggiatorEngine.buildPatternIndices(3, "alberti")).toEqual([0, 2, 1, 2]);

    // fingerpicking: 0, 1, 2, 1, 2, 1 for 3 notes
    expect(ArpeggiatorEngine.buildPatternIndices(3, "fingerpicking")).toEqual([0, 1, 2, 1, 2, 1]);
  });

  it("generates scheduled arpeggio events with correct timings and gate lengths", () => {
    const chord: ChordItem = {
      id: "c1",
      name: "C",
      root: "C",
      quality: "major",
      notes: ["C4", "E4", "G4"],
      beats: 4,
      midiNotes: [60, 64, 67],
    };

    const settings: ArpeggioSettings = {
      ...DEFAULT_ARPEGGIO_SETTINGS,
      enabled: true,
      pattern: "up",
      rate: "1/16",
      octaves: 1,
      gate: 0.8,
      accentFirstBeat: true,
      rootBassNote: true,
    };

    // 2.0s chord duration at 120 BPM, 1/16th = 0.125s step -> 16 steps + 1 bass anchor event
    const events = ArpeggiatorEngine.generateArpeggioEvents(chord, 2.0, 120, settings);
    expect(events.length).toBe(17);

    // First event is bass anchor at time 0
    expect(events[0].isBassAccent).toBe(true);
    expect(events[0].midi).toBe(48); // C3 (one octave below C4)
    expect(events[0].timeOffsetSeconds).toBe(0);

    // Second event is first 1/16th note at time 0
    expect(events[1].midi).toBe(60);
    expect(events[1].timeOffsetSeconds).toBeCloseTo(0, 3);
    expect(events[1].durationSeconds).toBeCloseTo(0.125 * 0.8, 3);

    // Third event is second 1/16th note at time 0.125
    expect(events[2].midi).toBe(64);
    expect(events[2].timeOffsetSeconds).toBeCloseTo(0.125, 3);
  });
});
