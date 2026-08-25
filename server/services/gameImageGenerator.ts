import fs from 'fs';
import path from 'path';
import https from 'https';
import axios from 'axios';
import { getConfig } from '../config.js';
import { getGameProfile } from '../data/games.js';
import {
  synthesizeFicsitDataWithGemini,
  generateFicsitSVG,
  renderBlueprintToPNG,
  FicsitTemplateType,
} from './proceduralBlueprint.js';

const httpsAgent = new https.Agent({ family: 4, keepAlive: true });

export type ImageStyleMode = 'infographic' | 'cinematic';
export type GeneratorEngineType = 'procedural' | 'gemini_image' | 'flux' | 'turbo';

export interface GameImageGenParams {
  prompt: string;
  gameId?: string;
  styleMode?: ImageStyleMode;
  engine?: GeneratorEngineType;
  templateType?: FicsitTemplateType;
  enhanceWithAI?: boolean;
  aspectRatio?: '9:16' | '16:9' | '1:1';
}

export const FICSIT_NEGATIVE_PROMPT =
  'blurry, low resolution, unreadable gibberish text, chaotic wires, messy layout, photorealistic human faces, organic landscape, soft watercolor, curved distorted lines, bad spelling, overlapping unaligned text cards, dirty lens, low contrast, cropped borders, 1:1 square, 16:9 landscape';

export const GAME_INFOGRAPHIC_PRESETS: Record<
  string,
  { label: string; prompt: string; type: string; templateType: FicsitTemplateType }[]
> = {
  satisfactory: [
    {
      label: '⚡ The Iron-Only Assembly (Total Consolidation)',
      prompt: 'The Iron-Only Assembly for Reinforced Iron Plates using Stitched Iron Plate and Iron Wire alternate recipes to eliminate copper and screws',
      type: 'Flowchart Consolidation',
      templateType: 'FLOWCHART_CONSOLIDATION',
    },
    {
      label: '🔩 Cast Screws: Standard vs. Alternate',
      prompt: 'Cast Screws Alternate Recipe: Convert Iron Ingots directly to Screws (50/min), bypassing Iron Rods',
      type: 'Comparison Stack',
      templateType: 'COMPARISON',
    },
    {
      label: '🚫 Screw Bottleneck Eradication (Problem vs. Solution)',
      prompt: 'Screw Bottleneck Eradication: Problem (huge belt congestion with screws) vs. Solution (Stitched Plates + Iron Wire)',
      type: 'Problem vs. Solution',
      templateType: 'PROBLEM_SOLUTION',
    },
    {
      label: '🔥 Infinite Turbofuel Power Grid Masterclass',
      prompt: 'Infinite Turbofuel Power Plant Ratio: 300 Crude Oil to 800 Turbofuel feeding 44 Fuel Generators with Heavy Oil Residue',
      type: 'Logistics Masterclass',
      templateType: 'FLOWCHART_CONSOLIDATION',
    },
    {
      label: '☢️ Zero Nuclear Waste Plutonium Loop',
      prompt: 'FICSIT Zero Nuclear Waste Recycling: Uranium Waste to Plutonium Fuel Rods to Sink conversion loop',
      type: 'Recycling Flowchart',
      templateType: 'FLOWCHART_CONSOLIDATION',
    },
  ],
  enshrouded: [
    {
      label: '🌫️ Flame Altar Level 6 Progression Matrix',
      prompt: 'Flame Altar Level 6 Upgrade Guide: Spark locations, Shroud core crafting, and passage timer multipliers',
      type: 'Progression Flowchart',
      templateType: 'FLOWCHART_CONSOLIDATION',
    },
    {
      label: '🪽 Infinite Glider Stamina Optimization',
      prompt: 'Infinite Glider Mechanics: Standard Glider stamina drain vs. Ghost Glider updraft skill synergy',
      type: 'Problem vs. Solution',
      templateType: 'PROBLEM_SOLUTION',
    },
  ],
  valheim: [
    {
      label: '🛡️ Structural Integrity & Beam Stability Math',
      prompt: 'Viking Structural Physics Blueprint: Standard wood beam collapse vs. Iron wood reinforced high roof stability',
      type: 'Comparison Stack',
      templateType: 'COMPARISON',
    },
    {
      label: '⚔️ Ashlands Siege Engine Assembly',
      prompt: 'Ashlands Fortress Siege Strategy: Battering ram mechanics, catapult fire trajectory, and anti-Charred shield placement',
      type: 'Logistics Masterclass',
      templateType: 'FLOWCHART_CONSOLIDATION',
    },
  ],
  factorio: [
    {
      label: '🧪 Perfect 45 SPM Science Pack Ratio Matrix',
      prompt: 'Optimal 45 SPM Science Pack Production Ratio: Raw Ore inputs splitting to Red and Green science assemblers',
      type: 'Flowchart Consolidation',
      templateType: 'FLOWCHART_CONSOLIDATION',
    },
  ],
  rust: [
    {
      label: '🏰 Unraidable Pixel-Gap Bunker Base CAD',
      prompt: 'Pixel-Gap Bunker Base Architecture: Standard 2x2 soft side weakness vs. Roof stability bunker exploit',
      type: 'Problem vs. Solution',
      templateType: 'PROBLEM_SOLUTION',
    },
  ],
  palworld: [
    {
      label: '🥚 Perfect 4-Passive Breeding Lineage Tree',
      prompt: 'Legendary 4-Passive Trait Breeding Tree: Parent cross-breeding lineage for Legend, Musclehead, Ferocious, and Burly Body',
      type: 'Breeding Flowchart',
      templateType: 'FLOWCHART_CONSOLIDATION',
    },
  ],
  subnautica: [
    {
      label: '🔋 Cyclops Infinite Thermal Power & Depth',
      prompt: 'Cyclops Deep Sea Power Optimization: Standard Power Cells vs. Thermal Reactor near volcanic vents with Ion Cells',
      type: 'Comparison Stack',
      templateType: 'COMPARISON',
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
  const templateType: FicsitTemplateType = params.templateType || 'FLOWCHART_CONSOLIDATION';

  const width = 1080;
  const height = 1920;

  // 1. Procedural Vector Infographic Engine (FICSIT Design System v1.0.0)
  if (styleMode === 'infographic' && (engine === 'procedural' || !engine)) {
    try {
      console.log(`[FICSIT ImageGen] Synthesizing 9:16 ${templateType} blueprint for ${gameId}...`);
      const ficsitData = await synthesizeFicsitDataWithGemini(gameId, params.prompt, templateType);
      const svgContent = generateFicsitSVG(ficsitData);

      const filename = `ficsit-${templateType.toLowerCase()}-${gameId}-${Date.now()}.png`;
      const outputPath = path.join(config.paths.uploads, filename);

      await renderBlueprintToPNG(svgContent, outputPath);

      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        return {
          filePath: outputPath,
          url: `/api/media/stream?path=${encodeURIComponent(outputPath)}`,
          width,
          height,
          promptUsed: `${ficsitData.header.title} ${ficsitData.header.subtitle}`,
          engineUsed: `ficsit_vector_${templateType.toLowerCase()}`,
        };
      }
    } catch (err: any) {
      console.warn('[FICSIT ImageGen] Vector Blueprint failed, falling back:', err.message);
    }
  }

  // 2. Google Gemini Native Image Generation (if supported on active key)
  if (config.geminiApiKey && (engine === 'gemini_image' || !engine)) {
    const geminiModels = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image', 'gemini-3-pro-image'];
    for (const model of geminiModels) {
      try {
        console.log(`[ImageGen] Trying Google ${model}...`);
        const googleRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`,
          {
            contents: [{ parts: [{ text: `Generate a vertical 9:16 FICSIT industrial infographic: ${params.prompt}` }] }],
            generationConfig: { responseModalities: ['IMAGE'] },
          },
          { timeout: 20000, httpsAgent }
        );

        const parts = googleRes.data?.candidates?.[0]?.content?.parts || [];
        for (const p of parts) {
          if (p.inlineData?.data) {
            const filename = `dfl-gemini-image-${gameId}-${Date.now()}.png`;
            const outputPath = path.join(config.paths.uploads, filename);
            fs.writeFileSync(outputPath, Buffer.from(p.inlineData.data, 'base64'));
            return {
              filePath: outputPath,
              url: `/api/media/stream?path=${encodeURIComponent(outputPath)}`,
              width,
              height,
              promptUsed: params.prompt,
              engineUsed: model,
            };
          }
        }
      } catch (err: any) {
        console.warn(`[ImageGen] Google ${model} not available on this key (${err.response?.status || err.message}), trying next...`);
      }
    }
  }

  // 3. High-Quality Flux / Turbo Diffusion Engine (Structured with Section 4 Templates + Section 6 Negatives)
  const gameProfile = getGameProfile(gameId);
  const promptSeed = Math.floor(Math.random() * 1000000);

  let promptTemplate = '';
  if (templateType === 'COMPARISON') {
    promptTemplate = `Vertical 9:16 aspect ratio industrial infographic, Satisfactory video game FICSIT technical style. Background: Dark industrial blue (#14202C) textured with faint CAD technical grid and orange hazard diagonal stripes. Header: Bold industrial top banner reading "FICSIT INC. PRODUCTION GUIDE: ALTERNATE RECIPE". Subheader: Large bold uppercase text "${params.prompt}" framed by orange hazard warning stripes. Section 1 (Standard Recipe): Dark UI panel labeled "Standard" with vertical process chain and rate metrics. Section 2 (Alternate Recipe): Dark UI panel labeled "Alternate" with bright highlight border and optimal throughput rates. Footer: Solid FICSIT orange bar with black bold industrial text verdict. Render style: Clean vector UI containers, isometric machinery schematics, high contrast, clean typography, 8k resolution.`;
  } else if (templateType === 'PROBLEM_SOLUTION') {
    promptTemplate = `Vertical 9:16 aspect ratio industrial infographic, Satisfactory FICSIT sci-fi UI aesthetic. Background: Matte gunmetal grey (#1C1E22) with glowing amber UI telemetry and subtle technical schematics. Header: "FICSIT INC. PRODUCTION GUIDE: ALTERNATE RECIPE" with title "${params.prompt}". Top Block (The Problem): Amber-bordered UI container titled "THE PROBLEM" with glowing red "X" over bottleneck item. Bottom Block (The Solution): Amber-bordered UI container titled "THE SOLUTION" with glowing green checkmark over optimal item. Footer: Dark banner with glowing orange border and bold uppercase text verdict. Render style: Precision CAD blueprint overlay, vibrant UI indicators, isometric game asset styling, razor sharp.`;
  } else {
    promptTemplate = `Vertical 9:16 aspect ratio industrial blueprint infographic, Satisfactory FICSIT aesthetic. Background: Deep steel blue (#131E29) with intricate technical machinery blueprint line art. Header: Top industrial banner reading "FICSIT INC. LOGISTICS MASTERCLASS". Title: Large bold text "${params.prompt}". Center Flowchart Layout: Top Root Node with splitting arrows, Path A (Left) with machines and rates, Path B (Right) with machines and rates, Convergence Assembler node, and Bottom Output Node. Side Callout Box: Blueprint note card titled "The Math Callout". Footer: Bright industrial FICSIT orange banner. Details: Corner bolts, small industrial screws and spools on border margins, crisp corporate FICSIT branding, 8k resolution.`;
  }

  const filename = `dfl-ficsit-${templateType.toLowerCase()}-${gameId}-${Date.now()}.jpg`;
  const outputPath = path.join(config.paths.uploads, filename);

  const encodedPrompt = encodeURIComponent(promptTemplate.slice(0, 500));
  const models = ['flux', 'turbo'];

  for (const m of models) {
    try {
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${promptSeed}&nologo=true&model=${m}&negative=${encodeURIComponent(FICSIT_NEGATIVE_PROMPT)}`;
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
          promptUsed: promptTemplate,
          engineUsed: `ai_${m}_${templateType.toLowerCase()}`,
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
