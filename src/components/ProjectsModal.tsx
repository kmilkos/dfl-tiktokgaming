import React, { useState } from 'react';
import {
  X,
  FolderKanban,
  Trash2,
  Video,
  Clock,
  CheckCircle2,
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  Play,
  Mic,
  Copy,
} from 'lucide-react';
import { GamingProject, GamingScriptItem } from '../types';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: GamingProject[];
  currentProjectId: string | null;
  currentScriptId: string | null;
  onSelectProject: (projectId: string, scriptId?: string) => void;
  onDeleteProject: (projectId: string) => void;
  onAddScriptToProject: (projectId: string) => void;
  onDeleteScriptFromProject: (projectId: string, scriptId: string) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  currentScriptId,
  onSelectProject,
  onDeleteProject,
  onAddScriptToProject,
  onDeleteScriptFromProject,
}) => {
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const p of projects) initial[p.id] = true;
    return initial;
  });

  if (!isOpen) return null;

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Gaming Projects & Series Library</h2>
              <p className="text-xs text-slate-400 font-mono">
                {projects.length} Project Series • {projects.reduce((acc, p) => acc + (p.scripts?.length || 0), 0)} Total Scripts
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

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3.5">
          {projects.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-mono text-xs">
              No saved gaming projects found. Click "New Project" to create one!
            </div>
          ) : (
            projects.map((p) => {
              const isCurrent = p.id === currentProjectId;
              const isExpanded = expandedProjects[p.id] ?? true;
              const totalScripts = p.scripts?.length || 0;
              const renderedCount = p.scripts?.filter((s) => s.status === 'rendered').length || 0;

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isCurrent
                      ? 'bg-slate-950 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Project Series Header */}
                  <div
                    onClick={() => {
                      onSelectProject(p.id);
                      onClose();
                    }}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(p.id, e)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                            {p.gameTitle}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(p.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white truncate">{p.title}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                        {totalScripts} {totalScripts === 1 ? 'Script' : 'Scripts'}
                        {renderedCount > 0 && (
                          <span className="text-emerald-400 font-bold ml-1.5">({renderedCount} ✓)</span>
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddScriptToProject(p.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 text-xs font-bold font-mono flex items-center gap-1 cursor-pointer transition-colors"
                        title="Add new script to this project series"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Script</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(p.id);
                        }}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
                        title="Delete entire project series"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Nested Scripts List */}
                  {isExpanded && p.scripts && p.scripts.length > 0 && (
                    <div className="border-t border-slate-800/60 bg-slate-950/40 p-3 space-y-1.5">
                      {p.scripts.map((s, sIdx) => {
                        const isScriptActive = p.id === currentProjectId && s.id === currentScriptId;

                        return (
                          <div
                            key={s.id}
                            onClick={() => {
                              onSelectProject(p.id, s.id);
                              onClose();
                            }}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isScriptActive
                                ? 'bg-slate-900 border-emerald-500/70 text-white shadow-sm'
                                : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/40'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-mono text-[10px] text-slate-500 font-bold w-5">
                                #{sIdx + 1}
                              </span>

                              <div className="w-8 h-10 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-600">
                                {s.image ? (
                                  <img src={s.image.url} alt={s.title} className="w-full h-full object-cover" />
                                ) : (
                                  <FileText className="w-4 h-4" />
                                )}
                              </div>

                              <div className="min-w-0 space-y-0.5">
                                <h4 className="text-xs font-bold text-slate-200 truncate">{s.title}</h4>
                                <p className="text-[10px] text-slate-400 line-clamp-1 font-mono">
                                  {s.script?.spokenText || s.context.topic || 'Draft script'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {s.status === 'rendered' ? (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Rendered</span>
                                </span>
                              ) : s.status === 'voiced' ? (
                                <span className="px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-[10px] font-mono font-bold flex items-center gap-1">
                                  <Mic className="w-3 h-3" />
                                  <span>Voiced</span>
                                </span>
                              ) : s.status === 'scripted' ? (
                                <span className="px-2 py-0.5 rounded-md bg-yellow-950/80 border border-yellow-800/60 text-yellow-400 text-[10px] font-mono font-bold flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  <span>Scripted</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono">
                                  Draft
                                </span>
                              )}

                              {p.scripts.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteScriptFromProject(p.id, s.id);
                                  }}
                                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                                  title="Delete script"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
