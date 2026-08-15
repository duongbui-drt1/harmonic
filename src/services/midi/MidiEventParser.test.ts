import { describe, it, expect } from "vitest";
import { parseMidiMessage } from "./MidiEventParser";

describe("MidiEventParser Audit", () => {
  it("parses Note On events correctly", () => {
    // Channel 1, Note 60 (C4), Velocity 100
    const raw = new Uint8Array([0x90, 60, 100]);
    const event = parseMidiMessage(raw, 1000);
    expect(event).toBeDefined();
    expect(event?.type).toBe("noteon");
    if (event?.type === "noteon") {
      expect(event.channel).toBe(1);
      expect(event.note).toBe(60);
      expect(event.noteName).toBe("C4");
      expect(event.velocity).toBe(100);
      expect(event.velocityFactor).toBeCloseTo(100 / 127, 2);
    }
  });

  it("handles Note On with velocity 0 as Note Off according to MIDI spec", () => {
    // 0x90 with velocity 0 is Note Off
    const raw = new Uint8Array([0x90, 60, 0]);
    const event = parseMidiMessage(raw, 1050);
    expect(event).toBeDefined();
    expect(event?.type).toBe("noteoff");
    if (event?.type === "noteoff") {
      expect(event.note).toBe(60);
      expect(event.velocity).toBe(0);
    }
  });

  it("parses standard Note Off events (0x80)", () => {
    const raw = new Uint8Array([0x80, 64, 64]);
    const event = parseMidiMessage(raw, 1100);
    expect(event?.type).toBe("noteoff");
    if (event?.type === "noteoff") {
      expect(event.note).toBe(64);
      expect(event.noteName).toBe("E4");
    }
  });

  it("parses CC64 Sustain Pedal events (down >= 64, up < 64)", () => {
    // Pedal down (127)
    const pedalDown = new Uint8Array([0xb0, 64, 127]);
    const evDown = parseMidiMessage(pedalDown, 1200);
    expect(evDown?.type).toBe("cc");
    if (evDown?.type === "cc") {
      expect(evDown.controller).toBe(64);
      expect(evDown.isSustain).toBe(true);
      expect(evDown.sustainActive).toBe(true);
    }

    // Pedal up (0)
    const pedalUp = new Uint8Array([0xb0, 64, 0]);
    const evUp = parseMidiMessage(pedalUp, 1300);
    expect(evUp?.type).toBe("cc");
    if (evUp?.type === "cc") {
      expect(evUp.isSustain).toBe(true);
      expect(evUp.sustainActive).toBe(false);
    }
  });

  it("parses Pitch Bend events and normalizes between -1.0 and +1.0", () => {
    // Center: LSB=0, MSB=64 -> 8192
    const center = new Uint8Array([0xe0, 0, 64]);
    const evCenter = parseMidiMessage(center);
    expect(evCenter?.type).toBe("pitchbend");
    if (evCenter?.type === "pitchbend") {
      expect(evCenter.value).toBeCloseTo(0, 3);
    }

    // Max up: LSB=127, MSB=127 -> 16383
    const maxUp = new Uint8Array([0xe0, 127, 127]);
    const evMax = parseMidiMessage(maxUp);
    if (evMax?.type === "pitchbend") {
      expect(evMax.value).toBeCloseTo(1.0, 1);
    }
  });
});
