import React, { useState } from "react";
import { InstrumentType, TimeSignatureString, ArpeggioSettings, ChordItem } from "../types";
import { TimeSignature, RhythmRegistry } from "../music/rhythm";
import { TimeSignatureSelector } from "./TimeSignatureSelector";
import { RhythmVisualizer } from "./RhythmVisualizer";
import { ArpeggiatorPanel } from "./ArpeggiatorPanel";
import {
  Play,
  Pause,
  Square,
  Repeat,
  Timer,
  Loader2,
  Volume2,
  VolumeX,
  Activity,
  Sliders,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Piano,
} from "lucide-react";

interface PlaybackControlsProps {
  isPlaying?: boolean;
  isLoading?: boolean;
  loadingStatus?: string;
  loadingPercent?: number;
  bpm?: number;
  timeSignature?: TimeSignatureString;
  timeSignatureGrouping?: number[];
  timeSignatureModel?: TimeSignature;
  activeBeatIndex?: number | null;
  activeSubdivisionIndex?: number | null;
  activeAccent?: "strong" | "secondary" | "weak" | null;
  instrument?: InstrumentType;
  volume?: number;
  loop?: boolean;
  metronome?: boolean;
  arpeggioSettings?: ArpeggioSettings;
  sampleChord?: ChordItem;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onChangeBpm?: (bpm: number) => void;
  onBpmChange?: (bpm: number) => void;
  onChangeTimeSignature?: (ts: TimeSignatureString, grouping?: number[]) => void;
  onTimeSignatureChange?: (ts: TimeSignatureString, grouping?: number[]) => void;
  onChangeInstrument?: (inst: InstrumentType) => void;
  onInstrumentChange?: (inst: InstrumentType) => void;
  onChangeVolume?: (volume: number) => void;
  onVolumeChange?: (volume: number) => void;
  onToggleLoop?: () => void;
  onLoopChange?: (loop: boolean) => void;
  onToggleMetronome?: () => void;
  onMetronomeChange?: (metronome: boolean) => void;
  onChangeArpeggioSettings?: (settings: ArpeggioSettings) => void;
  onPreviewArpeggio?: (chord: ChordItem, inst?: InstrumentType) => void;
  onOpenMidiModal?: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying = false,
  isLoading = false,
  loadingStatus = "",
  loadingPercent = 0,
  bpm = 120,
  timeSignature = "4/4",
  timeSignatureGrouping,
  timeSignatureModel,
  activeBeatIndex = null,
  activeSubdivisionIndex = null,
  activeAccent = null,
  instrument = "piano",
  volume = 80,
  loop = false,
  metronome = false,
  arpeggioSettings,
  sampleChord,
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
  onChangeArpeggioSettings,
  onPreviewArpeggio,
  onOpenMidiModal,
}) => {
  const [showRhythmVisualizer, setShowRhythmVisualizer] = useState(true);
  const [showArpeggiatorPanel, setShowArpeggiatorPanel] = useState(false);

  const resolvedModel =
    timeSignatureModel ||
    RhythmRegistry.getTimeSignature(timeSignature, timeSignatureGrouping);

  const handleBpm = (val: number) => {
    onChangeBpm?.(val);
    onBpmChange?.(val);
  };

  const handleTimeSig = (ts: TimeSignatureString, grouping?: number[]) => {
    onChangeTimeSignature?.(ts, grouping);
    onTimeSignatureChange?.(ts, grouping);
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

  const handleToggleArpeggio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onChangeArpeggioSettings || !arpeggioSettings) return;
    onChangeArpeggioSettings({
      ...arpeggioSettings,
      enabled: !arpeggioSettings.enabled,
    });
  };

  const beatUnitSymbol =
    resolvedModel.beatUnit === "dotted-quarter"
      ? "♩."
      : resolvedModel.beatUnit === "half"
      ? "𝅗𝅥"
      : resolvedModel.beatUnit === "eighth"
      ? "♪"
      : "♩";

  return (
    <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-4 shadow-xl space-y-3">
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
            title="Toggle Metronome (Click Track with Grouping Accents)"
          >
            <Timer className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Click</span>
          </button>

          {/* Arpeggiator Quick Button */}
          {arpeggioSettings && (
            <div className="flex items-center">
              <button
                onClick={() => setShowArpeggiatorPanel(!showArpeggiatorPanel)}
                className={`px-3 py-2 rounded-lg border flex items-center gap-1.5 transition ${
                  arpeggioSettings.enabled
                    ? "bg-[#7c5cbf]/20 border-[#7c5cbf] text-[#a88beb] shadow-sm shadow-[#7c5cbf]/20"
                    : "bg-[#252533] border-[#3d3d52] text-gray-400 hover:text-white"
                }`}
                title="Cấu hình bộ rải nốt Arpeggiator"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
                  Arp: {arpeggioSettings.enabled ? arpeggioSettings.rate : "Off"}
                </span>
                {showArpeggiatorPanel ? (
                  <ChevronUp className="w-3 h-3 text-gray-400 ml-0.5" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-gray-400 ml-0.5" />
                )}
              </button>
            </div>
          )}

          {/* MIDI Controller Quick Button */}
          {onOpenMidiModal && (
            <button
              onClick={onOpenMidiModal}
              className="px-3 py-2 rounded-lg border bg-[#252533] border-[#3d3d52] text-purple-300 hover:text-white hover:border-purple-500 flex items-center gap-1.5 transition"
              title="Cài đặt và giám sát thiết bị MIDI Controller"
            >
              <Piano className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">MIDI</span>
            </button>
          )}
        </div>

        {/* BPM Controls */}
        <div className="flex items-center gap-3 bg-[#0f0f13] px-3.5 py-1.5 rounded-lg border border-[#2d2d3d] w-full sm:w-auto">
          <span className="text-[11px] font-mono font-bold text-gray-400 w-24">
            BPM ({beatUnitSymbol}): <span className="text-[#a88beb]">{bpm}</span>
          </span>
          <input
            type="range"
            min={40}
            max={240}
            value={bpm}
            onChange={(e) => handleBpm(Number(e.target.value))}
            className="w-28 sm:w-32 accent-[#7c5cbf] cursor-pointer"
          />
        </div>

        {/* Generic Time Signature Selector with Grouping and Category support */}
        <div className="flex items-center gap-1.5">
          <TimeSignatureSelector
            timeSignature={timeSignature}
            timeSignatureGrouping={timeSignatureGrouping}
            onChangeTimeSignature={handleTimeSig}
          />
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

      {/* Expandable Arpeggiator Control Panel */}
      {showArpeggiatorPanel && arpeggioSettings && onChangeArpeggioSettings && (
        <div className="pt-2">
          <ArpeggiatorPanel
            settings={arpeggioSettings}
            onChangeSettings={onChangeArpeggioSettings}
            sampleChord={sampleChord}
            instrument={instrument}
            bpm={bpm}
            onPreviewArpeggio={onPreviewArpeggio}
            onClose={() => setShowArpeggiatorPanel(false)}
          />
        </div>
      )}

      {/* Real-time Rhythm Visualizer & Beat Indicator */}
      {showRhythmVisualizer && (
        <RhythmVisualizer
          timeSignatureModel={resolvedModel}
          bpm={bpm}
          isPlaying={isPlaying}
          activeBeatIndex={activeBeatIndex}
          activeSubdivisionIndex={activeSubdivisionIndex}
          activeAccent={activeAccent}
        />
      )}

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
