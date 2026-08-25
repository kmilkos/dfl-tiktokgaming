import fs from 'fs';
import path from 'path';
import https from 'https';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getConfig } from '../config.js';
import { getGameProfile } from '../data/games.js';

const httpsAgent = new https.Agent({ family: 4, keepAlive: true });

export interface GameImageGenParams {
  prompt: string;
  gameId?: string;
  enhanceWithAI?: boolean;
  model?: 'flux' | 'turbo' | 'unity';
  aspectRatio?: '9:16' | '16:9' | '1:1';
}

const GAME_STYLE_ANCHORS: Record<string, string> = {
  satisfactory: 'Satisfactory video game aesthetic, Unreal Engine 5 high fidelity render, industrial sci-fi mega factory, pristine orange power lines, glowing conveyor belts, towering space elevator in background, alien planet landscape, dramatic cinematic lighting, photorealistic 8k, 9:16 vertical composition',
  enshrouded: 'Enshrouded video game aesthetic, Embervale dark fantasy voxel world, ancient stone ruins surrounded by swirling blue glowing Shroud mist, volumetric godrays, glowing flame altar, dark atmospheric mystery, cinematic 8k, 9:16 vertical composition',
  valheim: 'Valheim Norse survival aesthetic, ancient Viking longhouse fortress with heavy wood beams, glowing green torches, stormy dark ocean with glowing sea serpent, dramatic Norse mythology atmosphere, photorealistic stylized lighting, 9:16 vertical composition',
  subnautica: 'Subnautica ocean planet 4546B, bioluminescent deep underwater trench, massive terrifying Leviathan lurking in dark abyss, glowing alien coral, Cyclops submarine headlights piercing deep water, 8k cinematic, 9:16 vertical composition',
  rust: 'Rust hardcore survival aesthetic, brutal armored metal bunker base on a snowy cliff, auto-turrets with red laser sights, dramatic dusk sky, gritty photorealistic survival game render, 9:16 vertical composition',
  palworld: 'Palworld creature survival aesthetic, bustling automated factory compound with assembly lines, vibrant 3D anime style, legendary Pals working on power generators, beautiful open world sky, 9:16 vertical composition',
  once_human: 'Once Human cosmic horror survival aesthetic, abandoned surreal modern city corrupted by glowing alien Stardust, mysterious Deviants floating, dark sci-fi volumetric fog, 9:16 vertical composition',
  '7days_to_die': '7 Days to Die zombie horde survival aesthetic, fortified concrete defense tower with glowing electric blade traps, red blood moon sky, intense apocalyptic atmosphere, 9:16 vertical composition',
  factorio: 'Factorio top-down automation aesthetic, vast infinite grid of conveyor belts, glowing green inserters, sprawling train networks, glowing nuclear power plants, gritty sci-fi industrial aesthetic, 9:16 vertical composition',
};

export const GAME_IMAGE_PRESETS: Record<string, { label: string; prompt: string }[]> = {
  satisfactory: [
    { label: '🏭 100% Efficient Mega Factory', prompt: 'Massive multi-floor Satisfactory factory with glowing conveyor manifolds, orange pipes, and space elevator at sunset' },
    { label: '⚡ Infinite Nuclear Power Grid', prompt: 'Towering nuclear power plants with glowing green water cooling towers and complex pipe routing in Satisfactory' },
    { label: '🚀 Phase 5 Space Elevator Base', prompt: 'Futuristic logistics hub with freight trains, hyper tubes, and the colossal space elevator ascending into clouds' },
  ],
  enshrouded: [
    { label: '🌫️ Secret Shrouded Castle Ruins', prompt: 'Ancient gothic castle swallowed by glowing blue Shroud fog with a Flameborn warrior holding a glowing torch' },
    { label: '🪽 Infinite Glider Overlook', prompt: 'High mountain cliff overlooking the vast Embervale valleys and sunken Shroud roots at golden hour' },
    { label: '🏰 High-Comfort Voxel Base', prompt: 'Warm cozy stone and timber tavern base with glowing hearth, bookshelves, and trophy wall in Enshrouded' },
  ],
  valheim: [
    { label: '⚔️ Ashlands Lava Fortress', prompt: 'Viking siege outpost built on black obsidian pillars surrounded by boiling lava and Ashlands storm clouds' },
    { label: '🌊 Sea Serpent Ocean Hunt', prompt: 'Viking Longship sailing through massive stormy waves with a colossal glowing sea serpent circling the hull' },
    { label: '🌲 Mistlands Treehouse Base', prompt: 'Towering Yggdrasil root base enveloped in purple Mistlands fog with glowing Dvergr lanterns' },
  ],
  subnautica: [
    { label: '🦈 Reaper Leviathan Attack', prompt: 'Terrifying Reaper Leviathan charging towards a Seamoth submarine in the dark murky depths of the crash zone' },
    { label: '🌋 Inactive Lava Zone Thermal Base', prompt: 'Futuristic glass habitat base built over glowing lava falls with a Sea Dragon Leviathan swimming overhead' },
    { label: '🛸 Alien Primary Containment Facility', prompt: 'Massive precursor alien architecture submerged in crystal clear ocean with green ion cube power conduits' },
  ],
  rust: [
    { label: '💣 Unraidable Pixel Bunker', prompt: 'Brutal multi-layer armored metal bunker with high external stone walls and auto-turrets at sunset in Rust' },
    { label: '🚁 Large Oil Rig Infiltration', prompt: 'Mini copter landing on the helipad of the Large Oil Rig surrounded by ocean spray and red siren lights' },
  ],
  palworld: [
    { label: '🐾 Automated Ingot Foundry Base', prompt: 'High-tech Palworld production facility with Anubis Pals crafting assembly items around glowing electric furnaces' },
    { label: '🐉 Legendary Jetragon Sky Mount', prompt: 'Player riding a glowing sonic Jetragon dragon across the volcanic biome at high speed in Palworld' },
  ],
};

export async function enhanceGamingPrompt(
  basePrompt: string,
  gameId: string
): Promise<string> {
  const config = getConfig();
  if (!config.geminiApiKey) {
    const anchor = GAME_STYLE_ANCHORS[gameId] || 'Gaming artwork, photorealistic 8k, cinematic 9:16 vertical';
    return `${basePrompt}, ${anchor}`;
  }

  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.7, maxOutputTokens: 150 },
    });

    const gameProfile = getGameProfile(gameId);
    const prompt = `Write a vivid, photorealistic image prompt describing a 9:16 vertical gaming scene for "${gameProfile.name}".
Concept: "${basePrompt}"
Output should describe the environment, lighting, architecture, and action in 2 descriptive sentences ending with "9:16 vertical composition, 8k photorealistic game capture". Return ONLY the prompt text.`;

    const res = await model.generateContent(prompt);
    const text = res.response.text().trim();
    if (text && text.length > 20) {
      return text;
    }
    return `${basePrompt}, ${GAME_STYLE_ANCHORS[gameId] || ''}`;
  } catch (err) {
    return `${basePrompt}, ${GAME_STYLE_ANCHORS[gameId] || ''}`;
  }
}

export async function generateGameImage(
  params: GameImageGenParams
): Promise<{ filePath: string; url: string; width: number; height: number; promptUsed: string }> {
  const config = getConfig();
  const gameId = params.gameId || 'satisfactory';

  let finalPrompt = params.prompt;
  if (params.enhanceWithAI) {
    finalPrompt = await enhanceGamingPrompt(params.prompt, gameId);
  } else {
    const anchor = GAME_STYLE_ANCHORS[gameId] || 'Gaming screenshot aesthetic, 9:16 vertical 8k';
    finalPrompt = `${params.prompt}, ${anchor}`;
  }

  const filename = `ai-game-${gameId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}.jpg`;
  const outputPath = path.join(config.paths.uploads, filename);

  const width = 1080;
  const height = 1920;

  // 1. Check if Google Gemini Image Generation can generate image directly
  if (config.geminiApiKey) {
    try {
      const googleRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${config.geminiApiKey}`,
        {
          contents: [{ parts: [{ text: `Generate a high quality visual scene in 9:16 vertical format: ${finalPrompt}` }] }],
        },
        { timeout: 25000, httpsAgent }
      );
      const part = googleRes.data?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));
      if (part?.inlineData?.data) {
        fs.writeFileSync(outputPath, Buffer.from(part.inlineData.data, 'base64'));
        return {
          filePath: outputPath,
          url: `/api/media/stream?path=${encodeURIComponent(outputPath)}`,
          width,
          height,
          promptUsed: finalPrompt,
        };
      }
    } catch {}
  }

  // 2. High-Performance Flux & Turbo Engine via Pollinations
  const encoded = encodeURIComponent(finalPrompt.slice(0, 500));
  const models = ['flux', 'turbo'];

  for (const m of models) {
    try {
      const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&nologo=true&model=${m}`;
      const res = await axios.get(url, {
        responseType: 'arraybuffer',
        httpsAgent,
        timeout: 35000,
      });

      if (res.data && res.data.length > 5000) {
        fs.writeFileSync(outputPath, Buffer.from(res.data));
        return {
          filePath: outputPath,
          url: `/api/media/stream?path=${encodeURIComponent(outputPath)}`,
          width,
          height,
          promptUsed: finalPrompt,
        };
      }
    } catch (err: any) {
      console.warn(`Image generation with model ${m} failed, trying next...`);
    }
  }

  throw new Error('Failed to generate AI gaming image after multiple engine attempts.');
}
