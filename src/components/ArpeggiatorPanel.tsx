import React, { useState, useMemo } from "react";
import {
  ArpeggioSettings,
  ArpeggioPattern,
  ArpeggioRate,
  ChordItem,
  InstrumentType,
} from "../types";
import {
  ARPEGGIO_PRESETS,
  DEFAULT_ARPEGGIO_SETTINGS,
  ArpeggiatorEngine,
} from "../music/arpeggio";
import {
  Sparkles,
  Zap,
  Activity,
  Sliders,
  Volume2,
  Play,
  RotateCcw,
  Check,
  Music,
  Waves,
} from "lucide-react";

interface ArpeggiatorPanelProps {
  settings: ArpeggioSettings;
  onChangeSettings: (newSettings: ArpeggioSettings) => void;
  sampleChord?: ChordItem;
  instrument?: InstrumentType;
  bpm?: number;
  onPreviewArpeggio?: (chord: ChordItem, inst?: InstrumentType) => void;
  onClose?: () => void;
}

const PATTERNS: Array<{
  id: ArpeggioPattern;
  name: string;
  sub: string;
  icon: string;
}> = [
  { id: "up", name: "Ascending", sub: "Đi lên", icon: "↗️" },
  { id: "down", name: "Descending", sub: "Đi xuống", icon: "↘️" },
  { id: "up_down", name: "Up & Down", sub: "Lượn sóng", icon: "↗️↘️" },
  { id: "down_up", name: "Down & Up", sub: "Ngược sóng", icon: "↘️↗️" },
  { id: "up_down_inclusive", name: "Inclusive", sub: "Vòng cung lặp", icon: "🔄" },
  { id: "alberti", name: "Alberti Bass", sub: "Cổ điển Mozart", icon: "🎹" },
  { id: "fingerpicking", name: "Fingerpicking", sub: "Tỉa ngón P-I-M-A", icon: "🎸" },
  { id: "stairway", name: "Stairway", sub: "Bậc thang luân hồi", icon: "🪜" },
  { id: "pulse", name: "Pulse", sub: "Xung nhịp dồn dập", icon: "💥" },
  { id: "random", name: "Random", sub: "Ngẫu hứng tự do", icon: "🎲" },
];

const RATES: Array<{ id: ArpeggioRate; label: string; sub: string }> = [
  { id: "1/4", label: "1/4", sub: "Nốt đen" },
  { id: "1/8", label: "1/8", sub: "Móc đơn" },
  { id: "1/8T", label: "1/8 Triplet", sub: "Liên 3" },
  { id: "1/16", label: "1/16", sub: "Móc kép" },
  { id: "1/16T", label: "1/16 Triplet", sub: "Liên 3 kép" },
  { id: "1/32", label: "1/32", sub: "Siêu tốc" },
];

export const ArpeggiatorPanel: React.FC<ArpeggiatorPanelProps> = ({
  settings,
  onChangeSettings,
  sampleChord,
  instrument = "piano",
  bpm = 120,
  onPreviewArpeggio,
  onClose,
}) => {
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const fallbackChord: ChordItem = useMemo(
    () =>
      sampleChord || {
        id: "demo",
        name: "Cmaj7",
        beats: 4,
        notes: ["C4", "E4", "G4", "B4"],
        midiNotes: [60, 64, 67, 71],
      },
    [sampleChord]
  );

  const updateSetting = <K extends keyof ArpeggioSettings>(
    key: K,
    value: ArpeggioSettings[K]
  ) => {
    setActivePresetId(null);
    onChangeSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = ARPEGGIO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(presetId);
    const merged: ArpeggioSettings = {
      ...settings,
      ...preset.settings,
      enabled: true,
    };
    onChangeSettings(merged);
  };

  const handleToggleMaster = () => {
    onChangeSettings({
      ...settings,
      enabled: !settings.enabled,
    });
  };

  const handleReset = () => {
    setActivePresetId(null);
    onChangeSettings(DEFAULT_ARPEGGIO_SETTINGS);
  };

  // Preview generated notes for step visualizer
  const visualizerEvents = useMemo(() => {
    return ArpeggiatorEngine.generateArpeggioEvents(
      fallbackChord,
      ArpeggiatorEngine.getStepDuration("1/4", bpm) * 4,
      bpm,
      { ...settings, enabled: true }
    );
  }, [fallbackChord, settings, bpm]);

  return (
    <div className="bg-[#14141d] border border-[#2d2d3d] rounded-2xl p-5 shadow-2xl space-y-6 text-gray-200">
      {/* Header & Master Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#2d2d3d]">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              settings.enabled
                ? "bg-[#7c5cbf] text-white shadow-lg shadow-[#7c5cbf]/40"
                : "bg-[#252533] text-gray-400"
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                Bộ Rải Hợp Âm (Arpeggiator)
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  settings.enabled
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse"
                    : "bg-gray-800 text-gray-400 border border-gray-700"
                }`}
              >
                {settings.enabled ? "Đang Bật" : "Tắt"}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Tự động phân tách nốt hợp âm thành chuỗi giai điệu chuyển động linh hoạt
            </p>
          </div>
        </div>

        {/* Master Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onPreviewArpeggio && (
            <button
              onClick={() => onPreviewArpeggio(fallbackChord, instrument)}
              className="px-3.5 py-1.5 bg-[#252533] hover:bg-[#323245] border border-[#3d3d52] text-xs font-semibold text-[#a88beb] hover:text-white rounded-lg flex items-center gap-1.5 transition shadow-sm"
              title="Nghe thử rải nốt hợp âm mẫu"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Thử: {fallbackChord.name}</span>
            </button>
          )}

          <button
            onClick={handleToggleMaster}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md ${
              settings.enabled
                ? "bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white shadow-[#7c5cbf]/30"
                : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{settings.enabled ? "Bật Arp" : "Tắt Arp"}</span>
          </button>
        </div>
      </div>

      {/* Preset Library Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#a88beb]" /> Cấu Hình Mẫu Phong Cách (Presets)
          </span>
          <button
            onClick={handleReset}
            className="text-[11px] text-gray-400 hover:text-[#a88beb] flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" /> Mặc định
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {ARPEGGIO_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-[#7c5cbf]/20 border-[#7c5cbf] text-white shadow-md shadow-[#7c5cbf]/20"
                    : "bg-[#1a1a26] border-[#2d2d3d] text-gray-300 hover:border-[#4d4d68] hover:bg-[#202030]"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span>{preset.icon}</span>
                  <span className="truncate">{preset.name}</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pattern Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
          1. Hướng Rải Nốt (Pattern Mode)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PATTERNS.map((p) => {
            const isSelected = settings.pattern === p.id;
            return (
              <button
                key={p.id}
                onClick={() => updateSetting("pattern", p.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-[#7c5cbf]/25 border-[#7c5cbf] text-white shadow-md ring-1 ring-[#7c5cbf]"
                    : "bg-[#1a1a26] border-[#2d2d3d] text-gray-300 hover:border-[#4d4d68] hover:bg-[#202030]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{p.icon}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#a88beb]" />}
                </div>
                <div className="font-bold text-xs mt-1 text-white">{p.name}</div>
                <div className="text-[10px] text-gray-400">{p.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Speed / Rate Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
          2. Tốc Độ Phân Chia Nốt (Rate / Subdivision)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {RATES.map((r) => {
            const isSelected = settings.rate === r.id;
            return (
              <button
                key={r.id}
                onClick={() => updateSetting("rate", r.id)}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? "bg-[#7c5cbf] border-[#7c5cbf] text-white font-bold shadow-md shadow-[#7c5cbf]/30"
                    : "bg-[#1a1a26] border-[#2d2d3d] text-gray-300 hover:border-[#4d4d68] hover:bg-[#202030]"
                }`}
              >
                <div className="font-mono text-xs font-bold">{r.label}</div>
                <div
                  className={`text-[9px] ${
                    isSelected ? "text-purple-200" : "text-gray-400"
                  }`}
                >
                  {r.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fine Tuning Sliders & Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Left Column: Sliders */}
        <div className="space-y-4 bg-[#1a1a26] p-4 rounded-xl border border-[#2d2d3d]">
          {/* Octave Range */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300 font-semibold">Phạm vi Quãng Tám (Octaves)</span>
              <span className="font-mono font-bold text-[#a88beb]">
                {settings.octaves} Quãng ({settings.octaves * 12} bán cung)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((oct) => (
                <button
                  key={oct}
                  onClick={() => updateSetting("octaves", oct)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                    settings.octaves === oct
                      ? "bg-[#7c5cbf] border-[#7c5cbf] text-white"
                      : "bg-[#0f0f14] border-[#3d3d52] text-gray-400 hover:text-white"
                  }`}
                >
                  {oct} Oct
                </button>
              ))}
            </div>
          </div>

          {/* Gate Length */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300 font-semibold">Độ Dài Ngân (Gate Length)</span>
              <span className="font-mono font-bold text-[#a88beb]">
                {Math.round(settings.gate * 100)}%{" "}
                {settings.gate < 0.6 ? "(Staccato)" : settings.gate > 1.0 ? "(Legato/Pedal)" : "(Chuẩn)"}
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={160}
              step={5}
              value={Math.round(settings.gate * 100)}
              onChange={(e) => updateSetting("gate", Number(e.target.value) / 100)}
              className="w-full accent-[#7c5cbf] cursor-pointer"
            />
          </div>

          {/* Swing */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300 font-semibold">Độ Nảy Nhịp (Swing Feel)</span>
              <span className="font-mono font-bold text-[#a88beb]">
                {Math.round(settings.swing * 100)}%{" "}
                {settings.swing === 0 ? "(Thẳng)" : settings.swing > 0.4 ? "(Nảy mạnh)" : "(Nhẹ)"}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={65}
              step={5}
              value={Math.round(settings.swing * 100)}
              onChange={(e) => updateSetting("swing", Number(e.target.value) / 100)}
              className="w-full accent-[#7c5cbf] cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column: Expression & Musicality Toggles */}
        <div className="space-y-3 bg-[#1a1a26] p-4 rounded-xl border border-[#2d2d3d] flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Tùy Chọn Biểu Cảm (Expression & Dynamics)
          </span>

          {/* Accent First Beat */}
          <label className="flex items-center justify-between p-2.5 bg-[#0f0f14] rounded-lg border border-[#2d2d3d] cursor-pointer hover:border-[#3d3d52] transition">
            <div>
              <div className="text-xs font-bold text-white">Nhấn Phách Mạnh (Accent Downbeat)</div>
              <div className="text-[10px] text-gray-400">Tăng lực gõ ở đầu phách/đầu nhịp</div>
            </div>
            <input
              type="checkbox"
              checked={settings.accentFirstBeat}
              onChange={(e) => updateSetting("accentFirstBeat", e.target.checked)}
              className="w-4 h-4 accent-[#7c5cbf] cursor-pointer"
            />
          </label>

          {/* Root Bass Note */}
          <label className="flex items-center justify-between p-2.5 bg-[#0f0f14] rounded-lg border border-[#2d2d3d] cursor-pointer hover:border-[#3d3d52] transition">
            <div>
              <div className="text-xs font-bold text-white">Nốt Bass Trầm Neo (Root Anchor)</div>
              <div className="text-[10px] text-gray-400">Đánh nốt trầm ở đầu hợp âm giữ nền vững chãi</div>
            </div>
            <input
              type="checkbox"
              checked={settings.rootBassNote}
              onChange={(e) => updateSetting("rootBassNote", e.target.checked)}
              className="w-4 h-4 accent-[#7c5cbf] cursor-pointer"
            />
          </label>

          {/* Humanize */}
          <label className="flex items-center justify-between p-2.5 bg-[#0f0f14] rounded-lg border border-[#2d2d3d] cursor-pointer hover:border-[#3d3d52] transition">
            <div>
              <div className="text-xs font-bold text-white">Biểu Cảm Người Chơi (Humanize)</div>
              <div className="text-[10px] text-gray-400">Biến thiên ngẫu nhiên nhẹ về nhịp và vận tốc gõ</div>
            </div>
            <input
              type="checkbox"
              checked={settings.humanize}
              onChange={(e) => updateSetting("humanize", e.target.checked)}
              className="w-4 h-4 accent-[#7c5cbf] cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Step Sequence Preview Dot Matrix */}
      <div className="space-y-2 bg-[#0d0d12] p-3.5 rounded-xl border border-[#2d2d3d]">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#a88beb]" /> Chuỗi Nốt Mô Phỏng (Step Sequence Matrix)
          </span>
          <span className="font-mono text-[11px] text-gray-400">
            {visualizerEvents.length} Nốt / 4 Phách
          </span>
        </div>

        <div className="flex items-end gap-1.5 h-16 pt-2 overflow-x-auto pb-1">
          {visualizerEvents.slice(0, 32).map((ev, idx) => {
            const heightPercent = Math.min(
              100,
              Math.max(15, ((ev.midi - 48) / (84 - 48)) * 100)
            );
            return (
              <div
                key={idx}
                className="flex-1 min-w-[14px] flex flex-col items-center justify-end h-full group relative"
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    ev.isBassAccent
                      ? "bg-amber-400 hover:bg-amber-300"
                      : idx % 4 === 0
                      ? "bg-[#a88beb] hover:bg-purple-300"
                      : "bg-[#7c5cbf]/70 hover:bg-[#7c5cbf]"
                  }`}
                  style={{
                    height: `${heightPercent}%`,
                    opacity: ev.velocity,
                  }}
                />
                <span className="text-[8px] font-mono text-gray-500 group-hover:text-white mt-1">
                  {ev.noteName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
