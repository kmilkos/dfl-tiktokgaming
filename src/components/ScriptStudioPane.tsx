import React, { useState } from 'react';
import {
  FileText,
  Mic,
  Sparkles,
  Volume2,
  Play,
  Flame,
  CheckCircle2,
  Clock,
  BookOpen,
  VolumeX,
  Plus,
  Trash2,
  Layers,
  HelpCircle,
  Wand2,
} from 'lucide-react';
import { GamingProject, VoiceOption } from '../types';

interface ScriptStudioPaneProps {
  project: GamingProject;
  voices: VoiceOption[];
  onUpdateScript: (script: Partial<GamingProject['script']>) => void;
  onUpdateVoice: (voice: Partial<GamingProject['voice']>) => void;
  onSynthesizeAudio: () => void;
  isSynthesizingAudio: boolean;
}

export const ScriptStudioPane: React.FC<ScriptStudioPaneProps> = ({
  project,
  voices,
  onUpdateScript,
  onUpdateVoice,
  onSynthesizeAudio,
  isSynthesizingAudio,
}) => {
  const script = project.script;
  const [newPhoneticKey, setNewPhoneticKey] = useState('');
  const [newPhoneticVal, setNewPhoneticVal] = useState('');

  const handleAddPhonetic = () => {
    if (!newPhoneticKey || !newPhoneticVal || !script) return;
    onUpdateScript({
      phoneticOverrides: {
        ...(script.phoneticOverrides || {}),
        [newPhoneticKey.trim()]: newPhoneticVal.trim(),
      },
    });
    setNewPhoneticKey('');
    setNewPhoneticVal('');
  };

  const handleRemovePhonetic = (key: string) => {
    if (!script) return;
    const updated = { ...(script.phoneticOverrides || {}) };
    delete updated[key];
    onUpdateScript({ phoneticOverrides: updated });
  };

  return (
    <div className="h-full flex flex-col space-y-5 bg-slate-900/70 border border-slate-800 rounded-3xl p-5 overflow-y-auto shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">2. Scriptcraft & Voice Studio</h2>
            <p className="text-[11px] text-slate-400 font-mono">Spoken delivery, timed beats & TTS audio</p>
          </div>
        </div>

        {script && (
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              {script.wordCount} words
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-950 border border-emerald-800/60 text-emerald-400 font-bold">
              ~{script.estimatedSeconds}s audio
            </span>
          </div>
        )}
      </div>

      {!script ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/40 border border-slate-800/60 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-500">
            <Wand2 className="w-6 h-6 text-emerald-400/80" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200">No Script Synthesized Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Configure your gameplay context on the left and click "Synthesize Gaming Script" to generate an authentic short-form narration.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* Spoken Text High-Impact Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Full Spoken Narration (What the Voice Reads)</span>
              </label>
            </div>
            <textarea
              rows={5}
              value={script.spokenText}
              onChange={(e) => {
                const text = e.target.value;
                const words = text.trim().split(/\s+/).filter(Boolean).length;
                onUpdateScript({
                  spokenText: text,
                  wordCount: words,
                  estimatedSeconds: Math.round((words / 145) * 60 * 10) / 10,
                });
              }}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed resize-none shadow-inner"
            />
          </div>

          {/* Hook, Body, CTA Structured Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-orange-500/30 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-orange-400 flex items-center gap-1">
                <Flame className="w-3 h-3" /> 1. The Hook (0-3s)
              </span>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
                {script.hook || 'No hook defined'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">
                2. Core Lore / Math
              </span>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
                {script.body || 'No body text'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                3. CTA / Discussion
              </span>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
                {script.cta || 'No CTA defined'}
              </p>
            </div>
          </div>

          {/* Timed Beat Breakdown */}
          {script.beats && script.beats.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Timed Beat Sheet & Camera Movement Sync</span>
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {script.beats.map((beat, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-400 font-bold flex-shrink-0 pt-0.5">
                      <span>{beat.timeSec.toFixed(1)}s</span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-slate-200 text-xs">{beat.text}</p>
                      {beat.visualFocus && (
                        <p className="text-[10px] font-mono text-cyan-400/90 truncate">
                          🎯 Zoom Focus: {beat.visualFocus}
                        </p>
                      )}
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[9px] font-mono text-slate-400 border border-slate-800 flex-shrink-0">
                      {beat.emotion}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phonetic Pronunciation Overrides for Game Jargon */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Phonetic Pronunciation Dictionary (Game Terms)</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Forces exact TTS speech</span>
            </div>

            {/* List existing */}
            {script.phoneticOverrides && Object.keys(script.phoneticOverrides).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(script.phoneticOverrides).map(([word, phon]) => (
                  <span
                    key={word}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-slate-200 flex items-center gap-1.5"
                  >
                    <span className="text-amber-400 font-bold">{word}</span>
                    <span className="text-slate-500">➜</span>
                    <span className="text-emerald-400">{phon}</span>
                    <button
                      onClick={() => handleRemovePhonetic(word)}
                      className="text-slate-500 hover:text-rose-400 ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add new override */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newPhoneticKey}
                onChange={(e) => setNewPhoneticKey(e.target.value)}
                placeholder="Game Word (e.g. FICSIT)"
                className="w-1/2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={newPhoneticVal}
                onChange={(e) => setNewPhoneticVal(e.target.value)}
                placeholder="Phonetic (e.g. FIK-sit)"
                className="w-1/2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddPhonetic}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Voiceover Selection & Synthesis Controls */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>Voice Actor & Engine Settings</span>
              </label>

              {project.voice.audioUrl && (
                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Voiceover Ready ({project.voice.durationSeconds}s)</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold">Gamer Voice Model</span>
                <select
                  value={project.voice.voiceId}
                  onChange={(e) => onUpdateVoice({ voiceId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {voices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Speech Speed / Energy</span>
                  <span className="font-mono text-emerald-400">{project.voice.speed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.35"
                  step="0.05"
                  value={project.voice.speed}
                  onChange={(e) => onUpdateVoice({ speed: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            {/* Synthesize Button */}
            <button
              onClick={onSynthesizeAudio}
              disabled={isSynthesizingAudio || !script.spokenText}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              <Volume2 className={`w-4 h-4 fill-slate-950 ${isSynthesizingAudio ? 'animate-spin' : ''}`} />
              <span>
                {isSynthesizingAudio
                  ? 'Synthesizing Voiceover Audio...'
                  : project.voice.audioUrl
                  ? 'Re-Synthesize Spoken Voiceover'
                  : 'Synthesize Spoken Voiceover (Edge-TTS)'}
              </span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
