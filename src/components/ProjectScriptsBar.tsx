import React, { useState } from 'react';
import {
  Plus,
  FileText,
  CheckCircle2,
  Mic,
  Video,
  Copy,
  Trash2,
  ChevronRight,
  Sparkles,
  Edit2,
  Check,
} from 'lucide-react';
import { GamingProject, GamingScriptItem } from '../types';

interface ProjectScriptsBarProps {
  project: GamingProject;
  activeScript: GamingScriptItem;
  onSelectScript: (scriptId: string) => void;
  onAddScript: () => void;
  onDuplicateScript: (scriptId: string) => void;
  onDeleteScript: (scriptId: string) => void;
  onUpdateProjectTitle: (newTitle: string) => void;
  onUpdateScriptTitle: (scriptId: string, newTitle: string) => void;
}

export const ProjectScriptsBar: React.FC<ProjectScriptsBarProps> = ({
  project,
  activeScript,
  onSelectScript,
  onAddScript,
  onDuplicateScript,
  onDeleteScript,
  onUpdateProjectTitle,
  onUpdateScriptTitle,
}) => {
  const [isEditingProjectTitle, setIsEditingProjectTitle] = useState(false);
  const [projectTitleInput, setProjectTitleInput] = useState(project.title);
  const [editingScriptId, setEditingScriptId] = useState<string | null>(null);
  const [scriptTitleInput, setScriptTitleInput] = useState('');

  const handleSaveProjectTitle = () => {
    if (projectTitleInput.trim()) {
      onUpdateProjectTitle(projectTitleInput.trim());
    }
    setIsEditingProjectTitle(false);
  };

  const handleSaveScriptTitle = (id: string) => {
    if (scriptTitleInput.trim()) {
      onUpdateScriptTitle(id, scriptTitleInput.trim());
    }
    setEditingScriptId(null);
  };

  return (
    <div className="w-full bg-slate-950/90 border-b border-slate-800 px-4 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
      
      {/* Left: Project / Series Name & Total Count */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-mono uppercase font-bold text-slate-400">
            Project Series:
          </span>
        </div>

        {isEditingProjectTitle ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={projectTitleInput}
              onChange={(e) => setProjectTitleInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveProjectTitle()}
              autoFocus
              className="px-2.5 py-1 bg-slate-900 border border-emerald-500 rounded-lg text-xs font-extrabold text-white focus:outline-none"
            />
            <button
              onClick={handleSaveProjectTitle}
              className="p-1 rounded-md bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => {
              setProjectTitleInput(project.title);
              setIsEditingProjectTitle(true);
            }}
            className="flex items-center gap-1.5 cursor-pointer group"
            title="Click to rename project series"
          >
            <h2 className="text-xs sm:text-sm font-extrabold text-white group-hover:text-emerald-400 transition-colors truncate">
              {project.title}
            </h2>
            <Edit2 className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all" />
          </div>
        )}

        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
          {project.scripts.length} {project.scripts.length === 1 ? 'Script' : 'Scripts'}
        </span>
      </div>

      {/* Right: Interactive Horizontal Scripts Tabs List */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        
        {project.scripts.map((s, idx) => {
          const isActive = s.id === activeScript.id;
          const isEditingThis = editingScriptId === s.id;

          return (
            <div
              key={s.id}
              onClick={() => onSelectScript(s.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex-shrink-0 group ${
                isActive
                  ? 'bg-slate-900 border-emerald-500/80 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {/* Script Number & Status Icon */}
              <span className="font-mono text-[10px] text-slate-500 font-bold">
                #{idx + 1}
              </span>

              {/* Status Badge Icon */}
              {s.status === 'rendered' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              ) : s.status === 'voiced' ? (
                <Mic className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              ) : s.status === 'scripted' ? (
                <FileText className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-600 flex-shrink-0" />
              )}

              {/* Title / Inline Rename */}
              {isEditingThis ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1"
                >
                  <input
                    type="text"
                    value={scriptTitleInput}
                    onChange={(e) => setScriptTitleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveScriptTitle(s.id)}
                    autoFocus
                    className="px-1.5 py-0.5 bg-slate-950 border border-emerald-500 rounded text-xs text-white focus:outline-none w-32"
                  />
                  <button
                    onClick={() => handleSaveScriptTitle(s.id)}
                    className="p-0.5 text-emerald-400 hover:text-emerald-300"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setScriptTitleInput(s.title);
                    setEditingScriptId(s.id);
                  }}
                  className="truncate max-w-[140px]"
                  title="Double click to rename"
                >
                  {s.title}
                </span>
              )}

              {/* Quick Script Action Buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateScript(s.id);
                  }}
                  className="p-0.5 text-slate-500 hover:text-cyan-400 transition-colors"
                  title="Duplicate Script"
                >
                  <Copy className="w-3 h-3" />
                </button>

                {project.scripts.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteScript(s.id);
                    }}
                    className="p-0.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Script"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Script Button */}
        <button
          type="button"
          onClick={onAddScript}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 shadow-sm"
          title="Add a new script / short to this project series"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Script</span>
        </button>

      </div>

    </div>
  );
};
