import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Music,
  Compass,
  ArrowLeftRight,
  Award,
  CheckCircle2,
  Play,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Piano,
} from "lucide-react";
import { LESSONS } from "../../data/learningCurriculum";
import { LessonData, UserLearningProgress } from "../../types/learning";
import { LearningLesson } from "./LearningLesson";
import { ChordExplorer } from "./ChordExplorer";
import { ScaleExplorer } from "./ScaleExplorer";
import { ProgressionPlayground } from "./ProgressionPlayground";
import { HearTheDifferenceLab } from "./HearTheDifferenceLab";
import { EarTrainingHub } from "./EarTrainingHub";
import { MidiPracticeLab } from "./MidiPracticeLab";

const STORAGE_KEY = "harmonicx_learning_progress_v1";

const DEFAULT_PROGRESS: UserLearningProgress = {
  completedLessons: [],
  conceptsMastered: [],
  earTraining: {
    totalAttempted: 0,
    totalCorrect: 0,
    byCategory: {},
    streak: 0,
  },
  lastLessonId: null,
  lastActiveTimestamp: Date.now(),
};

type LearningSubTab =
  | "curriculum"
  | "chord_explorer"
  | "scale_explorer"
  | "playground"
  | "comparisons"
  | "ear_training"
  | "midi_practice";

export const LearningMode: React.FC = () => {
  const [subTab, setSubTab] = useState<LearningSubTab>("curriculum");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  const [progress, setProgress] = useState<UserLearningProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_PROGRESS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (_) {}
  }, [progress]);

  const activeLesson = React.useMemo(() => {
    return LESSONS.find((l) => l.id === activeLessonId) || null;
  }, [activeLessonId]);

  const activeLessonIndex = React.useMemo(() => {
    return LESSONS.findIndex((l) => l.id === activeLessonId);
  }, [activeLessonId]);

  const handleCompleteLesson = (lessonId: string) => {
    setProgress((prev) => {
      const completed = prev.completedLessons.includes(lessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId];

      const lesson = LESSONS.find((l) => l.id === lessonId);
      const newConcepts = lesson
        ? Array.from(new Set([...prev.conceptsMastered, ...lesson.conceptTags]))
        : prev.conceptsMastered;

      return {
        ...prev,
        completedLessons: completed,
        conceptsMastered: newConcepts,
        lastLessonId: lessonId,
        lastActiveTimestamp: Date.now(),
      };
    });
  };

  const handleResetProgress = () => {
    if (window.confirm("Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ học nhạc không?")) {
      setProgress(DEFAULT_PROGRESS);
    }
  };

  const completedCount = progress.completedLessons.length;
  const progressPct = Math.round((completedCount / LESSONS.length) * 100);

  // If a specific lesson is actively open
  if (activeLesson) {
    const hasNext = activeLessonIndex >= 0 && activeLessonIndex < LESSONS.length - 1;
    const nextLesson = hasNext ? LESSONS[activeLessonIndex + 1] : null;

    return (
      <div className="min-h-screen bg-[#0a0a0f] text-slate-100 p-4 sm:p-6">
        <LearningLesson
          lesson={activeLesson}
          isCompleted={progress.completedLessons.includes(activeLesson.id)}
          onBackToCurriculum={() => setActiveLessonId(null)}
          onCompleteLesson={handleCompleteLesson}
          hasNextLesson={hasNext}
          onNextLesson={() => {
            if (nextLesson) setActiveLessonId(nextLesson.id);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 p-4 sm:p-6 space-y-6 pb-20 animate-fadeIn">
      {/* Learning Mode Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#18122B] via-[#12121C] to-[#0D0D14] border border-[#2d2545] rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase bg-purple-500/20 text-[#a88beb] border border-purple-500/30">
                Học Viện Âm Nhạc HarmonicX
              </span>
              <span className="text-xs text-gray-400 font-medium">
                Triết lý: NGHE → NHÌN → HIỂU → THỬ → TẠO
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Trung Tâm Học Nhạc Tương Tác
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed">
              Thấu hiểu bản chất âm nhạc thông qua lắng nghe trực tiếp, chạm phím đàn ảo và tự do thử nghiệm — không cần học vẹt lý thuyết khô khan hay phụ thuộc vào AI.
            </p>
          </div>

          {/* Progress Overview Card */}
          <div className="bg-[#181824]/90 border border-[#3b2d59] p-5 rounded-2xl min-w-[240px] space-y-3 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-300">
                Tiến Độ Nền Tảng
              </span>
              <span className="text-xs font-mono font-bold text-[#a88beb]">
                {completedCount} / {LESSONS.length} Bài học
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#252535] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
              <span>Đã làm chủ {progress.conceptsMastered.length} khái niệm</span>
              <button
                type="button"
                onClick={handleResetProgress}
                className="text-gray-500 hover:text-gray-300 transition"
                title="Đặt lại tiến độ"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-[#12121a] p-1.5 rounded-2xl border border-[#252535]">
        {[
          { id: "curriculum", label: "Lộ Trình 12 Bài Học", icon: <BookOpen className="w-4 h-4" /> },
          { id: "chord_explorer", label: "Khám Phá Hợp Âm", icon: <Layers className="w-4 h-4" /> },
          { id: "scale_explorer", label: "Khám Phá Gam / Âm Giai", icon: <Music className="w-4 h-4" /> },
          { id: "playground", label: "Sân Chơi Tiến Trình", icon: <Compass className="w-4 h-4" /> },
          { id: "comparisons", label: "Phòng So Sánh Âm Thanh", icon: <ArrowLeftRight className="w-4 h-4" /> },
          { id: "ear_training", label: "Trung Tâm Luyện Tai", icon: <Award className="w-4 h-4" /> },
          { id: "midi_practice", label: "Luyện Tập Với MIDI", icon: <Piano className="w-4 h-4" /> },
        ].map((tab) => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id as LearningSubTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-150 ${
                isActive
                  ? "bg-[#7c5cbf] text-white shadow-lg shadow-[#7c5cbf]/20 ring-2 ring-purple-400"
                  : "bg-transparent text-gray-400 hover:text-gray-200 hover:bg-[#181824]"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW: CURRICULUM (12 Lessons) */}
      {subTab === "curriculum" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-white">
                Khóa Nền Tảng Âm Nhạc (12 Bài Học Tương Tác)
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Hoàn thành từng bài học để xây dựng trực giác âm nhạc vững chắc về hòa âm, giai điệu và tiết tấu.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LESSONS.map((lesson) => {
              const isCompleted = progress.completedLessons.includes(lesson.id);

              return (
                <div
                  key={lesson.id}
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`group relative bg-[#141420] border rounded-2xl p-5 flex flex-col justify-between gap-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-xl ${
                    isCompleted
                      ? "border-emerald-700/50 bg-[#121920]/80 shadow-emerald-950/20"
                      : "border-[#252535] hover:border-[#7c5cbf]"
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Lesson Number & Duration */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-purple-500/20 text-[#a88beb] border border-purple-500/30">
                        Bài {lesson.number}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {lesson.estimatedMinutes} phút
                        </span>

                        {isCompleted && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lesson Title */}
                    <div>
                      <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium">{lesson.subtitle}</p>
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-gray-300/80 line-clamp-2 leading-relaxed">
                      {lesson.summary}
                    </p>
                  </div>

                  {/* Bottom: Concept tags & Action Button */}
                  <div className="pt-3 border-t border-[#252535]/80 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {lesson.conceptTags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#1e1e2d] text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition ${
                        isCompleted
                          ? "bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-700/60"
                          : "bg-[#7c5cbf] text-white hover:bg-[#8e6fd1] shadow-md shadow-purple-900/20"
                      }`}
                    >
                      <span>{isCompleted ? "Xem lại" : "Bắt đầu"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: CHORD EXPLORER */}
      {subTab === "chord_explorer" && <ChordExplorer />}

      {/* VIEW: SCALE EXPLORER */}
      {subTab === "scale_explorer" && <ScaleExplorer />}

      {/* VIEW: PROGRESSION PLAYGROUND */}
      {subTab === "playground" && <ProgressionPlayground />}

      {/* VIEW: HEAR THE DIFFERENCE LAB */}
      {subTab === "comparisons" && <HearTheDifferenceLab />}

      {/* VIEW: EAR TRAINING HUB */}
      {subTab === "ear_training" && <EarTrainingHub />}

      {/* VIEW: MIDI PRACTICE LAB */}
      {subTab === "midi_practice" && <MidiPracticeLab />}
    </div>
  );
};
