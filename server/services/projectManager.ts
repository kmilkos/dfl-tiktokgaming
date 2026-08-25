import fs from 'fs';
import path from 'path';
import { GamingProject, GamingScriptItem } from '../types.js';
import { getGameProfile } from '../data/games.js';

const DATA_FILE = path.join(process.cwd(), 'data', 'projects.json');

export class ProjectManager {
  private projects: Map<string, GamingProject> = new Map();

  constructor() {
    this.load();
  }

  private normalizeProject(raw: any): GamingProject {
    const gameId = raw.gameId || 'satisfactory';
    const gameProfile = getGameProfile(gameId);

    // If it already has scripts array, return normalized
    if (Array.isArray(raw.scripts) && raw.scripts.length > 0) {
      return {
        id: raw.id,
        title: raw.title || `${gameProfile.name} Pro Series`,
        gameId,
        gameTitle: raw.gameTitle || gameProfile.name,
        createdAt: raw.createdAt || new Date().toISOString(),
        updatedAt: raw.updatedAt || new Date().toISOString(),
        activeScriptId: raw.activeScriptId || raw.scripts[0].id,
        scripts: raw.scripts,
      };
    }

    // Auto-migrate single-script legacy format
    const scriptId = `script-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const migratedScript: GamingScriptItem = {
      id: scriptId,
      title: raw.context?.topic || raw.title || `${gameProfile.name} #1`,
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString(),
      status: raw.status || 'draft',
      context: raw.context || {
        gameId,
        gameTitle: gameProfile.name,
        contentType: 'factory_math',
        topic: raw.title || '',
        targetDuration: 30,
        hookStyle: 'warning_mistake',
        tone: 'energetic_hype',
      },
      image: raw.image,
      script: raw.script,
      voice: raw.voice || {
        voiceId: 'en-US-GuyNeural',
        engine: 'edge-tts',
        speed: 1.05,
      },
      motion: raw.motion || {
        style: 'ken_burns_zoom',
        focusPoint: { x: 0.5, y: 0.5 },
        zoomLevel: 1.25,
      },
      captions: raw.captions || {
        enabled: true,
        style: 'gaming_bold',
        uppercase: true,
      },
      detectedElements: raw.detectedElements,
      visualVibe: raw.visualVibe,
      renderedVideoPath: raw.renderedVideoPath,
      renderedVideoUrl: raw.renderedVideoUrl,
    };

    return {
      id: raw.id || `dfl-game-${Date.now()}`,
      title: raw.title || `${gameProfile.name} Pro Series`,
      gameId,
      gameTitle: raw.gameTitle || gameProfile.name,
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString(),
      activeScriptId: scriptId,
      scripts: [migratedScript],
    };
  }

  private load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const list: any[] = JSON.parse(raw);
        for (const p of list) {
          const normalized = this.normalizeProject(p);
          this.projects.set(normalized.id, normalized);
        }
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  }

  public save() {
    try {
      const list = Array.from(this.projects.values());
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving projects:', err);
    }
  }

  public getProjects(): GamingProject[] {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public getProject(id: string): GamingProject | undefined {
    return this.projects.get(id);
  }

  public createProject(initial?: Partial<GamingProject>): GamingProject {
    const id = `dfl-game-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date().toISOString();
    const gameId = initial?.gameId || 'satisfactory';
    const gameProfile = getGameProfile(gameId);

    const scriptId = `script-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const defaultScript: GamingScriptItem = {
      id: scriptId,
      title: `${gameProfile.name} Short #1`,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      context: {
        gameId,
        gameTitle: gameProfile.name,
        contentType: 'factory_math',
        topic: '',
        targetDuration: 30,
        hookStyle: 'warning_mistake',
        tone: 'energetic_hype',
      },
      voice: {
        voiceId: 'en-US-GuyNeural',
        engine: 'edge-tts',
        speed: 1.05,
      },
      motion: {
        style: 'ken_burns_zoom',
        focusPoint: { x: 0.5, y: 0.5 },
        zoomLevel: 1.25,
      },
      captions: {
        enabled: true,
        style: 'gaming_bold',
        uppercase: true,
      },
    };

    const project: GamingProject = {
      id,
      title: initial?.title || `${gameProfile.name} Pro Series`,
      gameId,
      gameTitle: gameProfile.name,
      createdAt: now,
      updatedAt: now,
      activeScriptId: scriptId,
      scripts: [defaultScript],
    };

    this.projects.set(id, project);
    this.save();
    return project;
  }

  public updateProject(id: string, updates: Partial<GamingProject>): GamingProject {
    const existing = this.projects.get(id);
    if (!existing) throw new Error(`Project ${id} not found`);

    const updated: GamingProject = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.projects.set(id, updated);
    this.save();
    return updated;
  }

  public deleteProject(id: string): boolean {
    const deleted = this.projects.delete(id);
    if (deleted) this.save();
    return deleted;
  }

  // --- Script Level Operations ---

  public addScriptToProject(projectId: string, initial?: Partial<GamingScriptItem>): GamingScriptItem {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    const now = new Date().toISOString();
    const scriptId = `script-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const gameProfile = getGameProfile(project.gameId);
    const count = project.scripts.length + 1;

    const newScript: GamingScriptItem = {
      id: scriptId,
      title: initial?.title || `${project.gameTitle} Short #${count}`,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      context: {
        gameId: project.gameId,
        gameTitle: project.gameTitle,
        contentType: initial?.context?.contentType || 'factory_math',
        topic: initial?.context?.topic || '',
        lore: initial?.context?.lore || '',
        keyFacts: initial?.context?.keyFacts || '',
        targetDuration: initial?.context?.targetDuration || 30,
        hookStyle: initial?.context?.hookStyle || 'warning_mistake',
        tone: initial?.context?.tone || 'energetic_hype',
        audience: initial?.context?.audience || 'Gamers & Builders',
      },
      voice: initial?.voice || {
        voiceId: 'en-US-GuyNeural',
        engine: 'edge-tts',
        speed: 1.05,
      },
      motion: initial?.motion || {
        style: 'ken_burns_zoom',
        focusPoint: { x: 0.5, y: 0.5 },
        zoomLevel: 1.25,
      },
      captions: initial?.captions || {
        enabled: true,
        style: 'gaming_bold',
        uppercase: true,
      },
      ...(initial || {}),
    };

    project.scripts.push(newScript);
    project.activeScriptId = scriptId;
    project.updatedAt = now;
    this.save();
    return newScript;
  }

  public updateScriptInProject(projectId: string, scriptId: string, updates: Partial<GamingScriptItem>): GamingScriptItem {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    const index = project.scripts.findIndex((s) => s.id === scriptId);
    if (index === -1) throw new Error(`Script ${scriptId} not found in project ${projectId}`);

    const existing = project.scripts[index];
    const updated: GamingScriptItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    project.scripts[index] = updated;
    project.updatedAt = new Date().toISOString();
    this.save();
    return updated;
  }

  public deleteScriptFromProject(projectId: string, scriptId: string): boolean {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    if (project.scripts.length <= 1) {
      throw new Error('A project must contain at least one script.');
    }

    const initialLen = project.scripts.length;
    project.scripts = project.scripts.filter((s) => s.id !== scriptId);

    if (project.scripts.length < initialLen) {
      if (project.activeScriptId === scriptId) {
        project.activeScriptId = project.scripts[0].id;
      }
      project.updatedAt = new Date().toISOString();
      this.save();
      return true;
    }

    return false;
  }

  public duplicateScriptInProject(projectId: string, scriptId: string): GamingScriptItem {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    const target = project.scripts.find((s) => s.id === scriptId);
    if (!target) throw new Error(`Script ${scriptId} not found`);

    const now = new Date().toISOString();
    const newId = `script-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const cloned: GamingScriptItem = {
      ...JSON.parse(JSON.stringify(target)),
      id: newId,
      title: `${target.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };

    project.scripts.push(cloned);
    project.activeScriptId = newId;
    project.updatedAt = now;
    this.save();
    return cloned;
  }
}

export const projectManager = new ProjectManager();
