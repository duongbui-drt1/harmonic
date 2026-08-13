import { DiagnosisReport } from "../types";

export function diagnoseProgression(chords: Array<{ name: string; beats: number }>, keyRoot = "C"): DiagnosisReport {
  if (!chords || chords.length === 0) {
    return {
      overallScore: 0,
      pros: [],
      warnings: ["Chưa có hợp âm nào trên Timeline."],
      suggestions: ["Hãy thêm ít nhất 4 hợp âm để tiến hành chẩn đoán hòa âm."],
      keyMetrics: { diatonicRatio: 0, harmonicVariety: 0, tensionResolutionBalance: 0, basslineSmoothness: 0 },
    };
  }

  const names = chords.map((c) => c.name);
  const uniqueNames = Array.from(new Set(names));
  const harmonicVariety = Math.round((uniqueNames.length / names.length) * 100);

  const pros: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check tonic establishment
  const startsWithTonic = names[0].startsWith(keyRoot);
  if (startsWithTonic) {
    pros.push("Xác lập Chủ âm (Tonic) vững chắc ngay từ đầu.");
  } else {
    warnings.push("Vòng hợp âm không bắt đầu bằng Chủ âm.");
    suggestions.push(`Thử mở đầu bằng hợp âm Chủ ${keyRoot} hoặc ${keyRoot}maj7 để làm điểm tựa.`);
  }

  // Check variety
  if (names.length >= 4 && uniqueNames.length <= 2) {
    warnings.push("Hợp âm lặp lại khá đơn điệu.");
    suggestions.push("Bổ sung hợp âm bậc vi (Am) hoặc ii (Dm) để tăng màu sắc.");
  } else {
    pros.push("Độ đa dạng hợp âm cân đối, có điểm nhấn phong phú.");
  }

  // Check dominant resolution
  const hasDominant = names.some((n) => n.includes("7") || n.startsWith("G"));
  if (hasDominant) {
    pros.push("Có chuyển động Át (Dominant) tạo lực hút mạnh mẽ.");
  } else {
    suggestions.push("Bổ sung hợp âm Dominant V (G7) hoặc Secondary Dominant để tạo sức hút giải kết.");
  }

  // Check chromaticism
  const isAllDiatonic = names.every((n) => ["C", "Dm", "Em", "F", "G", "Am", "Bdim", "Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7"].includes(n));
  if (isAllDiatonic) {
    warnings.push("Toàn bộ hợp âm là Diatonic thuần túy, có thể hơi dự đoán được (Predictable).");
    suggestions.push("Bổ sung 1 hợp âm vay mượn (Borrowed Chord) như Fm hoặc Bb7 để gây bất ngờ.");
  } else {
    pros.push("Sử dụng hợp âm biến thể Chromatic/Vay mượn ấn tượng.");
  }

  return {
    overallScore: Math.min(98, Math.max(50, 60 + pros.length * 10 - warnings.length * 8)),
    pros,
    warnings,
    suggestions,
    keyMetrics: {
      diatonicRatio: isAllDiatonic ? 100 : 75,
      harmonicVariety,
      tensionResolutionBalance: hasDominant ? 85 : 55,
      basslineSmoothness: 80,
    },
  };
}
