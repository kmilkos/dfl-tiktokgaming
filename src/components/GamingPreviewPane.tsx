import React, { useState, useRef, useEffect } from 'react';
import {
  Smartphone,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Video,
  Download,
  Film,
  Sparkles,
  Layers,
  Sliders,
  CheckCircle2,
  Loader2,
  Type,
  Maximize2,
} from 'lucide-react';
import { GamingProject, MotionStyleType } from '../types';

interface GamingPreviewPaneProps {
  project: GamingProject;
  onUpdateMotion: (motion: Partial<GamingProject['motion']>) => void;
  onUpdateCaptions: (captions: Partial<GamingProject['captions']>) => void;
  onRenderVideo: () => void;
  isRenderingVideo: boolean;
  renderProgress: number;
}

export const GamingPreviewPane: React.FC<GamingPreviewPaneProps> = ({
  project,
  onUpdateMotion,
  onUpdateCaptions,
  onRenderVideo,
  isRenderingVideo,
  renderProgress,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (project.voice.durationSeconds) {
      setDuration(project.voice.durationSeconds);
    }
  }, [project.voice.durationSeconds]);

  const togglePlay = () => {
    if (!audioRef.current || !project.voice.audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Find active beat / subtitle text
  const currentBeat = project.script?.beats?.find((b, idx, arr) => {
    const nextBeatTime = arr[idx + 1] ? arr[idx + 1].timeSec : 999;
    return currentTime >= b.timeSec && currentTime < nextBeatTime;
  });

  const motionStyles: { id: MotionStyleType; label: string; desc: string }[] = [
    { id: 'ken_burns_zoom', label: 'Slow Zoom-In', desc: 'Dramatic push towards focus' },
    { id: 'pulse_zoom', label: 'Dynamic Pulse', desc: 'Rhythmic zoom on audio beats' },
    { id: 'pan_down', label: 'Pan Down', desc: 'Vertical reveal from top to bottom' },
    { id: 'pan_up', label: 'Pan Up', desc: 'Reveal base structure upwards' },
    { id: 'cinematic_drift', label: 'Cinematic Drift', desc: 'Subtle slow lateral camera drift' },
  ];

  return (
    <div className="h-full flex flex-col space-y-4 bg-slate-900/70 border border-slate-800 rounded-3xl p-5 overflow-y-auto shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">3. 9:16 Video & Preview</h2>
            <p className="text-[11px] text-slate-400 font-mono">Mobile preview, kinetic captions & export</p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-lg bg-slate-950 text-purple-300 text-[10px] font-mono font-bold border border-slate-800">
          1080x1920 9:16
        </span>
      </div>

      {/* Mobile 9:16 Mock Device Preview */}
      <div className="flex-1 flex items-center justify-center min-h-[380px]">
        <div className="relative w-56 sm:w-64 aspect-[9/16] rounded-3xl bg-black border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between">
          
          {/* Top Notch / Time Bar */}
          <div className="absolute top-2 left-0 right-0 z-20 flex items-center justify-between px-4 text-[9px] font-mono text-white/80">
            <span>DFL GAMING</span>
            <span className="w-12 h-3.5 rounded-full bg-slate-900/90 border border-slate-800 mx-auto" />
            <span className="text-emerald-400 font-bold">{project.context.targetDuration}s</span>
          </div>

          {/* Background Screenshot with Camera Motion Simulation */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
            {project.image ? (
              <img
                src={project.image.url}
                alt="Gaming Preview"
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-125' : 'scale-100'
                }`}
                style={{
                  transformOrigin: `${(project.motion.focusPoint?.x ?? 0.5) * 100}% ${(project.motion.focusPoint?.y ?? 0.5) * 100}%`,
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-slate-900 to-slate-950 text-slate-600">
                <Film className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-[10px] font-mono">No Screenshot Loaded</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
          </div>

          {/* Center Dynamic Karaoke Captions */}
          <div className="relative z-10 my-auto px-4 text-center">
            {project.captions.enabled && (
              <div className="space-y-1">
                <p className="font-extrabold text-sm sm:text-base tracking-wide uppercase text-yellow-300 drop-shadow-[0_2px_8px_rgba(0,0,0,1)] text-stroke-sm font-sans leading-snug">
                  {currentBeat?.text || project.script?.hook || project.title}
                </p>
                {currentBeat?.visualFocus && (
                  <span className="inline-block px-2 py-0.5 rounded-md bg-black/80 text-[9px] font-mono text-cyan-300 border border-cyan-500/40">
                    🎯 {currentBeat.visualFocus}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Bottom TikTok UI Overlay Simulation */}
          <div className="relative z-10 p-3 bg-gradient-to-t from-black/90 to-transparent space-y-1">
            <p className="text-[10px] font-bold text-white truncate">
              @{project.gameTitle.toLowerCase().replace(/\s+/g, '')}_pro
            </p>
            <p className="text-[9px] text-slate-300 line-clamp-1">
              {project.script?.hook || project.context.topic} #shorts #{project.gameId}
            </p>
          </div>

          {/* Hidden Audio Player */}
          {project.voice.audioUrl && (
            <audio
              ref={audioRef}
              src={project.voice.audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
            />
          )}
        </div>
      </div>

      {/* Audio Playback Controls & Wave Scrubber */}
      {project.voice.audioUrl && (
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-emerald-400 font-bold">{currentTime.toFixed(1)}s</span>
            <span className="text-slate-500">/</span>
            <span>{duration.toFixed(1)}s</span>
          </div>

          {/* Progress Bar */}
          <div
            onClick={(e) => {
              if (!audioRef.current || !duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              audioRef.current.currentTime = pos * duration;
            }}
            className="h-2 w-full bg-slate-800 rounded-full overflow-hidden cursor-pointer relative"
          >
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-100"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>

          {/* Play/Pause Button */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  audioRef.current.play();
                  setIsPlaying(true);
                }
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={togglePlay}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
              <span>{isPlaying ? 'Pause Preview' : 'Play Voiceover'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Motion & Caption Settings */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400">Camera Motion</label>
          <select
            value={project.motion.style}
            onChange={(e) => onUpdateMotion({ style: e.target.value as MotionStyleType })}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {motionStyles.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400">Captions Style</label>
          <select
            value={project.captions.style}
            onChange={(e) => onUpdateCaptions({ style: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="gaming_bold">⚡ TikTok Bold Yellow</option>
            <option value="neon_glow">🌟 Neon Cyan Glow</option>
            <option value="minimal_clean">⚪ Minimal White</option>
          </select>
        </div>
      </div>

      {/* Export Status & Render Button */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Export Pool:</span>
          <span className="text-cyan-400 font-bold truncate max-w-[180px]">/outer/Downloads/DFLTikTokGaming</span>
        </div>

        {project.renderedVideoUrl ? (
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Video Rendered!</span>
              </span>
              <a
                href={project.renderedVideoUrl}
                download
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-md transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Download MP4</span>
              </a>
            </div>

            <button
              onClick={onRenderVideo}
              disabled={isRenderingVideo}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Re-Render Video</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onRenderVideo}
            disabled={isRenderingVideo || !project.voice.audioPath || !project.image}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isRenderingVideo ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Rendering 9:16 MP4 ({renderProgress}%)...</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span>Render 9:16 TikTok Video (1080x1920)</span>
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
};
