import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { getConfig } from '../config.js';
import { GamingProject, MotionStyleType } from '../types.js';

export async function renderGaming916Video(
  project: GamingProject,
  onProgress?: (percent: number) => void
): Promise<{ outputPath: string; sizeBytes: number; durationSeconds: number }> {
  const config = getConfig();

  if (!project.image?.path || !fs.existsSync(project.image.path)) {
    throw new Error('Project has no valid source screenshot or image');
  }

  if (!project.voice.audioPath || !fs.existsSync(project.voice.audioPath)) {
    throw new Error('Project has no voiceover audio. Generate TTS voice first.');
  }

  const duration = project.voice.durationSeconds || 30;
  const fps = config.defaultSettings.fps || 60;
  const totalFrames = Math.ceil(duration * fps);

  const outputFilename = `dfl-gaming-${project.gameId}-${Date.now()}.mp4`;
  const exportsDir = config.paths.exports;
  if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true });

  const outputPath = path.join(exportsDir, outputFilename);

  const motionStyle = project.motion.style || 'ken_burns_zoom';
  let zoompanFilter = '';

  const focusX = project.motion.focusPoint?.x ?? 0.5;
  const focusY = project.motion.focusPoint?.y ?? 0.5;

  if (motionStyle === 'pan_down') {
    zoompanFilter = `zoompan=z='1.2':x='iw*${focusX}-(iw/zoom/2)':y='if(lte(on,1),0,y+((ih-ih/zoom)/${totalFrames}))':d=${totalFrames}:s=1080x1920:fps=${fps}`;
  } else if (motionStyle === 'pan_up') {
    zoompanFilter = `zoompan=z='1.2':x='iw*${focusX}-(iw/zoom/2)':y='if(lte(on,1),ih-ih/zoom,y-((ih-ih/zoom)/${totalFrames}))':d=${totalFrames}:s=1080x1920:fps=${fps}`;
  } else if (motionStyle === 'pulse_zoom') {
    zoompanFilter = `zoompan=z='1.18+0.08*sin(2*PI*on/(${fps}*3))':x='iw*${focusX}-(iw/zoom/2)':y='ih*${focusY}-(ih/zoom/2)':d=${totalFrames}:s=1080x1920:fps=${fps}`;
  } else if (motionStyle === 'cinematic_drift') {
    zoompanFilter = `zoompan=z='1.15':x='if(lte(on,1),0,x+((iw-iw/zoom)/${totalFrames}))':y='ih*${focusY}-(ih/zoom/2)':d=${totalFrames}:s=1080x1920:fps=${fps}`;
  } else {
    // Default Ken Burns smooth zoom into focus region
    zoompanFilter = `zoompan=z='min(zoom+0.0008,1.35)':x='iw*${focusX}-(iw/zoom/2)':y='ih*${focusY}-(ih/zoom/2)':d=${totalFrames}:s=1080x1920:fps=${fps}`;
  }

  const complexFilter = [
    `[0:v]scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,${zoompanFilter},format=yuv420p[v]`,
  ];

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(project.image!.path)
      .loop(duration)
      .input(project.voice.audioPath!)
      .complexFilter(complexFilter)
      .outputOptions([
        '-map [v]',
        '-map 1:a',
        '-c:v libx264',
        '-preset fast',
        '-crf 20',
        '-c:a aac',
        '-b:a 192k',
        '-pix_fmt yuv420p',
        `-t ${duration}`,
        '-movflags +faststart',
      ])
      .output(outputPath)
      .on('progress', (p) => {
        if (onProgress && p.percent) {
          onProgress(Math.round(p.percent));
        }
      })
      .on('end', () => {
        try {
          const stats = fs.statSync(outputPath);
          resolve({
            outputPath,
            sizeBytes: stats.size,
            durationSeconds: duration,
          });
        } catch (err) {
          resolve({
            outputPath,
            sizeBytes: 0,
            durationSeconds: duration,
          });
        }
      })
      .on('error', (err) => {
        console.error('FFmpeg render error:', err);
        reject(err);
      })
      .run();
  });
}
