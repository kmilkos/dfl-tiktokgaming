import { GameProfile, GamingProject, ProjectContext, ProjectScript, VoiceOption, SystemConfig } from '../types';

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
    throw new Error(err.error || 'Failed to generate script');
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
    throw new Error(err.error || 'Failed to synthesize TTS voice');
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
    throw new Error(err.error || 'Failed to render 9:16 video');
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
