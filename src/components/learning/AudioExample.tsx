import React from "react";
import { Play, Pause, Volume2, Snail, Music2, ArrowLeftRight, Sparkles } from "lucide-react";
import { AudioExampleItem } from "../../types/learning";
import { useLearningAudio } from "../../hooks/useLearningAudio";

interface AudioExampleProps {
  example: AudioExampleItem;
  onCompare?: () => void;
  showCompareButton?: boolean;
  onActiveMidiChange?: (midi: number | null) => void;
  className?: string;
}

export const AudioExample: React.FC<AudioExampleProps> = ({
  example,
  onCompare,
  showCompareButton = false,
  onActiveMidiChange,
  className = "",
}) => {
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

  React.useEffect(() => {
    onActiveMidiChange?.(activeMidiNote);
  }, [activeMidiNote, onActiveMidiChange]);

  const midis = React.useMemo(() => {
    if (example.notes && example.notes.length > 0) {
      return example.notes.map((n) => n.midi);
    }
    if (example.chords && example.chords.length > 0) {
      return example.chords[0]?.midiNotes || [60, 64, 67];
    }
    return [60];
  }, [example]);

  const handlePlayNormal = async () => {
    if (isPlaying) {
      stop();
      return;
    }

    switch (example.type) {
      case "single_note":
        playNote(midis[0] || 60, 1.2);
        break;
      case "interval":
      case "chord":
        playChordBlock(midis, 1.8);
        break;
      case "arpeggio":
      case "scale":
        playNoteSequence(midis, 360, 0.7);
        break;
      case "progression":
        if (example.chords) {
          playProgression(
            example.chords.map((c) => ({
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
          example.timeSignature || "4/4",
          example.timeSignatureGrouping,
          example.bpm || 100,
          2
        );
        break;
    }
  };

  const handlePlaySlow = async () => {
    if (isPlaying) {
      stop();
      return;
    }

    switch (example.type) {
      case "single_note":
        playNote(midis[0] || 60, 2.2);
        break;
      case "interval":
      case "chord":
        playNoteSequence(midis, 650, 1.2);
        break;
      case "arpeggio":
      case "scale":
        playNoteSequence(midis, 700, 1.1);
        break;
      case "progression":
        if (example.chords) {
          playProgression(
            example.chords.map((c) => ({
              name: c.name,
              midis: c.midiNotes || [60, 64, 67],
              durationMs: 2400,
            })),
            0.55
          );
        }
        break;
      case "meter":
        playMeterGroove(
          example.timeSignature || "4/4",
          example.timeSignatureGrouping,
          Math.max(50, (example.bpm || 100) * 0.65),
          2
        );
        break;
    }
  };

  const handlePlayNotes = async () => {
    if (isPlaying) {
      stop();
      return;
    }
    playNoteSequence(midis, 420, 0.8);
  };

  return (
    <div
      className={`bg-[#181824] border border-[#2d2d3d] hover:border-[#7c5cbf]/60 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition shadow-md ${
        isPlaying ? "ring-2 ring-[#7c5cbf] bg-[#1d1a2f]" : ""
      } ${className}`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h4 className="text-sm font-bold text-white tracking-wide">{example.label}</h4>
          {example.chordName && (
            <span className="px-2 py-0.5 bg-[#7c5cbf]/30 text-[#a88beb] rounded text-xs font-mono font-bold">
              {example.chordName}
            </span>
          )}
        </div>
        {example.description && (
          <p className="text-xs text-gray-400 leading-relaxed">{example.description}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Play / Hear Button */}
        <button
          type="button"
          onClick={handlePlayNormal}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
            isPlaying
              ? "bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-300"
              : "bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white"
          }`}
          title="Nghe ví dụ âm thanh"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? "Dừng" : "▶ Nghe"}</span>
        </button>

        {/* Slow Playback */}
        <button
          type="button"
          onClick={handlePlaySlow}
          className="px-3 py-1.5 bg-[#252533] hover:bg-[#323245] text-amber-300 hover:text-amber-200 border border-[#3d3d52] rounded-lg text-xs font-bold flex items-center gap-1 transition"
          title="Nghe tốc độ chậm để cảm nhận từng chi tiết nốt"
        >
          <Snail className="w-3.5 h-3.5" />
          <span>🐢 Chậm</span>
        </button>

        {/* Hear Individual Notes (Sequence) */}
        {midis.length > 1 && (
          <button
            type="button"
            onClick={handlePlayNotes}
            className="px-3 py-1.5 bg-[#252533] hover:bg-[#323245] text-sky-300 hover:text-sky-200 border border-[#3d3d52] rounded-lg text-xs font-bold flex items-center gap-1 transition"
            title="Nghe tách từng nốt riêng biệt"
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>🔬 Tách nốt</span>
          </button>
        )}

        {/* Compare Button */}
        {showCompareButton && onCompare && (
          <button
            type="button"
            onClick={onCompare}
            className="px-3 py-1.5 bg-[#252533] hover:bg-[#323245] text-purple-300 hover:text-purple-200 border border-[#3d3d52] rounded-lg text-xs font-bold flex items-center gap-1 transition"
            title="So sánh trực diện A / B"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>↔ So sánh</span>
          </button>
        )}
      </div>
    </div>
  );
};
