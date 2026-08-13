import { PresetProgression } from "../types";

// Helper to generate presets cleanly up to 50 for each instrument
function createInstrumentPresets(
  prefix: string,
  instrument: any,
  genreList: Array<{ title: string; genre: string; key: string; mode: "major" | "minor"; bpm: number; timeSig: "3/4" | "4/4" | "6/8"; chords: Array<{ name: string; beats: number }>; desc: string }>
): PresetProgression[] {
  return genreList.map((g, idx) => ({
    id: `${prefix}-${idx + 1}`,
    title: g.title,
    genre: g.genre,
    instrument,
    description: g.desc,
    key: g.key,
    mode: g.mode,
    bpm: g.bpm,
    timeSignature: g.timeSig,
    chords: g.chords,
  }));
}

// 50 Piano Presets
export const PIANO_PRESETS: PresetProgression[] = Array.from({ length: 50 }, (_, i) => {
  const genres = ["Pop", "Ballad", "J-Pop", "Classical", "Jazz", "R&B", "Neo-Soul", "Lo-Fi", "Cinematic", "Gospel"];
  const g = genres[i % genres.length];
  const keys = ["C", "G", "D", "A", "E", "F", "Bb", "Eb", "Am", "Em"];
  const key = keys[i % keys.length];
  const mode = key.endsWith("m") ? "minor" : "major";

  const pianoPatterns = [
    [{ name: "Cmaj7", beats: 4 }, { name: "Am7", beats: 4 }, { name: "Dm7", beats: 4 }, { name: "G7", beats: 4 }],
    [{ name: "Fmaj7", beats: 4 }, { name: "G7", beats: 4 }, { name: "Em7", beats: 4 }, { name: "Am7", beats: 4 }],
    [{ name: "C", beats: 4 }, { name: "G/B", beats: 4 }, { name: "Am", beats: 4 }, { name: "F", beats: 4 }],
    [{ name: "Dm7", beats: 4 }, { name: "G7", beats: 4 }, { name: "Cmaj7", beats: 4 }, { name: "A7", beats: 4 }],
    [{ name: "Am", beats: 4 }, { name: "F", beats: 4 }, { name: "C", beats: 4 }, { name: "G", beats: 4 }],
  ];

  return {
    id: `piano-${i + 1}`,
    title: `Piano ${g} Masterwork #${i + 1}`,
    genre: g,
    instrument: "piano",
    description: `Preset Piano ${g} chuyên nghiệp số ${i + 1} hòa âm mượt mà.`,
    key: key.replace("m", ""),
    mode,
    bpm: 70 + (i * 3) % 80,
    timeSignature: i % 7 === 0 ? "3/4" : "4/4",
    chords: pianoPatterns[i % pianoPatterns.length],
  };
});

// 50 Guitar Presets
export const GUITAR_PRESETS: PresetProgression[] = Array.from({ length: 50 }, (_, i) => {
  const genres = ["Acoustic", "Rock", "Blues", "Country", "Flamenco", "Funk", "Indie", "Metal", "Reggae", "Bossa Nova"];
  const g = genres[i % genres.length];
  const keys = ["G", "C", "D", "E", "A", "Em", "Am", "F"];
  const key = keys[i % keys.length];
  const mode = key.endsWith("m") ? "minor" : "major";

  const guitarPatterns = [
    [{ name: "G", beats: 4 }, { name: "D", beats: 4 }, { name: "Em", beats: 4 }, { name: "C", beats: 4 }],
    [{ name: "C", beats: 4 }, { name: "G", beats: 4 }, { name: "Am", beats: 4 }, { name: "F", beats: 4 }],
    [{ name: "Am", beats: 4 }, { name: "G", beats: 4 }, { name: "F", beats: 4 }, { name: "E7", beats: 4 }],
    [{ name: "E7", beats: 4 }, { name: "A7", beats: 4 }, { name: "B7", beats: 4 }, { name: "E7", beats: 4 }],
    [{ name: "D", beats: 4 }, { name: "A", beats: 4 }, { name: "Bm", beats: 4 }, { name: "G", beats: 4 }],
  ];

  return {
    id: `guitar-${i + 1}`,
    title: `Guitar ${g} Strum & Pick #${i + 1}`,
    genre: g,
    instrument: i % 2 === 0 ? "acoustic_guitar" : "electric_guitar",
    description: `Preset Guitar ${g} mộc mạc sắc nét số ${i + 1}.`,
    key: key.replace("m", ""),
    mode,
    bpm: 80 + (i * 2) % 70,
    timeSignature: "4/4",
    chords: guitarPatterns[i % guitarPatterns.length],
  };
});

// 50 Strings Presets
export const STRINGS_PRESETS: PresetProgression[] = Array.from({ length: 50 }, (_, i) => {
  const genres = ["Orchestral", "Cinematic", "Classical", "Baroque", "Traditional", "J-Pop", "Gothic", "Epic"];
  const g = genres[i % genres.length];
  const keys = ["D", "G", "C", "A", "Eb", "Dm", "Am", "Cm"];
  const key = keys[i % keys.length];

  const stringPatterns = [
    [{ name: "Dm", beats: 4 }, { name: "Bb", beats: 4 }, { name: "F", beats: 4 }, { name: "C", beats: 4 }],
    [{ name: "C", beats: 4 }, { name: "G", beats: 4 }, { name: "Am", beats: 4 }, { name: "Em", beats: 4 }],
    [{ name: "Am", beats: 4 }, { name: "F", beats: 4 }, { name: "Dm", beats: 4 }, { name: "E7", beats: 4 }],
    [{ name: "Cm", beats: 4 }, { name: "Ab", beats: 4 }, { name: "Eb", beats: 4 }, { name: "Bb", beats: 4 }],
  ];

  return {
    id: `strings-${i + 1}`,
    title: `Symphonic Strings ${g} #${i + 1}`,
    genre: g,
    instrument: "strings",
    description: `Dàn dây Orchestral Strings ${g} tráng lệ số ${i + 1}.`,
    key: key.replace("m", ""),
    mode: key.endsWith("m") ? "minor" : "major",
    bpm: 65 + (i * 3) % 75,
    timeSignature: i % 6 === 0 ? "3/4" : "4/4",
    chords: stringPatterns[i % stringPatterns.length],
  };
});

// 50 Drums Presets
export const DRUMS_PRESETS: PresetProgression[] = Array.from({ length: 50 }, (_, i) => {
  const genres = ["Pop", "Rock", "Funk", "Hip-Hop", "Trap", "Lo-Fi", "Reggae", "Disco", "Jazz", "Latin"];
  const g = genres[i % genres.length];

  return {
    id: `drums-${i + 1}`,
    title: `Drums Groove ${g} Beat #${i + 1}`,
    genre: g,
    instrument: "drums",
    description: `Tiết tấu Trống Drum Kit ${g} nảy phách cuốn hút số ${i + 1}.`,
    key: "C",
    mode: "major",
    bpm: 85 + (i * 2) % 80,
    timeSignature: "4/4",
    chords: [{ name: "C", beats: 4 }, { name: "G", beats: 4 }, { name: "Am", beats: 4 }, { name: "F", beats: 4 }],
  };
});

// 50 Synth / Bass Presets
export const SYNTH_PRESETS: PresetProgression[] = Array.from({ length: 50 }, (_, i) => {
  const genres = ["Synthwave", "EDM", "House", "Cyberpunk", "Future Bass", "Chillwave", "Ambient"];
  const g = genres[i % genres.length];

  return {
    id: `synth-${i + 1}`,
    title: `Synth & Electronic ${g} #${i + 1}`,
    genre: g,
    instrument: "piano",
    description: `Preset Synthesizer & Bass ${g} số ${i + 1}.`,
    key: "A",
    mode: "minor",
    bpm: 110 + (i * 2) % 40,
    timeSignature: "4/4",
    chords: [{ name: "Am7", beats: 4 }, { name: "Fmaj7", beats: 4 }, { name: "Cmaj7", beats: 4 }, { name: "G7", beats: 4 }],
  };
});

export const ALL_PRESETS: PresetProgression[] = [
  ...PIANO_PRESETS,
  ...GUITAR_PRESETS,
  ...STRINGS_PRESETS,
  ...DRUMS_PRESETS,
  ...SYNTH_PRESETS,
];
