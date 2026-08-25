import fs from 'fs';
import path from 'path';
import https from 'https';
import axios from 'axios';
import { getConfig } from '../config.js';
import { getGameProfile } from '../data/games.js';
import {
  synthesizeBlueprintDataWithGemini,
  generateBlueprintSVG,
  renderBlueprintToPNG,
} from './proceduralBlueprint.js';

const httpsAgent = new https.Agent({ family: 4, keepAlive: true });

export type ImageStyleMode = 'infographic' | 'cinematic';
export type GeneratorEngineType = 'procedural' | 'flux' | 'turbo';

export interface GameImageGenParams {
  prompt: string;
  gameId?: string;
  styleMode?: ImageStyleMode;
  engine?: GeneratorEngineType;
  enhanceWithAI?: boolean;
  aspectRatio?: '9:16' | '16:9' | '1:1';
}

export const GAME_INFOGRAPHIC_PRESETS: Record<string, { label: string; prompt: string; type: string }[]> = {
  satisfactory: [
    {
      label: '⚡ The Iron-Only Assembly (Zero Screws)',
      prompt: 'The Iron-Only Assembly for Reinforced Iron Plates using Stitched Iron Plate and Iron Wire alternate recipes to eliminate copper and screws',
      type: 'Optimization Flowchart',
    },
    {
      label: '🔩 Cast Screws Alternate Recipe',
      prompt: 'Cast Screws M.A.M. alternate recipe: Convert Iron Ingots directly into Screws at 50/min, eliminating Iron Rods',
      type: 'Recipe Blueprint',
    },
    {
      label: '🔥 Infinite Turbofuel Power Grid',
      prompt: 'Infinite Turbofuel Power Plant Ratio Blueprint: 300 Crude Oil to 800 Turbofuel feeding 44 Fuel Generators with Heavy Oil Residue and Diluted Fuel',
      type: 'Power Ratio Guide',
    },
    {
      label: '☢️ Zero Nuclear Waste Plutonium Loop',
      prompt: 'FICSIT Zero Nuclear Waste Recycling Schematic: Uranium Waste to Plutonium Fuel Rods to Sink conversion loop with exact machine ratios',
      type: 'Recycling Matrix',
    },
    {
      label: '⚙️ Manifold vs Load Balancer Throughput',
      prompt: 'Conveyor Belt Throughput Masterclass: Manifold vs Load Balancing math comparison with Mk.5 Belts and Smart Splitter overflows',
      type: 'Logistics Blueprint',
    },
  ],
  enshrouded: [
    {
      label: '🌫️ Flame Altar Level 6 Progression Matrix',
      prompt: 'Embervale Flame Altar Level 6 Upgrade Guide: Spark locations, Shroud core crafting, passage timer multipliers, and biome unlocks',
      type: 'Progression Map',
    },
    {
      label: '🪽 Infinite Glider & Updraft Stamina Skip',
      prompt: 'Infinite Glider Flight Mechanics: Ghost Glider stamina efficiency, updraft boosting skill tree synergy, and traversal skips',
      type: 'Traversal Guide',
    },
    {
      label: '💎 Level 25 Legendary Chest Farming Route',
      prompt: 'Sun Temple Level 25 Golden Chest Farm Route: Fast travel altar placement, reload timers, and highest DPS weapon drop rates',
      type: 'Loot Route Blueprint',
    },
  ],
  valheim: [
    {
      label: '🛡️ Structural Integrity & Beam Weight Math',
      prompt: 'Viking Structural Physics Blueprint: Blue to Red beam stability load calculation, iron wood pole reinforcement, and maximum roof height math',
      type: 'Structural Physics',
    },
    {
      label: '⚔️ Ashlands Fortress Siege Defense Setup',
      prompt: 'Ashlands Fortress Conquest Strategy: Battering ram mechanics, catapult fire trajectory, and anti-Charred shield barrier placement',
      type: 'Combat Blueprint',
    },
  ],
  subnautica: [
    {
      label: '🔋 Cyclops Infinite Thermal Power & Depth',
      prompt: 'Cyclops Deep Sea Power Optimization: Thermal Reactor placement near volcanic vents and Ion Power Cell efficiency cycle',
      type: 'Submersible Schematic',
    },
  ],
  factorio: [
    {
      label: '🧪 Perfect 45 SPM Science Pack Ratio Matrix',
      prompt: 'Optimal 45 SPM All Science Packs Production Ratio: Assembler counts, smelter columns, and input conveyor line calculations',
      type: 'Factory Matrix',
    },
  ],
  rust: [
    {
      label: '🏰 Unraidable 2x2 Bunker Base Metagame',
      prompt: 'Unraidable Pixel-Gap Bunker Base Architecture: Roof stability exploit, triangle honeycomb, and high-rocket cost math',
      type: 'Base Defense CAD',
    },
  ],
  palworld: [
    {
      label: '🥚 Perfect 4-Passive Breeding Inheritance',
      prompt: 'Legendary 4-Passive Trait Breeding Tree: Parent cross-breeding lineage for Legend, Musclehead, Ferocious, and Burly Body',
      type: 'Breeding Lineage',
    },
  ],
};

export async function generateGameImage(
  params: GameImageGenParams
): Promise<{ filePath: string; url: string; width: number; height: number; promptUsed: string; engineUsed: string }> {
  const config = getConfig();
  const gameId = params.gameId || 'satisfactory';
  const styleMode = params.styleMode || 'infographic';
  const engine = params.engine || (styleMode === 'infographic' ? 'procedural' : 'flux');

  const width = 1080;
  const height = 1920;

  // 1. Procedural Vector Infographic Engine (100% Sharp Text, CAD Grid & Machine Nodes)
  if (styleMode === 'infographic' && (engine === 'procedural' || !engine)) {
    try {
      console.log(`[ImageGen] Synthesizing 9:16 Procedural Vector Blueprint for ${gameId}...`);
      const blueprintData = await synthesizeBlueprintDataWithGemini(gameId, params.prompt);
      const svgContent = generateBlueprintSVG(blueprintData);
      
      const filename = `dfl-blueprint-${gameId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}.png`;
      const outputPath = path.join(config.paths.uploads, filename);

      await renderBlueprintToPNG(svgContent, outputPath);

      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        return {
          filePath: outputPath,
          url: `/api/media/stream?path=${encodeURIComponent(outputPath)}`,
          width,
          height,
          promptUsed: `${blueprintData.title} - ${blueprintData.subtitle}`,
          engineUsed: 'procedural_vector',
        };
      }
    } catch (err: any) {
      console.warn('[ImageGen] Procedural Blueprint failed, falling back to Flux:', err.message);
    }
  }

  // 2. Flux / Turbo AI Image Generation with Enhanced Prompting
  const gameProfile = getGameProfile(gameId);
  const promptSeed = Math.floor(Math.random() * 1000000);

  const enhancedPrompt =
    styleMode === 'infographic'
      ? `Ultra-detailed technical industrial gaming infographic blueprint card for ${gameProfile.name} about "${params.prompt}". Dark blue CAD grid background, isometric machine icons, glowing neon cyan and amber flowchart boxes, recipe ratios, sharp UI stats badges, high contrast typography, 8k resolution, 9:16 vertical poster format.`
      : `Cinematic 8k photorealistic vertical 9:16 game screenshot of "${params.prompt}" in ${gameProfile.name}. Unreal Engine 5 visual fidelity, volumetric atmospheric lighting, raytraced reflections, hyper-detailed environment.`;

  const filename = `dfl-ai-${styleMode}-${gameId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}.jpg`;
  const outputPath = path.join(config.paths.uploads, filename);

  const encoded = encodeURIComponent(enhancedPrompt.slice(0, 500));
  const models = ['flux', 'turbo'];

  for (const m of models) {
    try {
      const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${promptSeed}&nologo=true&model=${m}`;
      const res = await axios.get(url, {
        responseType: 'arraybuffer',
        httpsAgent,
        timeout: 45000,
      });

      if (res.data && res.data.length > 5000) {
        fs.writeFileSync(outputPath, Buffer.from(res.data));
        return {
          filePath: outputPath,
          url: `/api/media/stream?path=${encodeURIComponent(outputPath)}`,
          width,
          height,
          promptUsed: enhancedPrompt,
          engineUsed: `ai_${m}`,
        };
      }
    } catch (err: any) {
      console.warn(`[ImageGen] Model ${m} failed, trying next...`);
    }
  }

  throw new Error('Failed to generate image with available engines.');
}

export async function fetchImageFromUrl(
  imageUrl: string
): Promise<{ filePath: string; url: string; width: number; height: number; filename: string }> {
  const config = getConfig();
  const res = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    httpsAgent,
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  const ext = imageUrl.endsWith('.png') ? '.png' : '.jpg';
  const filename = `dfl-url-import-${Date.now()}${ext}`;
  const outputPath = path.join(config.paths.uploads, filename);

  fs.writeFileSync(outputPath, Buffer.from(res.data));

  return {
    filePath: outputPath,
    url: `/api/media/stream?path=${encodeURIComponent(outputPath)}`,
    width: 1080,
    height: 1920,
    filename,
  };
}
