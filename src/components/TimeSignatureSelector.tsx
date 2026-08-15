import React, { useState, useRef, useEffect } from "react";
import { TimeSignature, RhythmRegistry, MeterCategory } from "../music/rhythm";
import { TimeSignatureString } from "../types";
import { ChevronDown, Sliders, Music, Check, Sparkles } from "lucide-react";

interface TimeSignatureSelectorProps {
  timeSignature: TimeSignatureString;
  timeSignatureGrouping?: number[];
  onChangeTimeSignature: (ts: TimeSignatureString, grouping?: number[]) => void;
}

export const TimeSignatureSelector: React.FC<TimeSignatureSelectorProps> = ({
  timeSignature,
  timeSignatureGrouping,
  onChangeTimeSignature,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MeterCategory>("basic");
  const popoverRef = useRef<HTMLDivElement>(null);

  const currentModel = RhythmRegistry.getTimeSignature(timeSignature, timeSignatureGrouping);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const basicMeters = RhythmRegistry.getByCategory("basic");
  const extendedMeters = RhythmRegistry.getByCategory("extended");
  const advancedMeters = RhythmRegistry.getByCategory("advanced");

  const handleSelectMeter = (ts: TimeSignature, grouping?: number[]) => {
    onChangeTimeSignature(ts.name, grouping || ts.grouping);
    if (!ts.availableGroupings || ts.availableGroupings.length <= 1) {
      setIsOpen(false);
    }
  };

  const handleSelectGrouping = (grouping: number[]) => {
    onChangeTimeSignature(currentModel.name, grouping);
    setIsOpen(false);
  };

  const beatUnitSymbol =
    currentModel.beatUnit === "dotted-quarter"
      ? "♩."
      : currentModel.beatUnit === "half"
      ? "𝅗𝅥"
      : currentModel.beatUnit === "eighth"
      ? "♪"
      : "♩";

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f0f13] hover:bg-[#252533] border border-[#2d2d3d] hover:border-[#7c5cbf] rounded-lg transition text-white shadow-sm"
        title="Chọn Số Chỉ Nhịp (Time Signature) & Phân Nhóm Trọng Âm"
      >
        <span className="text-[10px] font-bold text-[#a88beb] uppercase tracking-wider font-mono">
          {beatUnitSymbol}
        </span>
        <span className="text-xs font-mono font-bold">{currentModel.name}</span>

        {(currentModel.isCompound || currentModel.isOdd) && (
          <span className="text-[10px] bg-[#7c5cbf]/30 text-[#cbb6f7] px-1.5 py-0.2 rounded font-mono font-bold border border-[#7c5cbf]/40">
            {currentModel.groupingDisplay}
          </span>
        )}

        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 top-full mt-2 w-80 sm:w-96 bg-[#161622] border border-[#3d3d52] rounded-xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#2d2d3d]">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-[#7c5cbf]/20 text-[#a88beb]">
                <Music className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Số Chỉ Nhịp (Time Signature)
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
              {currentModel.classification}
            </span>
          </div>

          {/* Category Tabs: Basic / Extended / Advanced */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#0f0f13] rounded-lg border border-[#2d2d3d] mb-3">
            {(["basic", "extended", "advanced"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`py-1 text-[11px] font-bold uppercase rounded transition capitalize ${
                  activeCategory === cat
                    ? "bg-[#7c5cbf] text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {cat === "basic" ? "Cơ Bản" : cat === "extended" ? "Mở Rộng" : "Nâng Cao"}
              </button>
            ))}
          </div>

          {/* Meter List Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {(activeCategory === "basic"
              ? basicMeters
              : activeCategory === "extended"
              ? extendedMeters
              : advancedMeters
            ).map((meter) => {
              const isSelected = currentModel.name === meter.name;
              const hasGrouping = meter.isCompound || meter.isOdd;

              return (
                <button
                  key={meter.name}
                  type="button"
                  onClick={() => handleSelectMeter(meter)}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition ${
                    isSelected
                      ? "bg-[#7c5cbf]/20 border-[#7c5cbf] text-white shadow-md shadow-[#7c5cbf]/20"
                      : "bg-[#1f1f2e] hover:bg-[#28283c] border-[#34344a] text-gray-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-base font-mono font-bold">{meter.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#a88beb]" />}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {hasGrouping && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-[#0f0f13] text-[#cbb6f7] rounded font-mono font-bold border border-[#3d3d52]">
                        {meter.groupingDisplay}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {meter.beatUnit === "dotted-quarter"
                        ? "♩. phách"
                        : meter.beatUnit === "half"
                        ? "𝅗𝅥 phách"
                        : meter.beatUnit === "eighth"
                        ? "♪ phách"
                        : "♩ phách"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Grouping Selector for meters with multiple groupings (e.g. 7/8 or 5/4) */}
          {currentModel.availableGroupings && currentModel.availableGroupings.length > 1 && (
            <div className="pt-2.5 border-t border-[#2d2d3d]">
              <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Sliders className="w-3 h-3" /> Tùy Chọn Phân Nhóm Trọng Âm ({currentModel.name}):
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {currentModel.availableGroupings.map((grp) => {
                  const grpStr = grp.join("+");
                  const isCurrentGrp = currentModel.groupingDisplay === grpStr;

                  return (
                    <button
                      key={grpStr}
                      type="button"
                      onClick={() => handleSelectGrouping(grp)}
                      className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border transition ${
                        isCurrentGrp
                          ? "bg-amber-400 text-slate-950 border-amber-300 shadow-sm"
                          : "bg-[#252533] text-gray-300 hover:text-white border-[#3d3d52]"
                      }`}
                    >
                      {grpStr}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Meter Description */}
          <div className="mt-2.5 pt-2 border-t border-[#2d2d3d] text-[11px] text-gray-400">
            <span className="text-[#a88beb] font-bold">{currentModel.formatMeter()}</span>:{" "}
            {currentModel.description || "Nhịp chuẩn trong lý thuyết âm nhạc."}
          </div>
        </div>
      )}
    </div>
  );
};
