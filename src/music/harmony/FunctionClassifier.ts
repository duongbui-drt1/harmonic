import { HarmonicFunctionAnalysis, HarmonicFunctionRole } from "../types";
import { analyzeRomanNumeralAdvanced } from "./RomanAnalysis";

export function classifyHarmonicFunction(
  chordName: string,
  keyRoot: string = "C",
  keyMode: "major" | "minor" = "major",
  nextChordName?: string
): HarmonicFunctionAnalysis {
  const romanInfo = analyzeRomanNumeralAdvanced(chordName, keyRoot, keyMode, nextChordName);

  let role: HarmonicFunctionRole = romanInfo.functionRole;
  let explanation = romanInfo.explanation;
  let tendency = "";
  let colorHex = "#7c5cbf";

  switch (role) {
    case "Tonic":
      colorHex = "#10b981"; // Emerald green
      tendency = "Điểm tựa ổn định, cảm giác nghỉ ngơi, giải kết thúc ô nhịp.";
      break;
    case "Predominant":
      colorHex = "#3b82f6"; // Blue
      tendency = "Tạo đà đưa lên hợp âm Át (Dominant V) hoặc dẫn nhập cầu nối.";
      break;
    case "Dominant":
      colorHex = "#f59e0b"; // Amber/Orange
      tendency = "Sức hút căng thẳng cực lớn thúc giục giải về Chủ âm (Tonic I).";
      break;
    case "Secondary Dominant":
      colorHex = "#8b5cf6"; // Purple
      tendency = `Sức hút dồn dập chuẩn bị nhảy vọt sang ${romanInfo.appliedTarget || "bậc tiếp theo"}.`;
      break;
    case "Substitute":
      colorHex = "#ec4899"; // Pink
      tendency = "Thay thế độc đáo tạo bất ngờ về màu sắc chuyển nốt.";
      break;
    case "Borrowed":
      colorHex = "#06b6d4"; // Cyan
      tendency = "Gia tăng độ sâu lắng, hoài niệm khi mượn màu sắc điệu tính song song.";
      break;
    default:
      colorHex = "#6b7280";
      tendency = "Tạo màu sắc chuyển tiếp quyến rũ.";
      break;
  }

  return {
    chordName,
    role,
    explanation,
    tendencyToResolveTo: tendency,
    colorHex,
  };
}
