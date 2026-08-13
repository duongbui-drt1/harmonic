import { VoiceLeadingComparison, VoiceLeadingNoteMotion, SmootherVoicingOption } from "../types";
import { parseChordSymbolString, getChordMidiNotesFromSymbol, midiToPitchClass } from "../chords/ChordSymbol";

export function compareVoiceLeading(chordAStr: string, chordBStr: string): VoiceLeadingComparison {
  const symA = parseChordSymbolString(chordAStr);
  const symB = parseChordSymbolString(chordBStr);

  const midisA = getChordMidiNotesFromSymbol(symA, 4);
  let midisB = getChordMidiNotesFromSymbol(symB, 4);

  // Align length by padding or taking closest voices
  const minLen = Math.min(midisA.length, midisB.length);
  const noteMotions: VoiceLeadingNoteMotion[] = [];
  const commonTones: string[] = [];
  let totalDist = 0;

  for (let i = 0; i < minLen; i++) {
    const ma = midisA[i];
    const mb = midisB[i];
    const diff = mb - ma;
    totalDist += Math.abs(diff);

    const nameA = midiToPitchClass(ma);
    const nameB = midiToPitchClass(mb);

    let motionType: VoiceLeadingNoteMotion["motionType"] = "common_tone";
    if (diff === 0) {
      motionType = "common_tone";
      commonTones.push(nameA);
    } else if (diff === 1 || diff === 2) {
      motionType = "step_up";
    } else if (diff === -1 || diff === -2) {
      motionType = "step_down";
    } else if (diff > 2) {
      motionType = "leap_up";
    } else {
      motionType = "leap_down";
    }

    noteMotions.push({
      fromNote: `${nameA}${Math.floor(ma / 12) - 1}`,
      toNote: `${nameB}${Math.floor(mb / 12) - 1}`,
      fromMidi: ma,
      toMidi: mb,
      semitones: diff,
      motionType,
    });
  }

  const avgMove = minLen > 0 ? totalDist / minLen : 0;
  // Score: 100% minus penalty for distance
  const smoothnessScore = Math.max(10, Math.min(100, Math.round(100 - avgMove * 12 + commonTones.length * 10)));

  return {
    chordA: chordAStr,
    chordB: chordBStr,
    noteMotions,
    commonTones: Array.from(new Set(commonTones)),
    totalSemitoneMovement: totalDist,
    averageMovement: parseFloat(avgMove.toFixed(2)),
    smoothnessScore,
    parallel5thsOrOctaves: false,
  };
}

export function findSmootherVoicings(chordAStr: string, chordBStr: string): SmootherVoicingOption[] {
  const symA = parseChordSymbolString(chordAStr);
  const symB = parseChordSymbolString(chordBStr);
  const midisA = getChordMidiNotesFromSymbol(symA, 4);

  const baseMidisB = getChordMidiNotesFromSymbol(symB, 4);

  const options: SmootherVoicingOption[] = [];

  // Generate candidate inversions / octave shifts for chord B
  const inversions = [
    { name: `${symB.fullName} (Root Position)`, midis: baseMidisB, inv: 0 },
    { name: `${symB.fullName} (1st Inversion)`, midis: [baseMidisB[1] || baseMidisB[0], baseMidisB[2] || baseMidisB[0], (baseMidisB[0] || 0) + 12], inv: 1 },
    { name: `${symB.fullName} (2nd Inversion)`, midis: [baseMidisB[2] || baseMidisB[0], (baseMidisB[0] || 0) + 12, (baseMidisB[1] || 0) + 12], inv: 2 },
  ];

  for (const item of inversions) {
    const minLen = Math.min(midisA.length, item.midis.length);
    let dist = 0;
    for (let i = 0; i < minLen; i++) {
      dist += Math.abs(item.midis[i] - midisA[i]);
    }
    const score = Math.max(10, Math.min(100, Math.round(100 - (dist / minLen) * 12)));
    options.push({
      voicingName: item.name,
      midiNotes: item.midis,
      noteNames: item.midis.map((m) => midiToPitchClass(m)),
      inversion: item.inv,
      totalMovement: dist,
      smoothnessScore: score,
    });
  }

  return options.sort((a, b) => b.smoothnessScore - a.smoothnessScore);
}
