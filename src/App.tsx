import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChordItem, InstrumentType, Progression, AppTheme } from "./types";
import { useAudioEngine } from "./hooks/useAudioEngine";
import { useChordHistory } from "./hooks/useChordHistory";
import { detectKeyFromChords, getRomanNumeral, KeyResult } from "./utils/keyDetection";
import { PianoKeyboard } from "./components/PianoKeyboard";
import { ProgressionTimeline } from "./components/ProgressionTimeline";
import { PlaybackControls } from "./components/PlaybackControls";
import { ChordTheoryPanel } from "./components/ChordTheoryPanel";
import { PresetLibrary } from "./components/PresetLibrary";
import { AIAssistant } from "./components/AIAssistant";
import { ExportPanel } from "./components/ExportPanel";
import { SheetNotation } from "./components/SheetNotation";
import { SavedProjectsModal } from "./components/SavedProjectsModal";
import { AccessibilityModal } from "./components/AccessibilityModal";
import { Toast } from "./components/Toast";
import { Music, Layers, Folder, Sparkles, BookOpen, Music2, Sun, Moon, Eye, Keyboard } from "lucide-react";

export default function App() {
  // App state with Undo/Redo history stack
  const {
    chords,
    setChords,
    undo,
    redo,
    canUndo,
    canRedo,
    pastCount,
    futureCount,
  } = useChordHistory([]);

  const [bpm, setBpm] = useState<number>(90);
  const [timeSignature, setTimeSignature] = useState<"3/4" | "4/4" | "6/8">("4/4");
  const [instrument, setInstrument] = useState<InstrumentType>("piano");
  const [volume, setVolume] = useState<number>(80);
  const [loop, setLoop] = useState<boolean>(true);
  const [metronome, setMetronome] = useState<boolean>(false);

  // Selected chord for theory inspector
  const [selectedChordForDetails, setSelectedChordForDetails] = useState<ChordItem | null>(null);

  // UI Modals, Active Tabs, Theme
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isA11yModalOpen, setIsA11yModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"theory" | "notation" | "presets" | "ai">("theory");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem("harmonics_app_theme");
    if (saved === "dark") return "dark";
    return "light";
  });

  const handleSetTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    localStorage.setItem("harmonics_app_theme", newTheme);
    if (newTheme === "light") {
      showToast("☀️ Đã đổi sang giao diện Sáng!");
    } else {
      showToast("🌙 Đã đổi sang giao diện Tối!");
    }
  };

  // Key detection & Custom Key override
  const autoDetectedKey = detectKeyFromChords(chords.map((c) => c.name));
  const [customKey, setCustomKey] = useState<{ root: string; mode: "major" | "minor" } | null>(null);

  const activeKey: KeyResult = customKey
    ? {
        key: customKey.root,
        root: customKey.root,
        mode: customKey.mode,
        displayName: `${customKey.root} ${customKey.mode === "major" ? "Major" : "Minor"}`,
      }
    : autoDetectedKey;

  // Update Roman numerals whenever chords or key change
  const chordsWithRoman = useMemo(
    () =>
      chords.map((c) => ({
        ...c,
        romanNumeral: getRomanNumeral(c.name, activeKey.root, activeKey.mode),
      })),
    [chords, activeKey.root, activeKey.mode]
  );

  // Audio Engine Hook
  const {
    isPlaying,
    currentChordIndex,
    isLoading,
    loadingStatus,
    loadingPercent,
    play,
    pause,
    stop,
    playChordPreview,
    playNotePreview,
  } = useAudioEngine({
    bpm,
    timeSignature,
    instrument,
    volume,
    loop,
    metronome,
    chords: chordsWithRoman,
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
  };

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
      showToast("Undo: Restored previous timeline state");
    }
  }, [canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo();
      showToast("Redo: Restored timeline state");
    }
  }, [canRedo, redo]);

  // Keyboard shortcuts: Space, Undo/Redo, Arrow navigation, BPM, A11y guide
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      // Escape closes modals
      if (e.key === "Escape") {
        setIsSavedModalOpen(false);
        setIsA11yModalOpen(false);
      }

      // Spacebar toggles playback when not focused on text inputs
      if (e.code === "Space" && !isInput) {
        e.preventDefault();
        if (isPlaying) {
          pause();
        } else {
          play();
        }
      }

      // Arrow Left / Right to cycle through timeline chords & preview
      if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && !isInput && chords.length > 0) {
        e.preventDefault();
        const currentIdx = selectedChordForDetails
          ? chords.findIndex((c) => c.id === selectedChordForDetails.id)
          : 0;
        let nextIdx = 0;
        if (e.key === "ArrowRight") {
          nextIdx = (currentIdx + 1) % chords.length;
        } else {
          nextIdx = (currentIdx - 1 + chords.length) % chords.length;
        }
        const targetChord = chords[nextIdx];
        if (targetChord) {
          setSelectedChordForDetails(targetChord);
          playChordPreview(targetChord);
          showToast(`Hợp âm: ${targetChord.name} (${targetChord.beats} nhịp)`);
        }
      }

      // Arrow Up / Down to change BPM by 5
      if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !isInput) {
        e.preventDefault();
        setBpm((prev) => {
          const nextBpm = e.key === "ArrowUp" ? Math.min(240, prev + 5) : Math.max(40, prev - 5);
          showToast(`Nhịp độ Tempo: ${nextBpm} BPM`);
          return nextBpm;
        });
      }

      // Shift + ? or KeyH to open Accessibility Guide
      if (!isInput && (e.key === "?" || e.key.toLowerCase() === "h") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsA11yModalOpen((prev) => !prev);
      }

      // Undo: Ctrl+Z or Cmd+Z (without shift)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !e.shiftKey && !isInput) {
        e.preventDefault();
        handleUndo();
      }

      // Redo: Ctrl+Y or Cmd+Shift+Z / Ctrl+Shift+Z
      if (
        (!isInput && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") ||
        (!isInput && (e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, play, pause, handleUndo, handleRedo, chords, selectedChordForDetails, playChordPreview]);

  // Add chord
  const handleAddChord = (newChord: ChordItem) => {
    if (chords.length >= 16) {
      showToast("Maximum 16 chords allowed per progression.");
      return;
    }
    const updated = [...chords, newChord];
    setChords(updated);
    setSelectedChordForDetails(newChord);
    showToast(`Added chord "${newChord.name}"`);
  };

  // Delete chord
  const handleDeleteChord = (id: string) => {
    const updated = chords.filter((c) => c.id !== id);
    setChords(updated);
    if (selectedChordForDetails?.id === id) {
      setSelectedChordForDetails(updated[0] || null);
    }
  };

  // Update beats for a chord
  const handleUpdateBeats = (id: string, beats: number) => {
    setChords((prev) =>
      prev.map((c) => (c.id === id ? { ...c, beats } : c))
    );
  };

  // Move chord
  const handleMoveChord = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= chords.length) return;
    const updated = [...chords];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setChords(updated);
  };

  // Load preset
  const handleLoadPreset = (presetChords: ChordItem[], key: string, presetBpm: number, presetInstrument?: InstrumentType) => {
    setChords(presetChords);
    setBpm(presetBpm);
    if (presetInstrument) {
      setInstrument(presetInstrument);
    }
    setSelectedChordForDetails(presetChords[0] || null);
    showToast(`Đã tải preset (${presetChords.length} hợp âm, Giọng ${key}, ${presetBpm} BPM)!`);
  };

  // Load AI generated
  const handleLoadAIGenerated = (aiChords: ChordItem[], key: string, explanation: string) => {
    setChords(aiChords);
    setSelectedChordForDetails(aiChords[0] || null);
    showToast(`Đã tải vòng hợp âm AI (Giọng ${key})!`);
  };

  // Load saved project
  const handleLoadProject = (prog: Progression) => {
    setChords(prog.chords);
    setBpm(prog.bpm);
    setTimeSignature(prog.timeSignature);
    setSelectedChordForDetails(prog.chords[0] || null);
    showToast(`Đã mở dự án "${prog.name}"!`);
  };

  const getThemeClass = () => {
    if (theme === "light") return "bg-slate-100 text-slate-800";
    if (theme === "girly") return "bg-pink-50 text-pink-950";
    return "bg-[#0f0f13] text-gray-200";
  };

  const getHeaderClass = () => {
    if (theme === "light") return "bg-white border-slate-200 shadow-slate-200/50";
    if (theme === "girly") return "bg-pink-100/90 border-pink-200";
    return "bg-[#1a1a24] border-[#2d2d3d]";
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-[#7c5cbf] selection:text-white pb-16 transition-colors duration-300 ${getThemeClass()}`}>
      {/* Top Banner Header */}
      <header className={`h-14 border-b sticky top-0 z-30 shadow-sm flex items-center px-4 sm:px-6 transition-colors duration-200 ${getHeaderClass()}`}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold italic shadow-md shrink-0 ${
              theme === "girly" ? "bg-pink-500 shadow-pink-300" : "bg-gradient-to-tr from-[#7c5cbf] to-indigo-500 shadow-[#7c5cbf]/20"
            }`}>
              {theme === "girly" ? "🌸" : "H"}
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className={`text-sm sm:text-base font-bold tracking-tight uppercase ${theme === "light" ? "text-slate-900" : theme === "girly" ? "text-pink-950" : "text-white"}`}>
                HARMONICS <span className={`${theme === "girly" ? "text-pink-600" : "text-[#a88beb]"} font-mono text-xs font-semibold ml-0.5 opacity-90`}>v3.0</span>
              </h1>
              <span className={`hidden md:inline-block text-[11px] font-medium border-l ${
                theme === "light" ? "border-slate-300 text-slate-500" : "border-[#3d3d52] text-gray-400"
              } pl-2.5 py-0.5`}>
                Phân Tích & Sáng Tác Hòa Âm
              </span>
            </div>
          </div>

          {/* Action Controls & Gemini Badge */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Google Gemini Badge */}
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 font-bold text-[11px] rounded-lg shadow-sm whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
              <span>Powered by Google Gemini</span>
            </span>

            {/* Accessibility Modal Trigger */}
            <button
              onClick={() => setIsA11yModalOpen(true)}
              className={`px-2.5 py-1.5 ${
                theme === "light"
                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40"
              } border rounded-lg text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap shadow-sm`}
              title="Hướng dẫn hỗ trợ người khuyết tật & phím tắt (Shift + ?)"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Hỗ Trợ Tiếp Cận</span>
            </button>

            {/* Theme Selector */}
            <div className={`flex items-center p-0.5 rounded-lg border ${
              theme === "light" ? "bg-slate-100 border-slate-200" : "bg-[#0f0f13] border-[#2d2d3d]"
            }`}>
              <button
                onClick={() => handleSetTheme("dark")}
                className={`px-2 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition ${
                  theme === "dark" ? "bg-[#7c5cbf] text-white shadow-sm" : "text-gray-400 hover:text-white"
                }`}
                title="Giao diện Tối (Studio Dark)"
              >
                <Moon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Tối</span>
              </button>
              <button
                onClick={() => handleSetTheme("light")}
                className={`px-2 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition ${
                  theme === "light" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
                }`}
                title="Giao diện Sáng (Clean Light)"
              >
                <Sun className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sáng</span>
              </button>
            </div>

            {/* Active Key Display */}
            <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium whitespace-nowrap ${
              theme === "light" ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-[#0f0f13] border-[#2d2d3d] text-gray-300"
            }`}>
              <span>Giọng:</span>
              <span className="text-[#7c5cbf] dark:text-[#a88beb] font-mono font-bold">{activeKey.displayName}</span>
            </div>

            {/* Presets Button */}
            <button
              onClick={() => setActiveTab("presets")}
              className={`px-3 py-1.5 ${
                theme === "light"
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                  : "bg-[#252533] hover:bg-[#323245] text-gray-200 border-[#3d3d52]"
              } border rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition whitespace-nowrap shadow-sm`}
            >
              <Layers className="w-3.5 h-3.5 text-[#7c5cbf]" /> Presets (160)
            </button>

            {/* Projects Button */}
            <button
              onClick={() => setIsSavedModalOpen(true)}
              className={`px-3.5 py-1.5 ${
                theme === "girly" ? "bg-pink-500 hover:bg-pink-600 text-white" : "bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white"
              } rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition whitespace-nowrap shadow-sm`}
            >
              <Folder className="w-3.5 h-3.5" /> Dự Án
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Row 1: Playback Controls */}
        <PlaybackControls
          isPlaying={isPlaying}
          isLoading={isLoading}
          loadingStatus={loadingStatus}
          loadingPercent={loadingPercent}
          bpm={bpm}
          timeSignature={timeSignature}
          instrument={instrument}
          volume={volume}
          loop={loop}
          metronome={metronome}
          onPlay={play}
          onPause={pause}
          onStop={stop}
          onChangeBpm={setBpm}
          onChangeTimeSignature={setTimeSignature}
          onChangeInstrument={setInstrument}
          onChangeVolume={setVolume}
          onToggleLoop={() => setLoop(!loop)}
          onToggleMetronome={() => setMetronome(!metronome)}
        />

        {/* Row 2: Progression Timeline */}
        <ProgressionTimeline
          chords={chordsWithRoman}
          detectedKey={activeKey}
          customKey={customKey}
          onSetCustomKey={setCustomKey}
          playingIndex={currentChordIndex}
          selectedChordForDetails={selectedChordForDetails}
          onDeleteChord={handleDeleteChord}
          onUpdateBeats={handleUpdateBeats}
          onMoveChord={handleMoveChord}
          onPlayPreview={playChordPreview}
          onSelectChordForDetails={setSelectedChordForDetails}
          onClearTimeline={() => {
            setChords([]);
            setSelectedChordForDetails(null);
            showToast("Timeline cleared.");
          }}
          onSetChords={setChords}
          onOpenPresetLibrary={() => setActiveTab("presets")}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          pastCount={pastCount}
          futureCount={futureCount}
        />

        {/* Row 3: Virtual Piano Keyboard & Chord Builder */}
        <PianoKeyboard
          onAddChord={handleAddChord}
          onPlayNote={playNotePreview}
          onPlayChordPreview={playChordPreview}
        />

        {/* Row 4: Secondary Modules Tab Switcher */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#2d2d3d] pb-2 overflow-x-auto scrollbar-thin">
            <button
              onClick={() => setActiveTab("theory")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition ${
                activeTab === "theory"
                  ? "bg-[#7c5cbf] text-white shadow-md shadow-[#7c5cbf]/20"
                  : "bg-[#1a1a24] text-gray-400 hover:text-white border border-[#2d2d3d]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Lý Thuyết & Thế Tay Guitar
            </button>

            <button
              onClick={() => setActiveTab("notation")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition ${
                activeTab === "notation"
                  ? "bg-[#7c5cbf] text-white shadow-md shadow-[#7c5cbf]/20"
                  : "bg-[#1a1a24] text-gray-400 hover:text-white border border-[#2d2d3d]"
              }`}
            >
              <Music2 className="w-3.5 h-3.5" /> Ký Âm Phổ Nhạc
            </button>

            <button
              onClick={() => setActiveTab("presets")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition ${
                activeTab === "presets"
                  ? "bg-[#7c5cbf] text-white shadow-md shadow-[#7c5cbf]/20"
                  : "bg-[#1a1a24] text-gray-400 hover:text-white border border-[#2d2d3d]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Thư Viện Presets (160)
            </button>

            <button
              onClick={() => setActiveTab("ai")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition ${
                activeTab === "ai"
                  ? "bg-[#7c5cbf] text-white shadow-md shadow-[#7c5cbf]/20"
                  : "bg-[#1a1a24] text-gray-400 hover:text-white border border-[#2d2d3d]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Trợ Lý Trí Tuệ Nhân Tạo AI
            </button>
          </div>

          {/* Active Tab Content */}
          {activeTab === "theory" && (
            <ChordTheoryPanel
              chords={chordsWithRoman}
              selectedChord={selectedChordForDetails}
              activeKey={activeKey.displayName}
              onSelectChord={setSelectedChordForDetails}
              onPlayPreview={playChordPreview}
              onPlaySequence={play}
            />
          )}

          {activeTab === "notation" && (
            <SheetNotation chords={chordsWithRoman} keyName={activeKey.displayName} bpm={bpm} />
          )}

          {activeTab === "presets" && (
            <PresetLibrary onLoadPreset={handleLoadPreset} />
          )}

          {activeTab === "ai" && (
            <AIAssistant
              currentChords={chordsWithRoman}
              currentKey={activeKey.displayName}
              currentBpm={bpm}
              onLoadAIGenerated={handleLoadAIGenerated}
            />
          )}
        </div>

        {/* Row 5: Export & Share Options */}
        <ExportPanel
          chords={chordsWithRoman}
          detectedKey={activeKey}
          bpm={bpm}
          instrument={instrument}
          onShowToast={showToast}
        />
      </main>

      {/* Saved Projects Modal */}
      <SavedProjectsModal
        isOpen={isSavedModalOpen}
        currentProgression={{
          chords: chordsWithRoman,
          key: activeKey.displayName,
          bpm,
          timeSignature,
        }}
        onClose={() => setIsSavedModalOpen(false)}
        onLoadProject={handleLoadProject}
        onShowToast={showToast}
      />

      {/* Accessibility & Shortcuts Modal */}
      <AccessibilityModal
        isOpen={isA11yModalOpen}
        onClose={() => setIsA11yModalOpen(false)}
      />

      {/* Toast Notification */}
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
    </div>
  );
}
