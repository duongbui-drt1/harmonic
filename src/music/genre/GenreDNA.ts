import { GenreHarmonyProfile } from "../types";

export const GENRE_PROFILES: GenreHarmonyProfile[] = [
  {
    id: "jpop",
    name: "J-Pop / Anime",
    description: "Vòng Hoàng Đạo Oudou (IV–V–iii–vi), hợp âm quãng 7 & 9 rực rỡ cảm xúc.",
    preferredChordTypes: ["maj7", "7", "m7", "sus4", "add9"],
    commonProgressions: [["Fmaj7", "G7", "Em7", "Am7"], ["C", "G/B", "Am", "Em/G", "F", "C/E", "Dm7", "G7"]],
    extensionWeight: 0.85,
    borrowedWeight: 0.60,
    chromaticismWeight: 0.50,
    typicalBpmRange: [125, 160],
    characteristicCadences: ["IV -> V -> iii -> vi", "bVI -> bVII -> I"],
  },
  {
    id: "citypop",
    name: "City Pop",
    description: "Âm hưởng Nhật Bản thập niên 80 hoài niệm, hợp âm bVII7, maj9, m11, Db7.",
    preferredChordTypes: ["maj7", "maj9", "m7", "m9", "bVII7", "subV7"],
    commonProgressions: [["Fmaj7", "Em7", "Dm7", "Db7", "Cmaj7"], ["Cmaj7", "A7", "Dm7", "G7"]],
    extensionWeight: 0.90,
    borrowedWeight: 0.80,
    chromaticismWeight: 0.75,
    typicalBpmRange: [110, 128],
    characteristicCadences: ["IVmaj7 -> iii7 -> ii7 -> subV7 -> Imaj7"],
  },
  {
    id: "neosoul",
    name: "Neo-Soul / R&B",
    description: "Hợp âm 9, 11, 13 mượt mà, rải nốt màu sắc, lướt quãng 2 nhẹ nhàng.",
    preferredChordTypes: ["maj9", "m9", "m11", "13", "7alt"],
    commonProgressions: [["Fmaj9", "Em11", "Dm9", "Cmaj9"], ["Abmaj7", "G7alt", "Cm11", "F13"]],
    extensionWeight: 0.95,
    borrowedWeight: 0.70,
    chromaticismWeight: 0.65,
    typicalBpmRange: [75, 95],
    characteristicCadences: ["ii9 -> V13 -> Imaj9"],
  },
  {
    id: "vpop",
    name: "V-Pop Indie & Ballad",
    description: "Nhẹ nhàng như quán cafe góc phố, hòa âm sâu lắng gần gũi.",
    preferredChordTypes: ["maj7", "m7", "add9", "sus2"],
    commonProgressions: [["Fmaj7", "Em7", "Dm7", "Cmaj7"], ["C", "G/B", "Am7", "Fmaj7"]],
    extensionWeight: 0.75,
    borrowedWeight: 0.40,
    chromaticismWeight: 0.30,
    typicalBpmRange: [72, 98],
    characteristicCadences: ["IVmaj7 -> iii7 -> ii7 -> Imaj7"],
  },
  {
    id: "jazz",
    name: "Jazz Standard",
    description: "ii–V–I kinh điển, hợp âm biếu chuyển 7th, 9th, 13th, tritone sub.",
    preferredChordTypes: ["m7", "7", "maj7", "m7b5", "dim7", "13"],
    commonProgressions: [["Dm7", "G7", "Cmaj7", "Cmaj7"], ["Fm7", "Bb7", "Ebmaj7", "Abmaj7", "Dm7b5", "G7", "Cm7"]],
    extensionWeight: 0.95,
    borrowedWeight: 0.85,
    chromaticismWeight: 0.90,
    typicalBpmRange: [100, 180],
    characteristicCadences: ["ii7 -> V7 -> Imaj7", "subV7 -> Imaj7"],
  },
];

export function transformMakeItMore(
  chords: Array<{ name: string; beats: number }>,
  targetStyle: string,
  keyRoot = "C"
): Array<{ name: string; beats: number }> {
  if (!chords || chords.length === 0) return [];

  return chords.map((c) => {
    let name = c.name;
    const style = targetStyle.toLowerCase();

    if (style.includes("emotional") || style.includes("romantic")) {
      if (name === "C") name = "Cmaj7";
      if (name === "Am") name = "Am7";
      if (name === "G") name = "G/B";
      if (name === "F") name = "Fmaj7";
    } else if (style.includes("jazzy") || style.includes("neo soul")) {
      if (name === "C") name = "Cmaj9";
      if (name === "Am") name = "Am9";
      if (name === "Dm") name = "Dm11";
      if (name === "G7" || name === "G") name = "G13";
    } else if (style.includes("j-pop") || style.includes("anime")) {
      if (name === "C") name = "Cmaj7";
      if (name === "F") name = "Fmaj7";
      if (name === "G") name = "G7";
      if (name === "Em") name = "Em7";
    } else if (style.includes("dark") || style.includes("unstable")) {
      if (name === "C") name = "Cm";
      if (name === "F") name = "Fm";
      if (name === "G") name = "G7b9";
    } else if (style.includes("nostalgic")) {
      if (name === "G") name = "Db7";
      if (name === "F") name = "Fm6";
    }

    return { name, beats: c.beats };
  });
}
