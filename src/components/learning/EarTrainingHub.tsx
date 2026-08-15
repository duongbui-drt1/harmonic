import React, { useState } from "react";
import {
  Award,
  Play,
  RotateCcw,
  Volume2,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { useLearningAudio } from "../../hooks/useLearningAudio";
import { EarTrainingStats } from "../../types/learning";

interface DrillQuestion {
  id: string;
  category: "pitch" | "intervals" | "major_minor" | "tension";
  promptTitle: string;
  subtext: string;
  playAction: (audio: ReturnType<typeof useLearningAudio>) => void;
  options: {
    label: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  hint: string;
}

const DRILLS: DrillQuestion[] = [
  {
    id: "drill-1",
    category: "major_minor",
    promptTitle: "Hợp âm bí ẩn này là Hợp âm Trưởng hay Hợp âm Thứ?",
    subtext: "Lắng nghe nốt bậc 3 để cảm nhận tính chất cảm xúc.",
    playAction: (audio) => audio.playChordBlock([60, 63, 67], 2.0), // C minor
    options: [
      {
        label: "Hợp âm Trưởng (Tươi sáng / Tràn đầy hy vọng)",
        isCorrect: false,
        explanation: "Hợp âm này sử dụng nốt Eb (Mi giáng), tạo nên màu sắc trầm buồn da diết của hợp âm Thứ.",
      },
      {
        label: "Hợp âm Thứ (Trầm lắng / U buồn)",
        isCorrect: true,
        explanation: "Chính xác! Đó là hợp âm C Thứ (Cm: C – Eb – G).",
      },
    ],
    hint: "Hãy lắng nghe xem âm thanh mang cảm giác hân hoan hay tự sự trầm lắng.",
  },
  {
    id: "drill-2",
    category: "pitch",
    promptTitle: "Nghe hai nốt lần lượt. Cao độ nốt thứ hai đi Lên cao hay Xuống thấp?",
    subtext: "Nốt 1: C4. Nốt 2: G4.",
    playAction: (audio) => audio.playNoteSequence([60, 67], 500, 0.8),
    options: [
      {
        label: "Đi Lên cao hơn (Cao độ tăng)",
        isCorrect: true,
        explanation: "Chính xác! Nốt G4 (MIDI 67) rung nhanh hơn nốt C4 (MIDI 60), tạo cảm giác cao độ bước lên.",
      },
      {
        label: "Đi Xuống thấp hơn (Cao độ giảm)",
        isCorrect: false,
        explanation: "Nốt thứ hai có cao độ cao hơn nốt thứ nhất.",
      },
    ],
    hint: "Hãy lắng nghe hướng chuyển động của âm thanh hướng lên hay trượt xuống.",
  },
  {
    id: "drill-3",
    category: "intervals",
    promptTitle: "Quãng nào đang phát: Quãng 5 đúng êm ái hay Quãng 2 thứ cọ xát?",
    subtext: "Lắng nghe sự cộng hưởng đồng thời giữa hai nốt.",
    playAction: (audio) => audio.playChordBlock([60, 61], 1.8), // Minor 2nd
    options: [
      {
        label: "Quãng 5 Đúng (Êm ái, vững chãi, hòa quyện)",
        isCorrect: false,
        explanation: "Quãng 5 nghe rất thoáng và ổn định. Âm thanh vừa rồi có độ cọ xát và căng thẳng cao.",
      },
      {
        label: "Quãng 2 Thứ (Căng thẳng, cọ xát nghẹt thở)",
        isCorrect: true,
        explanation: "Chuẩn xác! Đó là nốt C và Db phát cùng lúc (Quãng 2 thứ - cách nhau 1 nửa cung).",
      },
    ],
    hint: "Lắng nghe độ rung gắt và sự ma sát va chạm giữa hai tần số âm thanh.",
  },
  {
    id: "drill-4",
    category: "tension",
    promptTitle: "Hợp âm này đang ở trạng thái Ổn định (Giải quyết) hay Đang căng thẳng (Chưa giải quyết)?",
    subtext: "Lắng nghe xem âm thanh tạo cảm giác như đã về nhà hay đang thôi thúc chuyển động tiếp.",
    playAction: (audio) => audio.playChordBlock([55, 59, 62, 65], 2.2), // G7
    options: [
      {
        label: "Đang căng thẳng hồi hộp (Lực hút của hợp âm Át 7)",
        isCorrect: true,
        explanation: "Chính xác! Đó là hợp âm G7 — chứa quãng nghịch tritone (B và F) thúc giục giải quyết về C.",
      },
      {
        label: "Đã giải quyết ổn định (Nghỉ ngơi tại chủ âm)",
        isCorrect: false,
        explanation: "Hợp âm này mang năng lượng dồn nén cao, chưa hạ cánh an toàn.",
      },
    ],
    hint: "Tai bạn có cảm giác đang chờ đợi một nốt kết thúc sau âm thanh này không?",
  },
  {
    id: "drill-5",
    category: "major_minor",
    promptTitle: "Hợp âm bí ẩn này là Hợp âm Trưởng hay Hợp âm Thứ?",
    subtext: "Lắng nghe tính chất hòa âm tổng thể.",
    playAction: (audio) => audio.playChordBlock([65, 69, 72], 2.0), // F major
    options: [
      {
        label: "Hợp âm Trưởng (Tươi sáng, rạng rỡ)",
        isCorrect: true,
        explanation: "Chính xác! Đó là hợp âm F Trưởng (F – A – C) với nốt quãng 3 trưởng (A) tươi sáng.",
      },
      {
        label: "Hợp âm Thứ (Trầm tư, u buồn)",
        isCorrect: false,
        explanation: "Hợp âm này mang tính chất mở rộng và sáng rõ của hợp âm Trưởng.",
      },
    ],
    hint: "Lắng nghe sắc thái tươi vui, lạc quan của âm thanh.",
  },
];

export const EarTrainingHub: React.FC = () => {
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [stats, setStats] = useState<EarTrainingStats>({
    totalAttempted: 0,
    totalCorrect: 0,
    byCategory: {},
    streak: 0,
  });

  const audio = useLearningAudio("piano");

  const currentDrill = DRILLS[currentDrillIndex] || DRILLS[0];

  const handlePlay = () => {
    if (audio.isPlaying) {
      audio.stop();
    } else {
      currentDrill.playAction(audio);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (hasAnswered) return;
    setSelectedOptionIndex(idx);
    setHasAnswered(true);

    const isCorrect = currentDrill.options[idx]?.isCorrect ?? false;

    setStats((prev) => {
      const cat = currentDrill.category;
      const catPrev = prev.byCategory[cat] || { attempted: 0, correct: 0 };

      return {
        totalAttempted: prev.totalAttempted + 1,
        totalCorrect: isCorrect ? prev.totalCorrect + 1 : prev.totalCorrect,
        streak: isCorrect ? prev.streak + 1 : 0,
        byCategory: {
          ...prev.byCategory,
          [cat]: {
            attempted: catPrev.attempted + 1,
            correct: isCorrect ? catPrev.correct + 1 : catPrev.correct,
          },
        },
      };
    });
  };

  const handleNextDrill = () => {
    setSelectedOptionIndex(null);
    setHasAnswered(false);
    setShowHint(false);
    audio.stop();
    setCurrentDrillIndex((prev) => (prev + 1) % DRILLS.length);
  };

  const accuracyPct =
    stats.totalAttempted > 0
      ? Math.round((stats.totalCorrect / stats.totalAttempted) * 100)
      : 100;

  const selectedOpt =
    selectedOptionIndex !== null ? currentDrill.options[selectedOptionIndex] : null;

  const categoryLabels: Record<string, string> = {
    pitch: "Cao độ",
    intervals: "Quãng",
    major_minor: "Trưởng & Thứ",
    tension: "Căng thẳng & Giải quyết",
  };

  return (
    <div className="bg-[#101018] border border-[#252535] rounded-2xl p-6 space-y-6 shadow-2xl">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252535] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-extrabold text-white">Trung Tâm Luyện Tai (Ear Training)</h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Rèn luyện đôi tai nhạy bén bằng các bài tập âm thanh thực tế — không cần học vẹt lý thuyết.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#181824] border border-[#2d2d3d] rounded-xl text-xs font-bold text-gray-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Độ chính xác: <strong className="text-white">{accuracyPct}%</strong> ({stats.totalCorrect}/{stats.totalAttempted})
            </span>
          </div>

          {stats.streak > 1 && (
            <div className="px-3 py-1.5 bg-amber-950/60 border border-amber-600/50 rounded-xl text-xs font-extrabold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Chuỗi {stats.streak} câu đúng!</span>
            </div>
          )}
        </div>
      </div>

      {/* Drill Question Card */}
      <div className="bg-[#141420] border border-[#252535] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a88beb]">
            Câu hỏi {currentDrillIndex + 1} / {DRILLS.length}
          </span>
          <span className="text-xs text-gray-400">Chủ đề: {categoryLabels[currentDrill.category] || currentDrill.category}</span>
        </div>

        <div>
          <h3 className="text-base font-extrabold text-white">{currentDrill.promptTitle}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{currentDrill.subtext}</p>
        </div>

        {/* Audio Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePlay}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg ${
              audio.isPlaying
                ? "bg-amber-500 text-slate-950 ring-4 ring-amber-400/40"
                : "bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white"
            }`}
          >
            {audio.isPlaying ? (
              <Volume2 className="w-4 h-4 animate-bounce" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>{audio.isPlaying ? "Đang phát âm thanh..." : "🔊 Nghe âm thanh câu hỏi"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-amber-300 hover:text-amber-200 px-2 py-1 rounded border border-amber-500/20 flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHint ? "Ẩn gợi ý" : "Gợi ý"}</span>
          </button>
        </div>

        {showHint && (
          <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl p-3 text-xs text-amber-200">
            {currentDrill.hint}
          </div>
        )}

        {/* Options */}
        <div className="space-y-2.5 pt-2">
          {currentDrill.options.map((opt, idx) => {
            const isSelected = selectedOptionIndex === idx;
            let style = "bg-[#1f1f2e] border-[#313145] text-gray-200 hover:bg-[#28283d] hover:border-[#7c5cbf]";

            if (hasAnswered) {
              if (opt.isCorrect) {
                style = "bg-emerald-950/80 border-emerald-500 text-emerald-100 ring-2 ring-emerald-400";
              } else if (isSelected && !opt.isCorrect) {
                style = "bg-rose-950/80 border-rose-500 text-rose-100 ring-2 ring-rose-400";
              } else {
                style = "bg-[#181824] border-[#252535] text-gray-500 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={hasAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-4 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition ${style}`}
              >
                <span>{opt.label}</span>
                {hasAnswered && opt.isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                {hasAnswered && isSelected && !opt.isCorrect && (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Explanation */}
        {hasAnswered && selectedOpt && (
          <div
            className={`p-4 rounded-xl border text-xs leading-relaxed ${
              selectedOpt.isCorrect
                ? "bg-emerald-950/40 border-emerald-700/60 text-emerald-200"
                : "bg-rose-950/40 border-rose-700/60 text-rose-200"
            }`}
          >
            <div className="font-bold mb-1">
              {selectedOpt.isCorrect ? "✨ Xuất sắc! Đôi tai của bạn rất chuẩn xác:" : "💡 Giải thích lý thuyết để bạn nghe lại:"}
            </div>
            <p>{selectedOpt.explanation}</p>
          </div>
        )}

        {hasAnswered && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleNextDrill}
              className="px-5 py-2.5 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg"
            >
              <span>Câu hỏi tiếp theo</span>
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
