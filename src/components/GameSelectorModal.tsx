import React from 'react';
import { X, Gamepad2, Check, Sparkles, Flame, Wrench, Shield, Compass } from 'lucide-react';
import { GameProfile } from '../types';

interface GameSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: GameProfile[];
  selectedGameId: string;
  onSelectGame: (game: GameProfile) => void;
}

export const GameSelectorModal: React.FC<GameSelectorModalProps> = ({
  isOpen,
  onClose,
  games,
  selectedGameId,
  onSelectGame,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Select Game Preset</h2>
              <p className="text-xs text-slate-400 font-mono">
                Pre-tuned with game mechanics, lore terminology, and viral hook formulas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Games Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {games.map((game) => {
            const isSelected = game.id === selectedGameId;
            return (
              <div
                key={game.id}
                onClick={() => {
                  onSelectGame(game);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group ${
                  isSelected
                    ? 'bg-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {game.badge}
                  </span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Title & Lore */}
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                    {game.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {game.loreSnippet}
                  </p>
                </div>

                {/* Key Mechanics Pill Tags */}
                <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/60">
                  {game.keyMechanics.slice(0, 3).map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-mono"
                    >
                      {m.split('(')[0].trim()}
                    </span>
                  ))}
                  {game.keyMechanics.length > 3 && (
                    <span className="px-1.5 py-0.5 text-[9px] text-slate-500 font-mono">
                      +{game.keyMechanics.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
