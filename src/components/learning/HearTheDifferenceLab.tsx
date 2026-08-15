import React, { useState } from "react";
import { ArrowLeftRight, Sparkles, Volume2, Check } from "lucide-react";
import { CompareAudio } from "./CompareAudio";
import { ComparisonItem } from "../../types/learning";
import { LESSONS } from "../../data/learningCurriculum";

export const HearTheDifferenceLab: React.FC = () => {
  // Extract all comparisons from curriculum
  const comparisons: ComparisonItem[] = React.useMemo(() => {
    return LESSONS.filter((l) => l.comparison !== undefined).map(
      (l) => l.comparison as ComparisonItem
    );
  }, []);

  const [selectedId, setSelectedId] = useState<string>(
    comparisons[0]?.id || "comp-maj-min"
  );

  const activeComparison =
    comparisons.find((c) => c.id === selectedId) || comparisons[0];

  return (
    <div className="bg-[#101018] border border-[#252535] rounded-2xl p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="border-b border-[#252535] pb-4">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-extrabold text-white">
            Phòng Thí Nghiệm "Lắng Nghe & Phân Biệt Đối Trọng"
          </h2>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Rèn luyện đôi tai bằng cách so sánh đối chiếu trực tiếp các thái cực âm nhạc với độ trễ bằng 0.
        </p>
      </div>

      {/* Comparison Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {comparisons.map((c) => {
          const isSelected = c.id === selectedId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              className={`p-3 rounded-xl border text-left transition-all duration-150 ${
                isSelected
                  ? "bg-[#201a38] border-[#7c5cbf] ring-2 ring-[#7c5cbf]/60 shadow-lg"
                  : "bg-[#181824] border-[#2d2d3d] hover:bg-[#222232]"
              }`}
            >
              <div className="text-xs font-extrabold text-white truncate">{c.title}</div>
              <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{c.description}</p>
            </button>
          );
        })}
      </div>

      {/* Active Comparison Viewer */}
      {activeComparison && (
        <div className="pt-2">
          <CompareAudio comparison={activeComparison} />
        </div>
      )}
    </div>
  );
};
