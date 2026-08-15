import React, { useState } from "react";
import { Play, Music2, Sparkles, Snail, Layers, CheckCircle2 } from "lucide-react";
import { useLearningAudio } from "../../hooks/useLearningAudio";
import { PianoVisualizer } from "./PianoVisualizer";
import { NoteItem } from "../../types/learning";
import { midiToNoteName } from "../../utils/noteNames";
import { parseChordDefinition } from "../../utils/chordData";

const ROOTS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

interface ScaleDef {
  id: string;
  name: string;
  steps: number[]; // semitone intervals from root
  formula: string;
  character: string;
  diatonicQualities: string[];
}

const SCALES: ScaleDef[] = [
  {
    id: "major",
    name: "Gam Trưởng (Major / Ionian)",
    steps: [0, 2, 4, 5, 7, 9, 11, 12],
    formula: "Cung - Cung - Nửa - Cung - Cung - Cung - Nửa",
    character: "Tươi sáng, hùng tráng, hân hoan, nền tảng của âm nhạc",
    diatonicQualities: ["major", "minor", "minor", "major", "major", "minor", "diminished"],
  },
  {
    id: "natural_minor",
    name: "Gam Thứ Tự Nhiên (Aeolian)",
    steps: [0, 2, 3, 5, 7, 8, 10, 12],
    formula: "Cung - Nửa - Cung - Cung - Nửa - Cung - Cung",
    character: "Trầm lắng, u buồn, hoài niệm, sâu sắc",
    diatonicQualities: ["minor", "diminished", "major", "minor", "minor", "major", "major"],
  },
  {
    id: "harmonic_minor",
    name: "Gam Thứ Hòa Âm (Harmonic Minor)",
    steps: [0, 2, 3, 5, 7, 8, 11, 12],
    formula: "Cung - Nửa - Cung - Cung - Nửa - 1.5 Cung - Nửa",
    character: "Kịch tính, ma mị, chất Cổ điển & Trung Đông bí ẩn",
    diatonicQualities: ["minor", "diminished", "augmented", "minor", "major", "major", "diminished"],
  },
  {
    id: "major_pentatonic",
    name: "Ngũ Cung Trưởng (5 Nốt)",
    steps: [0, 2, 4, 7, 9, 12],
    formula: "1 - 2 - 3 - 5 - 6 (Không có bậc 4 và 7)",
    character: "Ngọt ngào, êm ả, âm hưởng Dân ca, Quê hương, Ballad",
    diatonicQualities: ["major", "minor", "minor", "major", "minor"],
  },
  {
    id: "minor_pentatonic",
    name: "Ngũ Cung Thứ (5 Nốt)",
    steps: [0, 3, 5, 7, 10, 12],
    formula: "1 - b3 - 4 - 5 - b7",
    character: "Chất Blues/Rock mạnh mẽ, cá tính, câu solo ấn tượng",
    diatonicQualities: ["minor", "major", "minor", "minor", "major"],
  },
  {
    id: "blues",
    name: "Gam Blues (Blues Scale)",
    steps: [0, 3, 5, 6, 7, 10, 12],
    formula: "1 - b3 - 4 - b5 - 5 - b7 (Thêm nốt Blues b5)",
    character: "Day dứt, bụi bặm, đậm đà bản sắc Blues & Jazz",
    diatonicQualities: ["minor", "major", "diminished", "minor", "major"],
  },
  {
    id: "dorian",
    name: "Điệu Dorian (Dorian Mode)",
    steps: [0, 2, 3, 5, 7, 9, 10, 12],
    formula: "1 - 2 - b3 - 4 - 5 - 6 - b7 (Thứ có bậc 6 Trưởng)",
    character: "Màu Thứ nhưng có nét tươi sáng, chất Funk, Santana, Jazz Modal",
    diatonicQualities: ["minor", "minor", "major", "major", "minor", "diminished", "major"],
  },
  {
    id: "mixolydian",
    name: "Điệu Mixolydian (Mixolydian Mode)",
    steps: [0, 2, 4, 5, 7, 9, 10, 12],
    formula: "1 - 2 - 3 - 4 - 5 - 6 - b7 (Trưởng có bậc 7 Giáng)",
    character: "Chất Classic Rock phóng khoáng, Beatles, AC/DC",
    diatonicQualities: ["major", "minor", "diminished", "major", "minor", "minor", "major"],
  },
];

export const ScaleExplorer: React.FC = () => {
  const [root, setRoot] = useState("C");
  const [scaleId, setScaleId] = useState("major");

  const {
    isPlaying,
    activeMidiNote,
    playNote,
    playChordBlock,
    playNoteSequence,
    playProgression,
    stop,
  } = useLearningAudio("piano");

  const activeScale = SCALES.find((s) => s.id === scaleId) || SCALES[0];

  const rootMidi = React.useMemo(() => {
    const rootIndex = ROOTS.indexOf(root);
    return 60 + (rootIndex >= 0 ? rootIndex : 0); // Middle octave
  }, [root]);

  const scaleMidis = React.useMemo(() => {
    return activeScale.steps.map((st) => rootMidi + st);
  }, [rootMidi, activeScale]);

  const noteItems: NoteItem[] = React.useMemo(() => {
    const colors = ["#8b5cf6", "#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#ef4444", "#8b5cf6"];
    return scaleMidis.map((m, idx) => {
      const isOctave = idx === scaleMidis.length - 1;
      return {
        name: midiToNoteName(m),
        midi: m,
        label: isOctave ? "8 (Chủ âm)" : `${idx + 1}`,
        color: colors[idx % colors.length],
      };
    });
  }, [scaleMidis]);

  const handlePlayAscending = () => {
    playNoteSequence(scaleMidis, 340, 0.7);
  };

  const handlePlayDescending = () => {
    const desc = [...scaleMidis].reverse();
    playNoteSequence(desc, 340, 0.7);
  };

  const handlePlaySlow = () => {
    playNoteSequence(scaleMidis, 650, 1.1);
  };

  const handlePlayDiatonicChords = () => {
    // Generate triads built on scale steps
    const chords = activeScale.steps.slice(0, 7).map((stepOffset, idx) => {
      const chordRootMidi = rootMidi + stepOffset;
      const chordRootName = midiToNoteName(chordRootMidi).replace(/[0-9]/g, "");
      const qual = activeScale.diatonicQualities[idx] || "major";
      const def = parseChordDefinition(chordRootName, qual);
      return {
        name: `${chordRootName} ${qual}`,
        midis: def.midiNotes,
        durationMs: 1200,
      };
    });

    playProgression(chords, 1.0);
  };

  return (
    <div className="bg-[#101018] border border-[#252535] rounded-2xl p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#252535] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#a88beb]" />
            <h2 className="text-lg font-extrabold text-white">Khám Phá Gam / Âm Giai Tương Tác</h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Lắng nghe và trực quan hóa chiếc thang âm hình thành nên mọi giai điệu và họ hợp âm tự nhiên.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[#201a38] border border-[#7c5cbf]/50 rounded-xl flex items-center gap-2">
          <span className="text-xs text-gray-300 font-medium">Gam đang chọn:</span>
          <span className="text-sm font-extrabold text-[#a88beb] font-mono">
            {root} {activeScale.name}
          </span>
        </div>
      </div>

      {/* Root Picker */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-gray-300">1. Chọn Nốt Chủ Âm (Tonic):</span>
        <div className="flex flex-wrap gap-1.5">
          {ROOTS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRoot(r);
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

      {/* Scale Type Picker */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-gray-300">2. Chọn Hệ Gam / Điệu thức (Mode):</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SCALES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScaleId(s.id)}
              className={`p-3 rounded-xl border text-left transition-all duration-150 ${
                scaleId === s.id
                  ? "bg-[#201a38] border-[#7c5cbf] ring-2 ring-[#7c5cbf]/60 shadow-lg"
                  : "bg-[#181824] border-[#2d2d3d] hover:bg-[#202030]"
              }`}
            >
              <span className="text-xs font-extrabold text-white block truncate">{s.name}</span>
              <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{s.character}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-[#181824] rounded-xl border border-[#2d2d3d]">
        <button
          type="button"
          onClick={handlePlayAscending}
          className="px-4 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>▲ Gam đi lên</span>
        </button>

        <button
          type="button"
          onClick={handlePlayDescending}
          className="px-3.5 py-2 bg-[#252535] hover:bg-[#323248] text-sky-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[#3d3d55]"
        >
          <Play className="w-3.5 h-3.5 fill-current rotate-180" />
          <span>▼ Gam đi xuống</span>
        </button>

        <button
          type="button"
          onClick={handlePlaySlow}
          className="px-3.5 py-2 bg-[#252535] hover:bg-[#323248] text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[#3d3d55]"
        >
          <Snail className="w-3.5 h-3.5" />
          <span>🐢 Luyện nghe chậm</span>
        </button>

        <button
          type="button"
          onClick={handlePlayDiatonicChords}
          className="px-3.5 py-2 bg-[#252535] hover:bg-[#323248] text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[#3d3d55]"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>🎹 Nghe chuỗi hợp âm tự nhiên</span>
        </button>
      </div>

      {/* Piano Keyboard Visualizer */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs px-1 text-gray-300 font-bold">
          <span>Bàn phím hiển thị nốt</span>
          <span className="text-[#a88beb] font-mono">
            Gam: {scaleMidis.map((m) => midiToNoteName(m)).join(" → ")}
          </span>
        </div>
        <PianoVisualizer
          highlightedMidis={scaleMidis}
          noteItems={noteItems}
          activePlayingMidi={activeMidiNote}
          minMidi={48}
          maxMidi={84}
          onKeyClick={(m) => playNote(m, 0.8)}
        />
      </div>

      {/* Theory & Formula Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#141420] border border-[#252535] rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a88beb]">
            Màu Sắc & Bản Sắc Âm Nhạc
          </span>
          <p className="text-xs text-gray-200 leading-relaxed font-medium">
            {activeScale.character}
          </p>
        </div>

        <div className="bg-[#141420] border border-[#252535] rounded-xl p-4 space-y-1 font-mono">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
            Quy Luật Cung & Nửa Cung
          </span>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            {activeScale.formula}
          </p>
        </div>
      </div>
    </div>
  );
};
