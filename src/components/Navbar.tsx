import React from 'react';
import { Gamepad2, Sparkles, FolderKanban, Settings, Plus, Play, ChevronDown, Video } from 'lucide-react';
import { GameProfile, GamingProject } from '../types';

interface NavbarProps {
  currentProject: GamingProject | null;
  activeGame: GameProfile;
  onOpenGameSelector: () => void;
  onNewProject: () => void;
  onOpenProjects: () => void;
  onOpenSettings: () => void;
  isRendering?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  activeGame,
  onOpenGameSelector,
  onNewProject,
  onOpenProjects,
  onOpenSettings,
  isRendering,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="w-full mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                  <span>DFL TIKTOK GAMING</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-[10px] font-mono uppercase tracking-widest font-bold">
                    9:16 Suite
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Survival, Crafting & Automation Viral Scriptcraft
              </p>
            </div>
          </div>

          {/* Active Game Switcher Badge */}
          <button
            onClick={onOpenGameSelector}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-emerald-500/60 text-xs font-bold transition-all shadow-md cursor-pointer group"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 group-hover:text-emerald-300 font-mono">{activeGame.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>

        {/* Project Title / Status */}
        {currentProject && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-xl max-w-sm">
            <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Active Project:</span>
            <span className="text-xs font-semibold text-slate-200 truncate">{currentProject.title}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onNewProject}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Script</span>
          </button>

          <button
            onClick={onOpenProjects}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <FolderKanban className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Library</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 cursor-pointer"
            title="Settings & API Keys"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
