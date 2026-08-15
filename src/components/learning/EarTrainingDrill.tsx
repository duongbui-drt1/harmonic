import React, { useState } from "react";
import { Play, Volume2, Check, X, RotateCcw, Award, Sparkles, HelpCircle } from "lucide-react";
import { ChallengeQuestion } from "../../types/learning";
import { useLearningAudio } from "../../hooks/useLearningAudio";

interface EarTrainingDrillProps {
  challenge: ChallengeQuestion;
  onSuccess?: () => void;
  className?: string;
}

export const EarTrainingDrill: React.FC<EarTrainingDrillProps> = ({
  challenge,
  onSuccess,
  className = "",
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const {
    isPlaying,
    playNote,
    playChordBlock,
    playNoteSequence,
    playProgression,
    playMeterGroove,
    stop,
  } = useLearningAudio("piano");

  const midis = React.useMemo(() => {
    const ex = challenge.audioPrompt;
    if (ex.notes && ex.notes.length > 0) return ex.notes.map((n) => n.midi);
    if (ex.chords && ex.chords.length > 0) return ex.chords[0]?.midiNotes || [60, 64, 67];
    return [60];
  }, [challenge]);

  const handlePlayPrompt = () => {
    if (isPlaying) {
      stop();
      return;
    }

    const ex = challenge.audioPrompt;
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
        playNoteSequence(midis, 360, 0.7);
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

  const handleSelectOption = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedIndex(idx);
    setHasSubmitted(true);

    const isCorrect = challenge.options[idx]?.isCorrect;
    if (isCorrect) {
      onSuccess?.();
    }
  };

  const handleRetry = () => {
    setSelectedIndex(null);
    setHasSubmitted(false);
    setShowHint(false);
    stop();
  };

  const selectedOption = selectedIndex !== null ? challenge.options[selectedIndex] : null;
  const isCorrectAnswer = selectedOption?.isCorrect ?? false;

  return (
    <div
      className={`bg-gradient-to-br from-[#161623] to-[#1a142e] border border-[#3b2d59] rounded-2xl p-6 space-y-5 shadow-2xl ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2d2545] pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
            Bước 5 — Thử Thách Luyện Tai & Nhận Diện
          </span>
        </div>
        {hasSubmitted && (
          <button
            type="button"
            onClick={handleRetry}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>
        )}
      </div>

      {/* Question */}
      <div className="space-y-1.5">
        <h3 className="text-base font-extrabold text-white leading-snug">
          {challenge.question}
        </h3>
        {challenge.subtext && (
          <p className="text-xs text-gray-400">{challenge.subtext}</p>
        )}
      </div>

      {/* Play Sound Prompt Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePlayPrompt}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all duration-150 shadow-lg ${
            isPlaying
              ? "bg-amber-500 text-slate-950 ring-4 ring-amber-400/50 scale-105"
              : "bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white ring-2 ring-purple-400/30"
          }`}
        >
          {isPlaying ? (
            <Volume2 className="w-4 h-4 animate-bounce" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>{isPlaying ? "Đang phát âm thanh..." : "🔊 Nghe mẫu âm thanh câu hỏi"}</span>
        </button>

        {challenge.hint && (
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-amber-300/80 hover:text-amber-200 flex items-center gap-1 px-2 py-1 rounded border border-amber-500/20"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHint ? "Ẩn gợi ý" : "Gợi ý"}</span>
          </button>
        )}
      </div>

      {showHint && challenge.hint && (
        <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{challenge.hint}</span>
        </div>
      )}

      {/* Options */}
      <div className="space-y-2.5">
        {challenge.options.map((opt, idx) => {
          const isSelected = selectedIndex === idx;
          let btnStyle = "bg-[#1f1f2e] border-[#313145] text-gray-200 hover:border-[#7c5cbf] hover:bg-[#28283d]";

          if (hasSubmitted) {
            if (opt.isCorrect) {
              btnStyle = "bg-emerald-950/70 border-emerald-500 text-emerald-100 ring-2 ring-emerald-400/60";
            } else if (isSelected && !opt.isCorrect) {
              btnStyle = "bg-rose-950/70 border-rose-500 text-rose-100 ring-2 ring-rose-400/60";
            } else {
              btnStyle = "bg-[#181824] border-[#252535] text-gray-500 opacity-60";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={hasSubmitted}
              onClick={() => handleSelectOption(idx)}
              className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between gap-3 transition-all duration-150 ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-black/40 text-gray-400 text-[10px] font-mono font-bold flex items-center justify-center">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt.label}</span>
              </div>

              {hasSubmitted && (
                <div>
                  {opt.isCorrect ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                      <Check className="w-4 h-4" /> Chính xác
                    </span>
                  ) : isSelected ? (
                    <span className="flex items-center gap-1 text-rose-400 font-bold text-xs">
                      <X className="w-4 h-4" /> Chưa đúng
                    </span>
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Post-submission feedback explanation */}
      {hasSubmitted && selectedOption && (
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed transition-all animate-fadeIn ${
            isCorrectAnswer
              ? "bg-emerald-950/40 border-emerald-700/60 text-emerald-200"
              : "bg-rose-950/40 border-rose-700/60 text-rose-200"
          }`}
        >
          <div className="font-bold mb-1 flex items-center gap-1.5">
            {isCorrectAnswer ? (
              <>
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Chúc mừng! Bạn đã nghe và nắm chắc khái niệm.</span>
              </>
            ) : (
              <>
                <HelpCircle className="w-4 h-4 text-rose-400" />
                <span>Giải thích thêm để bạn nghe lại:</span>
              </>
            )}
          </div>
          <p>{selectedOption.explanation}</p>
        </div>
      )}
    </div>
  );
};
