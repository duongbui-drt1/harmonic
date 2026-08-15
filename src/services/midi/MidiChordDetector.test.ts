import { describe, it, expect } from "vitest";
import { detectMidiChord } from "./MidiChordDetector";

describe("MidiChordDetector Audit", () => {
  it("detects single notes accurately", () => {
    const single = detectMidiChord([60]);
    expect(single).toBeDefined();
    expect(single?.root).toBe("C");
    expect(single?.quality).toBe("single");
    expect(single?.symbol).toBe("C");
  });

  it("detects intervals accurately", () => {
    const fifth = detectMidiChord([60, 67]); // C - G (7 semitones)
    expect(fifth?.quality).toBe("interval");
    expect(fifth?.symbol).toBe("C5");

    const majThird = detectMidiChord([60, 64]); // C - E (4 semitones)
    expect(majThird?.quality).toBe("interval");
    expect(majThird?.symbol).toBe("CM3");
  });

  it("detects root position triads", () => {
    const cMaj = detectMidiChord([60, 64, 67]);
    expect(cMaj?.symbol).toBe("C");
    expect(cMaj?.root).toBe("C");
    expect(cMaj?.quality).toBe("major");

    const aMin = detectMidiChord([57, 60, 64]);
    expect(aMin?.symbol).toBe("Am");
    expect(aMin?.root).toBe("A");
    expect(aMin?.quality).toBe("minor");
  });

  it("detects inversions / slash chords", () => {
    // C/E (E3, G3, C4) -> [52, 55, 60]
    const cOverE = detectMidiChord([52, 55, 60]);
    expect(cOverE?.root).toBe("C");
    expect(cOverE?.bassNote).toBe("E");
    expect(cOverE?.isSlashChord).toBe(true);
    expect(cOverE?.symbol).toBe("C/E");

    // C/G (G3, C4, E4) -> [55, 60, 64]
    const cOverG = detectMidiChord([55, 60, 64]);
    expect(cOverG?.root).toBe("C");
    expect(cOverG?.bassNote).toBe("G");
    expect(cOverG?.symbol).toBe("C/G");
  });

  it("detects 7th and sus chords", () => {
    const cMaj7 = detectMidiChord([60, 64, 67, 71]);
    expect(cMaj7?.symbol).toBe("Cmaj7");
    expect(cMaj7?.quality).toBe("major7");

    const g7 = detectMidiChord([55, 59, 62, 65]);
    expect(g7?.symbol).toBe("G7");
    expect(g7?.quality).toBe("dominant7");

    const dSus4 = detectMidiChord([62, 67, 69]);
    expect(dSus4?.symbol).toBe("Dsus4");
  });
});
