import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GamingContextPane } from './components/GamingContextPane';
import { ScriptStudioPane } from './components/ScriptStudioPane';
import { GamingPreviewPane } from './components/GamingPreviewPane';
import { GameSelectorModal } from './components/GameSelectorModal';
import { ProjectsModal } from './components/ProjectsModal';
import { SettingsModal } from './components/SettingsModal';
import { GameProfile, GamingProject, VoiceOption } from './types';
import {
  fetchGames,
  fetchVoices,
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
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
        handleNewProject(GAME_PROFILES[0]);
      }
    }).catch(() => {
      handleNewProject(GAME_PROFILES[0]);
    });
  }, []);

  const handleNewProject = async (game = activeGame) => {
    try {
      const newProj = await createProject({
        gameId: game.id,
        gameTitle: game.name,
      });
      setCurrentProject(newProj);
      setActiveGame(game);
      setProjects((prev) => [newProj, ...prev]);
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  const handleSelectGame = (game: GameProfile) => {
    setActiveGame(game);
    if (currentProject) {
      handleUpdateProject({
        gameId: game.id,
        gameTitle: game.name,
        context: {
          ...currentProject.context,
          gameId: game.id,
          gameTitle: game.name,
        },
      });
    }
  };

  const handleUpdateProject = async (updates: Partial<GamingProject>) => {
    if (!currentProject) return;
    const updated = { ...currentProject, ...updates };
    setCurrentProject(updated);
    try {
      await updateProject(currentProject.id, updates);
      setProjects((prev) => prev.map((p) => (p.id === currentProject.id ? { ...p, ...updates } : p)));
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  const handleGenerateScript = async () => {
    if (!currentProject) return;
    try {
      setIsGeneratingScript(true);
      const res = await generateGamingScript(
        currentProject.image?.path,
        currentProject.context
      );
      handleUpdateProject({
        script: res.script,
        detectedElements: res.detectedElements,
        visualVibe: res.visualVibe,
        status: 'scripted',
      });
    } catch (err: any) {
      alert(`Script Generation Failed: ${err.message || err}`);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleSynthesizeAudio = async () => {
    if (!currentProject || !currentProject.script?.spokenText) return;
    try {
      setIsSynthesizingAudio(true);
      const res = await generateTTS(
        currentProject.script.spokenText,
        currentProject.voice.voiceId,
        currentProject.voice.engine,
        currentProject.voice.speed,
        currentProject.script.phoneticOverrides
      );
      handleUpdateProject({
        voice: {
          ...currentProject.voice,
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
    if (!currentProject) return;
    try {
      setIsRenderingVideo(true);
      setRenderProgress(10);
      const res = await renderVideo(currentProject);
      setRenderProgress(100);
      handleUpdateProject({
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

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (currentProject?.id === id) {
        const remaining = projects.filter((p) => p.id !== id);
        if (remaining.length > 0) {
          setCurrentProject(remaining[0]);
        } else {
          handleNewProject();
        }
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Navigation Header */}
      <Navbar
        currentProject={currentProject}
        activeGame={activeGame}
        onOpenGameSelector={() => setIsGameSelectorOpen(true)}
        onNewProject={() => handleNewProject(activeGame)}
        onOpenProjects={() => setIsProjectsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isRendering={isRenderingVideo}
      />

      {/* Main 3-Column Workstation Layout */}
      {currentProject ? (
        <main className="flex-1 w-full mx-auto px-4 lg:px-8 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-6rem)]">
            
            {/* Column 1: Context & Ingestion (3.5 cols) */}
            <div className="lg:col-span-4 h-full">
              <GamingContextPane
                project={currentProject}
                activeGame={activeGame}
                onUpdateContext={(ctx) =>
                  handleUpdateProject({ context: { ...currentProject.context, ...ctx } })
                }
                onUpdateImage={(img) => handleUpdateProject({ image: img })}
                onGenerateScript={handleGenerateScript}
                isGeneratingScript={isGeneratingScript}
              />
            </div>

            {/* Column 2: Scriptcraft & Voice Studio (4.5 cols) */}
            <div className="lg:col-span-4 h-full">
              <ScriptStudioPane
                project={currentProject}
                voices={voices}
                onUpdateScript={(s) =>
                  handleUpdateProject({ script: { ...currentProject.script!, ...s } })
                }
                onUpdateVoice={(v) =>
                  handleUpdateProject({ voice: { ...currentProject.voice, ...v } })
                }
                onSynthesizeAudio={handleSynthesizeAudio}
                isSynthesizingAudio={isSynthesizingAudio}
              />
            </div>

            {/* Column 3: 9:16 Video & Preview (4 cols) */}
            <div className="lg:col-span-4 h-full">
              <GamingPreviewPane
                project={currentProject}
                onUpdateMotion={(m) =>
                  handleUpdateProject({ motion: { ...currentProject.motion, ...m } })
                }
                onUpdateCaptions={(c) =>
                  handleUpdateProject({ captions: { ...currentProject.captions, ...c } })
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
        onSelectProject={(id) => {
          const p = projects.find((x) => x.id === id);
          if (p) {
            setCurrentProject(p);
            const g = GAME_PROFILES.find((x) => x.id === p.gameId);
            if (g) setActiveGame(g);
          }
        }}
        onDeleteProject={handleDeleteProject}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>
  );
};
