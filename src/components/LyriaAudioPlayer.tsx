import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Download, Volume2, VolumeX, Sparkles, AlertTriangle, CheckCircle2, Music2 } from "lucide-react";

interface LyriaAudioPlayerProps {
  audioBase64?: string;
  mimeType?: string;
  isLoading: boolean;
  error?: string | null;
  isQuotaError?: boolean;
  onRetry?: () => void;
  onSynthesizeFallback?: () => void;
  title?: string;
  badgeLabel?: string;
  cached?: boolean;
}

export const LyriaAudioPlayer: React.FC<LyriaAudioPlayerProps> = ({
  audioBase64,
  mimeType = "audio/wav",
  isLoading,
  error,
  isQuotaError = false,
  onRetry,
  onSynthesizeFallback,
  title = "AI Harmonic Preview",
  badgeLabel = "Lyria AI Interpretation",
  cached = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Convert Base64 to Blob URL for playback
  useEffect(() => {
    if (!audioBase64) {
      setAudioUrl(null);
      setIsPlaying(false);
      return;
    }

    try {
      const binaryStr = atob(audioBase64);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error("Failed to decode base64 audio:", e);
    }
  }, [audioBase64, mimeType]);

  // Handle Play / Pause
  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.error("Audio playback error:", err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (vol === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `harmonicx-lyria-preview-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-[#181824] border border-[#2d2d3d] rounded-xl p-4 shadow-xl space-y-3">
      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}

      {/* Title & Badge */}
      <div className="flex items-center justify-between gap-2 border-b border-[#2d2d3d] pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#a88beb]" />
          <h4 className="text-xs font-extrabold text-white tracking-wide">{title}</h4>
        </div>
        <div className="flex items-center gap-2">
          {cached && (
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono rounded border border-emerald-500/30">
              Cached
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 bg-[#7c5cbf]/30 text-[#a88beb] font-bold rounded border border-[#7c5cbf]/50">
            {badgeLabel}
          </span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-6 flex flex-col items-center justify-center space-y-3">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#7c5cbf]/30 border-t-[#a88beb] animate-spin" />
            <Sparkles className="w-5 h-5 text-[#a88beb] animate-pulse" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-extrabold text-white">Đang tổng hợp âm thanh với Lyria AI...</p>
            <p className="text-[11px] text-gray-400">Đang chuyển thông tin hòa âm thành bản diễn tấu âm nhạc ngắn.</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="p-4 bg-[#23151b] border border-rose-500/40 rounded-xl space-y-3">
          <div className="flex items-start gap-2.5 text-rose-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-white text-xs">Lyria AI Preview Unavailable</p>
              <p className="text-[11px] text-rose-200/90 leading-relaxed">{error}</p>
              <p className="text-[10px] text-gray-400">
                Note: Exact playback and harmonic theory calculations remain 100% functional.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-500/20">
            {onSynthesizeFallback && (
              <button
                onClick={onSynthesizeFallback}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-lg shadow transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Thử Nghe Bằng Offline Synthesizer (Tone.js)</span>
              </button>
            )}

            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1.5 bg-[#2a2a3b] hover:bg-[#38384f] text-gray-200 text-xs font-bold rounded-lg border border-[#44445c] transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Thử lại Lyria AI</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ready State & Audio Controls */}
      {!isLoading && !error && audioUrl && (
        <div className="space-y-3">
          {/* Main Controls Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c5cbf] to-[#6366f1] hover:from-[#8b68d4] hover:to-[#7173f2] text-white flex items-center justify-center shadow-lg shadow-[#7c5cbf]/30 transition transform active:scale-95"
                title={isPlaying ? "Tạm dừng" : "Phát preview"}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <button
                onClick={handleRestart}
                className="p-2 bg-[#252533] hover:bg-[#323245] text-gray-300 hover:text-white rounded-lg border border-[#3d3d52] transition"
                title="Phát lại từ đầu"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Time Indicator */}
            <div className="flex-1 px-2">
              <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-[#252533] rounded-lg appearance-none cursor-pointer accent-[#a88beb]"
              />
            </div>

            {/* Volume & Download */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 bg-[#252533] hover:bg-[#323245] text-gray-300 hover:text-white rounded-lg border border-[#3d3d52] transition"
                title={isMuted ? "Mở tiếng" : "Tắt tiếng"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-indigo-300" />}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1.5 bg-[#252533] rounded-lg appearance-none cursor-pointer accent-[#a88beb] hidden sm:block"
              />

              <button
                onClick={handleDownload}
                className="p-2 bg-[#252533] hover:bg-[#323245] text-emerald-400 hover:text-emerald-300 rounded-lg border border-[#3d3d52] transition flex items-center gap-1.5 text-xs font-bold"
                title="Tải nhạc preview (.wav)"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Tải về</span>
              </button>
            </div>
          </div>

          {/* AI Disclaimer Footer */}
          <p className="text-[10px] text-gray-400 italic bg-[#12121a] p-2 rounded-lg border border-[#252533]">
            💡 <strong className="text-gray-300 font-semibold font-sans">Lưu ý:</strong> Đây là <em>AI musical interpretation</em> (diễn tấu sáng tạo của AI) dựa trên lý thuyết hòa âm HarmonicX. Để nghe âm thanh nốt chính xác từng phím bấm MIDI, hãy chọn <strong className="text-indigo-300 font-mono">▶ Exact Playback</strong>.
          </p>
        </div>
      )}

      {/* No Audio Initial State */}
      {!isLoading && !error && !audioUrl && (
        <div className="py-4 text-center text-xs text-gray-400 bg-[#12121a] rounded-lg border border-[#252533]">
          Nhấn nút <strong className="text-[#a88beb]">✨ Generate Preview</strong> bên trên để khởi tạo âm thanh minh họa với Lyria AI.
        </div>
      )}
    </div>
  );
};
