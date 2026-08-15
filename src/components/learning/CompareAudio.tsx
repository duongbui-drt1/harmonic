import React, { useState } from "react";
import { ArrowLeftRight, Play, Volume2, Sparkles, HelpCircle } from "lucide-react";
import { ComparisonItem } from "../../types/learning";
import { useLearningAudio } from "../../hooks/useLearningAudio";
import { PianoVisualizer } from "./PianoVisualizer";

interface CompareAudioProps {
  comparison: ComparisonItem;
  className?: string;
}

export const CompareAudio: React.FC<CompareAudioProps> = ({ comparison, className = "" }) => {
  const [activeOption, setActiveOption] = useState<"A" | "B">("A");
  const {
    isPlaying,
    activeMidiNote,
    playNote,
    playChordBlock,
    playNoteSequence,
    playProgression,
    playMeterGroove,
    stop,
  } = useLearningAudio("piano");

  const [showTheory, setShowTheory] = useState(false);

  const getMidisForOption = (opt: "A" | "B"): number[] => {
    const ex = opt === "A" ? comparison.optionA.example : comparison.optionB.example;
    if (ex.notes && ex.notes.length > 0) return ex.notes.map((n) => n.midi);
    if (ex.chords && ex.chords.length > 0) return ex.chords[0]?.midiNotes || [60, 64, 67];
    return [60];
  };

  const playOption = (opt: "A" | "B") => {
    setActiveOption(opt);
    const ex = opt === "A" ? comparison.optionA.example : comparison.optionB.example;
    const midis = getMidisForOption(opt);

    stop();

    switch (ex.type) {
      case "single_note":
        playNote(midis[0] || 60, 1.2);
        break;
      case "interval":
      case "chord":
        playChordBlock(midis, 1.8);
        break;
      case "arpeggio":
      case "scale":
        playNoteSequence(midis, 360, 0.8);
        break;
      case "progression":
        if (ex.chords) {
          playProgression(
            ex.chords.map((c) => ({
              name: c.name,
              midis: c.midiNotes || [60, 64, 67],
              durationMs: 1400,
            })),
            1.0
          );
        }
        break;
      case "meter":
        playMeterGroove(
          ex.timeSignature || "4/4",
          ex.timeSignatureGrouping,
          ex.bpm || 100,
          2
        );
        break;
    }
  };

  const currentOptionData = activeOption === "A" ? comparison.optionA : comparison.optionB;
  const currentHighlightedMidis =
    currentOptionData.highlightMidis || getMidisForOption(activeOption);

  return (
    <div className={`bg-[#14141e] border border-[#2d2d3d] rounded-2xl p-5 space-y-4 shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2d2d3d] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              Lắng Nghe Điểm Khác Biệt (So Sánh Trực Diện A / B)
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white mt-0.5">{comparison.title}</h3>
        </div>
        <p className="text-xs text-gray-400">{comparison.description}</p>
      </div>

      {/* A / B Switchboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Option A Card */}
        <div
          onClick={() => playOption("A")}
          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
            activeOption === "A"
              ? "bg-[#201a38] border-[#7c5cbf] ring-2 ring-[#7c5cbf]/60 shadow-lg shadow-[#7c5cbf]/10"
              : "bg-[#181824] border-[#2d2d3d] hover:border-gray-600 opacity-80"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Lựa Chọn A
            </span>
            <button
              type="button"
              className={`p-2 rounded-lg flex items-center justify-center transition ${
                activeOption === "A" && isPlaying
                  ? "bg-amber-500 text-slate-950 ring-2 ring-amber-300 animate-pulse"
                  : "bg-[#7c5cbf] text-white hover:bg-[#8e6fd1]"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
          <h4 className="text-sm font-bold text-white">{comparison.optionA.label}</h4>
          <p className="text-xs text-gray-400 mt-1">{comparison.optionA.sublabel}</p>
        </div>

        {/* Option B Card */}
        <div
          onClick={() => playOption("B")}
          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
            activeOption === "B"
              ? "bg-[#201a38] border-[#7c5cbf] ring-2 ring-[#7c5cbf]/60 shadow-lg shadow-[#7c5cbf]/10"
              : "bg-[#181824] border-[#2d2d3d] hover:border-gray-600 opacity-80"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Lựa Chọn B
            </span>
            <button
              type="button"
              className={`p-2 rounded-lg flex items-center justify-center transition ${
                activeOption === "B" && isPlaying
                  ? "bg-amber-500 text-slate-950 ring-2 ring-amber-300 animate-pulse"
                  : "bg-[#7c5cbf] text-white hover:bg-[#8e6fd1]"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
          <h4 className="text-sm font-bold text-white">{comparison.optionB.label}</h4>
          <p className="text-xs text-gray-400 mt-1">{comparison.optionB.sublabel}</p>
        </div>
      </div>

      {/* Visualizer showing currently selected Option */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-gray-300">
            Hiển thị phím đàn ({activeOption === "A" ? comparison.optionA.label : comparison.optionB.label})
          </span>
          <span className="text-[11px] text-[#a88beb] font-mono">
            Đang chọn: Lựa chọn {activeOption}
          </span>
        </div>
        <PianoVisualizer
          highlightedMidis={currentHighlightedMidis}
          activePlayingMidi={activeMidiNote}
          minMidi={48}
          maxMidi={72}
          onKeyClick={(m) => playNote(m, 0.8)}
        />
      </div>

      {/* Why Difference Matters Explanation */}
      <div className="bg-[#181824] border border-[#2d2d3d] rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h5 className="text-xs font-bold text-white uppercase tracking-wider">
            Vì Sao Sự Khác Biệt Này Lại Quan Trọng?
          </h5>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          {comparison.whyDifferenceMatters}
        </p>

        {comparison.theoryDetails && (
          <div className="pt-2 border-t border-[#2d2d3d]/60">
            <button
              type="button"
              onClick={() => setShowTheory(!showTheory)}
              className="text-[11px] text-[#a88beb] hover:text-white font-bold flex items-center gap-1 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showTheory ? "Thu gọn lý thuyết chuyên sâu" : "Xem thêm lý thuyết chuyên sâu"}</span>
            </button>
            {showTheory && (
              <p className="mt-2 text-xs text-indigo-300 bg-indigo-950/30 border border-indigo-800/40 p-2.5 rounded-lg leading-relaxed">
                {comparison.theoryDetails}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
