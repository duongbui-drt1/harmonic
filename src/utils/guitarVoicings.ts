import { GuitarFingering } from "../types";

export const GUITAR_TUNING_MIDI = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4

export const GUITAR_VOICINGS_DATABASE: Record<string, GuitarFingering> = {
  // C Chords
  "C": { chordName: "C", frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  "Cm": { chordName: "Cm", frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 3, startString: 1, endString: 5 } },
  "C7": { chordName: "C7", frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  "Cmaj7": { chordName: "Cmaj7", frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
  "Cm7": { chordName: "Cm7", frets: [-1, 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1], barre: { fret: 3, startString: 1, endString: 5 } },
  "Csus2": { chordName: "Csus2", frets: [-1, 3, 0, 0, 1, 1], fingers: [0, 3, 0, 0, 1, 1] },
  "Csus4": { chordName: "Csus4", frets: [-1, 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1] },

  // D Chords
  "D": { chordName: "D", frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  "Dm": { chordName: "Dm", frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  "D7": { chordName: "D7", frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  "Dmaj7": { chordName: "Dmaj7", frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3] },
  "Dm7": { chordName: "Dm7", frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], barre: { fret: 1, startString: 4, endString: 5 } },
  "Dsus2": { chordName: "Dsus2", frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0] },
  "Dsus4": { chordName: "Dsus4", frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 4] },

  // E Chords
  "E": { chordName: "E", frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  "Em": { chordName: "Em", frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  "E7": { chordName: "E7", frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  "Emaj7": { chordName: "Emaj7", frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0] },
  "Em7": { chordName: "Em7", frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0] },

  // F Chords
  "F": { chordName: "F", frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, startString: 0, endString: 5 } },
  "Fm": { chordName: "Fm", frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, startString: 0, endString: 5 } },
  "Fmaj7": { chordName: "Fmaj7", frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0] },
  "Fm7": { chordName: "Fm7", frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 1, startString: 0, endString: 5 } },

  // G Chords
  "G": { chordName: "G", frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  "Gm": { chordName: "Gm", frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 3, startString: 0, endString: 5 } },
  "G7": { chordName: "G7", frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  "Gmaj7": { chordName: "Gmaj7", frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, 0, 0, 0, 1] },
  "Gm7": { chordName: "Gm7", frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 3, startString: 0, endString: 5 } },

  // A Chords
  "A": { chordName: "A", frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  "Am": { chordName: "Am", frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  "A7": { chordName: "A7", frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
  "Amaj7": { chordName: "Amaj7", frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },
  "Am7": { chordName: "Am7", frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
  "Asus2": { chordName: "Asus2", frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 2, 3, 0, 0] },
  "Asus4": { chordName: "Asus4", frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 4, 0] },

  // B Chords
  "B": { chordName: "B", frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 2, startString: 1, endString: 5 } },
  "Bm": { chordName: "Bm", frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 2, startString: 1, endString: 5 } },
  "B7": { chordName: "B7", frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
  "Bmaj7": { chordName: "Bmaj7", frets: [-1, 2, 4, 3, 4, 2], fingers: [0, 1, 3, 2, 4, 1], barre: { fret: 2, startString: 1, endString: 5 } },
  "Bm7": { chordName: "Bm7", frets: [-1, 2, 4, 2, 3, 2], fingers: [0, 1, 3, 1, 2, 1], barre: { fret: 2, startString: 1, endString: 5 } },
  "Bm7b5": { chordName: "Bm7b5", frets: [-1, 2, 3, 2, 3, -1], fingers: [0, 1, 2, 1, 3, 0] },
};

export function getGuitarFingering(chordName: string): GuitarFingering {
  const clean = chordName.trim();
  if (GUITAR_VOICINGS_DATABASE[clean]) {
    return GUITAR_VOICINGS_DATABASE[clean];
  }

  // Fallback: search by replacing sharps or flats in database
  let altName = clean.replace("C#", "Db").replace("D#", "Eb").replace("F#", "Gb").replace("G#", "Ab").replace("A#", "Bb");
  if (GUITAR_VOICINGS_DATABASE[altName]) {
    return GUITAR_VOICINGS_DATABASE[altName];
  }

  // Parse root and quality from chord string (e.g. "C#m7", "F#maj7", "Bb7")
  let mainChord = clean.split("/")[0];
  const rootMatch = mainChord.match(/^([A-G][#b]?)(.*)$/i);

  if (!rootMatch) {
    return {
      chordName: clean,
      frets: [-1, 3, 5, 5, 4, 3],
      fingers: [0, 1, 3, 4, 2, 1],
      barre: { fret: 3, startString: 1, endString: 5 },
    };
  }

  let rawRoot = rootMatch[1].toUpperCase();
  if (rawRoot.length > 1) {
    if (rawRoot[1] === "b") rawRoot = rawRoot[0] + "b";
    if (rawRoot[1] === "#") rawRoot = rawRoot[0] + "#";
  }
  const suffix = (rootMatch[2] || "").toLowerCase();

  // Map root to pitch class (0 for C, 1 for C#/Db, 2 for D, ..., 11 for B)
  const rootPitches: Record<string, number> = {
    "C": 0, "C#": 1, "DB": 1, "D": 2, "D#": 3, "EB": 3,
    "E": 4, "F": 5, "F#": 6, "GB": 6, "G": 7, "G#": 8,
    "AB": 8, "A": 9, "A#": 10, "BB": 10, "B": 11,
  };
  const pClass = rootPitches[rawRoot.toUpperCase()] ?? 0;

  // Choose E-shape (6th string root) vs A-shape (5th string root)
  const useE6Shape = [5, 6, 7, 8, 9, 10, 11].includes(pClass); // F, F#, G, G#, A, A#, B on 6th string
  const isMinor = suffix.startsWith("m") && !suffix.startsWith("maj");
  const is7 = suffix === "7" || suffix === "dom7";
  const isM7 = suffix.includes("m7") && !suffix.includes("maj7");
  const isMaj7 = suffix.includes("maj7") || suffix.includes("m7") === false && suffix.includes("M7");

  if (useE6Shape) {
    // E6 root fret: E is at fret 0, F at 1, F# at 2, G at 3, G# at 4, A at 5, A# at 6, B at 7
    let fret = (pClass - 4 + 12) % 12;
    if (fret === 0) fret = 12;

    let frets: number[];
    if (isMinor) {
      frets = [fret, fret + 2, fret + 2, fret, fret, fret]; // Fm shape
    } else if (isM7) {
      frets = [fret, fret + 2, fret, fret, fret, fret]; // Fm7 shape
    } else if (is7) {
      frets = [fret, fret + 2, fret, fret + 1, fret, fret]; // F7 shape
    } else if (isMaj7) {
      frets = [fret, fret + 2, fret + 1, fret + 1, fret, fret]; // Fmaj7 shape
    } else {
      frets = [fret, fret + 2, fret + 2, fret + 1, fret, fret]; // F major shape
    }

    return {
      chordName: clean,
      frets,
      fingers: [1, 3, 4, 2, 1, 1],
      barre: { fret, startString: 0, endString: 5 },
    };
  } else {
    // A5 root fret: A is at fret 0, A# at 1, B at 2, C at 3, C# at 4, D at 5, D# at 6, E at 7
    let fret = (pClass - 9 + 12) % 12;
    if (fret === 0) fret = 12;

    let frets: number[];
    if (isMinor) {
      frets = [-1, fret, fret + 2, fret + 2, fret + 1, fret]; // Bm shape
    } else if (isM7) {
      frets = [-1, fret, fret + 2, fret, fret + 1, fret]; // Bm7 shape
    } else if (is7) {
      frets = [-1, fret, fret + 2, fret, fret + 2, fret]; // B7 shape
    } else if (isMaj7) {
      frets = [-1, fret, fret + 2, fret + 1, fret + 2, fret]; // Bmaj7 shape
    } else {
      frets = [-1, fret, fret + 2, fret + 2, fret + 2, fret]; // B major shape
    }

    return {
      chordName: clean,
      frets,
      fingers: [0, 1, 3, 4, 2, 1],
      barre: { fret, startString: 1, endString: 5 },
    };
  }
}

export function getGuitarMidiNotes(fingering: GuitarFingering): number[] {
  const midis: number[] = [];
  fingering.frets.forEach((fret, stringIdx) => {
    if (fret >= 0) {
      const openMidi = GUITAR_TUNING_MIDI[stringIdx];
      midis.push(openMidi + fret);
    }
  });
  return midis.sort((a, b) => a - b);
}
