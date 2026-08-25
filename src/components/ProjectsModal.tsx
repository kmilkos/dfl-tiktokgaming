import React from 'react';
import { X, FolderKanban, Trash2, Video, Clock, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { GamingProject } from '../types';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: GamingProject[];
  currentProjectId: string | null;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onSelectProject,
  onDeleteProject,
}) => {
  if (!isOpen) return null;

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
              <h2 className="text-lg font-bold text-white">Gaming Shorts Library</h2>
              <p className="text-xs text-slate-400 font-mono">
                {projects.length} TikTok projects saved locally
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
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
          {projects.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-mono text-xs">
              No saved gaming projects found. Click "New Script" to create one!
            </div>
          ) : (
            projects.map((p) => {
              const isCurrent = p.id === currentProjectId;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p.id);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCurrent
                      ? 'bg-slate-950 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-600">
                      {p.image ? (
                        <img src={p.image.url} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                          {p.gameTitle}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(p.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white truncate">{p.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {p.script?.spokenText || p.context.topic || 'Draft project'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                    {p.renderedVideoUrl ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Rendered</span>
                      </span>
                    ) : p.voice.audioUrl ? (
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-mono font-bold">
                        Voiced
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono">
                        Draft
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(p.id);
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
