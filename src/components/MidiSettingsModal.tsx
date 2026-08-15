import React from "react";
import {
  Piano,
  X,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Activity,
  Zap,
  Volume2,
  HelpCircle,
  Radio,
} from "lucide-react";
import { useMidi } from "../hooks/useMidi";
import { midiToNoteName } from "../utils/noteNames";

interface MidiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const MidiSettingsModal: React.FC<MidiSettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const {
    isSupported,
    isInitialized,
    isConnected,
    devices,
    activeDeviceId,
    activeMidiNotes,
    detectedChord,
    isSustainActive,
    lastVelocity,
    error,
    initializeMidi,
    selectDevice,
    refreshDevices,
    releaseAll,
  } = useMidi({ enableAudioSynth: true });

  if (!isOpen) return null;

  const handleRefresh = () => {
    refreshDevices();
    onShowToast?.("Đã làm mới danh sách thiết bị MIDI!");
  };

  const handleConnect = async () => {
    const ok = await initializeMidi();
    if (ok) {
      onShowToast?.("Đã kích hoạt kết nối MIDI thành công!");
    } else {
      onShowToast?.("Không thể kích hoạt MIDI. Kiểm tra kết nối thiết bị.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="midi-settings-title"
    >
      <div className="relative w-full max-w-2xl bg-[#141420] border border-[#3d3259] rounded-3xl shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto scrollbar-thin space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#252538]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
              <Piano className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-[#a88beb] border border-purple-500/30">
                  Web MIDI API
                </span>
                <span className="text-[10px] text-gray-400 font-semibold">
                  Chuẩn Nhạc Cụ Điện Tử
                </span>
              </div>
              <h2 id="midi-settings-title" className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                Cài Đặt Thiết Bị MIDI Controller
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-[#1e1e2d] hover:bg-[#2a2a3d] rounded-full transition"
            aria-label="Đóng cài đặt MIDI"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Support Check */}
        {!isSupported && (
          <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-2xl flex items-start gap-3 text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h3 className="font-bold text-amber-300">Trình duyệt chưa hỗ trợ Web MIDI</h3>
              <p className="leading-relaxed text-amber-200/90">
                Trình duyệt của bạn hiện chưa kích hoạt hoặc không hỗ trợ Web MIDI API. Hãy sử dụng <b>Google Chrome</b>, <b>Microsoft Edge</b>, <b>Opera</b> hoặc <b>Brave</b> trên máy tính để kết nối đàn MIDI trực tiếp.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && isSupported && (
          <div className="bg-red-950/40 border border-red-500/40 p-4 rounded-2xl flex items-start gap-3 text-red-200 text-xs">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-red-300">Thông Báo Kết Nối MIDI</h3>
              <p>{error}</p>
              <button
                onClick={handleConnect}
                className="mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-[11px] transition"
              >
                Thử kết nối lại
              </button>
            </div>
          </div>
        )}

        {/* Device Selection & Status */}
        {isSupported && (
          <div className="bg-[#191928] border border-[#2d2d42] p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                  Thiết Bị Đầu Vào (MIDI Input)
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isConnected ? "bg-emerald-400 shadow-md shadow-emerald-500/50 animate-pulse" : "bg-gray-500"
                    }`}
                  />
                  <span className="text-xs font-semibold text-gray-200">
                    {isConnected ? "● Đã kết nối thiết bị" : "○ Chưa phát hiện thiết bị"}
                  </span>
                </div>
              </div>

              {/* Refresh & Connect buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="px-3 py-2 bg-[#252538] hover:bg-[#32324a] text-gray-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-[#3b3b55]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Làm mới thiết bị
                </button>

                {!isInitialized && (
                  <button
                    type="button"
                    onClick={handleConnect}
                    className="px-4 py-2 bg-[#7c5cbf] hover:bg-[#8e6fd1] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-purple-500/20"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Kích hoạt MIDI
                  </button>
                )}
              </div>
            </div>

            {/* Dropdown device selector */}
            <div>
              <select
                value={activeDeviceId || "all"}
                onChange={(e) => selectDevice(e.target.value === "all" ? null : e.target.value)}
                className="w-full bg-[#10101a] border border-[#34344e] rounded-xl px-4 py-3 text-sm text-white font-medium focus:ring-2 focus:ring-[#7c5cbf] focus:border-transparent outline-none transition"
              >
                <option value="all">Tất cả thiết bị kết nối (Nghe đồng thời)</option>
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.manufacturer ? `(${d.manufacturer})` : ""} - [{d.state}]
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1.5">
                {devices.length === 0
                  ? "Chưa tìm thấy cổng MIDI nào. Cắm đàn qua cáp USB và bấm 'Làm mới thiết bị'."
                  : `Đã tìm thấy ${devices.length} cổng thiết bị MIDI.`}
              </p>
            </div>
          </div>
        )}

        {/* Live MIDI Diagnostic Monitor */}
        <div className="bg-[#191928] border border-[#2d2d42] p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#2a2a3e] pb-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Bảng Giám Sát Tín Hiệu Thời Gian Thực
            </h3>
            <button
              onClick={releaseAll}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-500/30 transition"
            >
              Ngắt nốt (Panic)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Active Notes Display */}
            <div className="bg-[#10101a] border border-[#28283d] p-3.5 rounded-xl space-y-1.5">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">
                Nốt đang giữ ({activeMidiNotes.length})
              </span>
              <div className="min-h-[40px] flex flex-wrap items-center gap-1.5">
                {activeMidiNotes.length > 0 ? (
                  activeMidiNotes.map((midi) => (
                    <span
                      key={midi}
                      className="px-2.5 py-1 bg-purple-600/30 border border-purple-500/50 text-purple-200 rounded-lg text-xs font-mono font-bold animate-pulse"
                    >
                      {midiToNoteName(midi)} ({midi})
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 italic">Chưa có phím nào được bấm...</span>
                )}
              </div>
            </div>

            {/* Velocity & Sustain Monitor */}
            <div className="bg-[#10101a] border border-[#28283d] p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  Lực phím (Velocity)
                </span>
                <span className="text-xs font-mono font-bold text-indigo-300">
                  {lastVelocity} / 127
                </span>
              </div>
              <div className="w-full bg-[#202030] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-100"
                  style={{ width: `${Math.round((lastVelocity / 127) * 100)}%` }}
                />
              </div>

              {/* Sustain Indicator */}
              <div className="flex items-center justify-between pt-1 border-t border-[#232336] text-xs">
                <span className="text-gray-400">Bàn đạp vang (CC64):</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                    isSustainActive
                      ? "bg-emerald-900/60 text-emerald-300 border border-emerald-500/40"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {isSustainActive ? "Đang đạp (Sustain ON)" : "Đã nhả (OFF)"}
                </span>
              </div>
            </div>
          </div>

          {/* Real-Time Detected Chord Card */}
          <div className="bg-[#10101a] border border-[#28283d] p-4 rounded-xl flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">
                Hợp Âm Tự Động Nhận Diện
              </span>
              <div className="text-lg sm:text-xl font-extrabold text-white">
                {detectedChord ? detectedChord.vietnameseTitle : "Chưa phát hiện hợp âm"}
              </div>
              {detectedChord?.inversionText && (
                <span className="text-xs text-indigo-300 font-medium block mt-0.5">
                  {detectedChord.inversionText}
                </span>
              )}
            </div>

            {detectedChord && detectedChord.confidence > 0.3 && (
              <div className="text-right shrink-0">
                <span className="text-2xl sm:text-3xl font-black font-mono text-[#a88beb]">
                  {detectedChord.symbol}
                </span>
                <span className="text-[10px] text-emerald-400 block font-semibold">
                  Độ chính xác {Math.round(detectedChord.confidence * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Helpful Vietnamese Guide for Musicians */}
        <div className="bg-[#101018] border border-[#262638] p-4 rounded-2xl space-y-2 text-xs text-gray-300">
          <h4 className="font-bold text-gray-200 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            Hướng Dẫn Kết Nối Bàn Phím MIDI Cho Người Mới
          </h4>
          <ul className="list-disc list-inside space-y-1 text-gray-400 leading-relaxed">
            <li>Cắm trực tiếp cáp USB từ đàn Piano điện / MIDI Controller vào máy tính.</li>
            <li>Trình duyệt sẽ tự động nhận diện thiết bị mà không cần cài đặt thêm phần mềm trung gian.</li>
            <li>Khi bấm phím trên đàn thật, âm thanh sẽ phát ra và hiển thị nốt trực tiếp trên bàn phím ảo của HarmonicX.</li>
            <li>Bạn có thể luyện tập nhạc lý, rèn luyện tai nghe và nhận diện hợp âm tự động trong chế độ <b>Học Nhạc Core</b>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
