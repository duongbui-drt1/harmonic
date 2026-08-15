import React, { useState } from "react";
import {
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Repeat,
  Sliders,
  Volume2,
} from "lucide-react";
import { LessonData } from "../../types/learning";
import { useLearningAudio } from "../../hooks/useLearningAudio";
import { PianoVisualizer } from "./PianoVisualizer";
import { midiToNoteName } from "../../utils/noteNames";
import { parseChordDefinition } from "../../utils/chordData";

interface ExperimentLabProps {
  lesson: LessonData;
  className?: string;
}

export const ExperimentLab: React.FC<ExperimentLabProps> = ({ lesson, className = "" }) => {
  const {
    isPlaying,
    activeMidiNote,
    activeBeatIndex,
    playNote,
    playChordBlock,
    playNoteSequence,
    playProgression,
    playMeterGroove,
    stop,
  } = useLearningAudio("piano");

  // Local state for various experiment types
  const [selectedRoot, setSelectedRoot] = useState("C");
  const [selectedQuality, setSelectedQuality] = useState<"major" | "minor">("major");
  const [selectedIntervalOffset, setSelectedIntervalOffset] = useState(7); // P5 default
  const [arpPattern, setArpPattern] = useState<"up" | "down" | "updown" | "1353" | "1535">("up");
  const [arpBpm, setArpBpm] = useState(120);
  const [selectedInversion, setSelectedInversion] = useState<0 | 1 | 2>(0);
  const [activeMeter, setActiveMeter] = useState<"2/4" | "3/4" | "4/4" | "6/8">("4/4");
  const [progChords, setProgChords] = useState(["C", "Am", "F", "G"]);
  const [lastClickedNote, setLastClickedNote] = useState<string | null>("C4 (MIDI 60)");

  // 1. Interactive Piano
  const renderInteractivePiano = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-gray-300">
        <span>Bấm phím bất kỳ trên bàn phím bên dưới để lắng nghe cao độ và cảm nhận các quãng âm:</span>
        <span className="font-mono text-[#a88beb] font-bold">{lastClickedNote}</span>
      </div>
      <PianoVisualizer
        minMidi={48}
        maxMidi={72}
        activePlayingMidi={activeMidiNote}
        onKeyClick={(midi) => {
          setLastClickedNote(`${midiToNoteName(midi)} (MIDI ${midi})`);
          playNote(midi, 0.8);
        }}
      />
    </div>
  );

  // 2. Interval Builder
  const renderIntervalBuilder = () => {
    const rootMidi = 60; // C4
    const intervalMidi = rootMidi + selectedIntervalOffset;
    const intervalNames: Record<number, string> = {
      0: "Đồng âm (Unison - 0 st)",
      1: "Quãng 2 Thứ (Minor 2nd - 1 st)",
      2: "Quãng 2 Trưởng (Major 2nd - 2 st)",
      3: "Quãng 3 Thứ (Minor 3rd - 3 st)",
      4: "Quãng 3 Trưởng (Major 3rd - 4 st)",
      5: "Quãng 4 Đúng (Perfect 4th - 5 st)",
      6: "Quãng 3 Cung (Tritone - 6 st)",
      7: "Quãng 5 Đúng (Perfect 5th - 7 st)",
      8: "Quãng 6 Thứ (Minor 6th - 8 st)",
      9: "Quãng 6 Trưởng (Major 6th - 9 st)",
      12: "Quãng 8 Đúng (Octave - 12 st)",
    };

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(intervalNames).map(([offsetStr, name]) => {
            const offset = parseInt(offsetStr, 10);
            return (
              <button
                key={offset}
                type="button"
                onClick={() => {
                  setSelectedIntervalOffset(offset);
                  playChordBlock([rootMidi, rootMidi + offset], 1.2);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedIntervalOffset === offset
                    ? "bg-[#7c5cbf] text-white ring-2 ring-purple-400"
                    : "bg-[#1f1f2e] text-gray-300 hover:bg-[#2a2a3e]"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => playNoteSequence([rootMidi, intervalMidi], 400, 0.8)}
            className="px-4 py-2 bg-[#2a2a3e] hover:bg-[#35354e] text-sky-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Phát riêng lẻ (Giai điệu / Melodic)</span>
          </button>
          <button
            type="button"
            onClick={() => playChordBlock([rootMidi, intervalMidi], 1.6)}
            className="px-4 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Phát đồng thời (Hòa âm / Harmonic)</span>
          </button>
        </div>

        <PianoVisualizer
          highlightedMidis={[rootMidi, intervalMidi]}
          activePlayingMidi={activeMidiNote}
          minMidi={48}
          maxMidi={72}
          onKeyClick={(m) => playNote(m, 0.8)}
        />
      </div>
    );
  };

  // 3. Chord Builder
  const renderChordBuilder = () => {
    const cMajorMidis = [60, 64, 67];
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => playChordBlock(cMajorMidis, 1.8)}
            className="px-4 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Phát hợp âm khối (C + E + G)</span>
          </button>
          <button
            type="button"
            onClick={() => playNoteSequence(cMajorMidis, 450, 0.8)}
            className="px-4 py-2 bg-[#2a2a3e] hover:bg-[#35354e] text-sky-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Phát từng nốt liên tiếp</span>
          </button>
          <button
            type="button"
            onClick={() => playNoteSequence(cMajorMidis, 750, 1.2)}
            className="px-4 py-2 bg-[#2a2a3e] hover:bg-[#35354e] text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Phát tốc độ chậm (Phân tích nốt)</span>
          </button>
        </div>

        <PianoVisualizer
          highlightedMidis={cMajorMidis}
          activePlayingMidi={activeMidiNote}
          minMidi={48}
          maxMidi={72}
          onKeyClick={(m) => playNote(m, 0.8)}
        />
      </div>
    );
  };

  // 4. Major / Minor Toggle
  const renderMajorMinorToggle = () => {
    const roots = ["C", "D", "E", "F", "G", "A"];
    const chordDef = parseChordDefinition(selectedRoot, selectedQuality);
    const midis = chordDef.midiNotes;

    return (
      <div className="space-y-4">
        {/* Root Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold">Chủ âm (Root):</span>
          <div className="flex gap-1.5">
            {roots.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setSelectedRoot(r);
                  const def = parseChordDefinition(r, selectedQuality);
                  playChordBlock(def.midiNotes, 1.4);
                }}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                  selectedRoot === r
                    ? "bg-[#7c5cbf] text-white"
                    : "bg-[#1f1f2e] text-gray-300 hover:bg-[#2b2b3f]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedQuality("major");
              const def = parseChordDefinition(selectedRoot, "major");
              playChordBlock(def.midiNotes, 1.5);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
              selectedQuality === "major"
                ? "bg-amber-500 text-slate-950 ring-4 ring-amber-400/40 shadow-lg"
                : "bg-[#1f1f2e] text-gray-300 hover:bg-[#2b2b3f]"
            }`}
          >
            <span>☀️ Hợp âm Trưởng (Major - Tươi sáng)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedQuality("minor");
              const def = parseChordDefinition(selectedRoot, "minor");
              playChordBlock(def.midiNotes, 1.5);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
              selectedQuality === "minor"
                ? "bg-indigo-600 text-white ring-4 ring-indigo-400/40 shadow-lg"
                : "bg-[#1f1f2e] text-gray-300 hover:bg-[#2b2b3f]"
            }`}
          >
            <span>🌙 Hợp âm Thứ (Minor - Sâu lắng)</span>
          </button>
        </div>

        <PianoVisualizer
          highlightedMidis={midis}
          activePlayingMidi={activeMidiNote}
          minMidi={48}
          maxMidi={72}
          onKeyClick={(m) => playNote(m, 0.8)}
        />
      </div>
    );
  };

  // 5. Scale Player
  const renderScalePlayer = () => {
    const cScaleMidis = [60, 62, 64, 65, 67, 69, 71, 72];
    const cScaleDescMidis = [72, 71, 69, 67, 65, 64, 62, 60];

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => playNoteSequence(cScaleMidis, 360, 0.7)}
            className="px-4 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Đi lên (C → D → E → F → G → A → B → C)</span>
          </button>
          <button
            type="button"
            onClick={() => playNoteSequence(cScaleDescMidis, 360, 0.7)}
            className="px-4 py-2 bg-[#2a2a3e] hover:bg-[#35354e] text-sky-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Đi xuống (C → B → A → G → F → E → D → C)</span>
          </button>
          <button
            type="button"
            onClick={() => playNoteSequence(cScaleMidis, 650, 1.0)}
            className="px-4 py-2 bg-[#2a2a3e] hover:bg-[#35354e] text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Tốc độ chậm (Cảm nhận từng bậc âm)</span>
          </button>
        </div>

        <PianoVisualizer
          highlightedMidis={cScaleMidis}
          activePlayingMidi={activeMidiNote}
          minMidi={48}
          maxMidi={72}
          onKeyClick={(m) => playNote(m, 0.8)}
        />
      </div>
    );
  };

  // 6. Key Chords (Diatonic)
  const renderKeyChords = () => {
    const diatonicChords = [
      { name: "C (I)", quality: "Trưởng", midis: [60, 64, 67], color: "text-purple-400" },
      { name: "Dm (ii)", quality: "Thứ", midis: [62, 65, 69], color: "text-blue-400" },
      { name: "Em (iii)", quality: "Thứ", midis: [64, 67, 71], color: "text-blue-400" },
      { name: "F (IV)", quality: "Trưởng", midis: [65, 69, 72], color: "text-emerald-400" },
      { name: "G (V)", quality: "Trưởng", midis: [67, 71, 74], color: "text-amber-400" },
      { name: "Am (vi)", quality: "Thứ", midis: [57, 60, 64], color: "text-pink-400" },
      { name: "Bdim (vii°)", quality: "Giảm", midis: [59, 62, 65], color: "text-rose-400" },
    ];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {diatonicChords.map((chord) => (
            <button
              key={chord.name}
              type="button"
              onClick={() => playChordBlock(chord.midis, 1.4)}
              className="p-3 bg-[#1f1f2e] hover:bg-[#2a2a3e] border border-[#313145] hover:border-[#7c5cbf] rounded-xl flex flex-col items-center gap-1 transition text-center"
            >
              <span className={`text-xs font-extrabold ${chord.color}`}>{chord.name}</span>
              <span className="text-[10px] text-gray-400">{chord.quality}</span>
            </button>
          ))}
        </div>

        <PianoVisualizer
          highlightedMidis={[60, 62, 64, 65, 67, 69, 71]}
          activePlayingMidi={activeMidiNote}
          minMidi={48}
          maxMidi={76}
          onKeyClick={(m) => playNote(m, 0.8)}
        />
      </div>
    );
  };

  // 7. Progression Tweak
  const renderProgressionTweak = () => {
    const handlePlayProg = () => {
      const chordsToPlay = progChords.map((name) => {
        let midis = [60, 64, 67];
        if (name === "Am") midis = [57, 60, 64];
        if (name === "F") midis = [53, 57, 60];
        if (name === "G") midis = [55, 59, 62];
        if (name === "Em") midis = [52, 55, 59];
        if (name === "Dm") midis = [50, 53, 57];
        return { name, midis, durationMs: 1400 };
      });
      playProgression(chordsToPlay, 1.0);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {progChords.map((c, i) => (
              <div
                key={i}
                className="px-4 py-2 bg-[#201a38] border border-[#7c5cbf] rounded-xl text-xs font-bold text-white flex items-center gap-2"
              >
                <span>{c}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePlayProg}
            className="px-4 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Phát vòng lặp 4 Hợp âm</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
          <span className="font-bold">Thử các tiến trình khác:</span>
          <button
            type="button"
            onClick={() => setProgChords(["C", "Am", "F", "G"])}
            className="px-2.5 py-1 bg-[#1f1f2e] hover:bg-[#2b2b3f] rounded text-purple-300 text-xs font-bold"
          >
            C → Am → F → G (Pop)
          </button>
          <button
            type="button"
            onClick={() => setProgChords(["C", "F", "G", "C"])}
            className="px-2.5 py-1 bg-[#1f1f2e] hover:bg-[#2b2b3f] rounded text-purple-300 text-xs font-bold"
          >
            C → F → G → C (Folk)
          </button>
          <button
            type="button"
            onClick={() => setProgChords(["C", "G", "Am", "F"])}
            className="px-2.5 py-1 bg-[#1f1f2e] hover:bg-[#2b2b3f] rounded text-purple-300 text-xs font-bold"
          >
            C → G → Am → F (Anthem)
          </button>
        </div>
      </div>
    );
  };

  // 8. Tension & Resolution
  const renderTensionResolution = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => playChordBlock([55, 59, 62, 65], 2.5)} // G7
            className="p-4 bg-rose-950/40 border border-rose-600/60 hover:bg-rose-900/40 rounded-xl text-left transition"
          >
            <div className="flex items-center justify-between text-xs font-bold text-rose-300">
              <span>G7 (Căng thẳng / Chưa giải quyết)</span>
              <Play className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Tạo lực căng hòa âm mạnh (quãng 3 cung B & F) thôi thúc giải quyết.
            </p>
          </button>

          <button
            type="button"
            onClick={() => playChordBlock([60, 64, 67], 2.5)} // C
            className="p-4 bg-emerald-950/40 border border-emerald-600/60 hover:bg-emerald-900/40 rounded-xl text-left transition"
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
              <span>C (Giải tỏa / Về đích viên mãn)</span>
              <Play className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Trở về nốt chủ âm tạo cảm giác bình yên, vững chãi tại Nhà.
            </p>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            playProgression(
              [
                { name: "G7 (Căng thẳng)", midis: [55, 59, 62, 65], durationMs: 1600 },
                { name: "C (Giải tỏa)", midis: [60, 64, 67], durationMs: 2000 },
              ],
              1.0
            );
          }}
          className="w-full py-3 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Phát chuỗi hòa âm: G7 → C (Cảm nhận lực hút giải tỏa)</span>
        </button>
      </div>
    );
  };

  // 9. Inversions
  const renderInversions = () => {
    const invMap: Record<0 | 1 | 2, { name: string; midis: number[]; desc: string }> = {
      0: { name: "Thể gốc (C / C)", midis: [60, 64, 67], desc: "Nốt C ở bè trầm (Vững chãi, điểm tựa)" },
      1: { name: "Đảo 1 (C / E)", midis: [64, 67, 72], desc: "Nốt E ở bè trầm (Bay bổng, hướng về phía trước)" },
      2: { name: "Đảo 2 (C / G)", midis: [55, 60, 64], desc: "Nốt G ở bè trầm (Lơ lửng, tạo bước đệm)" },
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {([0, 1, 2] as const).map((inv) => (
            <button
              key={inv}
              type="button"
              onClick={() => {
                setSelectedInversion(inv);
                playChordBlock(invMap[inv].midis, 1.6);
              }}
              className={`p-3 rounded-xl border text-left transition ${
                selectedInversion === inv
                  ? "bg-[#201a38] border-[#7c5cbf] ring-2 ring-[#7c5cbf]"
                  : "bg-[#1f1f2e] border-[#313145] hover:bg-[#28283d]"
              }`}
            >
              <div className="text-xs font-extrabold text-white">{invMap[inv].name}</div>
              <div className="text-[10px] text-gray-400 mt-1">{invMap[inv].desc}</div>
            </button>
          ))}
        </div>

        <PianoVisualizer
          highlightedMidis={invMap[selectedInversion].midis}
          activePlayingMidi={activeMidiNote}
          minMidi={48}
          maxMidi={76}
          onKeyClick={(m) => playNote(m, 0.8)}
        />
      </div>
    );
  };

  // 10. Arpeggio Patterns
  const renderArpeggios = () => {
    const patterns: Record<string, { label: string; seq: number[] }> = {
      up: { label: "Rải đi lên (Ascending)", seq: [60, 64, 67] },
      down: { label: "Rải đi xuống (Descending)", seq: [67, 64, 60] },
      updown: { label: "Rải lên / xuống (Wave)", seq: [60, 64, 67, 64] },
      "1353": { label: "Mô hình 1-3-5-3 (Gentle Rock)", seq: [60, 64, 67, 64] },
      "1535": { label: "Mô hình 1-5-3-5 (Cinematic)", seq: [60, 67, 64, 67] },
    };

    const handlePlayArp = (pKey: typeof arpPattern) => {
      setArpPattern(pKey);
      const delayMs = Math.round(60000 / arpBpm / 2);
      playNoteSequence(patterns[pKey].seq, delayMs, 0.6);
    };

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(patterns).map(([k, val]) => (
            <button
              key={k}
              type="button"
              onClick={() => handlePlayArp(k as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                arpPattern === k
                  ? "bg-[#7c5cbf] text-white ring-2 ring-purple-400"
                  : "bg-[#1f1f2e] text-gray-300 hover:bg-[#2a2a3e]"
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-[#181824] p-3 rounded-xl border border-[#2d2d3d]">
          <Sliders className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-300 font-bold">Tốc độ: {arpBpm} BPM</span>
          <input
            type="range"
            min={60}
            max={180}
            value={arpBpm}
            onChange={(e) => setArpBpm(parseInt(e.target.value, 10))}
            className="flex-1 accent-[#7c5cbf]"
          />
        </div>

        <PianoVisualizer
          highlightedMidis={[60, 64, 67]}
          activePlayingMidi={activeMidiNote}
          minMidi={48}
          maxMidi={72}
          onKeyClick={(m) => playNote(m, 0.8)}
        />
      </div>
    );
  };

  // 11. Meter Grooves
  const renderMeterGrooves = () => {
    const meters: Record<"2/4" | "3/4" | "4/4" | "6/8", { name: string; grouping?: number[]; desc: string }> = {
      "2/4": { name: "Nhịp 2/4 (Hành khúc)", desc: "MỘT - hai" },
      "3/4": { name: "Nhịp 3/4 (Valse)", desc: "MỘT - hai - ba" },
      "4/4": { name: "Nhịp 4/4 (Pop phổ biến)", desc: "MỘT - hai - BA - bốn" },
      "6/8": { name: "Nhịp 6/8 (Nhịp kép 3+3)", grouping: [3, 3], desc: "MỘT-hai-ba, BỐN-năm-sáu" },
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(meters).map(([mKey, data]) => (
            <button
              key={mKey}
              type="button"
              onClick={() => {
                setActiveMeter(mKey as any);
                playMeterGroove(mKey as any, data.grouping, 100, 2);
              }}
              className={`p-3 rounded-xl border text-center transition ${
                activeMeter === mKey
                  ? "bg-[#201a38] border-[#7c5cbf] ring-2 ring-[#7c5cbf]"
                  : "bg-[#1f1f2e] border-[#313145] hover:bg-[#28283d]"
              }`}
            >
              <div className="text-xs font-extrabold text-white">{data.name}</div>
              <div className="text-[10px] text-gray-400 mt-1">{data.desc}</div>
            </button>
          ))}
        </div>

        {/* Real-time beat indicator */}
        <div className="bg-[#181824] p-4 rounded-xl border border-[#2d2d3d] flex items-center justify-center gap-3">
          <span className="text-xs text-gray-400 font-bold">Xung nhịp đếm:</span>
          <div className="flex gap-2">
            {Array.from({
              length: activeMeter === "2/4" ? 2 : activeMeter === "3/4" ? 3 : activeMeter === "6/8" ? 6 : 4,
            }).map((_, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all duration-75 ${
                  activeBeatIndex === idx
                    ? "bg-amber-400 text-slate-950 scale-110 shadow-lg shadow-amber-400/30 ring-2 ring-amber-300"
                    : "bg-[#252535] text-gray-400"
                }`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 12. Voice Leading
  const renderVoiceLeading = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              playProgression(
                [
                  { name: "C (Thể gốc)", midis: [60, 64, 67], durationMs: 1400 },
                  { name: "G (Thể gốc - Nhảy xa)", midis: [67, 71, 74], durationMs: 1400 },
                ],
                1.0
              );
            }}
            className="p-4 bg-[#1f1f2e] hover:bg-[#2a2a3e] border border-[#313145] rounded-xl text-left"
          >
            <div className="text-xs font-bold text-rose-300">Nhảy phím xa (Bè rời rạc, giật cục)</div>
            <p className="text-[11px] text-gray-400 mt-1">
              Bàn tay nhảy 7 nửa cung trên bàn phím.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              playProgression(
                [
                  { name: "C (Nốt chung G)", midis: [60, 64, 67], durationMs: 1400 },
                  { name: "G/B (Trượt êm)", midis: [59, 62, 67], durationMs: 1400 },
                ],
                1.0
              );
            }}
            className="p-4 bg-[#201a38] hover:bg-[#282245] border border-[#7c5cbf] rounded-xl text-left"
          >
            <div className="text-xs font-bold text-emerald-300">Dẫn bè mượt mà (Voice Leading êm ái)</div>
            <p className="text-[11px] text-gray-400 mt-1">
              Nốt cao G giữ nguyên vị trí làm điểm tựa; các bè khác chỉ trượt 1 nửa cung.
            </p>
          </button>
        </div>

        <PianoVisualizer
          highlightedMidis={[59, 60, 62, 64, 67]}
          activePlayingMidi={activeMidiNote}
          minMidi={48}
          maxMidi={76}
          onKeyClick={(m) => playNote(m, 0.8)}
        />
      </div>
    );
  };

  return (
    <div className={`bg-[#14141e] border border-[#2d2d3d] rounded-2xl p-5 space-y-4 shadow-xl ${className}`}>
      <div className="flex items-center justify-between border-b border-[#2d2d3d] pb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#a88beb]" />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a88beb]">
              Bước 4 — Thử Nghiệm Tương Tác Trực Tiếp
            </span>
            <h3 className="text-sm font-extrabold text-white">{lesson.experimentTitle}</h3>
          </div>
        </div>
        <p className="text-xs text-gray-400 hidden sm:block">{lesson.experimentPrompt}</p>
      </div>

      {lesson.experimentType === "interactive_piano" && renderInteractivePiano()}
      {lesson.experimentType === "interval_builder" && renderIntervalBuilder()}
      {lesson.experimentType === "chord_builder" && renderChordBuilder()}
      {lesson.experimentType === "major_minor_toggle" && renderMajorMinorToggle()}
      {lesson.experimentType === "scale_player" && renderScalePlayer()}
      {lesson.experimentType === "key_chords" && renderKeyChords()}
      {lesson.experimentType === "progression_tweak" && renderProgressionTweak()}
      {lesson.experimentType === "tension_resolution" && renderTensionResolution()}
      {lesson.experimentType === "inversion_picker" && renderInversions()}
      {lesson.experimentType === "arpeggio_patterns" && renderArpeggios()}
      {lesson.experimentType === "meter_grooves" && renderMeterGrooves()}
      {lesson.experimentType === "voice_leading_compare" && renderVoiceLeading()}
    </div>
  );
};
