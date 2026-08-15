import { midiToNoteName } from "../../utils/noteNames";

export type MidiMessageType = "noteon" | "noteoff" | "cc" | "pitchbend" | "other";

export interface BaseMidiEvent {
  type: MidiMessageType;
  channel: number;
  timestamp: number;
  raw: Uint8Array;
}

export interface MidiNoteOnEvent extends BaseMidiEvent {
  type: "noteon";
  note: number; // 0 - 127
  noteName: string; // e.g. "C4"
  velocity: number; // 1 - 127 (normalized 0..1 available via velocityFactor)
  velocityFactor: number; // 0..1
}

export interface MidiNoteOffEvent extends BaseMidiEvent {
  type: "noteoff";
  note: number; // 0 - 127
  noteName: string;
  velocity: number;
}

export interface MidiControlChangeEvent extends BaseMidiEvent {
  type: "cc";
  controller: number; // CC number, e.g. 64 for Sustain
  value: number; // 0 - 127
  isSustain: boolean; // true if controller === 64
  sustainActive: boolean; // true if controller === 64 and value >= 64
}

export interface MidiPitchBendEvent extends BaseMidiEvent {
  type: "pitchbend";
  value: number; // -1.0 to 1.0 (centered at 0)
}

export type ParsedMidiEvent =
  | MidiNoteOnEvent
  | MidiNoteOffEvent
  | MidiControlChangeEvent
  | MidiPitchBendEvent
  | (BaseMidiEvent & { type: "other" });

/**
 * Parses raw MIDI byte array from Web MIDI API MIDIMessageEvent
 */
export function parseMidiMessage(data: Uint8Array, timestamp: number = performance.now()): ParsedMidiEvent | null {
  if (!data || data.length < 2) return null;

  const statusByte = data[0];
  const command = statusByte & 0xf0;
  const channel = (statusByte & 0x0f) + 1;

  // 0x90 = Note On
  if (command === 0x90) {
    const note = data[1];
    const velocity = data.length > 2 ? data[2] : 64;

    // MIDI standard: Note On with velocity 0 is Note Off
    if (velocity === 0) {
      return {
        type: "noteoff",
        channel,
        note,
        noteName: midiToNoteName(note),
        velocity: 0,
        timestamp,
        raw: data,
      };
    }

    return {
      type: "noteon",
      channel,
      note,
      noteName: midiToNoteName(note),
      velocity,
      velocityFactor: Math.max(0.05, Math.min(1.0, velocity / 127)),
      timestamp,
      raw: data,
    };
  }

  // 0x80 = Note Off
  if (command === 0x80) {
    const note = data[1];
    const velocity = data.length > 2 ? data[2] : 0;
    return {
      type: "noteoff",
      channel,
      note,
      noteName: midiToNoteName(note),
      velocity,
      timestamp,
      raw: data,
    };
  }

  // 0xB0 = Control Change
  if (command === 0xb0) {
    const controller = data[1];
    const value = data.length > 2 ? data[2] : 0;
    const isSustain = controller === 64;
    return {
      type: "cc",
      channel,
      controller,
      value,
      isSustain,
      sustainActive: isSustain && value >= 64,
      timestamp,
      raw: data,
    };
  }

  // 0xE0 = Pitch Bend
  if (command === 0xe0) {
    const lsb = data[1];
    const msb = data.length > 2 ? data[2] : 64;
    const rawValue = (msb << 7) | lsb; // 0 .. 16383
    const normalized = (rawValue - 8192) / 8192; // -1.0 .. +1.0
    return {
      type: "pitchbend",
      channel,
      value: normalized,
      timestamp,
      raw: data,
    };
  }

  return {
    type: "other",
    channel,
    timestamp,
    raw: data,
  };
}
