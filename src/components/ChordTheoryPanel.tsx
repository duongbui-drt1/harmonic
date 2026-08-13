import React from "react";
import { ChordItem } from "../types";
import { parseChordName } from "../utils/chordData";
import { GuitarDiagram } from "./GuitarDiagram";
import { generatePianoKeys } from "../utils/noteNames";
import {
  BookOpen,
  Info,
  Volume2,
  Play,
  Sparkles,
  GitCommit,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight
} from "lucide-react";

interface ChordTheoryPanelProps {
  chords?: ChordItem[];
  selectedChord?: ChordItem | null;
  activeKey?: string;
  onSelectChord?: (chord: ChordItem) => void;
  onPlayPreview?: (chord: ChordItem) => void;
  onPlaySequence?: () => void;
}

// Famous Progression Patterns Recognition Utility
interface PatternInfo {
  name: string;
  genre: string;
  mood: string;
  description: string;
  theoryInsight: string;
}

function detectProgressionPattern(romanList: string[]): PatternInfo | null {
  if (romanList.length === 0) return null;
  const seqStr = romanList.map((r) => r.replace(/[^IViiva-z0-[#]/gi, "")).join("-");

  // Check common patterns
  if (seqStr.includes("I-V-vi-IV") || seqStr.includes("i-VI-III-VII")) {
    return {
      name: "Vòng Pop 4 Hợp Âm Quốc Dân (Axis of Awesome)",
      genre: "Pop, Ballad, Rock, V-Pop",
      mood: "Sáng sáng, quen thuộc, tràn đầy năng lượng & cuốn hút",
      description: "Vòng hòa âm huyền thoại xuất hiện trong hơn 30% các bản Pop Hit toàn cầu (Perfect - Ed Sheeran, Let It Be - Beatles, Despacito...).",
      theoryInsight: "Bắt đầu bằng Chủ Âm (I), đẩy sang Thống Lĩnh (V), chuyển tiếp sang Thứ Song Song (vi) và hạ kết nhẹ ở Hạ Thống Lĩnh (IV) trước khi quay về I.",
    };
  }

  if (seqStr.includes("vi-IV-I-V")) {
    return {
      name: "Vòng Pop Cảm Thán (Sensitive Female Progression)",
      genre: "Pop, Indie, Emo Ballad, R&B",
      mood: "Sâu lắng, u buồn nhẹ, nội tâm & da diết",
      description: "Sử dụng hợp âm Thứ (vi) mở đầu tạo cảm giác hoài niệm, rất phổ biến trong các bản Ballad u buồn (Apologize - OneRepublic, Grenade - Bruno Mars).",
      theoryInsight: "Chuyển màu sắc từ Am (vi) mở đầu, mượn sức căng của IV & I trước khi giải kết bằng V.",
    };
  }

  if (seqStr.includes("IV-V-iii-vi") || seqStr.includes("IV-V-I")) {
    return {
      name: "Vòng Nhạc Trẻ Hoàng Gia J-Pop (Royal Road / Oudourou)",
      genre: "J-Pop, Anime OST, V-Pop Modern, K-Pop",
      mood: "Kịch tính, sang trọng, giàu cảm xúc & cao trào",
      description: "Cấu trúc 'Con Đường Hoàng Gia' nổi tiếng trong âm nhạc Nhật Bản và V-Pop hiện đại (nhạc Vũ Cát Tường, Sơn Tùng M-TP, Yoasobi).",
      theoryInsight: "Bắt đầu bằng Hạ Thống Lĩnh (IV) tạo lực treo lơ lửng, bước qua V rồi rơi xuống iii-vi tạo điểm nhấn cảm xúc ngọt ngào.",
    };
  }

  if (seqStr.includes("ii-V-I") || seqStr.includes("ii7-V7-Imaj7")) {
    return {
      name: "Vòng Jazz Standard ii - V - I",
      genre: "Jazz, Bossa Nova, Neo-Soul, Lo-Fi",
      mood: "Sang trọng, êm dịu, tinh tế & chuẩn mực",
      description: "Nền tảng hòa âm quan trọng nhất của âm nhạc Jazz và Lo-Fi Chillout.",
      theoryInsight: "Chuỗi chuyển nhịp hoàn hảo từ Subdominant (ii) -> Dominant (V) -> Resolution (I).",
    };
  }

  if (seqStr.includes("I-vi-IV-V")) {
    return {
      name: "Vòng Pop cổ điển 50s Doo-Wop",
      genre: "Doo-Wop, Oldies, R&B 50s, Pop Ballad",
      mood: "Lãng mạn, hoài niệm thập niên 50-60, dịu dàng",
      description: "Tiêu chuẩn cho các bài hát tình ca cổ điển (Stand By Me, Earth Angel, Last Kiss).",
      theoryInsight: "Luân chuyển tuần hoàn hoàn hảo qua 4 bậc diatonic cốt lõi I -> vi -> IV -> V.",
    };
  }

  if (seqStr.includes("i-VII-VI-V") || seqStr.includes("i-bVII-bVI-V")) {
    return {
      name: "Vòng Andalusian Cadence (Tây Ban Nha / Flamenco)",
      genre: "Flamenco, Latin, Rock, Epic Film Score",
      mood: "Mạnh mẽ, kịch tính, mang âm hưởng Tây Ban Nha cổ điển",
      description: "Chuỗi hợp âm đi xuống liền bậc trầm hùng nổi tiếng trong nhạc Flamenco và Rock.",
      theoryInsight: "Tận dụng bước đi xuống nốt trầm (Bassline Descent) từ nốt Bậc i -> VII -> VI -> V.",
    };
  }

  if (seqStr.includes("I-V-vi-iii-IV-I-IV-V") || seqStr.includes("I-V-vi-iii")) {
    return {
      name: "Chu Kỳ Pachelbel Canon in D",
      genre: "Cổ Điển, Pop Ballad, Wedding Music",
      mood: "Thanh tao, bất hủ, rộng lớn & xao xuyến",
      description: "Trích từ bản Canon huyền thoại của Pachelbel, nền tảng cho vô số bài hát vượt thời gian.",
      theoryInsight: "Sự kết hợp giữa chuyển động Quinta đi xuống và bước nhảy quãng liền bậc.",
    };
  }

  // Generic fallback if no specific pattern matched
  return {
    name: `Vòng Hòa Âm Giọng ${romanList.length > 0 ? "Tự Do" : "Diatonic"}`,
    genre: "Đa thể loại",
    mood: "Đa dạng cảm xúc theo tiết tấu",
    description: "Chuỗi hợp âm được xây dựng tùy chỉnh theo cấu trúc hòa âm của bài hát.",
    theoryInsight: "Kết hợp giữa các bậc hợp âm chính và các hợp âm mở rộng màu sắc.",
  };
}

export const ChordTheoryPanel: React.FC<ChordTheoryPanelProps> = ({
  chords = [],
  selectedChord = null,
  activeKey = "C Major",
  onSelectChord,
  onPlayPreview,
  onPlaySequence,
}) => {
  // If no chords exist in progression timeline at all
  if (!chords || chords.length === 0) {
    return (
      <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-8 shadow-xl flex flex-col items-center justify-center text-center min-h-[320px]">
        <div className="p-4 bg-[#7c5cbf]/15 border border-[#7c5cbf]/30 rounded-2xl mb-3 text-[#a88beb]">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-white uppercase tracking-wider">Lý Thuyết & Phân Tích Chuỗi Hòa Âm</h3>
        <p className="text-xs text-gray-400 max-w-md mt-1.5 leading-relaxed">
          Chưa có hợp âm nào trên Dòng Thời Gian (Timeline). Bạn hãy chọn một <b>Preset Mẫu</b> hoặc tự thêm hợp âm từ <b>Bàn Phím Piano</b> để xem phân tích lý thuyết chuỗi hòa âm tự động!
        </p>
      </div>
    );
  }

  // Active inspecting chord (default to selected, or first in sequence)
  const inspectChord = selectedChord || chords[0];
  const parsed = inspectChord ? parseChordName(inspectChord.name) : null;
  const def = parsed?.qualityDef;
  const pianoKeys = generatePianoKeys(48, 71); // C3 to B4

  // Active pitch classes for piano highlight
  const activePitchClasses = (inspectChord?.midiNotes || []).map((m) => ((m % 12) + 12) % 12);

  // Extract all Roman numerals in sequence
  const romanList = chords.map((c) => c.romanNumeral || c.name);
  const patternInfo = detectProgressionPattern(romanList);

  // Analyze functional count
  const tonicCount = chords.filter((c) => {
    const r = c.romanNumeral || "";
    return r.startsWith("I") || r.startsWith("i") || r.startsWith("vi") || r.startsWith("VI");
  }).length;

  const subdominantCount = chords.filter((c) => {
    const r = c.romanNumeral || "";
    return r.startsWith("IV") || r.startsWith("iv") || r.startsWith("ii") || r.startsWith("II");
  }).length;

  const dominantCount = chords.filter((c) => {
    const r = c.romanNumeral || "";
    return r.startsWith("V") || r.startsWith("v") || r.startsWith("vii") || r.startsWith("VII");
  }).length;

  return (
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-5 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#2d2d3d]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block">
              Phân Tích Lý Thuyết Chuỗi Hòa Âm (Chord Sequence Analysis)
            </span>
            <span className="px-2 py-0.5 bg-[#252533] text-[#a88beb] border border-[#3d3d52] font-mono text-[10px] font-bold rounded">
              Giọng {activeKey}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#a88beb]" />
            Cấu Trúc Hòa Âm & Chuyển Điệu
          </h2>
        </div>

        {onPlaySequence && (
          <button
            onClick={onPlaySequence}
            className="px-4 py-2 bg-gradient-to-r from-[#7c5cbf] to-indigo-600 hover:from-[#8e6fd1] hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-md transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Phát Toàn Bộ Chuỗi ({chords.length} Hợp Âm)
          </button>
        )}
      </div>

      {/* SECTION 1: Dynamic Sequence Chain / Ribbon */}
      <div className="bg-[#0f0f13] border border-[#2d2d3d] p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-[#7c5cbf]" /> Chuỗi Hợp Âm Đang Phát (Chord Sequence)
          </label>
          <span className="text-[11px] text-gray-400 font-mono">
            {chords.length} Ô Nhịp · Bấm vào hợp âm để xem chi tiết
          </span>
        </div>

        {/* Sequence Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {chords.map((item, idx) => {
            const isSelected = inspectChord?.id === item.id;
            return (
              <React.Fragment key={item.id}>
                <button
                  onClick={() => onSelectChord(item)}
                  className={`group relative flex flex-col items-center p-3 rounded-xl border transition-all duration-200 min-w-[90px] shrink-0 text-left ${
                    isSelected
                      ? "bg-[#7c5cbf] border-white shadow-lg shadow-[#7c5cbf]/30 scale-105 z-10"
                      : "bg-[#1a1a24] border-[#2d2d3d] hover:border-[#7c5cbf] hover:bg-[#252533]"
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold uppercase ${isSelected ? "text-indigo-200" : "text-[#a88beb]"}`}>
                    {item.romanNumeral || `Hợp âm ${idx + 1}`}
                  </span>
                  <span className={`text-sm font-extrabold font-mono mt-0.5 ${isSelected ? "text-white" : "text-gray-200"}`}>
                    {item.name}
                  </span>
                  <span className={`text-[10px] font-mono mt-1 px-1.5 py-0.5 rounded ${
                    isSelected ? "bg-black/30 text-white" : "bg-[#0f0f13] text-gray-400"
                  }`}>
                    {item.beats} nhịp
                  </span>
                </button>

                {idx < chords.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Recognized Pattern & Harmonic Motion Analysis */}
      {patternInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Pattern Recognition Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#1a1a24] to-[#12121a] border border-[#7c5cbf]/40 p-4 rounded-xl space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#7c5cbf] text-white font-extrabold text-[10px] rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-yellow-300" /> Nhận Diện Chuỗi Nhạc
              </span>
              <span className="text-xs font-mono font-bold text-gray-400">Thể loại: {patternInfo.genre}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">{patternInfo.name}</h3>
            <p className="text-xs text-gray-300 leading-relaxed">{patternInfo.description}</p>
            <div className="pt-2 border-t border-[#2d2d3d]/60 text-xs text-indigo-300 font-mono">
              💡 <b>Lý thuyết hòa âm:</b> {patternInfo.theoryInsight}
            </div>
          </div>

          {/* Functional Motion Breakdown */}
          <div className="bg-[#0f0f13] border border-[#2d2d3d] p-4 rounded-xl space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#a88beb]" /> Cân Bằng Căng Căng - Giải Kết
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between bg-[#1a1a24] p-2 rounded border border-[#2d2d3d]">
                  <span className="text-emerald-400 font-bold">Chủ Âm (Tonic - Ổn định):</span>
                  <span className="font-mono font-bold text-white">{tonicCount} hợp âm</span>
                </div>
                <div className="flex items-center justify-between bg-[#1a1a24] p-2 rounded border border-[#2d2d3d]">
                  <span className="text-amber-400 font-bold">Hạ Thống Lĩnh (Subdominant):</span>
                  <span className="font-mono font-bold text-white">{subdominantCount} hợp âm</span>
                </div>
                <div className="flex items-center justify-between bg-[#1a1a24] p-2 rounded border border-[#2d2d3d]">
                  <span className="text-rose-400 font-bold">Thống Lĩnh (Dominant - Căng):</span>
                  <span className="font-mono font-bold text-white">{dominantCount} hợp âm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Detailed Single Chord Inspection */}
      <div className="pt-4 border-t border-[#2d2d3d]">
        <div className="flex items-center justify-between pb-3 mb-4">
          <div>
            <label className="text-[10px] font-bold text-[#7c5cbf] uppercase tracking-widest block mb-0.5">
              Chi Tiết Hợp Âm Đang Chọn (Inspecting Chord)
            </label>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white font-mono">{inspectChord.name}</h3>
              {inspectChord.romanNumeral && (
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#7c5cbf]/20 text-[#a88beb] border border-[#7c5cbf]/40 rounded-lg">
                  Bậc {inspectChord.romanNumeral}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onPlayPreview(inspectChord)}
            className="px-3.5 py-2 bg-[#7c5cbf]/20 hover:bg-[#7c5cbf] text-[#a88beb] hover:text-white border border-[#7c5cbf]/40 rounded-lg font-bold text-xs flex items-center gap-2 transition shadow-sm"
            title="Phát thử âm thanh hợp âm này"
          >
            <Volume2 className="w-4 h-4" /> Nghe Thử Hợp Âm
          </button>
        </div>

        {/* Main Grid: Details + Guitar + Piano */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Details Column */}
          <div className="space-y-3">
            <div className="bg-[#0f0f13] p-3 rounded-lg border border-[#2d2d3d]">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Công Thức Quãng (Interval Formula)</div>
              <div className="text-sm font-mono font-bold text-[#a88beb] mt-0.5">{def?.formula || "1 - 3 - 5"}</div>
            </div>

            <div className="bg-[#0f0f13] p-3 rounded-lg border border-[#2d2d3d]">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Các Nốt Trong Hợp Âm (Chord Notes)</div>
              <div className="text-sm font-mono font-bold text-white mt-0.5 tracking-wide">
                {inspectChord.notes && inspectChord.notes.length > 0
                  ? inspectChord.notes.join(" · ")
                  : inspectChord.root}
              </div>
            </div>

            <div className="bg-[#0f0f13] p-3 rounded-lg border border-[#2d2d3d]">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold flex items-center gap-1">
                <Info className="w-3 h-3 text-[#7c5cbf]" /> Vai Trò Hòa Âm & Cảm Xúc
              </div>
              <div className="text-xs text-gray-300 mt-1 leading-relaxed">
                {def?.functionDescription || "Hợp âm thuộc hệ thống giọng Diatonic tiêu chuẩn."}
              </div>
            </div>
          </div>

          {/* Guitar Diagram */}
          <div>
            <GuitarDiagram chordName={inspectChord.name} />
          </div>
        </div>

        {/* Piano Keyboard Highlight */}
        <div className="bg-[#0f0f13] p-3.5 rounded-xl border border-[#2d2d3d]">
          <div className="text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#7c5cbf]" /> Vị Trí Phím Đàn Piano (Piano Key Highlight)
          </div>
          <div className="relative flex justify-center h-20 overflow-x-auto select-none pt-1">
            {pianoKeys.map((key) => {
              const pitchClass = ((key.midi % 12) + 12) % 12;
              const isHighlighted = activePitchClasses.includes(pitchClass);

              if (key.isBlack) {
                return (
                  <div
                    key={key.midi}
                    className={`absolute z-10 w-4 h-12 rounded-b-sm ${
                      isHighlighted ? "bg-[#7c5cbf] shadow-md border border-white" : "bg-[#1a1a24]"
                    }`}
                    style={{ left: `${calcMiniBlackKeyPos(key.midi)}%` }}
                  />
                );
              }

              return (
                <div
                  key={key.midi}
                  className={`flex-1 h-18 border-r border-gray-700 rounded-b-sm transition ${
                    isHighlighted ? "bg-[#7c5cbf]" : "bg-gray-100 opacity-20"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

function calcMiniBlackKeyPos(midi: number): number {
  const whiteKeyOffsets: Record<number, number> = {
    49: 4.8,
    51: 11.9,
    54: 26.2,
    56: 33.3,
    58: 40.5,
    61: 54.8,
    63: 61.9,
    66: 76.2,
    68: 83.3,
    70: 90.5,
  };
  return whiteKeyOffsets[midi] || 0;
}
