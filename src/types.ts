export type GamingContentType =
  | 'factory_math'
  | 'secret_glitch'
  | 'base_architecture'
  | 'hidden_lore'
  | 'tier_list'
  | 'survival_challenge'
  | 'early_game_op'
  | 'update_meta';

export type HookStyleType =
  | 'question'
  | 'shocking_stat'
  | 'visual_callout'
  | 'pro_secret'
  | 'warning_mistake'
  | 'story_in_media_res';

export type ToneType =
  | 'energetic_hype'
  | 'sarcastic_gamer'
  | 'chill_builder'
  | 'mysterious_lore'
  | 'technical_pro';

export type MotionStyleType =
  | 'ken_burns_zoom'
  | 'pan_down'
  | 'pan_up'
  | 'pulse_zoom'
  | 'cinematic_drift';

export interface GameProfile {
  id: string;
  name: string;
  genre: 'automation' | 'survival' | 'crafting' | 'rpg_survival';
  badge: string;
  color: string;
  keyMechanics: string[];
  famousTerms: string[];
  popularHooks: string[];
  loreSnippet: string;
}

export interface ScriptBeat {
  timeSec: number;
  text: string;
  visualFocus: string;
  emotion: string;
  pauseAfterMs: number;
}

export interface ProjectContext {
  gameId: string;
  gameTitle: string;
  contentType: GamingContentType;
  topic: string;
  lore?: string;
  keyFacts?: string;
  targetDuration: 15 | 30 | 45 | 60;
  hookStyle: HookStyleType;
  tone: ToneType;
  audience?: string;
}

export interface ProjectImage {
  filename: string;
  path: string;
  url: string;
  width: number;
  height: number;
  format: string;
  sizeBytes: number;
}

export interface ProjectScript {
  spokenText: string;
  ssmlText: string;
  hook: string;
  body: string;
  cta: string;
  wordCount: number;
  estimatedSeconds: number;
  phoneticOverrides: Record<string, string>;
  beats: ScriptBeat[];
  visualCallouts: string[];
  gameTips?: string[];
}

export interface ProjectVoice {
  voiceId: string;
  engine: 'edge-tts' | 'elevenlabs';
  speed: number;
  audioPath?: string;
  audioUrl?: string;
  durationSeconds?: number;
}

export interface ProjectMotion {
  style: MotionStyleType;
  focusPoint: { x: number; y: number };
  zoomLevel: number;
}

export interface ProjectCaptions {
  enabled: boolean;
  style: 'gaming_bold' | 'neon_glow' | 'minimal_clean' | 'tiktok_yellow';
  uppercase: boolean;
}

export interface GamingProject {
  id: string;
  title: string;
  gameId: string;
  gameTitle: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'scripted' | 'voiced' | 'rendered';
  context: ProjectContext;
  image?: ProjectImage;
  script?: ProjectScript;
  voice: ProjectVoice;
  motion: ProjectMotion;
  captions: ProjectCaptions;
  detectedElements?: string[];
  visualVibe?: string;
  renderedVideoPath?: string;
  renderedVideoUrl?: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  lang: string;
  engine: 'edge-tts' | 'elevenlabs';
  vibe: string;
}

export interface SystemConfig {
  port: number;
  geminiApiKey: string;
  elevenLabsApiKey: string;
  defaultTtsEngine: 'edge-tts' | 'elevenlabs';
  defaultVoice: string;
  paths: {
    exports: string;
  };
}
