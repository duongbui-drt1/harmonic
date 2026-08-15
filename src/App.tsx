import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChordItem, InstrumentType, Progression, PresetProgression, AppTheme, TimeSignatureString, ArpeggioSettings } from "./types";
import { DEFAULT_ARPEGGIO_SETTINGS } from "./music/arpeggio";
import { parseChordName, getChordNotes } from "./utils/chordData";
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
import { NoteVelocityModal } from "./components/NoteVelocityModal";
import { MidiSettingsModal } from "./components/MidiSettingsModal";
import { Toast } from "./components/Toast";
import { Sidebar } from "./components/Sidebar";

import { VoiceLeadingLab } from "./components/VoiceLeadingLab";
import { TensionAndGraphLab } from "./components/TensionAndGraphLab";
import { MutatorAndWhatIfLab } from "./components/MutatorAndWhatIfLab";
import { DoctorAndModulationLab } from "./components/DoctorAndModulationLab";
import { GenreAndStyleLab } from "./components/GenreAndStyleLab";
import { MidiAnalyzerLab } from "./components/MidiAnalyzerLab";
import { LyriaPreview } from "./components/LyriaPreview";
import { LearningMode } from "./components/learning/LearningMode";

import { printHarmonicReport } from "./utils/reportExporter";
import { Menu, Music, Sparkles, Folder, Printer, Eye, RotateCcw, RotateCw, GraduationCap, Piano } from "lucide-react";

export default function App() {
  // Load cached auto-save state from localStorage
  const cachedData = useMemo(() => {
    try {
      const raw = localStorage.getItem("harmonics_autosave_v1");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // App state with Undo/Redo history stack
  const {
    chords,
    setChords,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useChordHistory(
    cachedData?.chords && cachedData.chords.length > 0
      ? cachedData.chords
      : [
          { id: "c1", name: "Cmaj7", beats: 4, midiNotes: [60, 64, 67, 71] },
          { id: "c2", name: "Am7", beats: 4, midiNotes: [57, 60, 64, 67] },
          { id: "c3", name: "Dm7", beats: 4, midiNotes: [62, 65, 69, 72] },
          { id: "c4", name: "G7", beats: 4, midiNotes: [55, 59, 62, 65] },
        ]
  );

  const [bpm, setBpm] = useState<number>(cachedData?.bpm ?? 90);
  const [timeSignature, setTimeSignature] = useState<TimeSignatureString>(cachedData?.timeSignature ?? "4/4");
  const [timeSignatureGrouping, setTimeSignatureGrouping] = useState<number[] | undefined>(cachedData?.timeSignatureGrouping);
  const [instrument, setInstrument] = useState<InstrumentType>(cachedData?.instrument ?? "piano");
  const [volume, setVolume] = useState<number>(cachedData?.volume ?? 80);
  const [loop, setLoop] = useState<boolean>(cachedData?.loop ?? true);
  const [metronome, setMetronome] = useState<boolean>(cachedData?.metronome ?? false);
  const [arpeggioSettings, setArpeggioSettings] = useState<ArpeggioSettings>(
    cachedData?.arpeggioSettings ?? DEFAULT_ARPEGGIO_SETTINGS
  );

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Velocity modal state
  const [velocityModalChord, setVelocityModalChord] = useState<ChordItem | null>(null);

  // Auto-save timestamp tracking
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string | null>(null);

  // Selected chord for theory inspector
  const [selectedChordForDetails, setSelectedChordForDetails] = useState<ChordItem | null>(null);

  // UI Modals, Active Tabs, Theme
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isA11yModalOpen, setIsA11yModalOpen] = useState(false);
  const [isMidiModalOpen, setIsMidiModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "learn"
    | "lyria_preview"
    | "theory"
    | "voice_leading"
    | "tension_graph"
    | "mutator_whatif"
    | "doctor_modulation"
    | "genre_dna"
    | "midi_analyzer"
    | "notation"
    | "presets"
    | "ai"
  >("learn");

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem("harmonics_app_theme");
    if (saved === "dark") return "dark";
    return "light";
  });

  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("harmonics_app_theme", nextTheme);
    showToast(`Đã chuyển sang giao diện ${nextTheme === "light" ? "Sáng" : "Tối"}!`);
  };

  // Key detection & Custom Key override
  const autoDetectedKey = detectKeyFromChords(chords.map((c) => c.name));
  const [customKey, setCustomKey] = useState<{ root: string; mode: "major" | "minor" } | null>(
    cachedData?.customKey ?? null
  );

  // Auto-save effect
  useEffect(() => {
    const dataToSave = {
      chords,
      bpm,
      timeSignature,
      timeSignatureGrouping,
      instrument,
      volume,
      loop,
      metronome,
      arpeggioSettings,
      customKey,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem("harmonics_autosave_v1", JSON.stringify(dataToSave));
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      setLastAutoSaveTime(timeStr);
    } catch (e) {
      console.error("Auto-save failed:", e);
    }
  }, [chords, bpm, timeSignature, timeSignatureGrouping, instrument, volume, loop, metronome, arpeggioSettings, customKey]);

  const activeKey: KeyResult = customKey
    ? {
        key: customKey.root,
        root: customKey.root,
        mode: customKey.mode,
        displayName: `${customKey.root} ${customKey.mode === "major" ? "Major" : "Minor"}`,
      }
    : autoDetectedKey;

  // Update Roman numerals
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
    activeBeatIndex,
    activeSubdivisionIndex,
    activeAccent,
    timeSignatureModel,
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
    timeSignatureGrouping,
    instrument,
    volume,
    loop,
    metronome,
    chords: chordsWithRoman,
    arpeggioSettings,
  });

  const handlePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
  };

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
      showToast("Undo: Đã khôi phục trạng thái trước!");
    }
  }, [canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo();
      showToast("Redo: Đã khôi phục trạng thái!");
    }
  }, [canRedo, redo]);

  // Load Preset
  const handleSelectPreset = (preset: PresetProgression | Progression) => {
    setChords(
      preset.chords.map((c, idx) => {
        const parsed = parseChordName(c.name);
        const root = parsed ? parsed.root : "C";
        const intervals = parsed ? parsed.qualityDef.intervals : [0, 4, 7];
        const { noteNames, midiNotes } = getChordNotes(root, intervals, 3);
        return {
          id: `preset-c-${idx}-${Date.now()}`,
          name: c.name,
          root,
          quality: parsed ? parsed.qualityDef.quality : "major",
          beats: c.beats,
          notes: noteNames,
          midiNotes,
        };
      })
    );
    if (preset.bpm) setBpm(preset.bpm);
    if ("timeSignature" in preset && preset.timeSignature) setTimeSignature(preset.timeSignature);
    if (preset.key) setCustomKey({ root: preset.key, mode: preset.mode || "major" });
    const nameStr = "title" in preset ? preset.title : preset.name;
    const genreStr = "genre" in preset ? preset.genre : "Diatonic";
    showToast(`Đã tải preset: "${nameStr}" (${genreStr})`);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      if (e.key === "Escape") {
        setIsSavedModalOpen(false);
        setIsA11yModalOpen(false);
        setIsSidebarOpen(false);
      }

      if (e.code === "Space" && !isInput) {
        e.preventDefault();
        if (isPlaying) pause();
        else play();
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !e.shiftKey && !isInput) {
        e.preventDefault();
        handleUndo();
      }

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
  }, [isPlaying, play, pause, handleUndo, handleRedo]);

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-slate-900 text-slate-100" : "bg-[#0b0b10] text-[#e0e0e8]"} font-sans antialiased selection:bg-[#7c5cbf] selection:text-white pb-12`}>
      {/* Toast Notification */}
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      {/* Sidebar Navigation Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeKeyName={activeKey?.displayName || "C Major"}
        isCustomKey={!!customKey}
        onSelectKey={(root, mode) => setCustomKey({ root, mode })}
        onResetKey={() => setCustomKey(null)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        lastAutoSaveTime={lastAutoSaveTime}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onOpenA11yModal={() => setIsA11yModalOpen(true)}
        onOpenMidiModal={() => setIsMidiModalOpen(true)}
        onPrintReport={() => printHarmonicReport({ key: activeKey?.displayName || "C Major", bpm, timeSignature, chords: chordsWithRoman })}
      />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-[#12121a]/90 backdrop-blur-md border-b border-[#2d2d3d] px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Hamburger Button to toggle Sidebar */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-[#252533] hover:bg-[#323245] text-white rounded-xl border border-[#3d3d52] transition shadow-md flex items-center gap-2"
              title="Mở Sidebar trạng thái & công cụ"
            >
              <Menu className="w-5 h-5 text-[#a88beb]" />
              <span className="text-xs font-bold hidden sm:inline">Menu</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c5cbf] to-[#6366f1] flex items-center justify-center text-white font-extrabold shadow-md">
                HX
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  HarmonicX <span className="text-[10px] px-1.5 py-0.5 bg-[#7c5cbf]/30 text-[#a88beb] rounded border border-[#7c5cbf]/50">Workstation</span>
                </h1>
              </div>
            </div>
          </div>

          {/* Quick Header Bar Status & Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("learn")}
              className={`px-3 py-1.5 text-xs font-black rounded-lg flex items-center gap-1.5 shadow-md transition ${
                activeTab === "learn"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white ring-2 ring-purple-400"
                  : "bg-[#1f1935] hover:bg-[#2c2448] text-[#c0a8f7] border border-[#7c5cbf]/50"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>🎓 Học Nhạc / Learn</span>
            </button>

            <button
              onClick={() => setActiveTab("lyria_preview")}
              className={`px-3 py-1.5 text-xs font-black rounded-lg flex items-center gap-1.5 shadow-md transition ${
                activeTab === "lyria_preview"
                  ? "bg-gradient-to-r from-[#7c5cbf] to-[#6366f1] text-white ring-1 ring-[#7c5cbf]"
                  : "bg-[#221c38] hover:bg-[#2c2448] text-[#a88beb] border border-[#7c5cbf]/40"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>✨ Lyria Preview</span>
            </button>

            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-[#1a1a24] border border-[#2d2d3d] text-xs font-mono font-bold text-indigo-300 rounded-lg">
              Key: {activeKey?.displayName || "C Major"}
            </span>

            <button
              onClick={() => setIsMidiModalOpen(true)}
              className="px-3 py-1.5 bg-[#252533] hover:bg-[#323245] text-purple-300 hover:text-white text-xs font-bold rounded-lg flex items-center gap-1.5 border border-[#3d3d52] transition shadow-sm"
              title="Cài đặt và giám sát MIDI Controller"
            >
              <Piano className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">MIDI</span>
            </button>

            <button
              onClick={() => printHarmonicReport({ key: activeKey?.displayName || "C Major", bpm, timeSignature, chords: chordsWithRoman })}
              className="px-3 py-1.5 bg-[#252533] hover:bg-[#323245] text-gray-200 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-[#3d3d52] transition"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" /> Báo Cáo
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      {activeTab === "learn" ? (
        <main className="max-w-7xl mx-auto px-4 pt-6">
          <LearningMode />
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
          {/* Interactive Piano Keyboard */}
          <section className="bg-[#161622] border border-[#2d2d3d] rounded-2xl p-4 shadow-2xl">
            <PianoKeyboard
              onPlayNote={(note) => playNotePreview(note)}
              onAddChord={(chord) => {
                setChords((prev) => [...prev, chord]);
                showToast(`Đã thêm hợp âm: ${chord.name}`);
              }}
              onPlayChordPreview={(chord) => playChordPreview(chord)}
            />
          </section>

          {/* Timeline & Playback Controls */}
          <section className="space-y-4">
            <PlaybackControls
              isPlaying={isPlaying}
              onPlay={play}
              onPause={pause}
              onStop={stop}
              bpm={bpm}
              onChangeBpm={setBpm}
              onBpmChange={setBpm}
              timeSignature={timeSignature}
              timeSignatureGrouping={timeSignatureGrouping}
              timeSignatureModel={timeSignatureModel}
              activeBeatIndex={activeBeatIndex}
              activeSubdivisionIndex={activeSubdivisionIndex}
              activeAccent={activeAccent}
              onChangeTimeSignature={(ts, grp) => {
                setTimeSignature(ts);
                setTimeSignatureGrouping(grp);
              }}
              onTimeSignatureChange={(ts, grp) => {
                setTimeSignature(ts);
                setTimeSignatureGrouping(grp);
              }}
              instrument={instrument}
              onChangeInstrument={setInstrument}
              onInstrumentChange={setInstrument}
              volume={volume}
              onChangeVolume={setVolume}
              onVolumeChange={setVolume}
              loop={loop}
              onToggleLoop={() => setLoop(!loop)}
              onLoopChange={setLoop}
              metronome={metronome}
              onToggleMetronome={() => setMetronome(!metronome)}
              onMetronomeChange={setMetronome}
              isLoading={isLoading}
              loadingStatus={loadingStatus}
              loadingPercent={loadingPercent}
              arpeggioSettings={arpeggioSettings}
              sampleChord={chordsWithRoman[0] || chords[0]}
              onChangeArpeggioSettings={setArpeggioSettings}
              onPreviewArpeggio={(chord, inst) => playChordPreview(chord, inst, true)}
              onOpenMidiModal={() => setIsMidiModalOpen(true)}
            />

            <ProgressionTimeline
              chords={chordsWithRoman}
              detectedKey={activeKey}
              timeSignature={timeSignature}
              timeSignatureGrouping={timeSignatureGrouping}
              timeSignatureModel={timeSignatureModel}
              bpm={bpm}
              customKey={customKey}
              onSetCustomKey={setCustomKey}
              playingIndex={currentChordIndex}
              selectedChordForDetails={selectedChordForDetails}
              onDeleteChord={(id) => setChords((prev) => prev.filter((c) => c.id !== id))}
              onUpdateBeats={(id, beats) => setChords((prev) => prev.map((c) => (c.id === id ? { ...c, beats } : c)))}
              onMoveChord={(index, direction) => {
                const target = index + direction;
                if (target < 0 || target >= chords.length) return;
                const next = [...chords];
                const [moved] = next.splice(index, 1);
                next.splice(target, 0, moved);
                setChords(next);
              }}
              onPlayPreview={playChordPreview}
              onSelectChordForDetails={(chord) => setSelectedChordForDetails(chord)}
              onOpenVelocityModal={(chord) => setVelocityModalChord(chord)}
              onClearTimeline={() => setChords([])}
              onSetChords={setChords}
              onOpenPresetLibrary={() => setActiveTab("presets")}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          </section>

          {/* Module Content Area */}
          <section className="space-y-6">
            {activeTab === "lyria_preview" && (
              <LyriaPreview
                chords={chordsWithRoman}
                keyName={activeKey?.displayName || "C Major"}
                bpm={bpm}
                timeSignature={timeSignature}
                onExactPlayback={handlePlay}
                isPlayingExact={isPlaying}
              />
            )}

            {activeTab === "theory" && (
              <ChordTheoryPanel
                chords={chordsWithRoman}
                selectedChord={selectedChordForDetails || chordsWithRoman[0] || null}
                activeKey={activeKey?.displayName || "C Major"}
                onSelectChord={(chord) => setSelectedChordForDetails(chord)}
                onPlayPreview={(chord) => playChordPreview(chord)}
                onPlaySequence={handlePlay}
              />
            )}

            {activeTab === "voice_leading" && (
              <VoiceLeadingLab chords={chordsWithRoman} onPlayPreview={playChordPreview} />
            )}

            {activeTab === "tension_graph" && (
              <TensionAndGraphLab chords={chordsWithRoman} keyName={activeKey?.displayName || "C Major"} />
            )}

            {activeTab === "mutator_whatif" && (
              <MutatorAndWhatIfLab
                chords={chordsWithRoman}
                keyName={activeKey?.displayName || "C Major"}
                onApplyMutation={(newChords) => {
                  setChords(
                    newChords.map((c, idx) => {
                      const parsed = parseChordName(c.name);
                      const root = parsed ? parsed.root : "C";
                      const intervals = parsed ? parsed.qualityDef.intervals : [0, 4, 7];
                      const { noteNames, midiNotes } = getChordNotes(root, intervals, 3);
                      return {
                        id: `mutated-${idx}-${Date.now()}`,
                        name: c.name,
                        root,
                        quality: parsed ? parsed.qualityDef.quality : "major",
                        beats: c.beats || 4,
                        notes: noteNames,
                        midiNotes,
                      };
                    })
                  );
                  showToast("Đã áp dụng biến thể hòa âm mới!");
                }}
              />
            )}

            {activeTab === "doctor_modulation" && (
              <DoctorAndModulationLab chords={chordsWithRoman} keyName={activeKey?.displayName || "C Major"} />
            )}

            {activeTab === "genre_dna" && (
              <GenreAndStyleLab
                chords={chordsWithRoman}
                keyName={activeKey?.displayName || "C Major"}
                onApplyMakeItMore={(newChords) => {
                  setChords(
                    newChords.map((c, idx) => {
                      const parsed = parseChordName(c.name);
                      const root = parsed ? parsed.root : "C";
                      const intervals = parsed ? parsed.qualityDef.intervals : [0, 4, 7];
                      const { noteNames, midiNotes } = getChordNotes(root, intervals, 3);
                      return {
                        id: `genre-${idx}-${Date.now()}`,
                        name: c.name,
                        root,
                        quality: parsed ? parsed.qualityDef.quality : "major",
                        beats: c.beats || 4,
                        notes: noteNames,
                        midiNotes,
                      };
                    })
                  );
                  showToast("Đã áp dụng chuyển đổi cảm xúc hợp âm!");
                }}
              />
            )}

            {activeTab === "midi_analyzer" && (
              <MidiAnalyzerLab
                onImportMidiChords={(importedChords, midiBpm) => {
                  setChords(
                    importedChords.map((c, idx) => {
                      const parsed = parseChordName(c.name);
                      const root = parsed ? parsed.root : "C";
                      const intervals = parsed ? parsed.qualityDef.intervals : [0, 4, 7];
                      const { noteNames, midiNotes } = getChordNotes(root, intervals, 3);
                      return {
                        id: `midi-${idx}-${Date.now()}`,
                        name: c.name,
                        root,
                        quality: parsed ? parsed.qualityDef.quality : "major",
                        beats: c.beats || 4,
                        notes: noteNames,
                        midiNotes,
                      };
                    })
                  );
                  setBpm(midiBpm);
                  showToast(`Đã nhập thành công ${importedChords.length} hợp âm từ MIDI!`);
                }}
              />
            )}

            {activeTab === "notation" && (
              <SheetNotation
                chords={chordsWithRoman}
                keyName={activeKey?.displayName || "C Major"}
                bpm={bpm}
                timeSignature={timeSignature}
                timeSignatureGrouping={timeSignatureGrouping}
                timeSignatureModel={timeSignatureModel}
              />
            )}

            {activeTab === "presets" && <PresetLibrary onSelectPreset={handleSelectPreset} />}

            {activeTab === "ai" && (
              <AIAssistant
                chords={chordsWithRoman}
                keyName={activeKey?.displayName || "C Major"}
                bpm={bpm}
                onApplySuggestion={(suggestedChords) => {
                  setChords(
                    suggestedChords.map((c, idx) => {
                      const parsed = parseChordName(c.name);
                      const root = parsed ? parsed.root : "C";
                      const intervals = parsed ? parsed.qualityDef.intervals : [0, 4, 7];
                      const { noteNames, midiNotes } = getChordNotes(root, intervals, 3);
                      return {
                        id: `ai-${idx}-${Date.now()}`,
                        name: c.name,
                        root,
                        quality: parsed ? parsed.qualityDef.quality : "major",
                        beats: c.beats || 4,
                        notes: noteNames,
                        midiNotes,
                      };
                    })
                  );
                  showToast("Đã áp dụng gợi ý từ AI Co-Pilot!");
                }}
              />
            )}

            {/* Export Panel */}
            <ExportPanel
              chords={chordsWithRoman}
              bpm={bpm}
              timeSignature={timeSignature}
              timeSignatureGrouping={timeSignatureGrouping}
              timeSignatureModel={timeSignatureModel}
              instrument={instrument}
              keyName={activeKey?.displayName || "C Major"}
              detectedKey={activeKey}
              arpeggioSettings={arpeggioSettings}
              onShowToast={showToast}
            />
          </section>
        </main>
      )}

      {/* Modals */}
      {isSavedModalOpen && (
        <SavedProjectsModal
          isOpen={isSavedModalOpen}
          onClose={() => setIsSavedModalOpen(false)}
          currentChords={chordsWithRoman}
          bpm={bpm}
          timeSignature={timeSignature}
          keyName={activeKey?.displayName || "C Major"}
          onLoadProject={(proj) => {
            setChords(proj.chords);
            setBpm(proj.bpm);
            setTimeSignature(proj.timeSignature);
            showToast(`Đã mở dự án: "${proj.name}"`);
          }}
          onShowToast={showToast}
        />
      )}

      {isA11yModalOpen && <AccessibilityModal isOpen={isA11yModalOpen} onClose={() => setIsA11yModalOpen(false)} />}

      {isMidiModalOpen && (
        <MidiSettingsModal
          isOpen={isMidiModalOpen}
          onClose={() => setIsMidiModalOpen(false)}
          onShowToast={showToast}
        />
      )}

      {velocityModalChord && (
        <NoteVelocityModal
          isOpen={!!velocityModalChord}
          onClose={() => setVelocityModalChord(null)}
          chord={velocityModalChord}
          onPlayPreview={(chord) => playChordPreview(chord)}
          onPlayNote={(midi) => playNotePreview(midi)}
          onSave={(updated) => {
            setChords((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            showToast(`Đã lưu Velocity & Sustain cho ${updated.name}`);
          }}
        />
      )}
    </div>
  );
}
