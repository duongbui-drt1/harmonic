import React, { useState, useEffect, useMemo } from "react";
import {
  Piano,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Trophy,
  ArrowRight,
  Lightbulb,
  Volume2,
  VolumeX,
  Flame,
  Music,
  Sliders,
  Check,
  ChevronRight,
} from "lucide-react";
import { useMidi } from "../../hooks/useMidi";
import { midiToNoteName, NOTE_NAMES_SHARP } from "../../utils/noteNames";
import { PianoVisualizer } from "./PianoVisualizer";

export interface MidiExercise {
  id: string;
  category: "note" | "interval" | "triad" | "seventh" | "inversion" | "scale" | "progression";
  categoryLabelVi: string;
  titleVi: string;
  promptVi: string;
  instructionVi: string;
  targetMidis: number[]; // e.g. [60, 64, 67] for C major
  targetPitchClasses: number[]; // [0, 4, 7] for C major (pitch classes 0..11)
  chordSymbol?: string;
  explanationVi: string;
  hintVi: string;
  difficulty: "Cơ bản" | "Trung cấp" | "Nâng cao";
}

export const MIDI_PRACTICE_EXERCISES: MidiExercise[] = [
  // 1. Single Notes
  {
    id: "note-c4",
    category: "note",
    categoryLabelVi: "Nhận Diện Nốt Đơn",
    titleVi: "Nốt Đô trung (Middle C)",
    promptVi: "Chơi nốt C4 (Đô trung tâm) trên bàn phím MIDI",
    instructionVi: "Hãy tìm và nhấn phím C4 (phím Đô nằm ở giữa bàn phím đàn).",
    targetMidis: [60],
    targetPitchClasses: [0],
    explanationVi: "Nốt C4 (MIDI số 60) là mốc chuẩn cao độ quan trọng nhất trong ký âm và xướng âm.",
    hintVi: "Phím trắng nằm ngay bên trái cụm 2 phím đen ở giữa đàn.",
    difficulty: "Cơ bản",
  },
  {
    id: "note-fsharp4",
    category: "note",
    categoryLabelVi: "Nhận Diện Nốt Đơn",
    titleVi: "Nốt Pha thăng (F#4)",
    promptVi: "Chơi nốt F#4 (Pha thăng)",
    instructionVi: "Nhấn phím đen F#4 trên bàn phím.",
    targetMidis: [66],
    targetPitchClasses: [6],
    explanationVi: "F#4 (MIDI số 66) là phím đen đầu tiên trong cụm 3 phím đen.",
    hintVi: "Phím đen đầu tiên bên trái của cụm 3 phím đen.",
    difficulty: "Cơ bản",
  },

  // 2. Intervals
  {
    id: "interval-p5",
    category: "interval",
    categoryLabelVi: "Luyện Tập Quãng",
    titleVi: "Quãng 5 đúng (Perfect Fifth)",
    promptVi: "Chơi quãng 5 đúng bắt đầu từ C4 (C4 + G4)",
    instructionVi: "Nhấn cùng lúc hoặc lần lượt hai nốt C4 và G4.",
    targetMidis: [60, 67],
    targetPitchClasses: [0, 7],
    explanationVi: "Quãng 5 đúng cách nhau 7 nửa cung (3.5 nguyên cung), mang lại âm hưởng hòa quyện, vững chắc và trong trẻo tuyệt đối.",
    hintVi: "Bấm phím C4 và phím G4 (cách C 7 nửa cung).",
    difficulty: "Cơ bản",
  },
  {
    id: "interval-m3-major",
    category: "interval",
    categoryLabelVi: "Luyện Tập Quãng",
    titleVi: "Quãng 3 trưởng (Major Third)",
    promptVi: "Chơi quãng 3 trưởng bắt đầu từ C4 (C4 + E4)",
    instructionVi: "Nhấn hai nốt C4 và E4 trên phím đàn.",
    targetMidis: [60, 64],
    targetPitchClasses: [0, 4],
    explanationVi: "Quãng 3 trưởng cách nhau 4 nửa cung (2 nguyên cung), là yếu tố cốt lõi quyết định sắc thái tươi sáng của hợp âm trưởng.",
    hintVi: "Bấm nốt C4 và nốt E4.",
    difficulty: "Cơ bản",
  },
  {
    id: "interval-m3-minor",
    category: "interval",
    categoryLabelVi: "Luyện Tập Quãng",
    titleVi: "Quãng 3 thứ (Minor Third)",
    promptVi: "Chơi quãng 3 thứ bắt đầu từ A3 (A3 + C4)",
    instructionVi: "Nhấn hai nốt A3 và C4 trên phím đàn.",
    targetMidis: [57, 60],
    targetPitchClasses: [9, 0],
    explanationVi: "Quãng 3 thứ cách nhau 3 nửa cung, tạo nên sắc thái da diết, trầm buồn đặc trưng của điệu thứ.",
    hintVi: "Bấm nốt La (A3) và nốt Đô (C4).",
    difficulty: "Cơ bản",
  },

  // 3. Triad Chords
  {
    id: "chord-c-major",
    category: "triad",
    categoryLabelVi: "Hợp Âm Ba (Triad)",
    titleVi: "Hợp âm C trưởng (C Major)",
    promptVi: "Chơi hợp âm C trưởng (C)",
    instructionVi: "Bấm giữ đồng thời 3 nốt: C - E - G.",
    targetMidis: [60, 64, 67],
    targetPitchClasses: [0, 4, 7],
    chordSymbol: "C",
    explanationVi: "Hợp âm C trưởng gồm: Nốt gốc (C) + Quãng ba trưởng (E) + Quãng năm đúng (G).",
    hintVi: "Bấm 3 phím trắng C4, E4 và G4.",
    difficulty: "Cơ bản",
  },
  {
    id: "chord-a-minor",
    category: "triad",
    categoryLabelVi: "Hợp Âm Ba (Triad)",
    titleVi: "Hợp âm A thứ (A Minor)",
    promptVi: "Chơi hợp âm A thứ (Am)",
    instructionVi: "Bấm giữ đồng thời 3 nốt: A - C - E.",
    targetMidis: [57, 60, 64],
    targetPitchClasses: [9, 0, 4],
    chordSymbol: "Am",
    explanationVi: "Hợp âm A thứ gồm: Nốt gốc (A) + Quãng ba thứ (C) + Quãng năm đúng (E).",
    hintVi: "Bấm 3 phím trắng A3, C4 và E4.",
    difficulty: "Cơ bản",
  },
  {
    id: "chord-f-major",
    category: "triad",
    categoryLabelVi: "Hợp Âm Ba (Triad)",
    titleVi: "Hợp âm F trưởng (F Major)",
    promptVi: "Chơi hợp âm F trưởng (F)",
    instructionVi: "Bấm giữ đồng thời 3 nốt: F - A - C.",
    targetMidis: [53, 57, 60],
    targetPitchClasses: [5, 9, 0],
    chordSymbol: "F",
    explanationVi: "Hợp âm F trưởng (Hạ át âm bậc IV) gồm F, A và C.",
    hintVi: "Bấm 3 phím trắng F3, A3 và C4.",
    difficulty: "Cơ bản",
  },
  {
    id: "chord-g-major",
    category: "triad",
    categoryLabelVi: "Hợp Âm Ba (Triad)",
    titleVi: "Hợp âm G trưởng (G Major)",
    promptVi: "Chơi hợp âm G trưởng (G)",
    instructionVi: "Bấm giữ đồng thời 3 nốt: G - B - D.",
    targetMidis: [55, 59, 62],
    targetPitchClasses: [7, 11, 2],
    chordSymbol: "G",
    explanationVi: "Hợp âm G trưởng (Át âm bậc V) tạo sức căng hướng về chủ âm C.",
    hintVi: "Bấm 3 phím trắng G3, B3 và D4.",
    difficulty: "Cơ bản",
  },

  // 4. Seventh Chords
  {
    id: "chord-c-maj7",
    category: "seventh",
    categoryLabelVi: "Hợp Âm Bảy (7th Chords)",
    titleVi: "Hợp âm C trưởng bảy (Cmaj7)",
    promptVi: "Chơi hợp âm Cmaj7 (C trưởng bảy)",
    instructionVi: "Bấm giữ đồng thời 4 nốt: C - E - G - B.",
    targetMidis: [60, 64, 67, 71],
    targetPitchClasses: [0, 4, 7, 11],
    chordSymbol: "Cmaj7",
    explanationVi: "Cmaj7 gồm C + E + G + B. Nốt B (quãng 7 trưởng) tạo nên cảm giác lơ lửng, ngọt ngào và sang trọng của nhạc Jazz/Pop hiện đại.",
    hintVi: "Bấm 4 phím trắng liên tiếp theo quãng ba: C, E, G, B.",
    difficulty: "Trung cấp",
  },
  {
    id: "chord-d-min7",
    category: "seventh",
    categoryLabelVi: "Hợp Âm Bảy (7th Chords)",
    titleVi: "Hợp âm D thứ bảy (Dm7)",
    promptVi: "Chơi hợp âm Dm7 (D thứ bảy)",
    instructionVi: "Bấm giữ đồng thời 4 nốt: D - F - A - C.",
    targetMidis: [62, 65, 69, 72],
    targetPitchClasses: [2, 5, 9, 0],
    chordSymbol: "Dm7",
    explanationVi: "Dm7 gồm D + F + A + C. Đây là hợp âm bậc ii7 chủ lực trong tiến trình kinh điển ii - V - I.",
    hintVi: "Bấm 4 phím trắng D, F, A, C.",
    difficulty: "Trung cấp",
  },
  {
    id: "chord-g-dom7",
    category: "seventh",
    categoryLabelVi: "Hợp Âm Bảy (7th Chords)",
    titleVi: "Hợp âm G át bảy (G7 Dominant)",
    promptVi: "Chơi hợp âm G7 (G át bảy)",
    instructionVi: "Bấm giữ đồng thời 4 nốt: G - B - D - F.",
    targetMidis: [55, 59, 62, 65],
    targetPitchClasses: [7, 11, 2, 5],
    chordSymbol: "G7",
    explanationVi: "G7 chứa quãng Tritone căng thẳng giữa B và F, luôn khao khát được giải quyết về nốt C và E của hợp âm C trưởng.",
    hintVi: "Bấm 4 phím trắng G, B, D, F.",
    difficulty: "Trung cấp",
  },

  // 5. Inversions
  {
    id: "inv-c-first",
    category: "inversion",
    categoryLabelVi: "Đảo Hợp Âm (Inversions)",
    titleVi: "C trưởng Đảo thứ nhất (C/E)",
    promptVi: "Chơi hợp âm C trưởng ở thế đảo thứ nhất (E - G - C)",
    instructionVi: "Đặt nốt E ở bè trầm (Bass), theo sau bởi G và C.",
    targetMidis: [64, 67, 72],
    targetPitchClasses: [4, 7, 0],
    chordSymbol: "C/E",
    explanationVi: "Thế đảo 1 (First Inversion) đưa nốt quãng ba (E) xuống làm nốt trầm nhất, tạo bước chuyển bassline liền bậc mượt mà.",
    hintVi: "Bấm các nốt E4, G4, C5.",
    difficulty: "Nâng cao",
  },
];

export const MidiPracticeLab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState<string>("");

  const {
    isSupported,
    isConnected,
    devices,
    activeMidiNotes,
    detectedChord,
    lastVelocity,
    initializeMidi,
    refreshDevices,
  } = useMidi({ enableAudioSynth: true });

  const filteredExercises = useMemo(() => {
    if (selectedCategory === "all") return MIDI_PRACTICE_EXERCISES;
    return MIDI_PRACTICE_EXERCISES.filter((ex) => ex.category === selectedCategory);
  }, [selectedCategory]);

  const currentExercise = filteredExercises[currentIndex] || MIDI_PRACTICE_EXERCISES[0];

  // Evaluate user input against the current exercise
  useEffect(() => {
    if (activeMidiNotes.length === 0) {
      setFeedbackMsg("Hãy bấm các phím trên đàn MIDI hoặc bàn phím ảo bên dưới...");
      return;
    }

    const uniquePCs: number[] = Array.from(
      new Set<number>(activeMidiNotes.map((m) => ((m % 12) + 12) % 12))
    );
    const playedPitchClasses: number[] = uniquePCs.sort((a, b) => a - b);

    const targetPCs = [...currentExercise.targetPitchClasses].sort((a, b) => a - b);

    // Check exact match in pitch classes
    const isExactMatch =
      playedPitchClasses.length === targetPCs.length &&
      playedPitchClasses.every((val, idx) => val === targetPCs[idx]);

    if (isExactMatch) {
      setIsSuccess(true);
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
      setFeedbackMsg(`✓ Chính xác tuyệt vời! Bạn đã chơi đúng ${currentExercise.titleVi}!`);
      return;
    }

    // Pedagogical Diagnostic Feedback
    const missingPCs = targetPCs.filter((pc) => !playedPitchClasses.includes(pc));
    const extraPCs = playedPitchClasses.filter((pc) => !targetPCs.includes(pc));

    const playedNames = playedPitchClasses.map((pc) => NOTE_NAMES_SHARP[pc]).join(", ");
    const missingNames = missingPCs.map((pc) => NOTE_NAMES_SHARP[pc]).join(", ");
    const extraNames = extraPCs.map((pc) => NOTE_NAMES_SHARP[pc]).join(", ");

    if (missingPCs.length > 0 && extraPCs.length === 0) {
      setFeedbackMsg(
        `Bạn đã chơi các nốt [${playedNames}]. Hãy bấm thêm nốt [${missingNames}] để hoàn thành.`
      );
    } else if (missingPCs.length === 0 && extraPCs.length > 0) {
      setFeedbackMsg(
        `Bạn đang bấm thêm nốt thừa [${extraNames}]. Hãy chỉ giữ các nốt mục tiêu.`
      );
    } else {
      setFeedbackMsg(
        `Bạn đang chơi [${playedNames}]. Mục tiêu cần các nốt: [${targetPCs
          .map((p) => NOTE_NAMES_SHARP[p])
          .join(", ")}].`
      );
    }
  }, [activeMidiNotes, currentExercise]);

  const handleNextExercise = () => {
    setIsSuccess(false);
    setShowHint(false);
    setFeedbackMsg("");
    if (currentIndex < filteredExercises.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleVirtualKeyPress = (midi: number) => {
    // Allows users without a physical MIDI keyboard to click virtual keys
    // Will be reflected in activeMidiNotes via synthesized event
  };

  return (
    <div className="bg-[#12121a] border border-[#2d2545] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#252538] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-purple-500/20 text-[#a88beb] border border-purple-500/30">
              Phòng Luyện Phím Tương Tác
            </span>
            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              {isConnected
                ? `MIDI Đã Kết Nối (${devices[0]?.name || "Thiết bị"})`
                : "Chế độ Bàn Phím Ảo (Sẵn sàng)"}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            🎹 Luyện Tập Với Bàn Phím MIDI
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            Rèn luyện phản xạ ngón tay và khả năng định vị nốt, quãng và hợp âm trên phím đàn thật với phản hồi tức thì bằng tiếng Việt.
          </p>
        </div>

        {/* Score and Streak Dashboard */}
        <div className="flex items-center gap-3">
          <div className="bg-[#1a1a28] border border-[#34344d] px-4 py-2.5 rounded-2xl flex items-center gap-2 text-center">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Điểm số</span>
              <span className="text-base font-extrabold text-white font-mono">{score}</span>
            </div>
          </div>

          <div className="bg-[#1a1a28] border border-[#34344d] px-4 py-2.5 rounded-2xl flex items-center gap-2 text-center">
            <Flame className="w-5 h-5 text-orange-400" />
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Chuỗi đúng</span>
              <span className="text-base font-extrabold text-orange-300 font-mono">{streak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "Tất Cả Thử Thách" },
          { id: "note", label: "Nốt Nhạc Đơn" },
          { id: "interval", label: "Quãng Âm Nhạc" },
          { id: "triad", label: "Hợp Âm Ba (Triad)" },
          { id: "seventh", label: "Hợp Âm Bảy (7th)" },
          { id: "inversion", label: "Đảo Hợp Âm" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setCurrentIndex(0);
              setIsSuccess(false);
              setShowHint(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedCategory === cat.id
                ? "bg-[#7c5cbf] text-white shadow-md shadow-purple-500/20"
                : "bg-[#1a1a28] text-gray-400 hover:text-white border border-[#2d2d42]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Current Exercise Challenge Card */}
      <div className="bg-gradient-to-br from-[#181829] to-[#12121d] border border-[#32284d] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252538] pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-500/20 text-[#a88beb] border border-purple-500/30 rounded-lg text-xs font-extrabold uppercase">
              {currentExercise.categoryLabelVi}
            </span>
            <span className="text-xs text-gray-400 font-semibold">
              Bài {currentIndex + 1} / {filteredExercises.length}
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded font-bold border border-indigo-800">
              Độ khó: {currentExercise.difficulty}
            </span>
          </div>

          <button
            onClick={() => setShowHint((h) => !h)}
            className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <Lightbulb className="w-4 h-4" />
            {showHint ? "Ẩn gợi ý" : "Xem gợi ý nốt"}
          </button>
        </div>

        {/* Main Prompt */}
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            {currentExercise.promptVi}
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            {currentExercise.instructionVi}
          </p>
        </div>

        {/* Hint Box if toggled */}
        {showHint && (
          <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-2xl text-xs text-amber-200 space-y-1 animate-fadeIn">
            <div className="font-bold flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Gợi Ý Nhạc Lý:
            </div>
            <p>{currentExercise.hintVi}</p>
            <p className="text-amber-300 font-mono font-bold mt-1">
              Các nốt cần bấm: {currentExercise.targetPitchClasses.map((pc) => NOTE_NAMES_SHARP[pc]).join(" - ")}
            </p>
          </div>
        )}

        {/* Visual Piano Keyboard synchronized with MIDI input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <span>Bàn phím phản hồi thời gian thực:</span>
            <span className="font-mono text-purple-300">
              {activeMidiNotes.length > 0
                ? `Đang giữ: [${activeMidiNotes.map((m) => midiToNoteName(m)).join(", ")}]`
                : "Chờ tín hiệu bấm phím..."}
            </span>
          </div>

          <div className="bg-[#0c0c14] border border-[#29293d] p-4 rounded-2xl shadow-inner">
            <PianoVisualizer
              highlightNotes={activeMidiNotes.map((m) => midiToNoteName(m))}
              keyName="C"
              startMidi={48}
              endMidi={72}
              showLabels={true}
              interactive={true}
              onKeyClick={handleVirtualKeyPress}
            />
          </div>
        </div>

        {/* Real-time Pedagogical Feedback Bar */}
        <div
          className={`p-4 rounded-2xl border transition-all duration-200 ${
            isSuccess
              ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-200"
              : activeMidiNotes.length > 0
              ? "bg-purple-950/40 border-purple-500/40 text-purple-200"
              : "bg-[#10101a] border-[#252538] text-gray-400"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 text-xs sm:text-sm font-medium">
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Piano className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-white mb-0.5">{feedbackMsg}</p>
                {isSuccess && (
                  <p className="text-xs text-emerald-300/90 leading-relaxed mt-1">
                    {currentExercise.explanationVi}
                  </p>
                )}
              </div>
            </div>

            {isSuccess && (
              <button
                type="button"
                onClick={handleNextExercise}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-950/40 shrink-0"
              >
                Bài tiếp theo <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
