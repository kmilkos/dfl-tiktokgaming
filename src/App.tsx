import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProjectScriptsBar } from './components/ProjectScriptsBar';
import { GamingContextPane } from './components/GamingContextPane';
import { ScriptStudioPane } from './components/ScriptStudioPane';
import { GamingPreviewPane } from './components/GamingPreviewPane';
import { GameSelectorModal } from './components/GameSelectorModal';
import { ProjectsModal } from './components/ProjectsModal';
import { SettingsModal } from './components/SettingsModal';
import { GameProfile, GamingProject, GamingScriptItem, VoiceOption } from './types';
import {
  fetchGames,
  fetchVoices,
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  addScriptToProject,
  updateScriptInProject,
  deleteScriptFromProject,
  duplicateScriptInProject,
  setActiveScript,
  generateGamingScript,
  generateTTS,
  renderVideo,
} from './services/api';
import { GAME_PROFILES } from './data/games';

export const App: React.FC = () => {
  const [games, setGames] = useState<GameProfile[]>(GAME_PROFILES);
  const [activeGame, setActiveGame] = useState<GameProfile>(GAME_PROFILES[0]);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [projects, setProjects] = useState<GamingProject[]>([]);
  const [currentProject, setCurrentProject] = useState<GamingProject | null>(null);

  // Modals
  const [isGameSelectorOpen, setIsGameSelectorOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Loading States
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState(false);
  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  // Load initial data
  useEffect(() => {
    fetchGames().then((g) => {
      if (g.length > 0) setGames(g);
    }).catch(() => {});

    fetchVoices().then(setVoices).catch(() => {});

    fetchProjects().then((projs) => {
      setProjects(projs);
      if (projs.length > 0) {
        setCurrentProject(projs[0]);
        const matchGame = GAME_PROFILES.find((g) => g.id === projs[0].gameId);
        if (matchGame) setActiveGame(matchGame);
      } else {
        handleNewProjectSeries(GAME_PROFILES[0]);
      }
    }).catch(() => {
      handleNewProjectSeries(GAME_PROFILES[0]);
    });
  }, []);

  // Compute Active Script
  const activeScript: GamingScriptItem | null = currentProject
    ? currentProject.scripts.find((s) => s.id === currentProject.activeScriptId) || currentProject.scripts[0] || null
    : null;

  // Project Series Operations
  const handleNewProjectSeries = async (game = activeGame) => {
    try {
      const newProj = await createProject({
        gameId: game.id,
        gameTitle: game.name,
        title: `${game.name} Pro Series`,
      });
      setCurrentProject(newProj);
      setActiveGame(game);
      setProjects((prev) => [newProj, ...prev]);
    } catch (err) {
      console.error('Error creating project series:', err);
    }
  };

  const handleSelectGame = (game: GameProfile) => {
    setActiveGame(game);
    if (currentProject) {
      const updated = {
        ...currentProject,
        gameId: game.id,
        gameTitle: game.name,
        scripts: currentProject.scripts.map((s) => ({
          ...s,
          context: { ...s.context, gameId: game.id, gameTitle: game.name },
        })),
      };
      setCurrentProject(updated);
      updateProject(currentProject.id, {
        gameId: game.id,
        gameTitle: game.name,
        scripts: updated.scripts,
      });
      setProjects((prev) => prev.map((p) => (p.id === currentProject.id ? updated : p)));
    }
  };

  const handleUpdateProjectTitle = async (newTitle: string) => {
    if (!currentProject) return;
    const updated = { ...currentProject, title: newTitle };
    setCurrentProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === currentProject.id ? updated : p)));
    try {
      await updateProject(currentProject.id, { title: newTitle });
    } catch (err) {
      console.error('Error updating project title:', err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      const remaining = projects.filter((p) => p.id !== id);
      setProjects(remaining);
      if (currentProject?.id === id) {
        if (remaining.length > 0) {
          setCurrentProject(remaining[0]);
          const g = GAME_PROFILES.find((x) => x.id === remaining[0].gameId);
          if (g) setActiveGame(g);
        } else {
          handleNewProjectSeries();
        }
      }
    } catch (err) {
      console.error('Error deleting project series:', err);
    }
  };

  // Script-Level Operations
  const handleSelectScript = async (scriptId: string) => {
    if (!currentProject) return;
    const updated = { ...currentProject, activeScriptId: scriptId };
    setCurrentProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === currentProject.id ? updated : p)));
    try {
      await setActiveScript(currentProject.id, scriptId);
    } catch (err) {
      console.error('Error setting active script:', err);
    }
  };

  const handleAddScript = async (projectId = currentProject?.id) => {
    if (!projectId) return;
    try {
      const res = await addScriptToProject(projectId);
      if (res.success && res.project) {
        setCurrentProject(res.project);
        setProjects((prev) => prev.map((p) => (p.id === projectId ? res.project : p)));
      }
    } catch (err) {
      console.error('Error adding script:', err);
    }
  };

  const handleDuplicateScript = async (scriptId: string) => {
    if (!currentProject) return;
    try {
      const res = await duplicateScriptInProject(currentProject.id, scriptId);
      if (res.success && res.project) {
        setCurrentProject(res.project);
        setProjects((prev) => prev.map((p) => (p.id === currentProject.id ? res.project : p)));
      }
    } catch (err) {
      console.error('Error duplicating script:', err);
    }
  };

  const handleDeleteScript = async (projectId: string, scriptId: string) => {
    try {
      const res = await deleteScriptFromProject(projectId, scriptId);
      if (res.ok && res.project) {
        setCurrentProject(res.project);
        setProjects((prev) => prev.map((p) => (p.id === projectId ? res.project : p)));
      }
    } catch (err: any) {
      alert(`Delete Script: ${err.message || err}`);
    }
  };

  const handleUpdateScriptTitle = async (scriptId: string, newTitle: string) => {
    if (!currentProject) return;
    handleUpdateActiveScript({ title: newTitle });
  };

  const handleUpdateActiveScript = async (updates: Partial<GamingScriptItem>) => {
    if (!currentProject || !activeScript) return;
    const updatedScript = { ...activeScript, ...updates, updatedAt: new Date().toISOString() };
    const updatedProject = {
      ...currentProject,
      scripts: currentProject.scripts.map((s) => (s.id === activeScript.id ? updatedScript : s)),
    };
    setCurrentProject(updatedProject);
    setProjects((prev) => prev.map((p) => (p.id === currentProject.id ? updatedProject : p)));

    try {
      await updateScriptInProject(currentProject.id, activeScript.id, updates);
    } catch (err) {
      console.error('Error updating script:', err);
    }
  };

  // Generation & Voice Actions for Active Script
  const handleGenerateScript = async () => {
    if (!currentProject || !activeScript) return;
    try {
      setIsGeneratingScript(true);
      const res = await generateGamingScript(
        activeScript.image?.path,
        activeScript.context
      );
      handleUpdateActiveScript({
        script: res.script,
        detectedElements: res.detectedElements,
        visualVibe: res.visualVibe,
        status: 'scripted',
        title: activeScript.context.topic || res.script.hook.slice(0, 30) || activeScript.title,
      });
    } catch (err: any) {
      alert(`Script Generation Failed: ${err.message || err}`);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleSynthesizeAudio = async () => {
    if (!currentProject || !activeScript || !activeScript.script?.spokenText) return;
    try {
      setIsSynthesizingAudio(true);
      const res = await generateTTS(
        activeScript.script.spokenText,
        activeScript.voice.voiceId,
        activeScript.voice.engine,
        activeScript.voice.speed,
        activeScript.script.phoneticOverrides
      );
      handleUpdateActiveScript({
        voice: {
          ...activeScript.voice,
          audioPath: res.audioPath,
          audioUrl: res.audioUrl,
          durationSeconds: res.durationSeconds,
        },
        status: 'voiced',
      });
    } catch (err: any) {
      alert(`Voice Synthesis Failed: ${err.message || err}`);
    } finally {
      setIsSynthesizingAudio(false);
    }
  };

  const handleRenderVideo = async () => {
    if (!currentProject || !activeScript) return;
    try {
      setIsRenderingVideo(true);
      setRenderProgress(15);
      const res = await renderVideo({
        ...activeScript,
        gameId: currentProject.gameId,
        gameTitle: currentProject.gameTitle,
      } as any);
      setRenderProgress(100);
      handleUpdateActiveScript({
        renderedVideoPath: res.outputPath,
        renderedVideoUrl: res.videoUrl,
        status: 'rendered',
      });
    } catch (err: any) {
      alert(`Video Rendering Failed: ${err.message || err}`);
    } finally {
      setIsRenderingVideo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Navigation Header */}
      <Navbar
        currentProject={currentProject}
        activeScriptTitle={activeScript?.title}
        activeGame={activeGame}
        onOpenGameSelector={() => setIsGameSelectorOpen(true)}
        onNewProjectSeries={() => handleNewProjectSeries(activeGame)}
        onOpenProjects={() => setIsProjectsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isRendering={isRenderingVideo}
      />

      {/* Project Series & Nested Scripts Bar */}
      {currentProject && activeScript && (
        <ProjectScriptsBar
          project={currentProject}
          activeScript={activeScript}
          onSelectScript={handleSelectScript}
          onAddScript={() => handleAddScript(currentProject.id)}
          onDuplicateScript={handleDuplicateScript}
          onDeleteScript={(sId) => handleDeleteScript(currentProject.id, sId)}
          onUpdateProjectTitle={handleUpdateProjectTitle}
          onUpdateScriptTitle={handleUpdateScriptTitle}
        />
      )}

      {/* Main 3-Column Workstation Layout */}
      {currentProject && activeScript ? (
        <main className="flex-1 w-full mx-auto px-4 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-9.5rem)]">
            
            {/* Column 1: Context & Ingestion (4 cols) */}
            <div className="lg:col-span-4 h-full">
              <GamingContextPane
                scriptItem={activeScript}
                activeGame={activeGame}
                onUpdateContext={(ctx) =>
                  handleUpdateActiveScript({ context: { ...activeScript.context, ...ctx } })
                }
                onUpdateImage={(img) => handleUpdateActiveScript({ image: img })}
                onGenerateScript={handleGenerateScript}
                isGeneratingScript={isGeneratingScript}
              />
            </div>

            {/* Column 2: Scriptcraft & Voice Studio (4 cols) */}
            <div className="lg:col-span-4 h-full">
              <ScriptStudioPane
                scriptItem={activeScript}
                voices={voices}
                onUpdateScript={(s) =>
                  handleUpdateActiveScript({ script: { ...activeScript.script!, ...s } })
                }
                onUpdateVoice={(v) =>
                  handleUpdateActiveScript({ voice: { ...activeScript.voice, ...v } })
                }
                onSynthesizeAudio={handleSynthesizeAudio}
                isSynthesizingAudio={isSynthesizingAudio}
              />
            </div>

            {/* Column 3: 9:16 Video & Preview (4 cols) */}
            <div className="lg:col-span-4 h-full">
              <GamingPreviewPane
                scriptItem={activeScript}
                onUpdateMotion={(m) =>
                  handleUpdateActiveScript({ motion: { ...activeScript.motion, ...m } })
                }
                onUpdateCaptions={(c) =>
                  handleUpdateActiveScript({ captions: { ...activeScript.captions, ...c } })
                }
                onRenderVideo={handleRenderVideo}
                isRenderingVideo={isRenderingVideo}
                renderProgress={renderProgress}
              />
            </div>

          </div>
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      )}

      {/* Modals */}
      <GameSelectorModal
        isOpen={isGameSelectorOpen}
        onClose={() => setIsGameSelectorOpen(false)}
        games={games}
        selectedGameId={activeGame.id}
        onSelectGame={handleSelectGame}
      />

      <ProjectsModal
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        projects={projects}
        currentProjectId={currentProject?.id || null}
        currentScriptId={activeScript?.id || null}
        onSelectProject={(projId, scriptId) => {
          const p = projects.find((x) => x.id === projId);
          if (p) {
            const updated = scriptId ? { ...p, activeScriptId: scriptId } : p;
            setCurrentProject(updated);
            const g = GAME_PROFILES.find((x) => x.id === p.gameId);
            if (g) setActiveGame(g);
          }
        }}
        onDeleteProject={handleDeleteProject}
        onAddScriptToProject={(projId) => handleAddScript(projId)}
        onDeleteScriptFromProject={handleDeleteScript}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>
  );
};
