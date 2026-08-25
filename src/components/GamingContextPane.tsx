import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Zap,
  Flame,
  Clock,
  Radio,
  Sliders,
  Shield,
  Calculator,
  Compass,
  AlertTriangle,
  Lightbulb,
  Crosshair,
  Wrench,
  Trash2,
  Palette,
  Loader2,
  Wand2,
} from 'lucide-react';
import { GameProfile, GamingContentType, GamingProject, HookStyleType, ToneType } from '../types';
import { uploadScreenshot, generateGameImage, fetchImagePresets } from '../services/api';

interface GamingContextPaneProps {
  project: GamingProject;
  activeGame: GameProfile;
  onUpdateContext: (context: Partial<GamingProject['context']>) => void;
  onUpdateImage: (image: GamingProject['image'] | undefined) => void;
  onGenerateScript: () => void;
  isGeneratingScript: boolean;
}

export const GamingContextPane: React.FC<GamingContextPaneProps> = ({
  project,
  activeGame,
  onUpdateContext,
  onUpdateImage,
  onGenerateScript,
  isGeneratingScript,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageMode, setImageMode] = useState<'upload' | 'ai_generate'>('ai_generate');
  const [styleMode, setStyleMode] = useState<'infographic' | 'cinematic'>('infographic');
  const [customImagePrompt, setCustomImagePrompt] = useState('');
  const [enhancePromptWithAI, setEnhancePromptWithAI] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePresets, setImagePresets] = useState<Record<string, { label: string; prompt: string; type?: string }[]>>({});

  useEffect(() => {
    fetchImagePresets().then(setImagePresets).catch(() => {});
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const res = await uploadScreenshot(file);
      if (res.success && res.image) {
        onUpdateImage(res.image);
      }
    } catch (err) {
      console.error('Error uploading screenshot:', err);
    }
  };

  const handleGenerateAIImage = async (promptToUse?: string, forcedStyle?: 'infographic' | 'cinematic') => {
    const p = promptToUse || customImagePrompt;
    if (!p.trim()) return;
    const targetStyle = forcedStyle || styleMode;
    try {
      setIsGeneratingImage(true);
      const res = await generateGameImage(
        p,
        activeGame.id,
        targetStyle,
        enhancePromptWithAI,
        'flux'
      );
      if (res.success && res.image) {
        onUpdateImage(res.image);
      }
    } catch (err: any) {
      alert(`Image Generation Failed: ${err.message || err}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const activePresets = imagePresets[activeGame.id] || [];

  const contentTypes: { id: GamingContentType; label: string; icon: any; desc: string }[] = [
    { id: 'factory_math', label: 'Factory Math & Ratios', icon: Calculator, desc: 'Conveyors, overclocking, throughput & power grids' },
    { id: 'secret_glitch', label: 'Secret Glitch / Skip', icon: Zap, desc: 'Unintended tech, stamina bypasses & skips' },
    { id: 'early_game_op', label: 'Early-Game OP Items', icon: Flame, desc: 'Hidden high-tier loot & early sequence breaks' },
    { id: 'base_architecture', label: 'Base Building & Defense', icon: Shield, desc: 'Unraidable bunkers, structural stability & traps' },
    { id: 'hidden_lore', label: 'Creepy Mysteries & Lore', icon: Compass, desc: 'Dark world lore, leviathans & secret audio logs' },
    { id: 'tier_list', label: 'Ranking & Tier Lists', icon: Crosshair, desc: 'Best weapons, biggest waste of resources' },
    { id: 'survival_challenge', label: '100 Days Challenge POV', icon: AlertTriangle, desc: 'Hardcore survival challenge narrations' },
    { id: 'update_meta', label: 'Patch / Meta Breakdown', icon: Wrench, desc: 'Latest updates, nerfs, buffs & features' },
  ];

  const hookStyles: { id: HookStyleType; label: string; example: string }[] = [
    { id: 'warning_mistake', label: 'Mistake / Warning Hook', example: '99% of players build this completely wrong...' },
    { id: 'pro_secret', label: 'Pro Veteran Secret', example: 'The hidden mechanic the devs never told you...' },
    { id: 'visual_callout', label: 'Visual Callout ("Look at this")', example: 'Look closely at this inventory stat...' },
    { id: 'question', label: 'Curiosity Question', example: 'What happens if you bring 50 explosives to...?' },
    { id: 'shocking_stat', label: 'Shocking Metric', example: 'This setup prints 10,000 ingots with ZERO power...' },
  ];

  const tones: { id: ToneType; label: string; desc: string }[] = [
    { id: 'energetic_hype', label: '🔥 Hype / Fast-Paced', desc: 'Punchy, viral, high-retention cadence' },
    { id: 'technical_pro', label: '⚙️ Technical Veteran', desc: 'Precise, authoritative, math-driven' },
    { id: 'sarcastic_gamer', label: '😏 Sarcastic / Witty', desc: 'Playful roasting of bad building habits' },
    { id: 'mysterious_lore', label: '🌌 Deep Lore Narrator', desc: 'Atmospheric, intense, world-building' },
    { id: 'chill_builder', label: '☕ Chill Let\'s Player', desc: 'Relaxed, helpful, walkthrough guide' },
  ];

  return (
    <div className="h-full flex flex-col space-y-5 bg-slate-900/70 border border-slate-800 rounded-3xl p-5 overflow-y-auto shadow-xl">
      
      {/* Pane Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">1. Gameplay Context & Ingestion</h2>
            <p className="text-[11px] text-slate-400 font-mono">Screenshot vision, AI art & formulas</p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-emerald-400 text-[10px] font-mono font-bold border border-slate-700">
          {activeGame.name}
        </span>
      </div>

      {/* Visual Ingestion Mode: AI Image Generator vs Upload */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">Visual Media & Scene Source</label>
          {project.image && (
            <button
              onClick={() => onUpdateImage(undefined)}
              className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-mono"
            >
              <Trash2 className="w-3 h-3" /> Clear Image
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setImageMode('ai_generate')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              imageMode === 'ai_generate'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>AI Image Generator</span>
          </button>

          <button
            type="button"
            onClick={() => setImageMode('upload')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              imageMode === 'upload'
                ? 'bg-slate-800 text-slate-100 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Screenshot</span>
          </button>
        </div>

        {/* If image exists, show preview */}
        {project.image ? (
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 aspect-video group">
            <img
              src={project.image.url}
              alt="Gameplay Screenshot"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300">
              <span className="truncate">{project.image.filename}</span>
              <span className="text-emerald-400 font-bold">Scene Ready ✓</span>
            </div>
          </div>
        ) : imageMode === 'ai_generate' ? (
          /* AI Image Generator Form */
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            
            {/* Style Mode Selector */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>Output Visual Style:</span>
              </div>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setStyleMode('infographic')}
                  className={`py-1 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    styleMode === 'infographic'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calculator className="w-3 h-3" />
                  <span>📊 Infographic Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStyleMode('cinematic')}
                  className={`py-1 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    styleMode === 'cinematic'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>🎬 Cinematic Scene</span>
                </button>
              </div>
            </div>

            {/* Quick 1-Click Game Presets */}
            {activePresets.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center justify-between">
                  <span>1-Click {activeGame.name} Infographic Blueprints:</span>
                </span>
                <div className="flex flex-col gap-1.5">
                  {activePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isGeneratingImage}
                      onClick={() => {
                        setCustomImagePrompt(preset.prompt);
                        handleGenerateAIImage(preset.prompt, 'infographic');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-600/60 text-left text-xs text-slate-300 hover:text-emerald-300 transition-colors flex items-center justify-between gap-2 cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[11px] truncate">{preset.label}</p>
                        {preset.type && (
                          <span className="text-[9px] font-mono text-emerald-400/90">{preset.type}</span>
                        )}
                      </div>
                      <Sparkles className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Prompt Input */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-semibold">
                  {styleMode === 'infographic' ? 'Infographic Topic / Optimization Ratio' : 'Custom Scene Prompt'}
                </span>
                <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer font-mono">
                  <input
                    type="checkbox"
                    checked={enhancePromptWithAI}
                    onChange={(e) => setEnhancePromptWithAI(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span>AI Blueprint Architecture</span>
                </label>
              </div>

              <textarea
                rows={2}
                value={customImagePrompt}
                onChange={(e) => setCustomImagePrompt(e.target.value)}
                placeholder={
                  styleMode === 'infographic'
                    ? `e.g. Infographic flowchart showing infinite turbofuel power plant ratio with 44 fuel generators in ${activeGame.name}`
                    : `e.g. Gigantic industrial nuclear reactor facility in ${activeGame.name} with purple glowing steam`
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-sans resize-none"
              />

              <button
                type="button"
                onClick={() => handleGenerateAIImage()}
                disabled={isGeneratingImage || !customImagePrompt.trim()}
                className="w-full py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      {styleMode === 'infographic'
                        ? 'Synthesizing 9:16 Infographic Blueprint Card...'
                        : 'Generating 9:16 Gaming Scene (Flux Engine)...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Palette className="w-3.5 h-3.5" />
                    <span>
                      {styleMode === 'infographic'
                        ? 'Generate 9:16 Infographic Blueprint Card'
                        : 'Generate 9:16 AI Artwork'}
                    </span>
                  </>
                )}
              </button>
            </div>

          </div>
        ) : (
          /* File Upload Box */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/60 rounded-2xl p-4 text-center bg-slate-950/40 hover:bg-slate-950/80 transition-all cursor-pointer group space-y-1.5"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-800/80 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 mx-auto flex items-center justify-center transition-colors">
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">
              Drop gameplay screenshot, base layout, or blueprint
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Inspects inventory, UI stats, materials & building tiers
            </p>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Content Type Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">Gaming Content Formula</label>
        <div className="grid grid-cols-2 gap-2">
          {contentTypes.map((ct) => {
            const Icon = ct.icon;
            const isSelected = project.context.contentType === ct.id;
            return (
              <button
                key={ct.id}
                type="button"
                onClick={() => onUpdateContext({ contentType: ct.id })}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{ct.label}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 font-mono">
                  {ct.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Duration & Tone */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Duration</span>
          </label>
          <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {([15, 30, 45, 60] as const).map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => onUpdateContext({ targetDuration: sec })}
                className={`py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                  project.context.targetDuration === sec
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Spoken Tone</span>
          </label>
          <select
            value={project.context.tone}
            onChange={(e) => onUpdateContext({ tone: e.target.value as ToneType })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {tones.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hook Style Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>Hook Retention Formula (First 2.5s)</span>
        </label>
        <select
          value={project.context.hookStyle}
          onChange={(e) => onUpdateContext({ hookStyle: e.target.value as HookStyleType })}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          {hookStyles.map((h) => (
            <option key={h.id} value={h.id}>
              {h.label} — "{h.example}"
            </option>
          ))}
        </select>
      </div>

      {/* Specific Topic & Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
          <span>Specific Video Topic / Strategy</span>
        </label>
        <input
          type="text"
          value={project.context.topic}
          onChange={(e) => onUpdateContext({ topic: e.target.value })}
          placeholder={`e.g. ${activeGame.popularHooks[0] || 'Nuclear waste recycling layout'}`}
          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">
          User Notes / Numbers / Glitch Steps (Optional)
        </label>
        <textarea
          rows={3}
          value={project.context.keyFacts || ''}
          onChange={(e) => onUpdateContext({ keyFacts: e.target.value })}
          placeholder={`Add exact item names, ratios, or instructions... (e.g. 240 Crude Oil -> 800 Turbofuel -> 44 Fuel Generators)`}
          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono resize-none"
        />
      </div>

      {/* AI Generate Button */}
      <button
        onClick={onGenerateScript}
        disabled={isGeneratingScript}
        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 mt-auto"
      >
        <Sparkles className={`w-4 h-4 fill-slate-950 ${isGeneratingScript ? 'animate-spin' : ''}`} />
        <span>{isGeneratingScript ? 'Synthesizing Gaming Script...' : 'Synthesize Gaming Script (Gemini 2.5)'}</span>
      </button>

    </div>
  );
};
