import React, { useState, useEffect } from 'react';
import { X, Settings, Key, CheckCircle2, Save, Loader2, Folder, Zap } from 'lucide-react';
import { SystemConfig } from '../types';
import { fetchConfig, saveConfig } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchConfig().then((cfg) => {
        setConfig(cfg);
        setGeminiApiKey(cfg.geminiApiKey || '');
        setElevenLabsApiKey(cfg.elevenLabsApiKey || '');
      });
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      await saveConfig({
        geminiApiKey,
        elevenLabsApiKey,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Gaming Suite Settings</h2>
              <p className="text-xs text-slate-400 font-mono">API keys, AI models & storage pools</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Gemini API Key */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google Gemini API Key (Multimodal Vision & Script Synthesis)</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">Model: gemini-2.5-flash</span>
            </div>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500 font-mono">
              Powers automated game screenshot analysis, inventory detection & viral hook writing.
            </p>
          </div>

          {/* ElevenLabs API Key */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span>ElevenLabs API Key (Optional High-Tier Voice Clone)</span>
            </label>
            <input
              type="password"
              value={elevenLabsApiKey}
              onChange={(e) => setElevenLabsApiKey(e.target.value)}
              placeholder="xi-api-key..."
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500 font-mono">
              Free high-speed Edge-TTS is built-in by default. ElevenLabs is optional for custom voice clones.
            </p>
          </div>

          {/* Export Directory */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Storage Pool</span>
            </span>
            <p className="text-xs font-mono text-emerald-400">/outer/Downloads/DFLTikTokGaming</p>
          </div>

          {/* Save Bar */}
          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings saved successfully!</span>
              </span>
            ) : <div />}

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Configuration</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
