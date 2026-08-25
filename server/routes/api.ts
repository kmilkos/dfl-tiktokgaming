import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { getConfig, saveConfig } from '../config.js';
import { projectManager } from '../services/projectManager.js';
import { GAME_PROFILES } from '../data/games.js';
import { generateGamingScript } from '../services/geminiGaming.js';
import { synthesizeSpeech, GAMING_VOICES } from '../services/ttsEngine.js';
import { renderGaming916Video } from '../services/visualMotion.js';
import { generateGameImage, fetchImageFromUrl, GAME_INFOGRAPHIC_PRESETS } from '../services/gameImageGenerator.js';
import { parseQuotaError } from '../utils/quotaParser.js';

export const apiRouter = Router();

const upload = multer({
  dest: getConfig().paths.uploads,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// 1. Games Presets
apiRouter.get('/games', (req, res) => {
  res.json(GAME_PROFILES);
});

apiRouter.get('/voices', (req, res) => {
  res.json(GAMING_VOICES);
});

// 2. Projects CRUD
apiRouter.get('/projects', (req, res) => {
  res.json(projectManager.getProjects());
});

apiRouter.get('/projects/:id', (req, res) => {
  const project = projectManager.getProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

apiRouter.post('/projects', (req, res) => {
  try {
    const project = projectManager.createProject(req.body);
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/projects/:id', (req, res) => {
  try {
    const project = projectManager.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/projects/:id', (req, res) => {
  const ok = projectManager.deleteProject(req.params.id);
  res.json({ ok });
});

// 2b. Project Script Management
apiRouter.post('/projects/:id/scripts', (req, res) => {
  try {
    const newScript = projectManager.addScriptToProject(req.params.id, req.body);
    const project = projectManager.getProject(req.params.id);
    res.json({ success: true, script: newScript, project });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/projects/:id/scripts/:scriptId', (req, res) => {
  try {
    const updated = projectManager.updateScriptInProject(req.params.id, req.params.scriptId, req.body);
    const project = projectManager.getProject(req.params.id);
    res.json({ success: true, script: updated, project });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/projects/:id/scripts/:scriptId', (req, res) => {
  try {
    const ok = projectManager.deleteScriptFromProject(req.params.id, req.params.scriptId);
    const project = projectManager.getProject(req.params.id);
    res.json({ ok, project });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/projects/:id/scripts/:scriptId/duplicate', (req, res) => {
  try {
    const duplicated = projectManager.duplicateScriptInProject(req.params.id, req.params.scriptId);
    const project = projectManager.getProject(req.params.id);
    res.json({ success: true, script: duplicated, project });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/projects/:id/active-script/:scriptId', (req, res) => {
  try {
    const project = projectManager.updateProject(req.params.id, { activeScriptId: req.params.scriptId });
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Screenshot Upload
apiRouter.post('/upload/screenshot', upload.single('screenshot'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No screenshot uploaded' });
    }

    const ext = path.extname(req.file.originalname) || '.jpg';
    const targetFilename = `screen-${Date.now()}-${Math.random().toString(36).substr(2, 5)}${ext}`;
    const targetPath = path.join(getConfig().paths.uploads, targetFilename);

    fs.renameSync(req.file.path, targetPath);

    const imageMetadata = {
      filename: req.file.originalname,
      path: targetPath,
      url: `/api/media/stream?path=${encodeURIComponent(targetPath)}`,
      width: 1080,
      height: 1920,
      format: ext.replace('.', ''),
      sizeBytes: req.file.size,
    };

    res.json({ success: true, image: imageMetadata });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3b. Base64 Upload
apiRouter.post('/upload/image-base64', (req, res) => {
  try {
    const { filename, data } = req.body;
    if (!data) return res.status(400).json({ error: 'No base64 data provided' });

    const base64Clean = data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');
    const ext = path.extname(filename || 'screenshot.png') || '.png';
    const targetFilename = `screen-${Date.now()}-${Math.random().toString(36).substr(2, 5)}${ext}`;
    const targetPath = path.join(getConfig().paths.uploads, targetFilename);

    fs.writeFileSync(targetPath, buffer);

    const imageMetadata = {
      filename: filename || 'uploaded_screenshot.png',
      path: targetPath,
      url: `/api/media/stream?path=${encodeURIComponent(targetPath)}`,
      width: 1080,
      height: 1920,
      format: ext.replace('.', ''),
      sizeBytes: buffer.length,
    };

    res.json({ success: true, image: imageMetadata });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3c. Direct Image URL Import
apiRouter.post('/upload/image-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'No image URL provided' });

    const result = await fetchImageFromUrl(url);
    const imageMetadata = {
      filename: result.filename,
      path: result.filePath,
      url: result.url,
      width: result.width,
      height: result.height,
      format: 'png',
      sizeBytes: fs.statSync(result.filePath).size,
    };

    res.json({ success: true, image: imageMetadata });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to download image from URL' });
  }
});

// 3c. AI Gaming Infographic / Scene Generation (Flux / Gemini)
apiRouter.get('/image/presets', (req, res) => {
  res.json(GAME_INFOGRAPHIC_PRESETS);
});

apiRouter.post('/generate/image', async (req, res) => {
  try {
    const { prompt, gameId, styleMode, enhanceWithAI, engine } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required for image generation' });
    }

    const result = await generateGameImage({
      prompt,
      gameId: gameId || 'satisfactory',
      styleMode: styleMode || 'infographic',
      enhanceWithAI: enhanceWithAI ?? true,
      engine: engine || (styleMode === 'infographic' ? 'procedural' : 'flux'),
      aspectRatio: '9:16',
    });

    const imageMetadata = {
      filename: path.basename(result.filePath),
      path: result.filePath,
      url: result.url,
      width: result.width,
      height: result.height,
      format: 'jpg',
      sizeBytes: fs.statSync(result.filePath).size,
      promptUsed: result.promptUsed,
    };

    res.json({ success: true, image: imageMetadata });
  } catch (err: any) {
    console.error('Image generation error:', err);
    const quotaInfo = parseQuotaError(err, 'Gemini / AI Generator');
    res.status(quotaInfo.isQuotaError ? 429 : 500).json({
      error: quotaInfo.userMessage,
      quotaInfo,
    });
  }
});

// 4. AI Multimodal Gaming Script Synthesis (Gemini 2.5 Flash)
apiRouter.post('/generate/script', async (req, res) => {
  try {
    const { imagePath, context, apiKey } = req.body;
    if (!context) return res.status(400).json({ error: 'Context is required' });

    const result = await generateGamingScript(imagePath, context, apiKey);
    res.json(result);
  } catch (err: any) {
    console.error('Gaming script generation error:', err);
    const quotaInfo = parseQuotaError(err, 'Gemini 2.5 Flash');
    res.status(quotaInfo.isQuotaError ? 429 : 500).json({
      error: quotaInfo.userMessage,
      quotaInfo,
    });
  }
});

// 5. TTS Voice Synthesis
apiRouter.post('/generate/tts', async (req, res) => {
  try {
    const { text, voiceId, engine, speed, phoneticOverrides } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for TTS synthesis' });
    }

    const result = await synthesizeSpeech(
      text,
      voiceId,
      engine || 'edge-tts',
      speed || 1.05,
      phoneticOverrides || {}
    );

    const audioUrl = `/api/media/stream?path=${encodeURIComponent(result.filePath)}`;

    res.json({
      success: true,
      audioPath: result.filePath,
      audioUrl,
      durationSeconds: result.durationSeconds,
    });
  } catch (err: any) {
    console.error('TTS synthesis error:', err);
    const quotaInfo = parseQuotaError(err, 'ElevenLabs / TTS');
    res.status(quotaInfo.isQuotaError ? 429 : 500).json({
      error: quotaInfo.userMessage,
      quotaInfo,
    });
  }
});

// 6. 9:16 Video Rendering
apiRouter.post('/render/video', async (req, res) => {
  try {
    const { project } = req.body;
    if (!project) return res.status(400).json({ error: 'Project data is required' });

    const result = await renderGaming916Video(project);
    const videoUrl = `/api/media/stream?path=${encodeURIComponent(result.outputPath)}`;

    res.json({
      success: true,
      outputPath: result.outputPath,
      videoUrl,
      sizeBytes: result.sizeBytes,
      durationSeconds: result.durationSeconds,
    });
  } catch (err: any) {
    console.error('Video render error:', err);
    res.status(500).json({ error: err.message || 'Video rendering failed' });
  }
});

// 7. Config Settings
apiRouter.get('/config', (req, res) => {
  res.json(getConfig());
});

apiRouter.post('/config', (req, res) => {
  try {
    const updated = saveConfig(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Safe Media Streaming with Range Requests
apiRouter.get('/media/stream', (req, res) => {
  const filePath = req.query.path as string;
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const ext = path.extname(filePath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.mp3') contentType = 'audio/mpeg';
  if (ext === '.wav') contentType = 'audio/wav';
  if (ext === '.mp4') contentType = 'video/mp4';
  if (ext === '.png') contentType = 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  if (ext === '.webp') contentType = 'image/webp';

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});
