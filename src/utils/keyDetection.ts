import { NOTE_NAMES_SHARP, NOTE_NAMES_FLAT } from "./noteNames";
import { parseChordName } from "./chordData";

export interface KeyResult {
  key: string; // e.g. "C", "Am"
  root: string; // e.g. "C", "A"
  mode: "major" | "minor";
  displayName: string; // e.g. "C Major", "A Minor"
}

// Diatonic intervals (semitones from key root)
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

// Diatonic triad/7th qualities for Major scale: [I=M, ii=m, iii=m, IV=M, V=M, vi=m, vii°=dim]
const MAJOR_DIATONIC_ROMAN = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
const MINOR_DIATONIC_ROMAN = ["i", "ii°", "III", "iv", "v", "VI", "VII"];

export function detectKeyFromChords(chordNames: string[]): KeyResult {
  if (!chordNames || chordNames.length === 0) {
    return { key: "C", root: "C", mode: "major", displayName: "C Major" };
  }

  const parsedChords = chordNames.map((name) => parseChordName(name)).filter(Boolean);
  if (parsedChords.length === 0) {
    return { key: "C", root: "C", mode: "major", displayName: "C Major" };
  }

  let bestKey = "C";
  let bestMode: "major" | "minor" = "major";
  let maxScore = -9999;

  for (let rootPc = 0; rootPc < 12; rootPc++) {
    const rootName = NOTE_NAMES_SHARP[rootPc];

    // 1. Score Major Key
    let majorScore = 0;
    parsedChords.forEach((c, idx) => {
      if (!c) return;
      let chordRootPc = NOTE_NAMES_SHARP.indexOf(c.root);
      if (chordRootPc === -1) chordRootPc = NOTE_NAMES_FLAT.indexOf(c.root);
      if (chordRootPc === -1) return;

      const semitones = (chordRootPc - rootPc + 12) % 12;
      const isFirst = idx === 0;
      const isLast = idx === parsedChords.length - 1;
      const q = c.qualityDef.quality;
      const isMinor = (q.startsWith("m") && !q.startsWith("maj")) || q.includes("dim") || q === "m7b5";

      // Diatonic qualities in Major: 0:M, 2:m, 4:m, 5:M, 7:M, 9:m, 11:dim
      if (semitones === 0) {
        majorScore += isMinor ? -4 : 8;
        if (isFirst) majorScore += 10;
        if (isLast) majorScore += 8;
      } else if (semitones === 2) {
        majorScore += isMinor ? 5 : 1;
      } else if (semitones === 4) {
        majorScore += isMinor ? 5 : 1;
      } else if (semitones === 5) {
        majorScore += !isMinor ? 6 : 1;
      } else if (semitones === 7) {
        majorScore += !isMinor ? 7 : 1;
        if (isLast) majorScore += 3; // Half cadence
      } else if (semitones === 9) {
        majorScore += isMinor ? 5 : 1;
      } else if (semitones === 11) {
        majorScore += q.includes("dim") ? 4 : 0;
      } else {
        majorScore -= 5; // Non-diatonic in major
      }
    });

    if (majorScore > maxScore) {
      maxScore = majorScore;
      bestKey = rootName;
      bestMode = "major";
    }

    // 2. Score Minor Key
    let minorScore = 0;
    parsedChords.forEach((c, idx) => {
      if (!c) return;
      let chordRootPc = NOTE_NAMES_SHARP.indexOf(c.root);
      if (chordRootPc === -1) chordRootPc = NOTE_NAMES_FLAT.indexOf(c.root);
      if (chordRootPc === -1) return;

      const semitones = (chordRootPc - rootPc + 12) % 12;
      const isFirst = idx === 0;
      const isLast = idx === parsedChords.length - 1;
      const q = c.qualityDef.quality;
      const isMinor = (q.startsWith("m") && !q.startsWith("maj")) || q.includes("dim") || q === "m7b5";

      // Diatonic qualities in Minor: 0:m, 2:dim, 3:M, 5:m, 7:M(harmonic)/m(natural), 8:M, 10:M
      if (semitones === 0) {
        minorScore += isMinor ? 8 : -4;
        if (isFirst) minorScore += 10;
        if (isLast) minorScore += 8;
      } else if (semitones === 2) {
        minorScore += q.includes("dim") ? 4 : 1;
      } else if (semitones === 3) {
        minorScore += !isMinor ? 5 : 1;
      } else if (semitones === 5) {
        minorScore += isMinor ? 6 : 1;
      } else if (semitones === 7) {
        minorScore += !isMinor ? 8 : 4; // V or V7 in minor is major/dom7
        if (isLast) minorScore += 3;
      } else if (semitones === 8) {
        minorScore += !isMinor ? 5 : 1;
      } else if (semitones === 10) {
        minorScore += !isMinor ? 5 : 1;
      } else {
        minorScore -= 5;
      }
    });

    if (minorScore > maxScore) {
      maxScore = minorScore;
      bestKey = rootName;
      bestMode = "minor";
    }
  }

  const displayName = `${bestKey} ${bestMode === "major" ? "Major" : "Minor"}`;
  return {
    key: bestKey,
    root: bestKey,
    mode: bestMode,
    displayName,
  };
}

export function getRomanNumeral(chordName: string, keyRoot: string, mode: "major" | "minor"): string {
  const parsed = parseChordName(chordName);
  if (!parsed) return chordName;

  let keyPc = NOTE_NAMES_SHARP.indexOf(keyRoot);
  if (keyPc === -1) keyPc = NOTE_NAMES_FLAT.indexOf(keyRoot);
  if (keyPc === -1) keyPc = 0;

  let chordPc = NOTE_NAMES_SHARP.indexOf(parsed.root);
  if (chordPc === -1) chordPc = NOTE_NAMES_FLAT.indexOf(parsed.root);
  if (chordPc === -1) return chordName;

  const semitones = (chordPc - keyPc + 12) % 12;
  const scale = mode === "major" ? MAJOR_SCALE : MINOR_SCALE;
  const scaleIndex = scale.indexOf(semitones);

  let romanBase = "";
  if (scaleIndex !== -1) {
    romanBase = mode === "major" ? MAJOR_DIATONIC_ROMAN[scaleIndex] : MINOR_DIATONIC_ROMAN[scaleIndex];
  } else {
    // Non-diatonic, e.g., bII, bVI, #IV
    const intervalMap: Record<number, string> = {
      1: "bII",
      3: mode === "major" ? "bIII" : "III",
      6: "#IV",
      8: mode === "major" ? "bVI" : "VI",
      10: mode === "major" ? "bVII" : "VII",
    };
    romanBase = intervalMap[semitones] || parsed.root;
  }

  // Append quality extensions e.g. 7, maj7, dim, etc.
  const qual = parsed.qualityDef.quality;
  if (qual === "7") return `${romanBase}7`;
  if (qual === "maj7") return `${romanBase}maj7`;
  if (qual === "m7") return `${romanBase}7`;
  if (qual === "m7b5") return `${romanBase}ø7`;
  if (qual === "dim7") return `${romanBase}°7`;
  if (qual === "sus4") return `${romanBase}sus4`;
  if (qual === "sus2") return `${romanBase}sus2`;
  if (qual === "add9") return `${romanBase}add9`;

  return romanBase;
}
