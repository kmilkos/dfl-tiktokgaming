import fs from 'fs';
import path from 'path';
import { GamingProject } from '../types.js';
import { getGameProfile } from '../data/games.js';

const DATA_FILE = path.join(process.cwd(), 'data', 'projects.json');

export class ProjectManager {
  private projects: Map<string, GamingProject> = new Map();

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const list: GamingProject[] = JSON.parse(raw);
        for (const p of list) {
          this.projects.set(p.id, p);
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

    const project: GamingProject = {
      id,
      title: initial?.title || `${gameProfile.name} Pro Guide`,
      gameId,
      gameTitle: gameProfile.name,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      context: {
        gameId,
        gameTitle: gameProfile.name,
        contentType: initial?.context?.contentType || 'factory_math',
        topic: initial?.context?.topic || '',
        lore: initial?.context?.lore || '',
        keyFacts: initial?.context?.keyFacts || '',
        targetDuration: initial?.context?.targetDuration || 30,
        hookStyle: initial?.context?.hookStyle || 'warning_mistake',
        tone: initial?.context?.tone || 'energetic_hype',
        audience: initial?.context?.audience || 'Gamers & Builders',
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
      ...(initial || {}),
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
}

export const projectManager = new ProjectManager();
