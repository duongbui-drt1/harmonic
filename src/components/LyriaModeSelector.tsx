import React from "react";
import { LyriaPreviewMode } from "../music/lyria/lyriaTypes";
import { Sparkles, Music, Wand2, BookOpen } from "lucide-react";

interface LyriaModeSelectorProps {
  selectedMode: LyriaPreviewMode;
  onSelectMode: (mode: LyriaPreviewMode) => void;
}

export const LyriaModeSelector: React.FC<LyriaModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
}) => {
  const modes: Array<{
    id: LyriaPreviewMode;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    description: string;
  }> = [
    {
      id: "pure_harmony",
      title: "Mode A — Pure Harmony",
      subtitle: "Nghe Rõ Cấu Trúc Hợp Âm",
      icon: Music,
      description: "Phối khí tối giản (Piano / Electric Piano, Bass nhẹ). Không có giai điệu rườm rà, giúp người mới bắt đầu cảm nhận chính xác màu sắc hòa âm.",
    },
    {
      id: "styled_preview",
      title: "Mode B — Styled Preview",
      subtitle: "Xem Trước Theo Dòng Nhạc",
      icon: Sparkles,
      description: "Áp dụng phong cách nhạc yêu thích (J-Pop, City Pop, Neo Soul, Jazz, Lo-Fi, Cinematic...) kết hợp dữ liệu Genre DNA của HarmonicX.",
    },
    {
      id: "reharmonization",
      title: "Mode C — Reharmonization",
      subtitle: "So Sánh Hòa Âm Biến Thể",
      icon: Wand2,
      description: "Nghe và so sánh trực tiếp vòng hợp âm Nguyên bản (Original) đối chiếu với vòng hợp âm Biến thể (Reharmonized A/B).",
    },
    {
      id: "chord_understanding",
      title: "Mode D — Chord Understanding",
      subtitle: "Thấu Hiểu Từng Hợp Âm",
      icon: BookOpen,
      description: "Chọn 1 hợp âm đơn lẻ để nghe riêng màu sắc, nghe cách nó giải kết về Chủ âm, hoặc nghe màu sắc đó đặt trong các dòng nhạc.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {modes.map((m) => {
        const Icon = m.icon;
        const isSelected = selectedMode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelectMode(m.id)}
            className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
              isSelected
                ? "bg-[#221e38] border-[#7c5cbf] shadow-lg shadow-[#7c5cbf]/20 ring-1 ring-[#7c5cbf]"
                : "bg-[#181824] border-[#2d2d3d] hover:bg-[#202030] hover:border-[#3d3d52]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? "bg-[#7c5cbf] text-white shadow-md"
                      : "bg-[#252533] text-gray-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#7c5cbf] text-white font-bold rounded">
                    Đang chọn
                  </span>
                )}
              </div>

              <h4 className={`text-xs font-black tracking-tight ${isSelected ? "text-white" : "text-gray-200"}`}>
                {m.title}
              </h4>
              <span className="text-[10px] font-bold text-[#a88beb] block mb-1.5">
                {m.subtitle}
              </span>

              <p className="text-[11px] text-gray-400 leading-snug">
                {m.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
