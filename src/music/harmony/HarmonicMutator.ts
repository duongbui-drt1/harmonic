import { MutationVariant, WhatIfOption } from "../types";

export function generateHarmonicMutations(chords: Array<{ name: string; beats: number }>, keyRoot = "C"): MutationVariant[] {
  if (!chords || chords.length === 0) return [];

  const originalNames = chords.map((c) => c.name);

  // Variant 1: Jazz & Upper Extensions
  const jazzMutated = chords.map((c) => {
    let name = c.name;
    if (name === "C") name = "Cmaj9";
    else if (name === "Am") name = "Am9";
    else if (name === "Dm") name = "Dm11";
    else if (name === "G7") name = "G13";
    else if (name === "F") name = "Fmaj7";
    return { name, beats: c.beats };
  });

  // Variant 2: Secondary Dominants & Tritone Substitution
  const secDomMutated = chords.map((c, idx) => {
    let name = c.name;
    if (idx === 1 && name.startsWith("A")) name = "A7";
    if (idx === 3 && (name === "G" || name === "G7")) name = "Db7";
    return { name, beats: c.beats };
  });

  // Variant 3: Borrowed Chords & Modal Interchange
  const borrowedMutated = chords.map((c, idx) => {
    let name = c.name;
    if (idx === 3 && (name === "F" || name === "G")) name = "Fm6";
    if (idx === 2 && name === "Dm") name = "Abmaj7";
    return { name, beats: c.beats };
  });

  // Variant 4: Inversions & Slash Bass Stepwise Motion
  const slashBassMutated = chords.map((c, idx) => {
    let name = c.name;
    if (idx === 1 && name === "G") name = "G/B";
    if (idx === 2 && name === "Am") name = "Am/G";
    return { name, beats: c.beats };
  });

  return [
    {
      title: "Jazz & Upper Extensions (Phát triển bậc cao)",
      category: "Upper Extension",
      originalChords: originalNames,
      mutatedChords: jazzMutated,
      theoryExplanation: "Bổ sung các quãng mở rộng 9th, 11th, 13th để tăng độ ấm mượt, đầy đặn chuẩn phong cách Jazz / Neo-Soul.",
      harmonicImpact: "Biến chuyển không gian âm nhạc trở nên sang trọng, lãng mạn và tinh tế hơn.",
    },
    {
      title: "Secondary Dominants & Tritone Sub (Chuyển màu căng thẳng)",
      category: "Secondary Dominant",
      originalChords: originalNames,
      mutatedChords: secDomMutated,
      theoryExplanation: "Chèn hợp âm Át phụ A7 chuẩn bị nhảy sang Dm, và dùng Tritone Sub Db7 thay cho G7.",
      harmonicImpact: "Tạo lực hút căng thẳng bùng nổ, quyến rũ không ngờ.",
    },
    {
      title: "Borrowed Chords & Modal Interchange (Mượn màu điệu tính)",
      category: "Borrowed Chord",
      originalChords: originalNames,
      mutatedChords: borrowedMutated,
      theoryExplanation: "Thay thế bằng các hợp âm vay mượn Fm6 & Abmaj7 từ giọng Thứ song song C minor.",
      harmonicImpact: "Mang lại màu sắc hoài niệm, sâu lắng và mang mác buồn da diết.",
    },
    {
      title: "Slash Bass & Smooth Stepwise Contour (Bass vuốt mượt)",
      category: "Inversion / Slash Bass",
      originalChords: originalNames,
      mutatedChords: slashBassMutated,
      theoryExplanation: "Tạo ngón Bass đảo C -> G/B -> Am/G chuyển dịch từng bước nhỏ rải mượt.",
      harmonicImpact: "Giúp đường tiếng Trầm (Bassline) di chuyển êm đềm, liền mạch.",
    },
  ];
}
