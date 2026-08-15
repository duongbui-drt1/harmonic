import React, { useState } from "react";
import { BookOpen, Lightbulb, ChevronDown, ChevronUp, GraduationCap, CheckCircle2 } from "lucide-react";

interface TheoryExplanationProps {
  beginnerExplanation: string;
  bulletPoints: string[];
  whyItWorks: string;
  theoryDetails?: string;
  className?: string;
}

export const TheoryExplanation: React.FC<TheoryExplanationProps> = ({
  beginnerExplanation,
  bulletPoints,
  whyItWorks,
  theoryDetails,
  className = "",
}) => {
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Beginner Explanation Card */}
      <div className="bg-[#181824] border border-[#2d2d3d] rounded-2xl p-5 space-y-3.5 shadow-md">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#a88beb]" />
          <h3 className="text-xs font-bold text-[#a88beb] uppercase tracking-widest">
            Bản Chất Cốt Lõi
          </h3>
        </div>

        <p className="text-sm text-gray-200 leading-relaxed font-normal">
          {beginnerExplanation}
        </p>

        {/* Bullet points */}
        {bulletPoints.length > 0 && (
          <ul className="space-y-2 pt-1 border-t border-[#2d2d3d]/60">
            {bulletPoints.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{pt}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* "Why does this work?" Card */}
      <div className="bg-gradient-to-r from-[#191e33] to-[#1a172e] border border-[#3b3a59] rounded-2xl p-5 space-y-2 shadow-md">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            Vì Sao Lại Như Vậy? (Nguyên Lý Khoa Học)
          </h4>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          {whyItWorks}
        </p>
      </div>

      {/* Progressive Disclosure: "Show Theory Details" */}
      {theoryDetails && (
        <div className="bg-[#13131c] border border-[#252535] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setIsTheoryOpen(!isTheoryOpen)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#1c1c2b] transition"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300">
                {isTheoryOpen ? "Thu gọn chi tiết lý thuyết chuyên sâu" : "Xem chi tiết lý thuyết nâng cao (Ký hiệu La Mã & Tần số)"}
              </span>
            </div>
            {isTheoryOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {isTheoryOpen && (
            <div className="px-4 pb-4 pt-1 text-xs text-indigo-200 bg-indigo-950/20 border-t border-[#252535] leading-relaxed font-mono">
              {theoryDetails}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
