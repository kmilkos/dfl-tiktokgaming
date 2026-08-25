import fs from 'fs';
import path from 'path';
import https from 'https';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getConfig } from '../config.js';
import { getGameProfile } from '../data/games.js';

const httpsAgent = new https.Agent({ family: 4, keepAlive: true });

export type ImageStyleMode = 'infographic' | 'cinematic';

export interface GameImageGenParams {
  prompt: string;
  gameId?: string;
  styleMode?: ImageStyleMode;
  enhanceWithAI?: boolean;
  model?: 'flux' | 'turbo' | 'unity';
  aspectRatio?: '9:16' | '16:9' | '1:1';
}

export const GAME_INFOGRAPHIC_PRESETS: Record<string, { label: string; prompt: string; type: string }[]> = {
  satisfactory: [
    {
      label: '⚡ The Iron-Only Assembly (Zero Screws)',
      prompt: 'The Iron-Only Assembly (Total Consolidation) for Reinforced Iron Plates using Stitched Iron Plate and Iron Wire alternate recipes to eliminate copper and screws',
      type: 'Optimization Flowchart',
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
    {
      label: '🏰 60-Minute Rest Comfort Maxing',
      prompt: 'Base Comfort 60+ Minute Buff Optimization: Fireplace tier, furniture stacking rules, and rested bonus stamina regeneration math',
      type: 'Base Buff Guide',
    },
  ],
  valheim: [
    {
      label: '🛡️ Structural Integrity & Beam Weight Math',
      prompt: 'Viking Structural Physics Blueprint: Blue to Red beam stability load calculation, iron wood pole reinforcement, and maximum roof height math',
      type: 'Architecture Blueprint',
    },
    {
      label: '🍖 Food Triad Optimization (HP vs Stamina vs Eitr)',
      prompt: 'Ashlands Food Triad Matrix: Optimal recipes for Health, Stamina, and Eitr balancing with duration and regeneration multipliers',
      type: 'Buff Matrix',
    },
    {
      label: '🐺 2-Star Wolf Army Automated Breeding Farm',
      prompt: 'Automated 2-Star Wolf Breeding Tower: Elevated feeding drop chute, cub separation physics, and infinite meat auto-farm',
      type: 'Breeding Blueprint',
    },
    {
      label: '⚔️ Ashlands Siege & Lava Shield Tactics',
      prompt: 'Ashlands Fortress Conquest Guide: Battering ram mechanics, catapult ammo recipes, and lava protection potion timing',
      type: 'Combat Blueprint',
    },
  ],
  subnautica: [
    {
      label: '🌊 Submarine Crush Depth & Upgrade Matrix',
      prompt: 'Alterra PDA Submarine Crush Depth Matrix: Seamoth, PRAWN Suit, and Cyclops depth modules (Mk.1-3) with required rare materials and depth limits',
      type: 'Depth Tier Chart',
    },
    {
      label: '⚡ Thermal Power & Transmitter Energy Grid',
      prompt: 'Deep Sea Thermal Energy Pipeline: Thermal plant placement over volcanic vents with Power Transmitter relay line distance math',
      type: 'Energy Grid Blueprint',
    },
    {
      label: '🦈 Leviathan Threat Sonar & Evasion Zones',
      prompt: 'Planet 4546B Leviathan Danger Zone Map: Reaper, Ghost, and Sea Dragon patrol depths with Stasis Rifle and Perimeter Defense counter-measures',
      type: 'Tactical Threat Map',
    },
  ],
  rust: [
    {
      label: '💣 Unraidable Pixel-Gap Bunker Schematic',
      prompt: 'Unraidable Pixel-Gap Stability Bunker: Roof bunker open/close trigger mechanics, honeycombing cross-section, and TC upkeep breakdown',
      type: 'Bunker Blueprint',
    },
    {
      label: '⚡ Smart Turret & Logic Gate Electrical Grid',
      prompt: 'Automated Defense Circuit: Solar panel to battery to RF Receiver and AND/OR logic switches triggering concealed auto-turrets',
      type: 'Circuit Diagram',
    },
    {
      label: '🚀 Raid Cost Calculation Table (Rockets vs C4)',
      prompt: 'Rust Wall Destruction Cost Matrix: Sheet metal, armored, and garage doors destruction costs in Rockets, C4, Satchels, and Explosive Ammo',
      type: 'Raid Cost Matrix',
    },
  ],
  palworld: [
    {
      label: '🐾 Ultimate 4-Passive Anubis Breeding Tree',
      prompt: 'Ultimate 4-Passive Worker Anubis Breeding Tree: Artisan, Serious, Lucky, Work Slave combination routes and egg incubation conditions',
      type: 'Breeding Flowchart',
    },
    {
      label: '🏭 10,000/hr Automated Ore & Ingot Foundry',
      prompt: 'Automated Ore & Ingot Production Base: Pal work suitability tier 4 assignments, feed box nutrition math, and zero-stuck pathing layout',
      type: 'Factory Blueprint',
    },
  ],
  factorio: [
    {
      label: '☢️ Perfect 2x2 Nuclear Reactor Ratio Schematic',
      prompt: 'Perfect 2x2 Nuclear Power Plant Ratio Blueprint: 4 Nuclear Reactors to 48 Heat Exchangers to 83 Steam Turbines with exact water pump ratios',
      type: 'Nuclear Math Guide',
    },
    {
      label: '🚂 Train Signal Masterclass (Block vs Chain)',
      prompt: 'Factorio Train Signaling Masterclass: Chain Signal in, Block Signal out rule diagram with 4-way intersection deadlock prevention',
      type: 'Rail Logistics Guide',
    },
  ],
};

const GAME_INFOGRAPHIC_STYLE_ANCHORS: Record<string, { org: string; header: string; colorScheme: string; footer: string }> = {
  satisfactory: {
    org: 'FICSIT Inc.',
    header: 'FICSIT INC. LOGISTICS MASTERCLASS',
    colorScheme: 'dark navy blueprint grid with faint CAD machinery wireframes, glowing amber-orange machine cards, electric-cyan item badges, thick white flow arrows',
    footer: 'ZERO COPPER. ZERO SCREWS. ULTIMATE EFFICIENCY.',
  },
  enshrouded: {
    org: 'Flameborn Archives',
    header: 'EMBERVALE SURVIVAL & PROGRESSION GUIDE',
    colorScheme: 'dark gothic arcane blueprint grid with glowing blue Shroud runes, amber flame altar cards, golden stat callouts, sleek technical layout',
    footer: 'MASTER THE SHROUD. CONQUER EMBERVALE.',
  },
  valheim: {
    org: 'Allfather Builder Guild',
    header: 'VALHEIM NORSE ARCHITECTURE & INTEGRITY BLUEPRINT',
    colorScheme: 'dark slate Viking blueprint grid with glowing green torches, color-coded beam stability bars (Blue, Green, Yellow, Red), rune stat badges',
    footer: 'STRUCTURAL PERFECTION. ODIN APPROVED.',
  },
  subnautica: {
    org: 'Alterra Corporation',
    header: 'ALTERRA PDA TACTICAL DEEP-DIVE SCHEMATIC',
    colorScheme: 'deep abyss navy holographic HUD grid, glowing neon cyan depth meters, orange thermal power nodes, crisp Alterra corporate typography',
    footer: 'TACTICAL DEPTH PROTOCOL. ZERO LOSS ASSURED.',
  },
  rust: {
    org: 'Hardcore Survivalist Blueprint',
    header: 'RUST TACTICAL BASE DEFENSE & BUNKER BLUEPRINT',
    colorScheme: 'dark industrial CAD blueprint grid with amber construction lines, red warning callouts, armored metal cutaway cards, rocket cost table',
    footer: '100% UNRAIDABLE. ZERO OFFLINE RAIDS.',
  },
  palworld: {
    org: 'Palpagos Research Institute',
    header: 'PALPAGOS AUTOMATION & BREEDING MATRIX',
    colorScheme: 'modern high-tech laboratory blueprint grid with purple and teal glowing cards, Pal DNA gene nodes, automated assembly rate badges',
    footer: 'MAXIMUM EFFICIENCY. 4-PASSIVE PERFECTION.',
  },
  factorio: {
    org: 'The Factory Must Grow Engineering',
    header: 'THE FACTORY MUST GROW LOGISTICS BLUEPRINT',
    colorScheme: 'technical engineering CAD grid with orange belt lines, green circuit nodes, exact fluid ratio tables, zero bottleneck arrows',
    footer: 'THE FACTORY MUST GROW. ZERO BOTTLENECKS.',
  },
};

export async function buildInfographicPrompt(
  baseTopic: string,
  gameId: string
): Promise<string> {
  const config = getConfig();
  const gameProfile = getGameProfile(gameId);
  const styleAnchor = GAME_INFOGRAPHIC_STYLE_ANCHORS[gameId] || GAME_INFOGRAPHIC_STYLE_ANCHORS.satisfactory;

  if (!config.geminiApiKey) {
    return `A highly detailed professional gaming infographic blueprint card in 9:16 vertical aspect ratio, styled after ${styleAnchor.org} UI. Central top-down factory/gameplay automation flowchart showing "${baseTopic}" with rounded glowing UI cards, material icons, machine icons, recipe names, production rates (e.g. 18.75/min), thick glowing flow arrows, header banner "${styleAnchor.header}", dedicated "The Math Callout" section in lower left with comparative stats, vibrant footer banner "${styleAnchor.footer}", ${styleAnchor.colorScheme}, photorealistic 8k technical UI infographic design.`;
  }

  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.6, maxOutputTokens: 300 },
    });

    const systemPrompt = `You are a world-class infographic prompt architect for viral 9:16 gaming tutorial cards.
Write an ultra-detailed, photorealistic image generation prompt that creates a crisp, professional 9:16 vertical infographic blueprint card for the game "${gameProfile.name}".

TOPIC: "${baseTopic}"

STYLE SPECIFICATIONS:
- Aspect Ratio: Exactly 9:16 vertical composition.
- Overall Layout: Top corporate/universe header banner ("${styleAnchor.header}"), central top-down step-by-step flowchart with rounded glowing rectangular UI cards, recipe names, production throughput rates (e.g. per-minute numbers), thick glowing flow arrows.
- Lower Left Section: A distinct framed "The Math Callout" box comparing standard vs optimized costs/benefits.
- Bottom Footer Banner: High-impact bold statement ("${styleAnchor.footer}").
- Background: ${styleAnchor.colorScheme}.
- Aesthetics: Ultra-crisp, futuristic, technical blueprint schematic, highly informative, perfectly readable UI design.

Return ONLY the prompt text, without markdown, quotes, or preambles.`;

    const res = await model.generateContent(systemPrompt);
    const promptText = res.response.text().trim();
    if (promptText && promptText.length > 50) {
      return promptText;
    }
  } catch (err) {
    console.warn('Error in buildInfographicPrompt with Gemini, using template fallback:', err);
  }

  return `A highly detailed professional gaming infographic blueprint card in 9:16 vertical aspect ratio, styled after ${styleAnchor.org} UI. Central top-down flowchart showing "${baseTopic}" with rounded glowing UI cards, material icons, machine icons, recipe names, exact production rates, thick glowing flow arrows, header banner "${styleAnchor.header}", The Math Callout section, bold footer banner "${styleAnchor.footer}", ${styleAnchor.colorScheme}, 8k photorealistic infographic design.`;
}

export async function generateGameImage(
  params: GameImageGenParams
): Promise<{ filePath: string; url: string; width: number; height: number; promptUsed: string }> {
  const config = getConfig();
  const gameId = params.gameId || 'satisfactory';
  const styleMode = params.styleMode || 'infographic';

  let finalPrompt = params.prompt;

  if (styleMode === 'infographic') {
    finalPrompt = await buildInfographicPrompt(params.prompt, gameId);
  } else {
    // Cinematic scenery prompt
    const gameProfile = getGameProfile(gameId);
    finalPrompt = `Cinematic photorealistic 9:16 vertical 8k game capture of "${params.prompt}" in ${gameProfile.name}, Unreal Engine 5 aesthetic, volumetric dramatic lighting, 9:16 vertical composition`;
  }

  const filename = `dfl-${styleMode}-${gameId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}.jpg`;
  const outputPath = path.join(config.paths.uploads, filename);

  const width = 1080;
  const height = 1920;

  // 1. Google Gemini Image Generation if configured
  if (config.geminiApiKey) {
    try {
      const googleRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${config.geminiApiKey}`,
        {
          contents: [{ parts: [{ text: `Generate a high quality 9:16 vertical visual infographic/scene: ${finalPrompt}` }] }],
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
  const encoded = encodeURIComponent(finalPrompt.slice(0, 600));
  const models = ['flux', 'turbo'];

  for (const m of models) {
    try {
      const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&nologo=true&model=${m}`;
      const res = await axios.get(url, {
        responseType: 'arraybuffer',
        httpsAgent,
        timeout: 40000,
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

  throw new Error('Failed to generate gaming image/infographic card.');
}
