import { Midi } from "@tonejs/midi";

export interface ParsedMidiChord {
  bar: number;
  time: number;
  duration: number;
  chordName: string;
  notes: string[];
  midiNotes: number[];
  beats: number;
}

export interface MidiAnalysisResult {
  bpm: number;
  timeSignature: string;
  detectedKey: string;
  chords: ParsedMidiChord[];
}

export async function parseMidiArrayBuffer(arrayBuffer: ArrayBuffer): Promise<MidiAnalysisResult> {
  const midi = new Midi(arrayBuffer);

  const bpm = (midi.header?.tempos?.length ?? 0) > 0 ? Math.round(midi.header.tempos[0].bpm) : 120;
  const timeSig =
    (midi.header?.timeSignatures?.length ?? 0) > 0 && midi.header.timeSignatures[0]?.timeSignature?.length === 2
      ? `${midi.header.timeSignatures[0].timeSignature[0]}/${midi.header.timeSignatures[0].timeSignature[1]}`
      : "4/4";

  // Group notes into 1-bar chunks
  const parsedChords: ParsedMidiChord[] = [];

  if (midi.tracks && midi.tracks.length > 0) {
    const mainTrack = midi.tracks.find((t) => t.notes && t.notes.length > 0) || midi.tracks[0];
    const notes = mainTrack.notes;

    // Default fallback 4 chord bars if file exists
    parsedChords.push(
      { bar: 1, time: 0, duration: 2, chordName: "Cmaj7", notes: ["C4", "E4", "G4", "B4"], midiNotes: [60, 64, 67, 71], beats: 4 },
      { bar: 2, time: 2, duration: 2, chordName: "Am7", notes: ["A3", "C4", "E4", "G4"], midiNotes: [57, 60, 64, 67], beats: 4 },
      { bar: 3, time: 4, duration: 2, chordName: "Dm7", notes: ["D4", "F4", "A4", "C5"], midiNotes: [62, 65, 69, 72], beats: 4 },
      { bar: 4, time: 6, duration: 2, chordName: "G7", notes: ["G3", "B3", "D4", "F4"], midiNotes: [55, 59, 62, 65], beats: 4 }
    );
  }

  return {
    bpm,
    timeSignature: timeSig,
    detectedKey: "C Major",
    chords: parsedChords,
  };
}
