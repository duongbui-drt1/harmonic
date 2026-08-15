import React, { useState } from "react";
import {
  Volume2,
  Eye,
  BookOpen,
  Zap,
  Award,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Layers,
} from "lucide-react";
import { LessonData, LessonStep } from "../../types/learning";
import { AudioExample } from "./AudioExample";
import { PianoVisualizer } from "./PianoVisualizer";
import { TheoryExplanation } from "./TheoryExplanation";
import { ExperimentLab } from "./ExperimentLab";
import { CompareAudio } from "./CompareAudio";
import { EarTrainingDrill } from "./EarTrainingDrill";
import { useLearningAudio } from "../../hooks/useLearningAudio";

interface LearningLessonProps {
  lesson: LessonData;
  onBackToCurriculum: () => void;
  onCompleteLesson: (lessonId: string) => void;
  isCompleted?: boolean;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
}

export const LearningLesson: React.FC<LearningLessonProps> = ({
  lesson,
  onBackToCurriculum,
  onCompleteLesson,
  isCompleted = false,
  onNextLesson,
  hasNextLesson = false,
}) => {
  const [activeStep, setActiveStep] = useState<LessonStep>("listen");
  const [activePlayingMidi, setActivePlayingMidi] = useState<number | null>(null);

  const { playNote } = useLearningAudio("piano");

  const steps: Array<{ id: LessonStep; label: string; icon: React.ReactNode }> = [
    { id: "listen", label: "1. Nghe", icon: <Volume2 className="w-4 h-4" /> },
    { id: "visualize", label: "2. Nhìn", icon: <Eye className="w-4 h-4" /> },
    { id: "explain", label: "3. Hiểu", icon: <BookOpen className="w-4 h-4" /> },
    { id: "experiment", label: "4. Thử", icon: <Zap className="w-4 h-4" /> },
    { id: "challenge", label: "5. Thử thách", icon: <Award className="w-4 h-4" /> },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === activeStep);

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setActiveStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setActiveStep(steps[currentStepIndex - 1].id);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Lesson Header / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#13131c] border border-[#252535] p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToCurriculum}
            className="p-2 bg-[#1f1f2e] hover:bg-[#2c2c40] text-gray-300 hover:text-white rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tất cả bài học</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-500/20 text-[#a88beb] border border-purple-500/30">
                Bài {lesson.number}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {lesson.level} • {lesson.estimatedMinutes} phút
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
              {lesson.title}: {lesson.subtitle}
            </h1>
          </div>
        </div>

        {isCompleted && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 border border-emerald-600/50 rounded-xl text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Đã hoàn thành</span>
          </div>
        )}
      </div>

      {/* 5-Step HEAR → SEE → UNDERSTAND → EXPERIMENT → CREATE Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-[#101018] p-1.5 rounded-2xl border border-[#252535]">
        {steps.map((step, idx) => {
          const isActive = activeStep === step.id;
          const isPassed = currentStepIndex > idx;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-150 ${
                isActive
                  ? "bg-[#7c5cbf] text-white shadow-lg shadow-[#7c5cbf]/20 ring-2 ring-purple-400"
                  : isPassed
                  ? "bg-[#181824] text-purple-200 hover:bg-[#202030]"
                  : "bg-transparent text-gray-400 hover:text-gray-200 hover:bg-[#181824]"
              }`}
            >
              {step.icon}
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* STEP CONTENT CONTAINER */}
      <div className="space-y-6">
        {/* STEP 1: LISTEN */}
        {activeStep === "listen" && (
          <div className="space-y-4">
            <div className="bg-[#181824] border border-[#2d2d3d] rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-emerald-300">
                  Bước 1 — Lắng Nghe Âm Thanh Trước Tiên
                </h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                {lesson.listenGuidance}
              </p>
            </div>

            <div className="space-y-3">
              {lesson.listenExamples.map((ex) => (
                <AudioExample
                  key={ex.id}
                  example={ex}
                  onActiveMidiChange={setActivePlayingMidi}
                />
              ))}
            </div>

            {/* Optional A/B comparison on Step 1 */}
            {lesson.comparison && (
              <CompareAudio comparison={lesson.comparison} />
            )}
          </div>
        )}

        {/* STEP 2: VISUALIZE */}
        {activeStep === "visualize" && (
          <div className="space-y-4">
            <div className="bg-[#181824] border border-[#2d2d3d] rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {lesson.visualizeTitle}
                  </h3>
                  <p className="text-xs text-gray-400">{lesson.visualizeCaption}</p>
                </div>
              </div>
            </div>

            <PianoVisualizer
              highlightedMidis={lesson.highlightedMidis}
              noteItems={lesson.visualizeNotes}
              activePlayingMidi={activePlayingMidi}
              minMidi={lesson.keyboardRange?.minMidi || 48}
              maxMidi={lesson.keyboardRange?.maxMidi || 72}
              onKeyClick={(m) => playNote(m, 0.8)}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {lesson.visualizeNotes.map((note) => (
                <div
                  key={note.name}
                  className="bg-[#181824] border border-[#2d2d3d] p-2.5 rounded-xl flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-white font-mono">{note.name}</span>
                  {note.label && (
                    <span className="text-[10px] font-bold text-amber-300 px-1.5 py-0.5 rounded bg-black/40">
                      {note.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: EXPLAIN */}
        {activeStep === "explain" && (
          <TheoryExplanation
            beginnerExplanation={lesson.beginnerExplanation}
            bulletPoints={lesson.bulletPoints}
            whyItWorks={lesson.whyItWorks}
            theoryDetails={lesson.theoryDetails}
          />
        )}

        {/* STEP 4: EXPERIMENT */}
        {activeStep === "experiment" && (
          <div className="space-y-4">
            <ExperimentLab lesson={lesson} />
          </div>
        )}

        {/* STEP 5: CHALLENGE */}
        {activeStep === "challenge" && (
          <div className="space-y-4">
            <EarTrainingDrill
              challenge={lesson.challenge}
              onSuccess={() => onCompleteLesson(lesson.id)}
            />
          </div>
        )}
      </div>

      {/* Bottom Step Navigation Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-[#252535]">
        <button
          type="button"
          disabled={currentStepIndex === 0}
          onClick={handlePrevStep}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            currentStepIndex === 0
              ? "opacity-30 cursor-not-allowed bg-transparent text-gray-500"
              : "bg-[#1f1f2e] hover:bg-[#2c2c40] text-gray-300 hover:text-white"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Bước trước ({currentStepIndex > 0 ? steps[currentStepIndex - 1].label : ""})</span>
        </button>

        {currentStepIndex < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="px-5 py-2.5 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-purple-900/30"
          >
            <span>Bước tiếp theo ({steps[currentStepIndex + 1].label})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCompleteLesson(lesson.id)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Hoàn thành bài học</span>
            </button>
            {hasNextLesson && onNextLesson && (
              <button
                type="button"
                onClick={onNextLesson}
                className="px-4 py-2.5 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <span>Bài tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
