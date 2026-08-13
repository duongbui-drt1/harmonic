import { WhatIfOption } from "../types";

export function exploreWhatIfTransformations(selectedChord: string, keyRoot = "C"): WhatIfOption[] {
  if (!selectedChord) return [];

  return [
    {
      title: "Giải kết về Chủ âm (Tonic Resolution)",
      originalChord: selectedChord,
      targetChord: `${keyRoot}maj7`,
      category: "Resolution",
      theoreticalExplanation: `Giải phóng hoàn toàn sức hút căng thẳng của ${selectedChord} về điểm tựa Chủ âm ${keyRoot}maj7.`,
      expectedEffect: "Tạo cảm giác bình yên, trọn vẹn và giải tỏa hoàn toàn.",
    },
    {
      title: "Thay thế bằng Tam Thanh (Tritone Substitution)",
      originalChord: selectedChord,
      targetChord: "Db7",
      category: "Tritone Sub",
      theoreticalExplanation: "Giữ nguyên 2 nốt hướng dẫn (Guide Tones) F & B nhưng đổi nốt G sang Db.",
      expectedEffect: "Mang lại âm hưởng Jazz Chromatic mượt mà bất ngờ.",
    },
    {
      title: "Biến thành Hợp âm Treo (Suspended Chord)",
      originalChord: selectedChord,
      targetChord: "Gsus4",
      category: "Suspension",
      theoreticalExplanation: "Thay nốt B bậc 3 bằng nốt C bậc 4 treo lơ lửng chờ giải quyết.",
      expectedEffect: "Tạo không gian lung linh, bay bổng đắn đo.",
    },
    {
      title: "Vay mượn từ Giọng Thứ (Borrowed Secondary)",
      originalChord: selectedChord,
      targetChord: "Abmaj7",
      category: "Modal Interchange",
      theoreticalExplanation: "Lấy hợp âm bVI mượn từ giọng C minor để đổi hướng màu sắc.",
      expectedEffect: "Tạo chiều sâu hoài niệm, điện ảnh da diết.",
    },
    {
      title: "Chuyển sang Cửa sau (Backdoor Resolution)",
      originalChord: selectedChord,
      targetChord: "Bb7",
      category: "Backdoor Dominant",
      theoreticalExplanation: "Dùng bVII7 sấn tới Imaj7 từ dưới vút lên.",
      expectedEffect: "Ấm áp, phóng khoáng, rất được ưa chuộng trong Pop & Soul.",
    },
  ];
}
