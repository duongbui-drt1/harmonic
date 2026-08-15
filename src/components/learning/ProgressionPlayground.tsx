import React, { useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Sparkles,
  Sliders,
  Repeat,
  ArrowRight,
  Music2,
  Lightbulb,
} from "lucide-react";
import { useLearningAudio } from "../../hooks/useLearningAudio";
import { parseChordDefinition } from "../../utils/chordData";
import { PianoVisualizer } from "./PianoVisualizer";
import { ChordItem } from "../../types";

const KEY_PRESETS: Array<{ key: string; name: string; tonic: string; diatonicChords: string[] }> = [
  { key: "C", name: "Đô Trưởng (C Major)", tonic: "C", diatonicChords: ["C", "Dm", "Em", "F", "G", "Am", "Bdim"] },
  { key: "G", name: "Sol Trưởng (G Major)", tonic: "G", diatonicChords: ["G", "Am", "Bm", "C", "D", "Em", "F#dim"] },
  { key: "F", name: "Fa Trưởng (F Major)", tonic: "F", diatonicChords: ["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"] },
  { key: "Am", name: "La Thứ (A Minor)", tonic: "Am", diatonicChords: ["Am", "Bdim", "C", "Dm", "Em", "F", "G"] },
  { key: "Em", name: "Mi Thứ (E Minor)", tonic: "Em", diatonicChords: ["Em", "F#dim", "G", "Am", "Bm", "C", "D"] },
];

const TEMPLATES: Array<{ name: string; key: string; chords: string[]; desc: string }> = [
  {
    name: "Bộ 4 Hợp Âm Vàng Nhạc Pop",
    key: "C",
    chords: ["C", "G", "Am", "F"],
    desc: "Xuất hiện trong hàng trăm bản hit đình đám thế giới (I - V - vi - IV)",
  },
  {
    name: "Doo-Wop Thập Niên 50",
    key: "C",
    chords: ["C", "Am", "F", "G"],
    desc: "Giai điệu hoài niệm bất hủ như Stand By Me (I - vi - IV - V)",
  },
  {
    name: "Dân Ca & Blues 3 Hợp Âm",
    key: "C",
    chords: ["C", "F", "G", "C"],
    desc: "Mộc mạc, gần gũi, tròn trịa (I - IV - V - I)",
  },
  {
    name: "Vòng Xoay Jazz Chuẩn ii - V - I",
    key: "C",
    chords: ["Dm", "G", "C", "Am"],
    desc: "Trái tim của hòa thanh nhạc Jazz và Broadway (ii - V - I - vi)",
  },
  {
    name: "Bản Hùng Ca Thứ (Epic Minor)",
    key: "Am",
    chords: ["Am", "F", "C", "G"],
    desc: "Âm hưởng điện ảnh hoành tráng, dồn dập (i - VI - III - VII)",
  },
  {
    name: "Vòng Flamenco Cadence",
    key: "Am",
    chords: ["Am", "G", "F", "E"],
    desc: "Bước đi lùi kinh điển chất Tây Ban Nha (i - VII - VI - V)",
  },
];

export const ProgressionPlayground: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState("C");
  const [chords, setChords] = useState<string[]>(["C", "Am", "F", "G"]);
  const [bpm, setBpm] = useState(100);
  const [isLooping, setIsLooping] = useState(true);

  const {
    isPlaying,
    activeChordIndex,
    activeMidiNote,
    playProgression,
    playChordBlock,
    stop,
  } = useLearningAudio("piano");

  const currentKeyData = KEY_PRESETS.find((k) => k.key === selectedKey) || KEY_PRESETS[0];

  const parsedChords = React.useMemo(() => {
    return chords.map((cName) => {
      let root = cName;
      let quality = "major";
      if (cName.endsWith("m") && !cName.endsWith("dim")) {
        root = cName.slice(0, -1);
        quality = "minor";
      } else if (cName.endsWith("dim")) {
        root = cName.replace("dim", "");
        quality = "diminished";
      } else if (cName.endsWith("7")) {
        root = cName.replace("7", "");
        quality = "7";
      }

      const def = parseChordDefinition(root, quality);
      return {
        name: cName,
        midis: def.midiNotes,
        durationMs: Math.round((60000 / bpm) * 2), // 2 beats per chord
      };
    });
  }, [chords, bpm]);

  const handlePlayToggle = () => {
    if (isPlaying) {
      stop();
    } else {
      playProgression(parsedChords, 1.0, isLooping);
    }
  };

  const handleAddChord = (cName: string) => {
    if (chords.length < 8) {
      setChords([...chords, cName]);
    }
  };

  const handleRemoveChord = (idx: number) => {
    if (chords.length > 1) {
      setChords(chords.filter((_, i) => i !== idx));
    }
  };

  // Rule-based "Suggest Next Chord" based on functional harmony principles
  const suggestedChords = React.useMemo(() => {
    if (chords.length === 0) return ["C", "Am"];
    const last = chords[chords.length - 1];

    if (last === "C" || (last === "G" && selectedKey === "G")) {
      return ["F (Bậc IV - Bước đi xa)", "Am (Bậc vi - Tăng cảm xúc)", "Dm (Bậc ii - Lối đi Jazz)"];
    } else if (last === "F" || last === "Dm") {
      return ["G (Bậc V - Tăng kịch tính)", "C (Bậc I - Về nhà ngay)", "Am (Bậc vi - Nốt chuyển)"];
    } else if (last === "G" || last === "G7") {
      return ["C (Bậc I - Giải quyết trọn vẹn)", "Am (Bậc vi - Giải quyết bất ngờ / Đánh lừa)"];
    } else if (last === "Am") {
      return ["F (Bậc IV - Vươn lên sáng)", "Dm (Bậc ii - Bước trầm lắng)", "G (Bậc V - Chuẩn bị kết)"];
    }
    return ["C", "G", "F"];
  }, [chords, selectedKey]);

  const activeChordMidis =
    activeChordIndex !== null && parsedChords[activeChordIndex]
      ? parsedChords[activeChordIndex].midis
      : parsedChords[0]?.midis || [60, 64, 67];

  return (
    <div className="bg-[#101018] border border-[#252535] rounded-2xl p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252535] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#a88beb]" />
            <h2 className="text-lg font-extrabold text-white">Sân Chơi Tiến Trình Hợp Âm</h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Tự do sáng tạo, sắp xếp và lặp lại chuỗi hợp âm. Khám phá cách hòa thanh kết nối từng bước chuyển đi.
          </p>
        </div>

        {/* Key Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold">Giọng chủ đạo (Key):</span>
          <select
            value={selectedKey}
            onChange={(e) => {
              setSelectedKey(e.target.value);
              const k = KEY_PRESETS.find((p) => p.key === e.target.value);
              if (k) setChords([k.diatonicChords[0], k.diatonicChords[3], k.diatonicChords[4], k.diatonicChords[0]]);
            }}
            className="bg-[#181824] border border-[#2d2d3d] text-white text-xs font-bold px-3 py-1.5 rounded-xl focus:ring-2 focus:ring-[#7c5cbf]"
          >
            {KEY_PRESETS.map((k) => (
              <option key={k.key} value={k.key}>
                {k.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Progression Templates */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-gray-300">Tiến trình mẫu kinh điển:</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.name}
              type="button"
              onClick={() => {
                setSelectedKey(tpl.key);
                setChords(tpl.chords);
              }}
              className="p-2.5 bg-[#181824] hover:bg-[#201a38] border border-[#2d2d3d] hover:border-[#7c5cbf] rounded-xl text-left transition"
            >
              <div className="text-[11px] font-extrabold text-white truncate">{tpl.name}</div>
              <div className="text-[10px] text-[#a88beb] font-mono mt-0.5">{tpl.chords.join(" - ")}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Progression Timeline */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-300">Chuỗi hợp âm của bạn ({chords.length} hợp âm):</span>
          <span className="text-gray-400">Bấm vào hợp âm để nghe thử, hoặc bấm ✕ để xóa</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-3 bg-[#141420] border border-[#252535] rounded-xl min-h-[72px]">
          {chords.map((cName, idx) => {
            const isActive = activeChordIndex === idx && isPlaying;
            return (
              <div
                key={idx}
                className={`relative group px-4 py-3 rounded-xl border flex items-center gap-2.5 transition-all duration-150 ${
                  isActive
                    ? "bg-purple-600 border-purple-400 text-white scale-105 shadow-lg shadow-purple-500/30 ring-2 ring-purple-300"
                    : "bg-[#1f1f2e] border-[#313145] text-gray-200 hover:border-[#7c5cbf]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parsedChords[idx];
                    if (parsed) playChordBlock(parsed.midis, 1.4);
                  }}
                  className="font-extrabold text-sm font-mono"
                >
                  {cName}
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveChord(idx)}
                  className="text-gray-400 hover:text-rose-400 transition"
                  title="Xóa hợp âm"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {chords.length < 8 && (
            <div className="text-xs text-gray-500 px-2 flex items-center gap-1 font-medium">
              <span>+ Thêm hợp âm từ bảng dưới</span>
            </div>
          )}
        </div>
      </div>

      {/* Diatonic Chord Palette to Add */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-gray-300">
          Thêm hợp âm trong giọng {currentKeyData.name}:
        </span>
        <div className="flex flex-wrap gap-2">
          {currentKeyData.diatonicChords.map((cName) => (
            <button
              key={cName}
              type="button"
              onClick={() => handleAddChord(cName)}
              className="px-3.5 py-2 bg-[#1f1f2e] hover:bg-[#2c2c40] border border-[#313145] hover:border-[#7c5cbf] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5 text-[#a88beb]" />
              <span className="font-mono font-extrabold">{cName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rule-Based "Theory Guidance: Suggest Next Chord" */}
      <div className="bg-[#181824] border border-[#2d2d3d] rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <Lightbulb className="w-4 h-4" />
          <span>Gợi ý quy luật hòa thanh (Hợp âm tiếp theo có thể đi đâu?):</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {suggestedChords.map((s, idx) => {
            const rawChord = s.split(" ")[0];
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddChord(rawChord)}
                className="px-3 py-1.5 bg-[#252538] hover:bg-[#32324c] border border-[#3f3f58] rounded-lg text-xs text-amber-200 font-medium flex items-center gap-1.5 transition"
              >
                <span>+ {s}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls & Piano Preview */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#141420] border border-[#252535] rounded-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePlayToggle}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg ${
              isPlaying
                ? "bg-amber-500 text-slate-950 ring-4 ring-amber-400/40"
                : "bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Tạm dừng phát</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>▶ Phát tiến trình</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsLooping(!isLooping)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
              isLooping
                ? "bg-purple-950/40 border-purple-500 text-purple-300"
                : "bg-[#181824] border-[#2d2d3d] text-gray-400"
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Lặp lại: {isLooping ? "BẬT" : "TẮT"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-300">
          <Sliders className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-bold">Tốc độ: {bpm} BPM</span>
          <input
            type="range"
            min={60}
            max={180}
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
            className="w-32 accent-[#7c5cbf]"
          />
        </div>
      </div>

      <PianoVisualizer
        highlightedMidis={activeChordMidis}
        activePlayingMidi={activeMidiNote}
        minMidi={48}
        maxMidi={76}
      />
    </div>
  );
};
