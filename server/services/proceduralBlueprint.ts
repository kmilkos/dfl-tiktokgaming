import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import { getConfig } from '../config.js';
import { getGameProfile } from '../data/games.js';

const execAsync = promisify(exec);

export interface BlueprintData {
  headerBadge: string;
  title: string;
  subtitle: string;
  badgeColor?: 'amber' | 'cyan' | 'emerald' | 'purple';
  stats: Array<{ label: string; value: string; color?: string }>;
  standardPath?: {
    title: string;
    steps: string[];
    metric?: string;
  };
  alternatePath: {
    title: string;
    steps: string[];
    metric?: string;
    tag?: string;
  };
  mathBox: {
    title: string;
    highlight: string;
    bullets: string[];
  };
  bottomBanner: string;
}

export async function synthesizeBlueprintDataWithGemini(
  gameId: string,
  userTopic: string,
  keyFacts?: string
): Promise<BlueprintData> {
  const config = getConfig();
  const game = getGameProfile(gameId);

  const prompt = `You are a legendary technical gaming infographic designer specializing in 9:16 vertical TikTok/Shorts game blueprints for "${game.name}".
The user wants an infographic for: "${userTopic || game.popularHooks[0] || 'Efficiency Recipe Strategy'}".
Additional context / facts: "${keyFacts || 'Optimal ratios, alternate recipe or glitch strategy'}".

Generate a structured JSON technical blueprint with exact game numbers, recipe steps, and comparison.
Output ONLY valid JSON with this exact schema:
{
  "headerBadge": "ORGANIZATION / ARCHIVE PROTOCOL (e.g. FICSIT INC. // EFFICIENCY PROTOCOL #084 or ENSHROUDED CRAFTING CODEX)",
  "title": "SHORT BOLD TITLE (max 3 words, e.g. CAST SCREWS, TURBOFUEL LOOP, ASHLANDS FORGE)",
  "subtitle": "RECIPE UNLOCK OR CONTEXT (e.g. M.A.M. HARD DRIVE DISCOVERY, TIER 4 POWER META)",
  "badgeColor": "amber", // one of "amber", "cyan", "emerald", "purple"
  "stats": [
    {"label": "METRIC 1", "value": "-50% MW"},
    {"label": "METRIC 2", "value": "-50% TILES"},
    {"label": "METRIC 3", "value": "50 / MIN"}
  ],
  "standardPath": {
    "title": "STANDARD RECIPE (INEFFICIENT)",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "metric": "Output rate or loss"
  },
  "alternatePath": {
    "title": "ALTERNATE META (UNLOCKED!)",
    "steps": ["Optimized Step 1", "Optimized Step 2"],
    "metric": "Massive Boost Rate",
    "tag": "OPTIMAL"
  },
  "mathBox": {
    "title": "THE EFFICIENCY MATH",
    "highlight": "ONE-LINE CRITICAL TAKEAWAY",
    "bullets": [
      "Key reason 1 with numbers",
      "Key reason 2 with savings"
    ]
  },
  "bottomBanner": "PUNCHY 5-8 WORD SLOGAN IN ALL CAPS (e.g. ZERO RODS. ZERO BOTTLENECKS. ULTIMATE THROUGHPUT.)"
}`;

  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.geminiApiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      },
      { timeout: 20000 }
    );

    const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error('No blueprint data returned from Gemini');
    return JSON.parse(raw);
  } catch (err: any) {
    console.warn('Gemini blueprint synthesis fallback:', err.message);
    // Fallback template
    return {
      headerBadge: `${game.name.toUpperCase()} // EFFICIENCY PROTOCOL #01`,
      title: userTopic.toUpperCase() || 'EFFICIENCY BLUEPRINT',
      subtitle: 'HIGH YIELD OPTIMIZATION MATRIX',
      badgeColor: 'amber',
      stats: [
        { label: 'POWER SAVED', value: '-45% MW' },
        { label: 'SPACE FOOTPRINT', value: '-50% TILES' },
        { label: 'THROUGHPUT', value: 'MAX META' },
      ],
      standardPath: {
        title: 'STANDARD PATH (2-STEP CONVERSION)',
        steps: ['Raw Ingot Input', 'Intermediate Component', 'Finished Craft'],
        metric: 'High Bottleneck',
      },
      alternatePath: {
        title: 'ALTERNATE PATH (UNLOCKED!)',
        steps: ['Direct Smelt / Cast Ingot', 'Instant Finished Craft (1-Step)'],
        metric: '2x Output Speed',
        tag: 'OPTIMIZED',
      },
      mathBox: {
        title: 'THE EFFICIENCY MATH',
        highlight: 'ELIMINATES INTERMEDIATE BOTTLENECK',
        bullets: [
          'Removes 50% of production buildings needed on your factory floor.',
          'Saves massive power grid capacity for late-game scaling.',
        ],
      },
      bottomBanner: 'ZERO INTERMEDIATE LOSS. MAXIMUM SYSTEM OUTPUT.',
    };
  }
}

export function generateBlueprintSVG(data: BlueprintData): string {
  const primaryColor = data.badgeColor === 'cyan' ? '#06b6d4' : data.badgeColor === 'emerald' ? '#10b981' : data.badgeColor === 'purple' ? '#a855f7' : '#f59e0b';
  const primaryGlow = data.badgeColor === 'cyan' ? 'rgba(6,182,212,0.4)' : data.badgeColor === 'emerald' ? 'rgba(16,185,129,0.4)' : data.badgeColor === 'purple' ? 'rgba(168,85,247,0.4)' : 'rgba(245,158,11,0.4)';

  const stats = data.stats || [];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#070a12"/>
      <stop offset="50%" stop-color="#0b1120"/>
      <stop offset="100%" stop-color="#050811"/>
    </linearGradient>
    <linearGradient id="primaryCard" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#131d31"/>
      <stop offset="100%" stop-color="#0c1322"/>
    </linearGradient>
    <linearGradient id="altCard" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#16263d"/>
      <stop offset="100%" stop-color="#0d1829"/>
    </linearGradient>
    <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
    <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <circle cx="0" cy="0" r="1.5" fill="rgba(255,255,255,0.1)"/>
    </pattern>
    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="${primaryColor}" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background CAD Grid -->
  <rect width="1080" height="1920" fill="url(#bgGrad)"/>
  <rect width="1080" height="1920" fill="url(#cadGrid)"/>

  <!-- Outer Technical Blueprint Border & Corner Brackets -->
  <rect x="30" y="30" width="1020" height="1860" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" rx="24"/>
  <rect x="40" y="40" width="1000" height="1840" fill="none" stroke="${primaryColor}" stroke-opacity="0.3" stroke-width="1" rx="18" stroke-dasharray="16 8"/>

  <!-- Top Industrial Safety Diagonal Warning Stripe Ribbon -->
  <g transform="translate(60, 65)">
    <rect width="960" height="16" fill="#1e293b" rx="8"/>
    <path d="M 0 0 L 20 16 M 40 0 L 60 16 M 80 0 L 100 16 M 120 0 L 140 16 M 160 0 L 180 16 M 200 0 L 220 16 M 240 0 L 260 16 M 280 0 L 300 16 M 320 0 L 340 16 M 360 0 L 380 16 M 400 0 L 420 16 M 440 0 L 460 16 M 480 0 L 500 16 M 520 0 L 540 16 M 560 0 L 580 16 M 600 0 L 620 16 M 640 0 L 660 16 M 680 0 L 700 16 M 720 0 L 740 16 M 760 0 L 780 16 M 800 0 L 820 16 M 840 0 L 860 16 M 880 0 L 900 16 M 920 0 L 940 16" stroke="${primaryColor}" stroke-width="6" stroke-opacity="0.7"/>
  </g>

  <!-- Header Section -->
  <g transform="translate(60, 115)">
    <!-- Header Top Badge -->
    <rect width="460" height="34" rx="8" fill="rgba(255,255,255,0.06)" stroke="${primaryColor}" stroke-width="1.5"/>
    <text x="20" y="22" fill="${primaryColor}" font-family="monospace, sans-serif" font-size="14" font-weight="bold" letter-spacing="2">
      ${escapeXml(data.headerBadge || 'EFFICIENCY REPORT // PROTOCOL')}
    </text>

    <!-- Main Title -->
    <text x="0" y="95" fill="#ffffff" font-family="'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" letter-spacing="1">
      ${escapeXml(data.title || 'BLUEPRINT')}
    </text>

    <!-- Subtitle Pill -->
    <g transform="translate(0, 115)">
      <rect width="560" height="38" rx="10" fill="rgba(6, 182, 212, 0.15)" stroke="#06b6d4" stroke-width="1.5"/>
      <circle cx="20" cy="19" r="6" fill="#06b6d4"/>
      <text x="36" y="25" fill="#e0f2fe" font-family="monospace, sans-serif" font-size="15" font-weight="bold" letter-spacing="1">
        ${escapeXml(data.subtitle || 'OPTIMIZATION DISCOVERY')}
      </text>
    </g>
  </g>

  <!-- 3 Key Metric Scorecards -->
  <g transform="translate(60, 310)">
    ${stats
      .slice(0, 3)
      .map((stat, i) => {
        const xOffset = i * 330;
        return `
      <g transform="translate(${xOffset}, 0)">
        <rect width="300" height="110" rx="16" fill="url(#primaryCard)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
        <text x="20" y="34" fill="#94a3b8" font-family="monospace, sans-serif" font-size="13" font-weight="bold" letter-spacing="1">
          ${escapeXml(stat.label)}
        </text>
        <text x="20" y="84" fill="${stat.color || primaryColor}" font-family="'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900">
          ${escapeXml(stat.value)}
        </text>
      </g>`;
      })
      .join('')}
  </g>

  <!-- Flowchart Section 1: Standard Inefficient Path -->
  ${
    data.standardPath
      ? `
  <g transform="translate(60, 460)">
    <rect width="960" height="300" rx="20" fill="url(#primaryCard)" stroke="rgba(239, 68, 68, 0.4)" stroke-width="2"/>
    
    <!-- Title Pill -->
    <rect x="25" y="25" width="380" height="36" rx="8" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="1.5"/>
    <text x="45" y="48" fill="#fca5a5" font-family="monospace, sans-serif" font-size="14" font-weight="bold">
      ${escapeXml(data.standardPath.title || 'STANDARD PATH (INEFFICIENT)')}
    </text>

    <!-- Node Steps -->
    <g transform="translate(30, 85)">
      ${data.standardPath.steps
        .map((step, idx) => {
          const stepX = idx * 225;
          return `
        <g transform="translate(${stepX}, 0)">
          <rect width="190" height="150" rx="14" fill="#090d16" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
          <circle cx="30" cy="30" r="14" fill="#1e293b"/>
          <text x="25" y="35" fill="#94a3b8" font-family="monospace, sans-serif" font-size="12" font-weight="bold">${idx + 1}</text>
          <text x="20" y="85" fill="#e2e8f0" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="bold">
            ${escapeXml(step)}
          </text>
        </g>
        ${
          idx < data.standardPath!.steps.length - 1
            ? `<path d="M ${stepX + 195} 75 L ${stepX + 220} 75" stroke="#ef4444" stroke-width="3" stroke-dasharray="4 2"/>
               <polygon points="${stepX + 220},71 ${stepX + 228},75 ${stepX + 220},79" fill="#ef4444"/>`
            : ''
        }
        `;
        })
        .join('')}
    </g>

    ${
      data.standardPath.metric
        ? `
    <text x="935" y="50" text-anchor="end" fill="#ef4444" font-family="monospace, sans-serif" font-size="14" font-weight="bold">
      ${escapeXml(data.standardPath.metric)}
    </text>`
        : ''
    }
  </g>`
      : ''
  }

  <!-- Flowchart Section 2: Alternate Unlocked Path (OPTIMIZED) -->
  <g transform="translate(60, 790)">
    <rect width="960" height="350" rx="20" fill="url(#altCard)" stroke="${primaryColor}" stroke-width="3" filter="url(#neonGlow)"/>
    
    <!-- Title Pill & Unlocked Badge -->
    <rect x="25" y="25" width="430" height="40" rx="10" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" stroke-width="2"/>
    <text x="45" y="51" fill="#6ee7b7" font-family="monospace, sans-serif" font-size="16" font-weight="900" letter-spacing="1">
      ★ ${escapeXml(data.alternatePath.title || 'ALTERNATE PATH (UNLOCKED!)')}
    </text>

    <rect x="800" y="25" width="135" height="36" rx="8" fill="${primaryColor}"/>
    <text x="867" y="49" text-anchor="middle" fill="#0f172a" font-family="monospace, sans-serif" font-size="14" font-weight="900" letter-spacing="1">
      ${escapeXml(data.alternatePath.tag || 'OPTIMAL')}
    </text>

    <!-- Node Steps with Iso Machines -->
    <g transform="translate(30, 95)">
      ${data.alternatePath.steps
        .map((step, idx) => {
          const stepX = idx * 295;
          return `
        <g transform="translate(${stepX}, 0)">
          <rect width="255" height="190" rx="16" fill="#0a1220" stroke="${primaryColor}" stroke-opacity="0.6" stroke-width="2"/>
          <circle cx="35" cy="35" r="16" fill="${primaryColor}"/>
          <text x="29" y="41" fill="#0f172a" font-family="monospace, sans-serif" font-size="15" font-weight="900">#${idx + 1}</text>
          
          <text x="25" y="105" fill="#ffffff" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="bold">
            ${escapeXml(step)}
          </text>
          <text x="25" y="150" fill="${primaryColor}" font-family="monospace, sans-serif" font-size="14" font-weight="bold">
            DIRECT PIPELINE ✓
          </text>
        </g>
        ${
          idx < data.alternatePath.steps.length - 1
            ? `<path d="M ${stepX + 260} 95 L ${stepX + 290} 95" stroke="#10b981" stroke-width="4"/>
               <polygon points="${stepX + 290},89 ${stepX + 302},95 ${stepX + 290},101" fill="#10b981"/>`
            : ''
        }
        `;
        })
        .join('')}
    </g>
  </g>

  <!-- The Math Callout Box -->
  <g transform="translate(60, 1170)">
    <rect width="960" height="340" rx="20" fill="#0e172a" stroke="#f59e0b" stroke-width="2.5"/>
    
    <!-- Math Header -->
    <g transform="translate(30, 30)">
      <circle cx="20" cy="20" r="18" fill="#f59e0b"/>
      <text x="14" y="27" fill="#0f172a" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="bold">⚡</text>
      
      <text x="50" y="26" fill="#fbbf24" font-family="monospace, sans-serif" font-size="18" font-weight="bold" letter-spacing="1">
        ${escapeXml(data.mathBox.title || 'THE EFFICIENCY MATH')}
      </text>

      <!-- Highlight Banner -->
      <rect x="0" y="55" width="900" height="50" rx="12" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="20" y="87" fill="#fef3c7" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900">
        ${escapeXml(data.mathBox.highlight || 'ONE-LINE HIGHLIGHT')}
      </text>

      <!-- Bullet Points -->
      ${data.mathBox.bullets
        .map((bullet, bIdx) => {
          const yPos = 145 + bIdx * 50;
          return `
        <g transform="translate(10, ${yPos})">
          <circle cx="10" cy="-6" r="6" fill="#f59e0b"/>
          <text x="30" y="0" fill="#cbd5e1" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500">
            ${escapeXml(bullet)}
          </text>
        </g>`;
        })
        .join('')}
    </g>
  </g>

  <!-- Bottom Final Verdict Banner -->
  <g transform="translate(60, 1540)">
    <rect width="960" height="140" rx="20" fill="url(#bannerGrad)" filter="url(#neonGlow)"/>
    <text x="480" y="80" text-anchor="middle" fill="#090d16" font-family="'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="900" letter-spacing="1">
      ${escapeXml(data.bottomBanner || 'ZERO BOTTLENECK. MAXIMUM EFFICIENCY.')}
    </text>
  </g>

  <!-- Footer Blueprint Barcode & Metadata -->
  <g transform="translate(60, 1720)">
    <!-- Barcode Simulation -->
    <g fill="#475569">
      <rect x="0" y="0" width="4" height="40"/>
      <rect x="8" y="0" width="8" height="40"/>
      <rect x="20" y="0" width="4" height="40"/>
      <rect x="28" y="0" width="12" height="40"/>
      <rect x="44" y="0" width="4" height="40"/>
      <rect x="52" y="0" width="8" height="40"/>
      <rect x="64" y="0" width="16" height="40"/>
      <rect x="84" y="0" width="4" height="40"/>
      <rect x="92" y="0" width="8" height="40"/>
      <rect x="104" y="0" width="4" height="40"/>
      <rect x="112" y="0" width="12" height="40"/>
    </g>
    <text x="140" y="26" fill="#64748b" font-family="monospace, sans-serif" font-size="14" font-weight="bold">
      SPEC-ID: 99482-B // REVISION 1.0 // TIKTOK 9:16 HIGH-DENSITY BLUEPRINT
    </text>
    <text x="960" y="26" text-anchor="end" fill="${primaryColor}" font-family="monospace, sans-serif" font-size="14" font-weight="bold">
      EFFICIENCY IS MANDATORY
    </text>
  </g>

</svg>`;
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
  const tmpSvg = path.join(path.dirname(outputPath), `temp-${Date.now()}.svg`);
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
