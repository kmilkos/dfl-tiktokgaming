import { GameProfile, GamingProject, GamingScriptItem, ProjectContext, ProjectScript, VoiceOption, SystemConfig } from '../types';

const BASE_URL = '/api';

export async function fetchGames(): Promise<GameProfile[]> {
  const res = await fetch(`${BASE_URL}/games`);
  return res.json();
}

export async function fetchVoices(): Promise<VoiceOption[]> {
  const res = await fetch(`${BASE_URL}/voices`);
  return res.json();
}

export async function fetchProjects(): Promise<GamingProject[]> {
  const res = await fetch(`${BASE_URL}/projects`);
  return res.json();
}

export async function fetchProject(id: string): Promise<GamingProject> {
  const res = await fetch(`${BASE_URL}/projects/${id}`);
  return res.json();
}

export async function createProject(data?: Partial<GamingProject>): Promise<GamingProject> {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {}),
  });
  return res.json();
}

export async function updateProject(id: string, updates: Partial<GamingProject>): Promise<GamingProject> {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deleteProject(id: string): Promise<{ ok: boolean }> {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function addScriptToProject(
  projectId: string,
  data?: Partial<GamingScriptItem>
): Promise<{ success: boolean; script: GamingScriptItem; project: GamingProject }> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/scripts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {}),
  });
  return res.json();
}

export async function updateScriptInProject(
  projectId: string,
  scriptId: string,
  updates: Partial<GamingScriptItem>
): Promise<{ success: boolean; script: GamingScriptItem; project: GamingProject }> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/scripts/${scriptId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deleteScriptFromProject(
  projectId: string,
  scriptId: string
): Promise<{ ok: boolean; project: GamingProject }> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/scripts/${scriptId}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function duplicateScriptInProject(
  projectId: string,
  scriptId: string
): Promise<{ success: boolean; script: GamingScriptItem; project: GamingProject }> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/scripts/${scriptId}/duplicate`, {
    method: 'POST',
  });
  return res.json();
}

export async function setActiveScript(projectId: string, scriptId: string): Promise<GamingProject> {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/active-script/${scriptId}`, {
    method: 'PUT',
  });
  return res.json();
}

export async function uploadScreenshot(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('screenshot', file);
  const res = await fetch(`${BASE_URL}/upload/screenshot`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function uploadScreenshotBase64(filename: string, data: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/upload/image-base64`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, data }),
  });
  return res.json();
}

export async function uploadImageUrl(url: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/upload/image-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return res.json();
}

export async function fetchImagePresets(): Promise<Record<string, { label: string; prompt: string; type?: string }[]>> {
  const res = await fetch(`${BASE_URL}/image/presets`);
  return res.json();
}

import { QuotaErrorInfo } from '../utils/quotaParser';

export class ApiError extends Error {
  public quotaInfo?: QuotaErrorInfo;
  public status?: number;

  constructor(message: string, quotaInfo?: QuotaErrorInfo, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.quotaInfo = quotaInfo;
    this.status = status;
  }
}

export async function generateGameImage(
  prompt: string,
  gameId?: string,
  styleMode: 'infographic' | 'cinematic' = 'infographic',
  enhanceWithAI = true,
  engine: 'procedural' | 'flux' | 'turbo' = 'procedural'
): Promise<any> {
  const res = await fetch(`${BASE_URL}/generate/image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, gameId, styleMode, enhanceWithAI, engine }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.error || 'Failed to generate AI gaming image', err.quotaInfo, res.status);
  }
  return res.json();
}

export async function generateGamingScript(
  imagePath: string | undefined,
  context: ProjectContext,
  apiKey?: string
): Promise<{ script: ProjectScript; detectedElements: string[]; visualVibe: string }> {
  const res = await fetch(`${BASE_URL}/generate/script`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imagePath, context, apiKey }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.error || 'Failed to generate script', err.quotaInfo, res.status);
  }
  return res.json();
}

export async function generateTTS(
  text: string,
  voiceId: string,
  engine: 'edge-tts' | 'elevenlabs' = 'edge-tts',
  speed = 1.05,
  phoneticOverrides: Record<string, string> = {}
): Promise<{ audioPath: string; audioUrl: string; durationSeconds: number }> {
  const res = await fetch(`${BASE_URL}/generate/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId, engine, speed, phoneticOverrides }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.error || 'Failed to synthesize TTS voice', err.quotaInfo, res.status);
  }
  return res.json();
}

export async function renderVideo(project: GamingProject): Promise<{ outputPath: string; videoUrl: string; sizeBytes: number; durationSeconds: number }> {
  const res = await fetch(`${BASE_URL}/render/video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.error || 'Failed to render 9:16 video', err.quotaInfo, res.status);
  }
  return res.json();
}

export async function fetchConfig(): Promise<SystemConfig> {
  const res = await fetch(`${BASE_URL}/config`);
  return res.json();
}

export async function saveConfig(cfg: Partial<SystemConfig>): Promise<SystemConfig> {
  const res = await fetch(`${BASE_URL}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg),
  });
  return res.json();
}
