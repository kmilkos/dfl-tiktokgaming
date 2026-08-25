import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import { getConfig } from '../config.js';
import { VoiceOption } from '../types.js';
import { cleanSpokenText, applyPhoneticOverrides } from './ttsFormatter.js';

const EDGE_TTS_BIN = '/opt/edith-aivideo/pyenv/bin/edge-tts';

export const GAMING_VOICES: VoiceOption[] = [
  { id: 'en-US-GuyNeural', name: 'Guy (Hype / Energetic Gamer)', gender: 'male', lang: 'en-US', engine: 'edge-tts', vibe: 'High energy, fast-paced TikTok gaming hook' },
  { id: 'en-US-ChristopherNeural', name: 'Christopher (Deep Lore / Cinematic Narrator)', gender: 'male', lang: 'en-US', engine: 'edge-tts', vibe: 'Dramatic, intense, mysterious survival atmosphere' },
  { id: 'en-US-JennyNeural', name: 'Jenny (Expressive / Pro Streamer)', gender: 'female', lang: 'en-US', engine: 'edge-tts', vibe: 'Engaging, fast, upbeat gaming commentary' },
  { id: 'en-US-EricNeural', name: 'Eric (Authority / Factory Engineer)', gender: 'male', lang: 'en-US', engine: 'edge-tts', vibe: 'Analytical, authoritative, technical optimization' },
  { id: 'en-US-AriaNeural', name: 'Aria (Modern / Sarcastic Gamer)', gender: 'female', lang: 'en-US', engine: 'edge-tts', vibe: 'Sharp, punchy, witty gaming insights' },
  { id: 'en-GB-RyanNeural', name: 'Ryan (British / Soulslike / Dark Fantasy)', gender: 'male', lang: 'en-GB', engine: 'edge-tts', vibe: 'Norse mythos, deep dark fantasy lore' },
  { id: 'en-US-BrianMultilingualNeural', name: 'Brian (Casual / Let\'s Play Guide)', gender: 'male', lang: 'en-US', engine: 'edge-tts', vibe: 'Friendly, relatable, instructional walkthroughs' },
];

export async function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err || !metadata || !metadata.format || !metadata.format.duration) {
        try {
          const stats = fs.statSync(filePath);
          resolve(Math.round((stats.size / 16000) * 10) / 10);
        } catch {
          resolve(30);
        }
        return;
      }
      resolve(Math.round(metadata.format.duration * 10) / 10);
    });
  });
}

export async function synthesizeSpeech(
  text: string,
  voiceId: string = 'en-US-GuyNeural',
  engine: 'edge-tts' | 'elevenlabs' = 'edge-tts',
  speed = 1.0,
  phoneticOverrides: Record<string, string> = {},
  outputFilename?: string
): Promise<{ filePath: string; durationSeconds: number }> {
  const config = getConfig();
  const filename = outputFilename || `tts-${Date.now()}-${Math.random().toString(36).substr(2, 5)}.mp3`;
  const outputPath = path.join(config.paths.generated, filename);

  const cleanText = cleanSpokenText(text);
  const processedText = applyPhoneticOverrides(cleanText, phoneticOverrides);

  if (!processedText.trim()) {
    throw new Error('No text provided for speech synthesis');
  }

  if (engine === 'elevenlabs') {
    if (!config.elevenLabsApiKey) {
      throw new Error('ElevenLabs API key is missing. Set it in Settings.');
    }

    const elevenVoiceId = voiceId || '21m00Tcm4TlvDq8ikWAM';
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`,
      {
        text: processedText,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      },
      {
        headers: {
          'xi-api-key': config.elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    fs.writeFileSync(outputPath, Buffer.from(response.data));
    const durationSeconds = await getAudioDuration(outputPath);
    return { filePath: outputPath, durationSeconds };
  }

  // Edge-TTS Generation
  const rateArg = speed !== 1.0 ? `${speed > 1 ? '+' : ''}${Math.round((speed - 1) * 100)}%` : '+0%';

  return new Promise((resolve, reject) => {
    const args = [
      '--voice', voiceId,
      '--text', processedText,
      '--rate', rateArg,
      '--write-media', outputPath,
    ];

    const proc = spawn(EDGE_TTS_BIN, args);
    let stderr = '';

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', async (code) => {
      if (code !== 0) {
        return reject(new Error(`Edge-TTS failed with code ${code}: ${stderr}`));
      }

      try {
        const durationSeconds = await getAudioDuration(outputPath);
        resolve({ filePath: outputPath, durationSeconds });
      } catch (err) {
        resolve({ filePath: outputPath, durationSeconds: 30 });
      }
    });
  });
}
