import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { getConfig } from '../config.js';
import { ProjectContext, ProjectScript } from '../types.js';
import { getGameProfile } from '../data/games.js';

function fileToGenerativePart(filePath: string, mimeType: string): Part {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
      mimeType,
    },
  };
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'image/jpeg';
}

function calculateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateSpeechDurationSeconds(text: string, wpm = 145): number {
  const words = calculateWordCount(text);
  return Math.round((words / wpm) * 60 * 10) / 10;
}

export function generateSsmlFromBeats(spokenText: string, beats: any[]): string {
  if (!beats || beats.length === 0) {
    return `<speak version="1.0" xml:lang="en-US">\n  <voice name="en-US-GuyNeural">\n    <s>${spokenText}</s>\n  </voice>\n</speak>`;
  }

  let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">\n  <voice name="en-US-GuyNeural">\n`;

  for (const beat of beats) {
    const text = beat.text ? beat.text.trim() : '';
    if (text) {
      ssml += `    <s>${text}</s>\n`;
      const pauseMs = beat.pauseAfterMs || 250;
      ssml += `    <break time="${pauseMs}ms"/>\n`;
    }
  }

  ssml += `  </voice>\n</speak>`;
  return ssml;
}

export async function generateGamingScript(
  screenshotPath: string | undefined,
  context: ProjectContext,
  customApiKey?: string
): Promise<{ script: ProjectScript; detectedElements: string[]; visualVibe: string }> {
  const config = getConfig();
  const apiKey = customApiKey || config.geminiApiKey;
  const gameProfile = getGameProfile(context.gameId);
  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  const candidateModels = ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
  const genConfig = {
    temperature: 0.85,
    topP: 0.95,
    responseMimeType: 'application/json',
  };

  const durationWordsMap: Record<number, { min: number; max: number }> = {
    15: { min: 38, max: 50 },
    30: { min: 72, max: 92 },
    45: { min: 105, max: 135 },
    60: { min: 140, max: 180 },
  };

  const targetRange = durationWordsMap[context.targetDuration] || { min: 72, max: 92 };

  const systemPrompt = `You are DFL GAMING, the ultimate short-form viral scriptwriter for Open-World, Survival, Crafting, and Automation Games (Satisfactory, Enshrouded, Valheim, Subnautica, Rust, Palworld, Once Human, 7 Days to Die, Factorio, etc.).

YOUR MISSION:
Write a high-energy, authentic, retention-engineered 9:16 vertical TikTok/Shorts narration script.

GAME CONTEXT:
- Game: ${gameProfile.name} (${gameProfile.badge})
- Known Key Mechanics: ${gameProfile.keyMechanics.join(', ')}
- Famous Terms / Jargon: ${gameProfile.famousTerms.join(', ')}
- Content Angle: ${context.contentType.replace('_', ' ').toUpperCase()}
- Hook Style: ${context.hookStyle}
- Spoken Tone: ${context.tone}

CRITICAL RULES FOR GAMING SCRIPTS:
1. Target Word Count: EXACTLY between ${targetRange.min} and ${targetRange.max} words (${context.targetDuration}s total spoken delivery).
2. The Hook (First 2.5 seconds): MUST immediately stop the scroll! Use numbers, mistakes ("99% of players..."), secret tricks, or visual callouts from the screenshot.
3. Gamer Authenticity: Speak like a real veteran player who understands the game's meta, ratios, and mechanics. Avoid cheesy corporate marketing speak.
4. Spoken Cadence: Write strictly for natural speech. Use contractions (don't, you'll, here's), short punchy clauses, and dramatic pauses.
5. If an image is provided: inspect inventory numbers, UI health/stamina bars, building materials, conveyor belt tiers, tier levels, or map landmarks and mention them naturally in the script!
6. Phonetics: Provide phonetic guides in 'phoneticOverrides' for difficult game terms (e.g. "FICSIT": "FIK-sit", "Eitr": "EYE-tur", "Anubis": "uh-NOO-bis").

Return ONLY valid JSON matching this schema:
{
  "detectedElements": ["element 1 in screenshot", "element 2", "element 3"],
  "visualVibe": "brief description of the screenshot aesthetic / gameplay situation",
  "hook": "The first 1-2 punchy opening sentences (2.5s retention hook)",
  "body": "The core gameplay breakdown, factory math, secret location, or building strategy",
  "cta": "Closing question, debate starter, or follow prompt",
  "spokenText": "The complete combined spoken narration text without any markdown or tags",
  "visualCallouts": ["Specific UI or item detail in screenshot highlighted"],
  "gameTips": ["Short actionable pro tip 1", "Pro tip 2"],
  "phoneticOverrides": {
    "Term": "Pronunciation"
  },
  "beats": [
    {
      "timeSec": 0.0,
      "text": "First sentence of the hook...",
      "visualFocus": "Specific region of screen to zoom in on (e.g. inventory bar / base roof / core machine)",
      "emotion": "hype / shocking / analytical",
      "pauseAfterMs": 250
    }
  ]
}`;

  const userPrompt = `TOPIC: ${context.topic || `${gameProfile.name} Pro Strategy`}
GAME: ${gameProfile.name}
CONTENT TYPE: ${context.contentType}
USER NOTES & SPECIFIC DETAILS:
${context.keyFacts || context.lore || 'Provide the most viral, mind-blowing trick or optimization for this game.'}

TARGET AUDIENCE: ${context.audience || 'Gamers, builders, and survival enthusiasts looking for fast actionable guides.'}`;

  let responseText = '';
  let lastError: any = null;

  // 1. Try OmniRoute Local Gateway Service (Port 20128)
  const omniUrl = config.omniRouteUrl || 'http://localhost:20128/v1';
  if (config.useOmniRoute !== false) {
    try {
      console.log(`[Scriptcraft] Synthesizing gaming script via OmniRoute (${omniUrl})...`);
      const userContent: any[] = [{ type: 'text', text: userPrompt }];

      if (screenshotPath && fs.existsSync(screenshotPath)) {
        const mime = getMimeType(screenshotPath);
        const base64Data = fs.readFileSync(screenshotPath).toString('base64');
        userContent.push({
          type: 'image_url',
          image_url: { url: `data:${mime};base64,${base64Data}` },
        });
      }

      const omniRes = await axios.post(
        `${omniUrl}/chat/completions`,
        {
          model: screenshotPath ? 'auto/best-vision' : 'auto/best-fast',
          stream: false,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
        },
        { timeout: 25000 }
      );

      const content = omniRes.data?.choices?.[0]?.message?.content;
      if (content) {
        responseText = content;
        console.log('[Scriptcraft] Successfully synthesized script via OmniRoute!');
      }
    } catch (err: any) {
      console.warn(`[Scriptcraft] OmniRoute attempt failed (${err.message}), falling back to direct API...`);
      lastError = err;
    }
  }

  // 2. Fallback to Google Gemini Direct API
  if (!responseText && apiKey && genAI) {
    const contents: any[] = [];
    if (screenshotPath && fs.existsSync(screenshotPath)) {
      const mime = getMimeType(screenshotPath);
      contents.push(fileToGenerativePart(screenshotPath, mime));
    }
    contents.push({ text: `${systemPrompt}\n\n${userPrompt}` });

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: genConfig,
        });
        const response = await model.generateContent(contents);
        responseText = response.response.text();
        if (responseText) {
          break;
        }
      } catch (err: any) {
        console.warn(`[Gemini API] Failed with model ${modelName}:`, err.message);
        lastError = err;
      }
    }
  }

  if (!responseText && lastError) {
    throw new Error(`Generation failed: ${lastError.message || lastError}`);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(responseText);
  } catch (err) {
    const cleaned = responseText.replace(/```json\s*|\s*```/g, '').trim();
    parsed = JSON.parse(cleaned);
  }

  const spokenText = parsed.spokenText || `${parsed.hook || ''} ${parsed.body || ''} ${parsed.cta || ''}`.trim();
  const wordCount = calculateWordCount(spokenText);
  const estimatedSeconds = estimateSpeechDurationSeconds(spokenText);
  const ssmlText = generateSsmlFromBeats(spokenText, parsed.beats || []);

  const script: ProjectScript = {
    spokenText,
    ssmlText,
    hook: parsed.hook || '',
    body: parsed.body || '',
    cta: parsed.cta || '',
    wordCount,
    estimatedSeconds,
    phoneticOverrides: parsed.phoneticOverrides || {},
    beats: parsed.beats || [],
    visualCallouts: parsed.visualCallouts || [],
    gameTips: parsed.gameTips || [],
  };

  return {
    script,
    detectedElements: parsed.detectedElements || [],
    visualVibe: parsed.visualVibe || '',
  };
}
