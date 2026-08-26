import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import { getConfig } from '../config.js';
import { getGameProfile } from '../data/games.js';

const execAsync = promisify(exec);

// Exact FICSIT Design System Color Tokens
export const FICSIT_COLORS = {
  BG_PRIMARY_1: '#101820',
  BG_PRIMARY_2: '#16202A',
  BG_SURFACE_1: '#1B2836',
  BG_SURFACE_2: '#222E3C',
  BORDER_SUBTLE: '#334E68',
  BORDER_GRID: '#486581',
  FICSIT_ORANGE: '#FA8014',
  FICSIT_ORANGE_LIGHT: '#FF8A00',
  TEXT_PRIMARY: '#F8FAFC',
  TEXT_MUTED: '#94A3B8',
  ACCENT_CYAN: '#00E5FF',
  ACCENT_CYAN_LIGHT: '#38BDF8',
  STATUS_OPTIMAL: '#22C55E',
  STATUS_OPTIMAL_ALT: '#10B981',
  STATUS_WARNING: '#EF4444',
  STATUS_WARNING_ALT: '#F43F5E',
};

export type FicsitTemplateType = 'FLOWCHART_CONSOLIDATION' | 'COMPARISON' | 'PROBLEM_SOLUTION';

export interface FicsitInfographicData {
  infographic_id?: string;
  template_type: FicsitTemplateType;
  aspect_ratio: '9:16';
  header: {
    organization: string;
    category?: string;
    title: string;
    subtitle: string;
  };
  raw_inputs: Array<{
    name: string;
    rate?: string;
    icon_type?: string;
  }>;
  pathway_nodes: Array<{
    path_id: string;
    machine: string;
    recipe_tag?: string;
    output_item: string;
    rate: string;
    subtext?: string;
    is_bottleneck?: boolean;
    is_optimal?: boolean;
  }>;
  assembly_node?: {
    machine: string;
    recipe_name: string;
    final_output: string;
    output_rate: string;
  };
  math_callouts: string[];
  verdict: string;
}

// 100% Dynamic Lexical Parser for Custom User Topics (zero hardcoded presets)
export function synthesizeDeterministicFicsitData(
  gameId: string,
  userTopic: string,
  templateType: FicsitTemplateType = 'FLOWCHART_CONSOLIDATION'
): FicsitInfographicData {
  const game = getGameProfile(gameId);
  const cleanTopic = (userTopic || 'CUSTOM PRODUCTION BLUEPRINT').trim();
  const upperTitle = cleanTopic.toUpperCase();

  // Extract candidate rates (e.g. 50/min, 12.5/min, 780/min, 100 MW)
  const rateMatches = cleanTopic.match(/(\d+(?:\.\d+)?\s*(?:\/min|mw|m³\/min|items|%))/gi) || [];
  const primaryRate = rateMatches[0] || '100% Steady-State';
  const secondaryRate = rateMatches[1] || '+100% Throughput';

  // Determine machine type dynamically based on topic keywords
  let machineA = 'Standard Processor';
  let machineB = 'Optimized Processing Unit';
  let assemblerMachine = 'Central Fabrication Node';

  const lower = cleanTopic.toLowerCase();
  if (lower.includes('oil') || lower.includes('fuel') || lower.includes('fluid')) {
    machineA = 'Standard Refinery';
    machineB = 'Turbo Blender / Refinery';
    assemblerMachine = 'Fluid Blending Array';
  } else if (lower.includes('smelt') || lower.includes('ingot') || lower.includes('ore')) {
    machineA = 'Standard Smelter';
    machineB = 'Foundry / Refined Smelter';
    assemblerMachine = 'High-Speed Constructor';
  } else if (lower.includes('assembl') || lower.includes('plate') || lower.includes('frame') || lower.includes('rotor') || lower.includes('motor')) {
    machineA = 'Standard Constructor Chain';
    machineB = 'Alternate Assembler';
    assemblerMachine = 'Automated Assembler';
  } else if (lower.includes('manifold') || lower.includes('belt') || lower.includes('splitter')) {
    machineA = 'Load Balancer Splitter Tree';
    machineB = 'Inline Manifold Cascade';
    assemblerMachine = 'Smart Splitter Buffer';
  }

  return {
    infographic_id: `ficsit-custom-${Date.now()}`,
    template_type: templateType,
    aspect_ratio: '9:16',
    header: {
      organization: 'FICSIT INC.',
      category: 'LOGISTICS MASTERCLASS',
      title: upperTitle.length > 40 ? upperTitle.slice(0, 38) + '...' : upperTitle,
      subtitle: `(${game.name.toUpperCase()} EFFICIENCY PROTOCOL)`,
    },
    raw_inputs: [
      {
        name: `Infeed: ${cleanTopic.split(' ')[0] || 'Raw Resource'}`,
        rate: primaryRate,
        icon_type: 'custom_infeed',
      },
    ],
    pathway_nodes: [
      {
        path_id: templateType === 'PROBLEM_SOLUTION' ? 'The Problem' : 'Path A (Standard)',
        machine: machineA,
        output_item: `Baseline ${cleanTopic.slice(0, 18)}`,
        rate: primaryRate,
        subtext: 'Baseline Routing: High machine footprint, redundant stages.',
        is_bottleneck: true,
      },
      {
        path_id: templateType === 'PROBLEM_SOLUTION' ? 'The Solution' : 'Path B (Optimized)',
        machine: machineB,
        recipe_tag: 'Alternate Unlocked',
        output_item: `Max Yield ${cleanTopic.slice(0, 18)}`,
        rate: secondaryRate,
        subtext: 'Optimal Flow: Maximum throughput, minimal footprint and zero waste.',
        is_optimal: true,
      },
    ],
    assembly_node: {
      machine: assemblerMachine,
      recipe_name: `${cleanTopic.slice(0, 24)} Assembly`,
      final_output: `${cleanTopic.slice(0, 22)} End Product`,
      output_rate: secondaryRate,
    },
    math_callouts: [
      `Target Objective: Optimize ${cleanTopic.slice(0, 30)}.`,
      `Throughput Metric: Maximized at ${secondaryRate}.`,
      'Footprint Reduction: Eliminates intermediate conveyor bottlenecks.',
      'Operational Uptime: 100% verified efficiency at steady-state.',
    ],
    verdict: `${upperTitle.slice(0, 32)}: MAXIMUM EFFICIENCY. ZERO WASTE.`,
  };
}

export async function synthesizeFicsitDataWithGemini(
  gameId: string,
  userTopic: string,
  templateType: FicsitTemplateType = 'FLOWCHART_CONSOLIDATION',
  keyFacts?: string
): Promise<FicsitInfographicData> {
  const config = getConfig();
  const game = getGameProfile(gameId);

  const prompt = `You are the Lead Industrial UI/UX Technical Illustrator and Logistics Systems Architect for FICSIT Inc.
Generate a structured production infographic payload adhering to the FICSIT Design System (v1.0.0).

STRICT INSTRUCTION:
Generate precise, custom technical data specifically and exclusively for the custom user topic: "${userTopic}".
Do NOT output any default boilerplate or irrelevant recipes. Extract the exact materials, machines, input/output rates, and math for "${userTopic}" in ${game.name}.

Context:
Game: ${game.name}
User Custom Topic: "${userTopic}"
Template Archetype: "${templateType}"
Key Facts: "${keyFacts || ''}"

Return ONLY valid JSON matching this schema:
{
  "infographic_id": "ficsit-custom",
  "template_type": "${templateType}",
  "aspect_ratio": "9:16",
  "header": {
    "organization": "FICSIT INC.",
    "category": "PRODUCTION GUIDE: ALTERNATE RECIPE",
    "title": "UPPERCASE CUSTOM TOPIC TITLE",
    "subtitle": "(SUBTITLE CONTEXT IN PARENTHESES)"
  },
  "raw_inputs": [
    {
      "name": "Input Material Name and Rate",
      "rate": "Input Rate / min",
      "icon_type": "material"
    }
  ],
  "pathway_nodes": [
    {
      "path_id": "Path A / Standard",
      "machine": "Machine Name",
      "output_item": "Item Name",
      "rate": "Rate / min",
      "subtext": "Technical annotation note",
      "is_bottleneck": false,
      "is_optimal": true
    },
    {
      "path_id": "Path B / Alternate",
      "machine": "Machine Name",
      "recipe_tag": "Recipe Name",
      "output_item": "Item Name",
      "rate": "Rate / min",
      "subtext": "Technical annotation note",
      "is_bottleneck": false,
      "is_optimal": true
    }
  ],
  "assembly_node": {
    "machine": "Assembler / Manufacturer / Refinery",
    "recipe_name": "Recipe Name",
    "final_output": "Final Product Name",
    "output_rate": "Output Rate / min"
  },
  "math_callouts": [
    "Specific math comparison fact 1",
    "Specific math comparison fact 2",
    "Specific math comparison fact 3"
  ],
  "verdict": "PUNCHY CAPITALIZED FICSIT VERDICT SLOGAN"
}`;

  // 1. Try Local OmniRoute Gateway Service (Port 20128)
  const omniUrl = config.omniRouteUrl || 'http://localhost:20128/v1';
  if (config.useOmniRoute !== false) {
    try {
      console.log(`[Procedural] Synthesizing blueprint via OmniRoute (${omniUrl})...`);
      const omniRes = await axios.post(
        `${omniUrl}/chat/completions`,
        {
          model: 'auto/best-fast',
          stream: false,
          messages: [
            { role: 'system', content: 'You are a technical factory systems architect. Return ONLY a valid JSON object matching the requested schema.' },
            { role: 'user', content: prompt },
          ],
        },
        { timeout: 20000 }
      );

      const content = omniRes.data?.choices?.[0]?.message?.content;
      if (content) {
        const cleaned = content.replace(/```json\s*|\s*```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.header?.title) {
          console.log(`[Procedural] Successfully synthesized blueprint with OmniRoute!`);
          return parsed;
        }
      }
    } catch (err: any) {
      console.warn(`[Procedural] OmniRoute synthesis failed (${err.message}), trying fallback...`);
    }
  }

  // 2. Try Google Gemini Direct API
  if (config.geminiApiKey) {
    try {
      console.log(`[Procedural] Synthesizing blueprint via Google Gemini Direct API...`);
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.geminiApiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        },
        { timeout: 15000 }
      );

      const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.header?.title) return parsed;
      }
    } catch (err: any) {
      console.warn(`[Procedural] Google Direct API unavailable (${err.message}), using deterministic engine...`);
    }
  }

  // 3. Deterministic Lexical Fallback
  return synthesizeDeterministicFicsitData(gameId, userTopic, templateType);
}

export function generateFicsitSVG(data: FicsitInfographicData): string {
  const C = FICSIT_COLORS;
  const templateType = data.template_type || 'FLOWCHART_CONSOLIDATION';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${C.BG_PRIMARY_1}"/>
      <stop offset="50%" stop-color="${C.BG_PRIMARY_2}"/>
      <stop offset="100%" stop-color="${C.BG_PRIMARY_1}"/>
    </linearGradient>

    <linearGradient id="surfaceCard" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${C.BG_SURFACE_2}"/>
      <stop offset="100%" stop-color="${C.BG_SURFACE_1}"/>
    </linearGradient>

    <linearGradient id="hazardGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${C.FICSIT_ORANGE}"/>
      <stop offset="100%" stop-color="${C.FICSIT_ORANGE_LIGHT}"/>
    </linearGradient>

    <!-- CAD Technical Grid Pattern -->
    <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${C.BORDER_GRID}" stroke-opacity="0.18" stroke-width="1"/>
      <circle cx="0" cy="0" r="1.5" fill="${C.BORDER_GRID}" fill-opacity="0.3"/>
    </pattern>

    <filter id="neonOrangeGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="${C.FICSIT_ORANGE}" flood-opacity="0.5"/>
    </filter>

    <filter id="neonCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="${C.ACCENT_CYAN}" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Deep Slate Industrial Background & CAD Canvas -->
  <rect width="1080" height="1920" fill="url(#bgGrad)"/>
  <rect width="1080" height="1920" fill="url(#cadGrid)"/>

  <!-- Outer Blueprint Technical Border & Corner Bolt Accents -->
  <rect x="25" y="25" width="1030" height="1870" fill="none" stroke="${C.BORDER_SUBTLE}" stroke-width="2" rx="16"/>
  <rect x="35" y="35" width="1010" height="1850" fill="none" stroke="${C.FICSIT_ORANGE}" stroke-opacity="0.4" stroke-width="1.5" rx="12" stroke-dasharray="16 8"/>

  <!-- Corner Bolts -->
  <g fill="${C.BORDER_GRID}" stroke="#0b0f19" stroke-width="1.5">
    <circle cx="45" cy="45" r="5"/>
    <circle cx="1035" cy="45" r="5"/>
    <circle cx="45" cy="1875" r="5"/>
    <circle cx="1035" cy="1875" r="5"/>
  </g>

  <!-- Top Header Bar (FICSIT Inc. Branding & Hazard Stripes) -->
  <g transform="translate(55, 55)">
    <!-- Hazard Stripes -->
    <rect width="970" height="14" rx="7" fill="#1e293b"/>
    <path d="M 0 0 L 16 14 M 32 0 L 48 14 M 64 0 L 80 14 M 96 0 L 112 14 M 128 0 L 144 14 M 160 0 L 176 14 M 192 0 L 208 14 M 224 0 L 240 14 M 256 0 L 272 14 M 288 0 L 304 14 M 320 0 L 336 14 M 352 0 L 368 14 M 384 0 L 400 14 M 416 0 L 432 14 M 448 0 L 464 14 M 480 0 L 496 14 M 512 0 L 528 14 M 544 0 L 560 14 M 576 0 L 592 14 M 608 0 L 624 14 M 640 0 L 656 14 M 672 0 L 688 14 M 704 0 L 720 14 M 736 0 L 752 14 M 768 0 L 784 14 M 800 0 L 816 14 M 832 0 L 848 14 M 864 0 L 880 14 M 896 0 L 912 14 M 928 0 L 944 14 M 960 0 L 976 14" stroke="${C.FICSIT_ORANGE}" stroke-width="5" stroke-opacity="0.8"/>

    <!-- Corporate Branding Pill -->
    <g transform="translate(0, 30)">
      <rect width="520" height="34" rx="6" fill="${C.BG_SURFACE_1}" stroke="${C.FICSIT_ORANGE}" stroke-width="1.5"/>
      <text x="18" y="22" fill="${C.FICSIT_ORANGE}" font-family="'DIN Alternate', 'Barlow Condensed', sans-serif" font-size="14" font-weight="900" letter-spacing="2">
        ${escapeXml(data.header.organization)} PRODUCTION GUIDE: ${escapeXml(data.header.category || 'LOGISTICS MASTERCLASS')}
      </text>
    </g>

    <!-- Main Infographic Title -->
    <text x="0" y="115" fill="${C.TEXT_PRIMARY}" font-family="'Barlow Condensed', 'DIN Alternate', Impact, sans-serif" font-size="50" font-weight="900" letter-spacing="1">
      ${escapeXml(data.header.title)}
    </text>

    <!-- Subtitle Frame with Hazard Marks -->
    <g transform="translate(0, 135)">
      <text x="0" y="24" fill="${C.ACCENT_CYAN}" font-family="'Courier New', monospace, sans-serif" font-size="20" font-weight="bold" letter-spacing="1.5">
        /// ${escapeXml(data.header.subtitle || '(OPTIMIZATION PROTOCOL)')} ///
      </text>
    </g>
  </g>

  <!-- Dynamic Template Body -->
  ${
    templateType === 'PROBLEM_SOLUTION'
      ? renderProblemSolutionTemplate(data, C)
      : templateType === 'COMPARISON'
      ? renderComparisonTemplate(data, C)
      : renderFlowchartConsolidationTemplate(data, C)
  }

  <!-- The Math Callout Card -->
  <g transform="translate(55, 1380)">
    <rect width="970" height="230" rx="14" fill="${C.BG_SURFACE_1}" stroke="${C.FICSIT_ORANGE}" stroke-width="2" filter="url(#neonOrangeGlow)"/>
    
    <!-- Title Badge -->
    <g transform="translate(25, 20)">
      <rect width="260" height="32" rx="6" fill="${C.FICSIT_ORANGE}"/>
      <text x="130" y="21" text-anchor="middle" fill="#0b0f19" font-family="'Barlow Condensed', sans-serif" font-size="15" font-weight="900" letter-spacing="1.5">
        ⚡ THE MATH CALLOUT
      </text>
    </g>

    <!-- Bullet Lines -->
    <g transform="translate(30, 85)">
      ${data.math_callouts
        .slice(0, 4)
        .map((line, idx) => `
      <g transform="translate(0, ${idx * 40})">
        <rect width="8" height="8" rx="2" fill="${C.ACCENT_CYAN}" y="-6"/>
        <text x="24" y="2" fill="${C.TEXT_PRIMARY}" font-family="'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="700">
          ${escapeXml(line)}
        </text>
      </g>`)
        .join('')}
    </g>
  </g>

  <!-- Bottom Executive Verdict Banner -->
  <g transform="translate(55, 1640)">
    <rect width="970" height="130" rx="14" fill="url(#hazardGrad)" filter="url(#neonOrangeGlow)"/>
    <text x="485" y="75" text-anchor="middle" fill="#0a0e17" font-family="'Barlow Condensed', 'DIN Alternate', Impact, sans-serif" font-size="28" font-weight="900" letter-spacing="1.5">
      ${escapeXml(data.verdict || 'ULTIMATE EFFICIENCY. ZERO WASTE. FICSIT APPROVED.')}
    </text>
  </g>

  <!-- Technical Margins / Barcode Footer -->
  <g transform="translate(55, 1800)">
    <g fill="${C.BORDER_GRID}">
      <rect x="0" y="0" width="4" height="30"/>
      <rect x="8" y="0" width="10" height="30"/>
      <rect x="24" y="0" width="4" height="30"/>
      <rect x="34" y="0" width="14" height="30"/>
      <rect x="54" y="0" width="4" height="30"/>
      <rect x="64" y="0" width="18" height="30"/>
      <rect x="88" y="0" width="6" height="30"/>
    </g>
    <text x="110" y="20" fill="${C.TEXT_MUTED}" font-family="monospace, sans-serif" font-size="13" font-weight="bold" letter-spacing="1">
      FICSIT SPEC: 9:16 VERTICAL ENGINE // REVISION 1.0.0
    </text>
    <text x="970" y="20" text-anchor="end" fill="${C.FICSIT_ORANGE}" font-family="monospace, sans-serif" font-size="13" font-weight="bold">
      EFFICIENCY IS MANDATORY
    </text>
  </g>

</svg>`;
}

// Template A: Comparison (Vertical Stack)
function renderComparisonTemplate(data: FicsitInfographicData, C: typeof FICSIT_COLORS): string {
  const pA = data.pathway_nodes[0] || { machine: 'Standard Smelter', output_item: 'Standard Output', rate: 'Default Rate' };
  const pB = data.pathway_nodes[1] || { machine: 'Alternate Constructor', output_item: 'Alternate Output', rate: 'Boosted Rate', recipe_tag: 'Alternate Recipe' };

  return `
  <!-- Section 1: Standard Recipe Panel -->
  <g transform="translate(55, 270)">
    <rect width="970" height="510" rx="14" fill="${C.BG_SURFACE_1}" stroke="${C.STATUS_WARNING}" stroke-width="2"/>
    <rect x="30" y="25" width="200" height="34" rx="6" fill="rgba(239, 68, 68, 0.2)" stroke="${C.STATUS_WARNING}" stroke-width="1.5"/>
    <text x="130" y="47" text-anchor="middle" fill="${C.STATUS_WARNING}" font-family="'Barlow Condensed', sans-serif" font-size="16" font-weight="900" letter-spacing="1.5">
      STANDARD RECIPE
    </text>

    <!-- Node Process Chain -->
    <g transform="translate(40, 100)">
      <rect width="260" height="150" rx="10" fill="#0e1622" stroke="${C.BORDER_SUBTLE}" stroke-width="1.5"/>
      <text x="20" y="40" fill="${C.TEXT_MUTED}" font-family="monospace" font-size="13" font-weight="bold">RAW INFEED</text>
      <text x="20" y="80" fill="${C.TEXT_PRIMARY}" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="bold">${escapeXml(data.raw_inputs[0]?.name || 'Raw Resource')}</text>
      <text x="20" y="115" fill="${C.ACCENT_CYAN}" font-family="monospace" font-size="14" font-weight="bold">${escapeXml(data.raw_inputs[0]?.rate || 'Standard Rate')}</text>

      <path d="M 270 75 L 320 75" stroke="${C.STATUS_WARNING}" stroke-width="3" stroke-dasharray="6 3"/>
      <polygon points="320,70 330,75 320,80" fill="${C.STATUS_WARNING}"/>

      <rect x="340" y="0" width="260" height="150" rx="10" fill="#0e1622" stroke="${C.BORDER_SUBTLE}" stroke-width="1.5"/>
      <text x="360" y="40" fill="${C.TEXT_MUTED}" font-family="monospace" font-size="13" font-weight="bold">PROCESSING</text>
      <text x="360" y="85" fill="${C.TEXT_PRIMARY}" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="bold">${escapeXml(pA.machine)}</text>

      <path d="M 610 75 L 660 75" stroke="${C.STATUS_WARNING}" stroke-width="3" stroke-dasharray="6 3"/>
      <polygon points="660,70 670,75 660,80" fill="${C.STATUS_WARNING}"/>

      <rect x="680" y="0" width="240" height="150" rx="10" fill="#0e1622" stroke="${C.BORDER_SUBTLE}" stroke-width="1.5"/>
      <text x="700" y="40" fill="${C.TEXT_MUTED}" font-family="monospace" font-size="13" font-weight="bold">OUTPUT</text>
      <text x="700" y="80" fill="${C.TEXT_PRIMARY}" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="bold">${escapeXml(pA.output_item)}</text>
      <text x="700" y="115" fill="${C.STATUS_WARNING}" font-family="monospace" font-size="14" font-weight="bold">${escapeXml(pA.rate)}</text>
    </g>

    <text x="40" y="340" fill="${C.TEXT_MUTED}" font-family="'Segoe UI', sans-serif" font-size="16">
      ${escapeXml(pA.subtext || 'Standard Logistics Note: High machine footprint, redundant multi-step stages.')}
    </text>
  </g>

  <!-- Section 2: Alternate Recipe Panel (OPTIMIZED) -->
  <g transform="translate(55, 820)">
    <rect width="970" height="520" rx="14" fill="${C.BG_SURFACE_2}" stroke="${C.STATUS_OPTIMAL}" stroke-width="3" filter="url(#neonCyanGlow)"/>
    <rect x="30" y="25" width="280" height="36" rx="6" fill="rgba(34, 197, 94, 0.2)" stroke="${C.STATUS_OPTIMAL}" stroke-width="2"/>
    <text x="170" y="49" text-anchor="middle" fill="${C.STATUS_OPTIMAL}" font-family="'Barlow Condensed', sans-serif" font-size="17" font-weight="900" letter-spacing="1.5">
      ★ ALTERNATE (UNLOCKED!)
    </text>

    <!-- Node Process Chain -->
    <g transform="translate(40, 100)">
      <rect width="260" height="160" rx="10" fill="#0b1320" stroke="${C.STATUS_OPTIMAL}" stroke-opacity="0.6" stroke-width="2"/>
      <text x="20" y="40" fill="${C.ACCENT_CYAN}" font-family="monospace" font-size="13" font-weight="bold">OPTIMIZED INPUT</text>
      <text x="20" y="85" fill="${C.TEXT_PRIMARY}" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="bold">${escapeXml(data.raw_inputs[0]?.name || 'Raw Resource')}</text>
      <text x="20" y="125" fill="${C.STATUS_OPTIMAL}" font-family="monospace" font-size="15" font-weight="bold">DIRECT INFEED</text>

      <path d="M 270 80 L 320 80" stroke="${C.STATUS_OPTIMAL}" stroke-width="4"/>
      <polygon points="320,74 332,80 320,86" fill="${C.STATUS_OPTIMAL}"/>

      <rect x="340" y="0" width="260" height="160" rx="10" fill="#0b1320" stroke="${C.STATUS_OPTIMAL}" stroke-opacity="0.6" stroke-width="2"/>
      <text x="360" y="40" fill="${C.ACCENT_CYAN}" font-family="monospace" font-size="13" font-weight="bold">HARD DRIVE RECIPE</text>
      <text x="360" y="85" fill="${C.TEXT_PRIMARY}" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="bold">${escapeXml(pB.machine)}</text>
      <text x="360" y="125" fill="${C.FICSIT_ORANGE}" font-family="monospace" font-size="14" font-weight="bold">${escapeXml(pB.recipe_tag || '1-Step Direct')}</text>

      <path d="M 610 80 L 660 80" stroke="${C.STATUS_OPTIMAL}" stroke-width="4"/>
      <polygon points="660,74 672,80 660,86" fill="${C.STATUS_OPTIMAL}"/>

      <rect x="680" y="0" width="240" height="160" rx="10" fill="#0b1320" stroke="${C.STATUS_OPTIMAL}" stroke-opacity="0.6" stroke-width="2"/>
      <text x="700" y="40" fill="${C.STATUS_OPTIMAL}" font-family="monospace" font-size="13" font-weight="bold">BOOSTED OUTPUT</text>
      <text x="700" y="85" fill="${C.TEXT_PRIMARY}" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="bold">${escapeXml(pB.output_item)}</text>
      <text x="700" y="125" fill="${C.STATUS_OPTIMAL}" font-family="monospace" font-size="16" font-weight="900">${escapeXml(pB.rate)}</text>
    </g>

    <text x="40" y="360" fill="${C.ACCENT_CYAN}" font-family="'Segoe UI', sans-serif" font-size="17" font-weight="700">
      ✓ ${escapeXml(pB.subtext || 'Alternate Efficiency Verdict: Optimal routing and higher throughput yield.')}
    </text>
  </g>`;
}

// Template B: Problem vs Solution (Bottleneck Eradication)
function renderProblemSolutionTemplate(data: FicsitInfographicData, C: typeof FICSIT_COLORS): string {
  const pA = data.pathway_nodes[0] || { machine: 'Standard Pipeline', output_item: 'Low Yield', rate: 'High Cost' };
  const pB = data.pathway_nodes[1] || { machine: 'Alternate Pipeline', output_item: 'High Yield', rate: 'Optimal' };

  return `
  <!-- Top Block (The Problem) -->
  <g transform="translate(55, 270)">
    <rect width="970" height="520" rx="14" fill="${C.BG_SURFACE_1}" stroke="${C.STATUS_WARNING}" stroke-width="2.5"/>
    <rect x="30" y="25" width="220" height="34" rx="6" fill="rgba(239, 68, 68, 0.2)" stroke="${C.STATUS_WARNING}" stroke-width="1.5"/>
    <text x="140" y="47" text-anchor="middle" fill="${C.STATUS_WARNING}" font-family="'Barlow Condensed', sans-serif" font-size="16" font-weight="900" letter-spacing="1.5">
      THE PROBLEM
    </text>

    <!-- Glowing Red X Badge -->
    <g transform="translate(850, 45)">
      <circle cx="20" cy="20" r="26" fill="rgba(239,68,68,0.25)" stroke="${C.STATUS_WARNING}" stroke-width="2"/>
      <text x="20" y="28" text-anchor="middle" fill="${C.STATUS_WARNING}" font-size="28" font-weight="900">✕</text>
    </g>

    <g transform="translate(40, 110)">
      <rect width="400" height="180" rx="10" fill="#0d1522" stroke="${C.BORDER_SUBTLE}" stroke-width="1.5"/>
      <text x="25" y="45" fill="${C.TEXT_MUTED}" font-family="monospace" font-size="14">INEFFICIENT INPUT</text>
      <text x="25" y="90" fill="${C.TEXT_PRIMARY}" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="bold">${escapeXml(data.raw_inputs[0]?.name || 'Raw Infeed')}</text>
      <text x="25" y="135" fill="${C.STATUS_WARNING}" font-family="monospace" font-size="15">Rate: ${escapeXml(data.raw_inputs[0]?.rate || 'Baseline')}</text>

      <path d="M 420 90 L 490 90" stroke="${C.STATUS_WARNING}" stroke-width="4" stroke-dasharray="6 3"/>
      <polygon points="490,84 502,90 490,96" fill="${C.STATUS_WARNING}"/>

      <rect x="520" y="0" width="400" height="180" rx="10" fill="#0d1522" stroke="${C.BORDER_SUBTLE}" stroke-width="1.5"/>
      <text x="25" y="45" fill="${C.TEXT_MUTED}" font-family="monospace" font-size="14">MACHINE OUTPUT</text>
      <text x="25" y="90" fill="${C.TEXT_PRIMARY}" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="bold">${escapeXml(pA.output_item)}</text>
      <text x="25" y="135" fill="${C.STATUS_WARNING}" font-family="monospace" font-size="15">Yield: ${escapeXml(pA.rate)}</text>
    </g>

    <text x="40" y="380" fill="${C.STATUS_WARNING}" font-family="'Segoe UI', sans-serif" font-size="17" font-weight="700">
      ⚠ ${escapeXml(pA.subtext || 'Bottleneck Detected: Excessive intermediate processing stages.')}
    </text>
  </g>

  <!-- Bottom Block (The Solution) -->
  <g transform="translate(55, 820)">
    <rect width="970" height="520" rx="14" fill="${C.BG_SURFACE_2}" stroke="${C.STATUS_OPTIMAL}" stroke-width="3" filter="url(#neonOrangeGlow)"/>
    <rect x="30" y="25" width="220" height="34" rx="6" fill="rgba(34, 197, 94, 0.2)" stroke="${C.STATUS_OPTIMAL}" stroke-width="1.5"/>
    <text x="140" y="47" text-anchor="middle" fill="${C.STATUS_OPTIMAL}" font-family="'Barlow Condensed', sans-serif" font-size="16" font-weight="900" letter-spacing="1.5">
      THE SOLUTION
    </text>

    <!-- Glowing Green Checkmark Badge -->
    <g transform="translate(850, 45)">
      <circle cx="20" cy="20" r="26" fill="rgba(34,197,94,0.25)" stroke="${C.STATUS_OPTIMAL}" stroke-width="2"/>
      <text x="20" y="28" text-anchor="middle" fill="${C.STATUS_OPTIMAL}" font-size="28" font-weight="900">✓</text>
    </g>

    <g transform="translate(40, 110)">
      <rect width="400" height="180" rx="10" fill="#0a1220" stroke="${C.STATUS_OPTIMAL}" stroke-opacity="0.6" stroke-width="2"/>
      <text x="25" y="45" fill="${C.ACCENT_CYAN}" font-family="monospace" font-size="14">OPTIMAL INFEED</text>
      <text x="25" y="90" fill="${C.TEXT_PRIMARY}" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="bold">${escapeXml(data.raw_inputs[0]?.name || 'Raw Infeed')}</text>
      <text x="25" y="135" fill="${C.STATUS_OPTIMAL}" font-family="monospace" font-size="15">Streamlined Direct Flow</text>

      <path d="M 420 90 L 490 90" stroke="${C.STATUS_OPTIMAL}" stroke-width="4"/>
      <polygon points="490,84 502,90 490,96" fill="${C.STATUS_OPTIMAL}"/>

      <rect x="520" y="0" width="400" height="180" rx="10" fill="#0a1220" stroke="${C.STATUS_OPTIMAL}" stroke-opacity="0.6" stroke-width="2"/>
      <text x="25" y="45" fill="${C.STATUS_OPTIMAL}" font-family="monospace" font-size="14">MAXIMUM YIELD</text>
      <text x="25" y="90" fill="${C.TEXT_PRIMARY}" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="bold">${escapeXml(pB.output_item)}</text>
      <text x="25" y="135" fill="${C.STATUS_OPTIMAL}" font-family="monospace" font-size="15">Output: ${escapeXml(pB.rate)}</text>
    </g>

    <text x="40" y="380" fill="${C.STATUS_OPTIMAL}" font-family="'Segoe UI', sans-serif" font-size="17" font-weight="700">
      ✓ ${escapeXml(pB.subtext || 'Resolution: Eradicates intermediate bottlenecks with higher material throughput.')}
    </text>
  </g>`;
}

// Template C: Logistics Masterclass (Full Assembly Flowchart)
function renderFlowchartConsolidationTemplate(data: FicsitInfographicData, C: typeof FICSIT_COLORS): string {
  const pA = data.pathway_nodes[0] || { machine: 'Smelter', output_item: 'Primary Component', rate: '25/min' };
  const pB = data.pathway_nodes[1] || { machine: 'Constructor', output_item: 'Secondary Component', rate: '50/min', recipe_tag: 'Alternate Recipe' };
  const ass = data.assembly_node || { machine: 'Assembler', recipe_name: 'Optimized Assembly', final_output: 'High-Tier Product', output_rate: '10/min' };

  return `
  <!-- Center Flowchart Layout Container -->
  <g transform="translate(55, 240)">
    
    <!-- Top Root Node: Raw Input with Splitting Arrows -->
    <g transform="translate(250, 0)">
      <rect width="470" height="110" rx="12" fill="${C.BG_SURFACE_2}" stroke="${C.FICSIT_ORANGE}" stroke-width="2" filter="url(#neonOrangeGlow)"/>
      <text x="235" y="34" text-anchor="middle" fill="${C.ACCENT_CYAN}" font-family="monospace" font-size="13" font-weight="bold" letter-spacing="1">
        PRIMARY RAW INFEED
      </text>
      <text x="235" y="78" text-anchor="middle" fill="${C.TEXT_PRIMARY}" font-family="'Barlow Condensed', sans-serif" font-size="24" font-weight="900">
        ${escapeXml(data.raw_inputs[0]?.name || 'Raw Input')}
      </text>

      <!-- Splitting Arrows (Y-Splitter) -->
      <path d="M 235 110 L 235 140 L 40 210" stroke="${C.ACCENT_CYAN}" stroke-width="3" fill="none"/>
      <polygon points="35,205 30,215 45,215" fill="${C.ACCENT_CYAN}"/>

      <path d="M 235 140 L 430 210" stroke="${C.ACCENT_CYAN}" stroke-width="3" fill="none"/>
      <polygon points="425,215 440,215 435,205" fill="${C.ACCENT_CYAN}"/>
    </g>

    <!-- Path A (Left Branch) -->
    <g transform="translate(20, 230)">
      <rect width="420" height="280" rx="12" fill="${C.BG_SURFACE_1}" stroke="${C.BORDER_SUBTLE}" stroke-width="2"/>
      <rect x="20" y="20" width="130" height="28" rx="6" fill="rgba(0, 229, 255, 0.15)" stroke="${C.ACCENT_CYAN}" stroke-width="1.5"/>
      <text x="85" y="39" text-anchor="middle" fill="${C.ACCENT_CYAN}" font-family="monospace" font-size="13" font-weight="bold">PATH A</text>

      <text x="25" y="90" fill="${C.TEXT_MUTED}" font-family="monospace" font-size="14">MACHINE NODE</text>
      <text x="25" y="125" fill="${C.TEXT_PRIMARY}" font-family="'Segoe UI', sans-serif" font-size="20" font-weight="bold">${escapeXml(pA.machine)}</text>

      <line x1="25" y1="160" x2="395" y2="160" stroke="${C.BORDER_SUBTLE}" stroke-width="1"/>

      <text x="25" y="195" fill="${C.TEXT_MUTED}" font-family="monospace" font-size="14">BRANCH OUTPUT</text>
      <text x="25" y="235" fill="${C.FICSIT_ORANGE}" font-family="'Barlow Condensed', sans-serif" font-size="24" font-weight="900">${escapeXml(pA.output_item)}</text>
      <text x="395" y="235" text-anchor="end" fill="${C.TEXT_PRIMARY}" font-family="monospace" font-size="18" font-weight="bold">${escapeXml(pA.rate)}</text>
    </g>

    <!-- Path B (Right Branch) -->
    <g transform="translate(530, 230)">
      <rect width="420" height="280" rx="12" fill="${C.BG_SURFACE_1}" stroke="${C.FICSIT_ORANGE}" stroke-width="2" filter="url(#neonOrangeGlow)"/>
      <rect x="20" y="20" width="130" height="28" rx="6" fill="rgba(250, 128, 20, 0.2)" stroke="${C.FICSIT_ORANGE}" stroke-width="1.5"/>
      <text x="85" y="39" text-anchor="middle" fill="${C.FICSIT_ORANGE}" font-family="monospace" font-size="13" font-weight="bold">PATH B</text>

      ${pB.recipe_tag ? `
      <rect x="160" y="20" width="220" height="28" rx="6" fill="rgba(34, 197, 94, 0.2)" stroke="${C.STATUS_OPTIMAL}" stroke-width="1.5"/>
      <text x="270" y="39" text-anchor="middle" fill="${C.STATUS_OPTIMAL}" font-family="monospace" font-size="12" font-weight="bold">${escapeXml(pB.recipe_tag)}</text>
      ` : ''}

      <text x="25" y="90" fill="${C.TEXT_MUTED}" font-family="monospace" font-size="14">MACHINE NODE</text>
      <text x="25" y="125" fill="${C.TEXT_PRIMARY}" font-family="'Segoe UI', sans-serif" font-size="20" font-weight="bold">${escapeXml(pB.machine)}</text>

      <line x1="25" y1="160" x2="395" y2="160" stroke="${C.BORDER_SUBTLE}" stroke-width="1"/>

      <text x="25" y="195" fill="${C.TEXT_MUTED}" font-family="monospace" font-size="14">BRANCH OUTPUT</text>
      <text x="25" y="235" fill="${C.FICSIT_ORANGE}" font-family="'Barlow Condensed', sans-serif" font-size="24" font-weight="900">${escapeXml(pB.output_item)}</text>
      <text x="395" y="235" text-anchor="end" fill="${C.TEXT_PRIMARY}" font-family="monospace" font-size="18" font-weight="bold">${escapeXml(pB.rate)}</text>
    </g>

    <!-- Convergence Feed Lines into Central Assembler -->
    <path d="M 230 510 L 230 570 L 400 620" stroke="${C.ACCENT_CYAN}" stroke-width="3" fill="none"/>
    <polygon points="395,612 410,622 398,628" fill="${C.ACCENT_CYAN}"/>

    <path d="M 740 510 L 740 570 L 570 620" stroke="${C.FICSIT_ORANGE}" stroke-width="3" fill="none"/>
    <polygon points="572,628 560,622 575,612" fill="${C.FICSIT_ORANGE}"/>

    <!-- Central Assembler Convergence Node -->
    <g transform="translate(185, 590)">
      <rect width="600" height="230" rx="14" fill="${C.BG_SURFACE_2}" stroke="${C.ACCENT_CYAN}" stroke-width="2.5" filter="url(#neonCyanGlow)"/>
      <rect x="25" y="20" width="240" height="30" rx="6" fill="rgba(0, 229, 255, 0.2)" stroke="${C.ACCENT_CYAN}" stroke-width="1.5"/>
      <text x="145" y="40" text-anchor="middle" fill="${C.ACCENT_CYAN}" font-family="monospace" font-size="13" font-weight="bold">CONVERGENCE NODE</text>

      <text x="25" y="90" fill="${C.TEXT_MUTED}" font-family="monospace" font-size="14">MACHINE / RECIPE</text>
      <text x="25" y="130" fill="${C.TEXT_PRIMARY}" font-family="'Barlow Condensed', sans-serif" font-size="28" font-weight="900">${escapeXml(ass.machine)}</text>
      <text x="25" y="170" fill="${C.FICSIT_ORANGE}" font-family="monospace" font-size="16" font-weight="bold">${escapeXml(ass.recipe_name)}</text>
    </g>

    <!-- Output Arrow to Final Node -->
    <path d="M 485 820 L 485 880" stroke="${C.STATUS_OPTIMAL}" stroke-width="5" fill="none"/>
    <polygon points="475,880 485,895 495,880" fill="${C.STATUS_OPTIMAL}"/>

    <!-- Final Output Node -->
    <g transform="translate(185, 900)">
      <rect width="600" height="170" rx="14" fill="${C.BG_SURFACE_1}" stroke="${C.STATUS_OPTIMAL}" stroke-width="3" filter="url(#neonOrangeGlow)"/>
      <rect x="25" y="20" width="200" height="30" rx="6" fill="rgba(34, 197, 94, 0.2)" stroke="${C.STATUS_OPTIMAL}" stroke-width="1.5"/>
      <text x="125" y="40" text-anchor="middle" fill="${C.STATUS_OPTIMAL}" font-family="monospace" font-size="13" font-weight="bold">FINAL PRODUCT</text>

      <text x="25" y="95" fill="${C.TEXT_PRIMARY}" font-family="'Barlow Condensed', sans-serif" font-size="32" font-weight="900">
        ${escapeXml(ass.final_output)}
      </text>
      <text x="25" y="138" fill="${C.STATUS_OPTIMAL}" font-family="monospace" font-size="20" font-weight="900">
        Rate: ${escapeXml(ass.output_rate)}
      </text>
    </g>

  </g>`;
}

function escapeXml(unsafe: string): string {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function renderBlueprintToPNG(
  svgContent: string,
  outputPath: string
): Promise<string> {
  const tmpSvg = path.join(path.dirname(outputPath), `temp-ficsit-${Date.now()}.svg`);
  fs.writeFileSync(tmpSvg, svgContent, 'utf-8');

  try {
    const cmd = `ffmpeg -y -i "${tmpSvg}" -vf scale=1080:1920 "${outputPath}"`;
    await execAsync(cmd);
    return outputPath;
  } finally {
    if (fs.existsSync(tmpSvg)) {
      try {
        fs.unlinkSync(tmpSvg);
      } catch (_) {}
    }
  }
}
