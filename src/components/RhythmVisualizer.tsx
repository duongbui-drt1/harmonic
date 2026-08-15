import React from "react";
import { TimeSignature, SubdivisionInfo } from "../music/rhythm";
import { Activity, Music, Sparkles } from "lucide-react";

interface RhythmVisualizerProps {
  timeSignatureModel: TimeSignature;
  bpm: number;
  isPlaying: boolean;
  activeBeatIndex: number | null;
  activeSubdivisionIndex: number | null;
  activeAccent: "strong" | "secondary" | "weak" | null;
}

export const RhythmVisualizer: React.FC<RhythmVisualizerProps> = ({
  timeSignatureModel,
  bpm,
  isPlaying,
  activeSubdivisionIndex,
  activeAccent,
}) => {
  const subs = timeSignatureModel.getSubdivisions(bpm);
  const barDuration = timeSignatureModel.getBarDuration(bpm);
  const beatUnitLabel =
    timeSignatureModel.beatUnit === "dotted-quarter"
      ? "♩."
      : timeSignatureModel.beatUnit === "half"
      ? "𝅗𝅥"
      : timeSignatureModel.beatUnit === "eighth"
      ? "♪"
      : "♩";

  return (
    <div className="bg-[#12121a] border border-[#2d2d3d] rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
      {/* Left info badge */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#7c5cbf]/20 border border-[#7c5cbf]/40 flex items-center justify-center text-[#a88beb]">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white font-mono">{timeSignatureModel.name}</span>
            {(timeSignatureModel.isCompound || timeSignatureModel.isOdd) && (
              <span className="text-[10px] bg-[#7c5cbf]/30 text-[#cbb6f7] px-1.5 py-0.2 rounded font-mono font-bold border border-[#7c5cbf]/40">
                {timeSignatureModel.groupingDisplay}
              </span>
            )}
            <span className="text-[10px] text-gray-400 font-mono">
              ({beatUnitLabel} = {bpm} BPM · {barDuration.toFixed(2)}s/bar)
            </span>
          </div>
          <p className="text-[10px] text-gray-400 truncate max-w-xs">
            {timeSignatureModel.description || `${timeSignatureModel.classification} meter`}
          </p>
        </div>
      </div>

      {/* Real-time Beat & Subdivision Pulse Strip */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#0a0a0e] rounded-lg border border-[#252533] overflow-x-auto max-w-full">
        {timeSignatureModel.grouping.map((groupSize, gIdx) => {
          // Find subdivisions belonging to this group
          const groupSubs = subs.filter((s) => s.groupIndex === gIdx);

          return (
            <React.Fragment key={gIdx}>
              {gIdx > 0 && <div className="w-[2px] h-6 bg-[#3d3d52] mx-0.5 rounded-full" />}
              <div className="flex items-center gap-1 bg-[#1a1a24]/60 px-1 py-0.5 rounded border border-[#2d2d3d]/50">
                {groupSubs.map((sub) => {
                  const isActive = isPlaying && activeSubdivisionIndex === sub.index;
                  const isStrong = sub.accent === "strong";
                  const isSecondary = sub.accent === "secondary";

                  let pulseColor = "bg-[#252533] text-gray-400 border-[#3d3d52]";
                  if (isActive) {
                    if (isStrong) {
                      pulseColor = "bg-amber-400 text-slate-950 font-black border-amber-300 scale-110 shadow-lg shadow-amber-400/50";
                    } else if (isSecondary) {
                      pulseColor = "bg-[#a88beb] text-slate-950 font-black border-[#cbb6f7] scale-105 shadow-md shadow-[#7c5cbf]/50";
                    } else {
                      pulseColor = "bg-[#7c5cbf] text-white font-bold border-[#8e6fd1] scale-105";
                    }
                  } else if (isStrong) {
                    pulseColor = "bg-[#252533] text-amber-300 border-amber-500/40 hover:border-amber-400";
                  } else if (isSecondary) {
                    pulseColor = "bg-[#252533] text-[#a88beb] border-[#7c5cbf]/40";
                  }

                  return (
                    <div
                      key={sub.index}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono transition-all duration-75 border ${pulseColor}`}
                      title={`Subdivision ${sub.displayNumber} (${sub.accent.toUpperCase()} accent)`}
                    >
                      <span className="leading-none">{sub.displayNumber}</span>
                      <span className="text-[7px] leading-none opacity-60">
                        {isStrong ? "STR" : isSecondary ? "SEC" : "·"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
