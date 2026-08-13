import React from "react";
import { InstrumentType } from "../types";
import { Play, Pause, Square, Repeat, Timer, Loader2, Volume2, VolumeX } from "lucide-react";

interface PlaybackControlsProps {
  isPlaying?: boolean;
  isLoading?: boolean;
  loadingStatus?: string;
  loadingPercent?: number;
  bpm?: number;
  timeSignature?: "3/4" | "4/4" | "6/8";
  instrument?: InstrumentType;
  volume?: number;
  loop?: boolean;
  metronome?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onChangeBpm?: (bpm: number) => void;
  onBpmChange?: (bpm: number) => void;
  onChangeTimeSignature?: (ts: "3/4" | "4/4" | "6/8") => void;
  onTimeSignatureChange?: (ts: "3/4" | "4/4" | "6/8") => void;
  onChangeInstrument?: (inst: InstrumentType) => void;
  onInstrumentChange?: (inst: InstrumentType) => void;
  onChangeVolume?: (volume: number) => void;
  onVolumeChange?: (volume: number) => void;
  onToggleLoop?: () => void;
  onLoopChange?: (loop: boolean) => void;
  onToggleMetronome?: () => void;
  onMetronomeChange?: (metronome: boolean) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying = false,
  isLoading = false,
  loadingStatus = "",
  loadingPercent = 0,
  bpm = 120,
  timeSignature = "4/4",
  instrument = "piano",
  volume = 80,
  loop = false,
  metronome = false,
  onPlay,
  onPause,
  onStop,
  onChangeBpm,
  onBpmChange,
  onChangeTimeSignature,
  onTimeSignatureChange,
  onChangeInstrument,
  onInstrumentChange,
  onChangeVolume,
  onVolumeChange,
  onToggleLoop,
  onLoopChange,
  onToggleMetronome,
  onMetronomeChange,
}) => {
  const handleBpm = (val: number) => {
    onChangeBpm?.(val);
    onBpmChange?.(val);
  };

  const handleTimeSig = (ts: "3/4" | "4/4" | "6/8") => {
    onChangeTimeSignature?.(ts);
    onTimeSignatureChange?.(ts);
  };

  const handleInstrument = (inst: InstrumentType) => {
    onChangeInstrument?.(inst);
    onInstrumentChange?.(inst);
  };

  const handleVolume = (vol: number) => {
    onChangeVolume?.(vol);
    onVolumeChange?.(vol);
  };

  const handleLoop = () => {
    onToggleLoop?.();
    onLoopChange?.(!loop);
  };

  const handleMetronome = () => {
    onToggleMetronome?.();
    onMetronomeChange?.(!metronome);
  };

  return (
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-4 shadow-xl">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={onPause}
              className="px-5 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-md shadow-[#7c5cbf]/30 transition"
            >
              <Pause className="w-4 h-4 fill-current" /> Pause
            </button>
          ) : (
            <button
              onClick={onPlay}
              disabled={isLoading}
              className="px-5 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-md shadow-[#7c5cbf]/30 disabled:opacity-50 transition"
            >
              <Play className="w-4 h-4 fill-current" /> Play
            </button>
          )}

          <button
            onClick={onStop}
            className="p-2 bg-[#252533] hover:bg-[#323245] border border-[#3d3d52] text-gray-300 rounded-lg transition"
            title="Stop Playback"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={handleLoop}
            className={`p-2 rounded-lg border transition ${
              loop
                ? "bg-[#7c5cbf]/20 border-[#7c5cbf] text-[#a88beb]"
                : "bg-[#252533] border-[#3d3d52] text-gray-400 hover:text-white"
            }`}
            title="Toggle Loop"
          >
            <Repeat className="w-4 h-4" />
          </button>

          <button
            onClick={handleMetronome}
            className={`px-3 py-2 rounded-lg border flex items-center gap-1.5 transition ${
              metronome
                ? "bg-[#7c5cbf]/20 border-[#7c5cbf] text-[#a88beb]"
                : "bg-[#252533] border-[#3d3d52] text-gray-400 hover:text-white"
            }`}
            title="Toggle Metronome (Click Track)"
          >
            <Timer className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Click</span>
          </button>
        </div>

        {/* BPM Controls */}
        <div className="flex items-center gap-3 bg-[#0f0f13] px-3.5 py-1.5 rounded-lg border border-[#2d2d3d] w-full sm:w-auto">
          <span className="text-[11px] font-mono font-bold text-gray-400 w-16">BPM: <span className="text-[#a88beb]">{bpm}</span></span>
          <input
            type="range"
            min={40}
            max={200}
            value={bpm}
            onChange={(e) => handleBpm(Number(e.target.value))}
            className="w-32 accent-[#7c5cbf] cursor-pointer"
          />
        </div>

        {/* Time Signature */}
        <div className="flex items-center gap-1 bg-[#0f0f13] p-1 rounded-lg border border-[#2d2d3d]">
          {(["3/4", "4/4", "6/8"] as const).map((ts) => (
            <button
              key={ts}
              onClick={() => handleTimeSig(ts)}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition ${
                timeSignature === ts
                  ? "bg-[#7c5cbf] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {ts}
            </button>
          ))}
        </div>

        {/* Instrument Selector & Volume Control */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={instrument}
            onChange={(e) => handleInstrument(e.target.value as InstrumentType)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-[#0f0f13] border border-[#3d3d52] rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-[#7c5cbf] cursor-pointer"
          >
            <option value="piano">🎹 Piano Acoustic Grand</option>
            <option value="acoustic_guitar">🎸 Guitar Acoustic (Nylon)</option>
            <option value="electric_guitar">⚡ Guitar Điện Clean</option>
            <option value="strings">🎻 Đàn Violin / Chuỗi Dây</option>
            <option value="drums">🥁 Bộ Trống (Drum Kit)</option>
          </select>

          {/* Instrument Volume Control */}
          {(onChangeVolume || onVolumeChange) && (
            <div className="flex items-center gap-2 bg-[#0f0f13] px-3 py-1.5 rounded-lg border border-[#2d2d3d]">
              <button
                onClick={() => handleVolume(volume === 0 ? 80 : 0)}
                className="text-gray-400 hover:text-[#a88beb] transition"
                title={volume === 0 ? "Unmute Instrument" : "Mute Instrument"}
              >
                {volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-[#a88beb]" />
                )}
              </button>
              <span className="text-[11px] font-mono font-bold text-gray-400 w-8 text-right">
                {volume}%
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => handleVolume(Number(e.target.value))}
                className="w-16 sm:w-20 accent-[#7c5cbf] cursor-pointer"
                title="Instrument Volume"
              />
            </div>
          )}
        </div>
      </div>

      {/* SoundFont Loading Progress */}
      {isLoading && (
        <div className="mt-3 pt-3 border-t border-[#2d2d3d] flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-[#7c5cbf] animate-spin" />
          <div className="flex-1">
            <div className="flex justify-between text-[11px] text-gray-400 mb-1">
              <span>{loadingStatus}</span>
              <span className="font-mono text-[#a88beb]">{loadingPercent}%</span>
            </div>
            <div className="w-full bg-[#0f0f13] h-1.5 rounded-full overflow-hidden border border-[#2d2d3d]">
              <div
                className="bg-[#7c5cbf] h-full transition-all duration-300"
                style={{ width: `${loadingPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
