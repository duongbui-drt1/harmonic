/**
 * HarmonicX Music Terminology & Vocabulary System
 * Chuẩn thuật ngữ âm nhạc & lý thuyết âm nhạc tiếng Việt chuyên nghiệp
 */

export interface MusicTermDef {
  vi: string;
  en: string;
  desc: string;
  category: "pitch" | "chord" | "interval" | "scale" | "rhythm" | "harmony" | "ear_training";
}

export const MUSIC_TERMINOLOGY: Record<string, MusicTermDef> = {
  note: {
    vi: "Nốt",
    en: "Note",
    desc: "Một âm thanh âm nhạc đơn lẻ có cao độ và trường độ xác định.",
    category: "pitch",
  },
  pitch: {
    vi: "Cao độ",
    en: "Pitch",
    desc: "Độ cao thấp của âm thanh do tần số rung quy định.",
    category: "pitch",
  },
  octave: {
    vi: "Quãng tám",
    en: "Octave",
    desc: "Khoảng cách giữa hai nốt cùng tên ở hai tầng cao độ kế tiếp (tỷ lệ tần số 2:1).",
    category: "interval",
  },
  semitone: {
    vi: "Nửa cung",
    en: "Semitone / Half-step",
    desc: "Khoảng cách nhỏ nhất giữa hai phím đàn liền kề trên bàn phím.",
    category: "interval",
  },
  tone: {
    vi: "Nguyên cung",
    en: "Whole tone / Whole-step",
    desc: "Khoảng cách tương đương 2 nửa cung (cách nhau 2 phím đàn liền kề).",
    category: "interval",
  },
  interval: {
    vi: "Quãng",
    en: "Interval",
    desc: "Khoảng cách cao độ giữa hai nốt nhạc.",
    category: "interval",
  },
  majorThird: {
    vi: "Quãng ba trưởng",
    en: "Major Third",
    desc: "Khoảng cách 4 nửa cung (2 nguyên cung), mang cảm giác sáng và tươi vui.",
    category: "interval",
  },
  minorThird: {
    vi: "Quãng ba thứ",
    en: "Minor Third",
    desc: "Khoảng cách 3 nửa cung (1.5 nguyên cung), mang sắc thái trầm buồn và sâu lắng.",
    category: "interval",
  },
  perfectFifth: {
    vi: "Quãng năm đúng",
    en: "Perfect Fifth",
    desc: "Khoảng cách 7 nửa cung (3.5 nguyên cung), trụ cột vững chắc của mọi hợp âm.",
    category: "interval",
  },
  chord: {
    vi: "Hợp âm",
    en: "Chord",
    desc: "Sự kết hợp đồng thời của ba hoặc nhiều nốt nhạc vang lên cùng lúc.",
    category: "chord",
  },
  triad: {
    vi: "Hợp âm ba",
    en: "Triad",
    desc: "Hợp âm cơ bản gồm ba nốt: Nốt gốc, Quãng ba và Quãng năm.",
    category: "chord",
  },
  seventhChord: {
    vi: "Hợp âm bảy",
    en: "7th Chord",
    desc: "Hợp âm gồm bốn nốt: Nốt gốc, Quãng ba, Quãng năm và Quãng bảy.",
    category: "chord",
  },
  majorChord: {
    vi: "Hợp âm trưởng",
    en: "Major Chord",
    desc: "Hợp âm có cấu trúc Nốt gốc + Quãng ba trưởng + Quãng năm đúng. Âm sắc tươi sáng, ổn định.",
    category: "chord",
  },
  minorChord: {
    vi: "Hợp âm thứ",
    en: "Minor Chord",
    desc: "Hợp âm có cấu trúc Nốt gốc + Quãng ba thứ + Quãng năm đúng. Âm sắc trầm tư, da diết.",
    category: "chord",
  },
  diminishedChord: {
    vi: "Hợp âm giảm",
    en: "Diminished Chord",
    desc: "Hợp âm gồm Quãng ba thứ và Quãng năm giảm. Âm sắc căng thẳng, hồi hộp.",
    category: "chord",
  },
  augmentedChord: {
    vi: "Hợp âm tăng",
    en: "Augmented Chord",
    desc: "Hợp âm gồm Quãng ba trưởng và Quãng năm tăng (#5). Âm sắc huyền bí, lơ lửng.",
    category: "chord",
  },
  suspendedChord: {
    vi: "Hợp âm treo",
    en: "Suspended Chord (Sus)",
    desc: "Hợp âm thay thế nốt bậc 3 bằng nốt bậc 2 (Sus2) hoặc bậc 4 (Sus4), tạo cảm giác mở và chờ đợi giải quyết.",
    category: "chord",
  },
  chordInversion: {
    vi: "Đảo hợp âm",
    en: "Chord Inversion",
    desc: "Cách sắp xếp các nốt của hợp âm sao cho nốt trầm nhất (bass) không phải là nốt gốc.",
    category: "chord",
  },
  rootPosition: {
    vi: "Thế gốc",
    en: "Root Position",
    desc: "Hợp âm có nốt gốc nằm ở bè trầm nhất.",
    category: "chord",
  },
  firstInversion: {
    vi: "Đảo thứ nhất",
    en: "First Inversion",
    desc: "Hợp âm có nốt quãng ba nằm ở bè trầm nhất.",
    category: "chord",
  },
  secondInversion: {
    vi: "Đảo thứ hai",
    en: "Second Inversion",
    desc: "Hợp âm có nốt quãng năm nằm ở bè trầm nhất.",
    category: "chord",
  },
  scale: {
    vi: "Gam",
    en: "Scale",
    desc: "Chuỗi các nốt nhạc được sắp xếp theo thứ tự cao độ tăng hoặc giảm theo quy luật nhất định.",
    category: "scale",
  },
  majorScale: {
    vi: "Gam trưởng",
    en: "Major Scale",
    desc: "Gam gồm 7 nốt với công thức: Cung - Cung - Nửa - Cung - Cung - Cung - Nửa.",
    category: "scale",
  },
  naturalMinorScale: {
    vi: "Gam thứ tự nhiên",
    en: "Natural Minor Scale",
    desc: "Gam thứ cơ bản với công thức: Cung - Nửa - Cung - Cung - Nửa - Cung - Cung.",
    category: "scale",
  },
  key: {
    vi: "Giọng",
    en: "Key",
    desc: "Hệ thống các cao độ xoay quanh một nốt chủ âm (Tonic) làm trung tâm ổn định.",
    category: "harmony",
  },
  progression: {
    vi: "Tiến trình hợp âm",
    en: "Chord Progression",
    desc: "Chuỗi các hợp âm nối tiếp nhau tạo nên câu chuyện và cảm xúc hòa âm của bài nhạc.",
    category: "harmony",
  },
  tonic: {
    vi: "Chủ âm",
    en: "Tonic (I / i)",
    desc: "Nốt hoặc hợp âm bậc I, điểm tựa nghỉ ngơi và ổn định tuyệt đối trong một giọng.",
    category: "harmony",
  },
  dominant: {
    vi: "Át âm",
    en: "Dominant (V / V7)",
    desc: "Hợp âm bậc V, mang lực căng hòa âm mạnh nhất thôi thúc trở về chủ âm (I).",
    category: "harmony",
  },
  subdominant: {
    vi: "Hạ át",
    en: "Subdominant (IV / ii)",
    desc: "Hợp âm bậc IV hoặc ii, bước đệm rời xa chủ âm để chuẩn bị tiến vào át âm.",
    category: "harmony",
  },
  voiceLeading: {
    vi: "Dẫn bè",
    en: "Voice Leading",
    desc: "Nghệ thuật kết nối từng nốt riêng lẻ giữa các hợp âm sao cho mượt mà, hạn chế bước nhảy xa.",
    category: "harmony",
  },
  tension: {
    vi: "Căng thẳng hòa âm",
    en: "Harmonic Tension",
    desc: "Mức độ bất ổn định và lực đẩy âm thanh tạo cảm giác hồi hộp, chờ đợi.",
    category: "harmony",
  },
  resolution: {
    vi: "Giải quyết",
    en: "Resolution",
    desc: "Chuyển động từ một hợp âm căng thẳng (như V7, Sus4, Dim) về một hợp âm ổn định, êm tai (như I).",
    category: "harmony",
  },
  cadence: {
    vi: "Kết",
    en: "Cadence",
    desc: "Cụm hợp âm kết thúc một câu nhạc hoặc đoạn nhạc (như V → I là Kết trọn vẹn).",
    category: "harmony",
  },
  arpeggio: {
    vi: "Rải hợp âm",
    en: "Arpeggio",
    desc: "Phát lần lượt từng nốt cấu thành hợp âm thay vì bấm đồng thời cùng một lúc.",
    category: "rhythm",
  },
  timeSignature: {
    vi: "Số chỉ nhịp",
    en: "Time Signature",
    desc: "Ký hiệu chỉ số lượng phách trong một ô nhịp và giá trị trường độ của mỗi phách.",
    category: "rhythm",
  },
  tempo: {
    vi: "Nhịp độ (BPM)",
    en: "Tempo (BPM)",
    desc: "Tốc độ nhanh hay chậm của bài nhạc tính theo số phách mỗi phút.",
    category: "rhythm",
  },
  beat: {
    vi: "Phách",
    en: "Beat",
    desc: "Đơn vị thời gian cơ bản, nhịp đập nền tảng của tác phẩm âm nhạc.",
    category: "rhythm",
  },
  measure: {
    vi: "Ô nhịp",
    en: "Measure / Bar",
    desc: "Một đoạn thời gian chứa số phách nhất định được ngăn cách bởi vạch nhịp.",
    category: "rhythm",
  },
  earTraining: {
    vi: "Luyện tai nghe",
    en: "Ear Training",
    desc: "Rèn luyện khả năng nhận biết cao độ, quãng, hợp âm và tiết tấu bằng thính giác.",
    category: "ear_training",
  },
};

/**
 * Trả về tên tiếng Việt chuẩn của thuật ngữ
 */
export function getViTerm(key: keyof typeof MUSIC_TERMINOLOGY): string {
  return MUSIC_TERMINOLOGY[key]?.vi || key;
}

/**
 * Trả về tên song ngữ (Ví dụ: "Đảo hợp âm (Inversion)") khi cần chú thích giáo dục
 */
export function getBilingualTerm(key: keyof typeof MUSIC_TERMINOLOGY): string {
  const t = MUSIC_TERMINOLOGY[key];
  if (!t) return key;
  return `${t.vi} (${t.en})`;
}
