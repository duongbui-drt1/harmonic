import React, { useState } from "react";
import { Play, Pause, Snail, Music2, Layers, Sparkles, Sliders, ArrowRight } from "lucide-react";
import { parseChordDefinition } from "../../utils/chordData";
import { useLearningAudio } from "../../hooks/useLearningAudio";
import { PianoVisualizer } from "./PianoVisualizer";
import { NoteItem } from "../../types/learning";
import { midiToNoteName } from "../../utils/noteNames";

const ROOTS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const QUALITIES: Array<{
  id: string;
  name: string;
  category: string;
  formula: string;
  character: string;
  theory: string;
}> = [
  {
    id: "major",
    name: "Trưởng (Major)",
    category: "Hợp âm ba",
    formula: "1 - 3 - 5",
    character: "Tươi sáng, hân hoan, vững chãi, ổn định",
    theory: "Nốt gốc + Quãng 3 Trưởng (4 nửa cung) + Quãng 5 Đúng (7 nửa cung)",
  },
  {
    id: "minor",
    name: "Thứ (Minor)",
    category: "Hợp âm ba",
    formula: "1 - b3 - 5",
    character: "Trầm lắng, u buồn, sâu sắc, tự sự",
    theory: "Nốt gốc + Quãng 3 Thứ (3 nửa cung) + Quãng 5 Đúng (7 nửa cung)",
  },
  {
    id: "diminished",
    name: "Giảm (Diminished)",
    category: "Hợp âm ba",
    formula: "1 - b3 - b5",
    character: "Căng thẳng, hồi hộp, nghẹt thở, bí ẩn",
    theory: "Nốt gốc + Quãng 3 Thứ (3 nửa cung) + Quãng 5 Giảm (6 nửa cung)",
  },
  {
    id: "augmented",
    name: "Tăng (Augmented)",
    category: "Hợp âm ba",
    formula: "1 - 3 - #5",
    character: "Huyền ảo, mơ hồ, lơ lửng, viễn tưởng",
    theory: "Nốt gốc + Quãng 3 Trưởng (4 nửa cung) + Quãng 5 Tăng (8 nửa cung)",
  },
  {
    id: "sus2",
    name: "Treo 2 (Sus2)",
    category: "Hợp âm treo",
    formula: "1 - 2 - 5",
    character: "Khoáng đạt, hiện đại, bay bổng, trung tính",
    theory: "Nốt gốc + Quãng 2 Trưởng (2 nửa cung) + Quãng 5 Đúng (7 nửa cung) — Không có bậc 3!",
  },
  {
    id: "sus4",
    name: "Treo 4 (Sus4)",
    category: "Hợp âm treo",
    formula: "1 - 4 - 5",
    character: "Hồi hộp chờ đợi, muốn rơi về hợp âm Trưởng",
    theory: "Nốt gốc + Quãng 4 Đúng (5 nửa cung) + Quãng 5 Đúng (7 nửa cung) — Không có bậc 3!",
  },
  {
    id: "7",
    name: "Bảy Át (Dominant 7th)",
    category: "Hợp âm bảy",
    formula: "1 - 3 - 5 - b7",
    character: "Chất Blues, sôi động, lực hút mạnh mẽ muốn giải quyết về chủ âm",
    theory: "Hợp âm Trưởng + Quãng 7 Thứ (10 nửa cung)",
  },
  {
    id: "maj7",
    name: "Bảy Trưởng (Major 7th)",
    category: "Hợp âm bảy",
    formula: "1 - 3 - 5 - 7",
    character: "Mộng mơ, sang trọng, chất Jazz, hoài niệm, Lo-Fi thư thái",
    theory: "Hợp âm Trưởng + Quãng 7 Trưởng (11 nửa cung)",
  },
  {
    id: "m7",
    name: "Bảy Thứ (Minor 7th)",
    category: "Hợp âm bảy",
    formula: "1 - b3 - 5 - b7",
    character: "Mượt mà, êm dịu, ấm áp, Neo-Soul, R&B",
    theory: "Hợp âm Thứ + Quãng 7 Thứ (10 nửa cung)",
  },
];

export const ChordExplorer: React.FC = () => {
  const [root, setRoot] = useState("C");
  const [qualityId, setQualityId] = useState("major");
  const [inversion, setInversion] = useState<number>(0);

  const {
    isPlaying,
    activeMidiNote,
    playNote,
    playChordBlock,
    playNoteSequence,
    stop,
  } = useLearningAudio("piano");

  const activeQuality = QUALITIES.find((q) => q.id === qualityId) || QUALITIES[0];
  const chordDef = parseChordDefinition(root, qualityId);

  // Apply inversion
  const invertedMidis = React.useMemo(() => {
    const raw = [...chordDef.midiNotes];
    if (inversion === 0 || raw.length === 0) return raw;

    const notes = [...raw];
    for (let i = 0; i < inversion; i++) {
      const first = notes.shift();
      if (first !== undefined) {
        notes.push(first + 12);
      }
    }
    return notes;
  }, [chordDef, inversion]);

  const noteItems: NoteItem[] = React.useMemo(() => {
    const colors = ["#8b5cf6", "#10b981", "#f59e0b", "#ec4899"];
    return invertedMidis.map((m, idx) => ({
      name: midiToNoteName(m),
      midi: m,
      label: idx === 0 ? "Bass" : `Bè ${idx + 1}`,
      color: colors[idx % colors.length],
    }));
  }, [invertedMidis]);

  const handlePlayBlock = () => {
    playChordBlock(invertedMidis, 1.8);
  };

  const handlePlayNotes = () => {
    playNoteSequence(invertedMidis, 380, 0.8);
  };

  const handlePlaySlow = () => {
    playNoteSequence(invertedMidis, 650, 1.2);
  };

  const handlePlayArp = () => {
    // 1-3-5-3 wave
    const wave = [...invertedMidis, ...(invertedMidis.slice(1, -1).reverse())];
    playNoteSequence(wave, 250, 0.6);
  };

  const inversionLabels = ["Thế gốc", "Đảo 1", "Đảo 2", ...(chordDef.midiNotes.length > 3 ? ["Đảo 3"] : [])];

  return (
    <div className="bg-[#101018] border border-[#252535] rounded-2xl p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#252535] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#a88beb]" />
            <h2 className="text-lg font-extrabold text-white">Khám Phá Hợp Âm Tương Tác</h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Nghe, nhìn và thấu hiểu mọi loại hợp âm trên tất cả các giọng với lời giải thích lý thuyết trực quan.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[#201a38] border border-[#7c5cbf]/50 rounded-xl flex items-center gap-2">
          <span className="text-xs text-gray-300 font-medium">Hợp âm đang chọn:</span>
          <span className="text-sm font-extrabold text-[#a88beb] font-mono">
            {root} {activeQuality.name}
            {inversion > 0 && ` (${inversionLabels[inversion]})`}
          </span>
        </div>
      </div>

      {/* Root Selector */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-gray-300">1. Chọn Nốt Gốc (Root):</span>
        <div className="flex flex-wrap gap-1.5">
          {ROOTS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRoot(r);
                const def = parseChordDefinition(r, qualityId);
                playChordBlock(def.midiNotes, 1.2);
              }}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all duration-150 ${
                root === r
                  ? "bg-[#7c5cbf] text-white ring-2 ring-purple-400 scale-105 shadow-md"
                  : "bg-[#181824] text-gray-300 hover:bg-[#252538] border border-[#2d2d3d]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Selector */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-gray-300">2. Chọn Tính Chất / Màu Sắc Hợp Âm:</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2">
          {QUALITIES.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                setQualityId(q.id);
                const def = parseChordDefinition(root, q.id);
                playChordBlock(def.midiNotes, 1.4);
              }}
              className={`p-3 rounded-xl border text-left transition-all duration-150 ${
                qualityId === q.id
                  ? "bg-[#201a38] border-[#7c5cbf] ring-2 ring-[#7c5cbf]/60 shadow-lg"
                  : "bg-[#181824] border-[#2d2d3d] hover:bg-[#202030]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white">{q.name}</span>
                <span className="text-[10px] text-[#a88beb] font-mono font-bold">{q.formula}</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{q.character}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Inversion Selector */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs font-bold text-gray-300">Đảo hợp âm:</span>
        <div className="flex gap-1.5">
          {inversionLabels.map(
            (label, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInversion(idx);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  inversion === idx
                    ? "bg-[#7c5cbf] text-white"
                    : "bg-[#181824] text-gray-400 hover:bg-[#252538] border border-[#2d2d3d]"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Audio Playback Controls */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-[#181824] rounded-xl border border-[#2d2d3d]">
        <button
          type="button"
          onClick={handlePlayBlock}
          className="px-4 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>▶ Nghe hợp âm khối</span>
        </button>

        <button
          type="button"
          onClick={handlePlayNotes}
          className="px-3.5 py-2 bg-[#252535] hover:bg-[#323248] text-sky-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[#3d3d55]"
        >
          <Music2 className="w-3.5 h-3.5" />
          <span>🔬 Tách nốt</span>
        </button>

        <button
          type="button"
          onClick={handlePlayArp}
          className="px-3.5 py-2 bg-[#252535] hover:bg-[#323248] text-purple-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[#3d3d55]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>🌊 Rải hợp âm (Arpeggio)</span>
        </button>

        <button
          type="button"
          onClick={handlePlaySlow}
          className="px-3.5 py-2 bg-[#252535] hover:bg-[#323248] text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[#3d3d55]"
        >
          <Snail className="w-3.5 h-3.5" />
          <span>🐢 Nghe chậm giải mã</span>
        </button>
      </div>

      {/* Piano Keyboard Visualizer */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs px-1 text-gray-300 font-bold">
          <span>Bàn phím hiển thị nốt</span>
          <span className="text-[#a88beb] font-mono">
            Các nốt: {invertedMidis.map((m) => midiToNoteName(m)).join(" - ")}
          </span>
        </div>
        <PianoVisualizer
          highlightedMidis={invertedMidis}
          noteItems={noteItems}
          activePlayingMidi={activeMidiNote}
          minMidi={48}
          maxMidi={84}
          onKeyClick={(m) => playNote(m, 0.8)}
        />
      </div>

      {/* Theory & Character Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#141420] border border-[#252535] rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a88beb]">
            Màu Sắc & Cảm Xúc Âm Nhạc
          </span>
          <p className="text-xs text-gray-200 leading-relaxed font-medium">
            {activeQuality.character}
          </p>
        </div>

        <div className="bg-[#141420] border border-[#252535] rounded-xl p-4 space-y-1 font-mono">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
            Công Thức Quãng & Lý Thuyết
          </span>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            {activeQuality.theory}
          </p>
        </div>
      </div>
    </div>
  );
};
