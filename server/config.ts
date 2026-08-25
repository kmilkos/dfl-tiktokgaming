import fs from 'fs';
import path from 'path';

export interface GamingSuiteConfig {
  port: number;
  geminiApiKey: string;
  elevenLabsApiKey: string;
  defaultTtsEngine: 'edge-tts' | 'elevenlabs';
  defaultVoice: string;
  paths: {
    root: string;
    uploads: string;
    generated: string;
    exports: string;
    projects: string;
  };
  defaultSettings: {
    targetDuration: number;
    hookStyle: string;
    tone: string;
    fps: number;
    width: number;
    height: number;
  };
}

const CONFIG_FILE = path.join(process.cwd(), 'data', 'config.json');

function getInitialKeys(): { geminiKey: string; elevenLabsKey: string } {
  try {
    const candidateConfigs = [
      '/opt/edith-aivideo/data/config.json',
      '/opt/edith-916video/data/config.json',
      '/opt/mediamanager/data/config.json',
    ];
    for (const cPath of candidateConfigs) {
      if (fs.existsSync(cPath)) {
        const data = JSON.parse(fs.readFileSync(cPath, 'utf-8'));
        if (data.geminiApiKey) {
          return {
            geminiKey: data.geminiApiKey,
            elevenLabsKey: data.elevenLabsApiKey || '',
          };
        }
      }
    }
  } catch {}
  return { geminiKey: '', elevenLabsKey: '' };
}

const initial = getInitialKeys();
const EXPORT_DIR = '/outer/Downloads/DFLTikTokGaming';

export const DEFAULT_CONFIG: GamingSuiteConfig = {
  port: 4005,
  geminiApiKey: initial.geminiKey,
  elevenLabsApiKey: initial.elevenLabsKey,
  defaultTtsEngine: 'edge-tts',
  defaultVoice: 'en-US-GuyNeural', // Energetic gamer voice
  paths: {
    root: process.cwd(),
    uploads: path.join(process.cwd(), 'data', 'uploads'),
    generated: path.join(process.cwd(), 'data', 'generated'),
    exports: EXPORT_DIR,
    projects: path.join(process.cwd(), 'data', 'projects'),
  },
  defaultSettings: {
    targetDuration: 30,
    hookStyle: 'warning_mistake',
    tone: 'energetic_hype',
    fps: 60,
    width: 1080,
    height: 1920,
  },
};

let currentConfig: GamingSuiteConfig = { ...DEFAULT_CONFIG };

export function loadConfig(): GamingSuiteConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      currentConfig = {
        ...DEFAULT_CONFIG,
        ...data,
        paths: {
          ...DEFAULT_CONFIG.paths,
          ...(data.paths || {}),
        },
        defaultSettings: {
          ...DEFAULT_CONFIG.defaultSettings,
          ...(data.defaultSettings || {}),
        },
      };
      return currentConfig;
    }
  } catch (err) {
    console.error('Error loading config, using defaults:', err);
  }

  saveConfig(DEFAULT_CONFIG);
  return currentConfig;
}

export function saveConfig(newConfig: Partial<GamingSuiteConfig>): GamingSuiteConfig {
  currentConfig = {
    ...currentConfig,
    ...newConfig,
  };

  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving config:', err);
  }

  return currentConfig;
}

export function getConfig(): GamingSuiteConfig {
  return currentConfig;
}

// Initial load
loadConfig();
