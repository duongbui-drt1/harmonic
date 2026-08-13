import React from "react";
import { AppTheme, InstrumentType } from "../types";
import {
  Menu,
  X,
  Music,
  Sliders,
  Activity,
  Network,
  Wand2,
  Stethoscope,
  Layers,
  FileAudio,
  BookOpen,
  Folder,
  Sparkles,
  Sun,
  Moon,
  Save,
  Printer,
  ShieldAlert,
  RotateCcw,
  RotateCw,
  Key,
  Clock,
  Music2,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  activeKeyName: string;
  isCustomKey: boolean;
  onSelectKey: (key: string, mode: "major" | "minor") => void;
  onResetKey: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  lastAutoSaveTime: string | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenSavedModal: () => void;
  onOpenA11yModal: () => void;
  onPrintReport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeTab,
  setActiveTab,
  activeKeyName,
  isCustomKey,
  onSelectKey,
  onResetKey,
  theme,
  onToggleTheme,
  lastAutoSaveTime,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenSavedModal,
  onOpenA11yModal,
  onPrintReport,
}) => {
  const ALL_KEYS = [
    { root: "C", mode: "major" },
    { root: "G", mode: "major" },
    { root: "D", mode: "major" },
    { root: "A", mode: "major" },
    { root: "E", mode: "major" },
    { root: "F", mode: "major" },
    { root: "Bb", mode: "major" },
    { root: "Eb", mode: "major" },
    { root: "A", mode: "minor" },
    { root: "E", mode: "minor" },
    { root: "D", mode: "minor" },
  ];

  const tabs = [
    { id: "theory", label: "Chord Theory", icon: BookOpen, tag: "Lý Thuyết" },
    { id: "voice_leading", label: "Voice Leading Lab", icon: Sliders, tag: "Dẫn Nốt" },
    { id: "tension_graph", label: "Tension & Graph", icon: Activity, tag: "Căng Thẳng" },
    { id: "mutator_whatif", label: "Mutator & What-If", icon: Wand2, tag: "Biến Thể" },
    { id: "doctor_modulation", label: "Chord Doctor", icon: Stethoscope, tag: "Chẩn Đoán" },
    { id: "genre_dna", label: "Genre DNA & Style", icon: Layers, tag: "Dòng Nhạc" },
    { id: "midi_analyzer", label: "MIDI Analyzer", icon: FileAudio, tag: "Nhập MIDI" },
    { id: "notation", label: "Sheet Notation", icon: Music, tag: "Phổ Nhạc" },
    { id: "presets", label: "Preset Library", icon: Music2, tag: "250 Presets" },
    { id: "ai", label: "AI Harmony Co-Pilot", icon: Sparkles, tag: "Trợ Lý AI" },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-[#12121a] border-r border-[#2d2d3d] z-50 flex flex-col justify-between transition-transform duration-300 shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-[#2d2d3d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c5cbf] to-[#6366f1] flex items-center justify-center text-white font-extrabold shadow-md">
              HX
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-wide">HarmonicX</h2>
              <span className="text-[10px] text-[#a88beb] font-semibold block">Workstation v2.5</span>
            </div>
          </div>

          <button
            onClick={onToggle}
            className="p-1.5 text-gray-400 hover:text-white bg-[#252533] hover:bg-[#323245] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
          {/* Key & Scale Status */}
          <div className="bg-[#1a1a24] border border-[#2d2d3d] rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Key className="w-3 h-3 text-[#a88beb]" /> Giọng Điệu (Key)
              </span>
              {isCustomKey && (
                <button
                  onClick={onResetKey}
                  className="text-[10px] text-[#a88beb] hover:underline font-bold"
                >
                  Tự động
                </button>
              )}
            </div>

            <div className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#7c5cbf] text-white rounded text-xs">{activeKeyName}</span>
              <span className="text-[11px] text-gray-400 font-sans font-normal">
                {isCustomKey ? "(Tùy chỉnh)" : "(Tự động phát hiện)"}
              </span>
            </div>

            <select
              value={isCustomKey ? activeKeyName : ""}
              onChange={(e) => {
                if (!e.target.value) {
                  onResetKey();
                  return;
                }
                const [r, m] = e.target.value.split(" ");
                onSelectKey(r, m === "Minor" ? "minor" : "major");
              }}
              className="w-full bg-[#252533] border border-[#3d3d52] text-white text-xs rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-[#7c5cbf]"
            >
              <option value="">-- Tự Động Nhận Diện Giọng --</option>
              {ALL_KEYS.map((k, idx) => (
                <option key={idx} value={`${k.root} ${k.mode === "major" ? "Major" : "Minor"}`}>
                  {k.root} {k.mode === "major" ? "Major" : "Minor"}
                </option>
              ))}
            </select>
          </div>

          {/* Undo / Redo & Save Controls */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="px-3 py-2 bg-[#1a1a24] disabled:opacity-40 hover:bg-[#252533] border border-[#2d2d3d] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" /> Undo
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="px-3 py-2 bg-[#1a1a24] disabled:opacity-40 hover:bg-[#252533] border border-[#2d2d3d] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <RotateCw className="w-3.5 h-3.5 text-indigo-400" /> Redo
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-2 mb-1">
              Phân Tích & Công Cụ (Lab Modules)
            </label>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    onToggle(); // Close sidebar on selection mobile
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                    isActive
                      ? "bg-[#7c5cbf] text-white shadow-lg shadow-[#7c5cbf]/20"
                      : "text-gray-300 hover:bg-[#252533] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#a88beb]"}`} />
                    <span>{tab.label}</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                      isActive ? "bg-white/20 text-white" : "bg-[#252533] text-gray-400"
                    }`}
                  >
                    {tab.tag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Actions */}
          <div className="space-y-1.5 pt-2 border-t border-[#2d2d3d]">
            <button
              onClick={onOpenSavedModal}
              className="w-full px-3 py-2 bg-[#1a1a24] hover:bg-[#252533] border border-[#2d2d3d] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition"
            >
              <Folder className="w-4 h-4 text-emerald-400" /> Quản Lý Dự Án
            </button>

            <button
              onClick={onPrintReport}
              className="w-full px-3 py-2 bg-[#1a1a24] hover:bg-[#252533] border border-[#2d2d3d] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4 text-sky-400" /> Xuất Báo Cáo Phân Tích (PDF)
            </button>

            <button
              onClick={onOpenA11yModal}
              className="w-full px-3 py-2 bg-[#1a1a24] hover:bg-[#252533] border border-[#2d2d3d] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Phím Tắt & Trợ Năng
            </button>
          </div>
        </div>

        {/* Footer info & Auto-save timestamp */}
        <div className="p-4 border-t border-[#2d2d3d] bg-[#0f0f13] space-y-2 text-xs">
          <div className="flex items-center justify-between text-gray-400">
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3 text-emerald-400" /> Auto-save:
            </span>
            <span className="font-mono text-emerald-400 font-bold text-[11px]">{lastAutoSaveTime || "Vừa xong"}</span>
          </div>

          <button
            onClick={onToggleTheme}
            className="w-full py-1.5 bg-[#252533] hover:bg-[#323245] text-gray-200 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition border border-[#3d3d52]"
          >
            {theme === "light" ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span>Đổi sang {theme === "light" ? "Giao diện Tối" : "Giao diện Sáng"}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
