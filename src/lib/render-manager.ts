import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { chromium, Browser } from 'playwright';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import { cleanUnwantedButtons } from './html-cleaner';
import { parseSubtitles, generateSrtContent, generateVttContent } from './subtitle-parser';
import { RenderJob, RenderJobSettings } from './types';

function getFFmpegPath(): string {
  const winBinary = path.join(process.cwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');
  if (fs.existsSync(winBinary)) {
    return winBinary;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const installer = require('@ffmpeg-installer/ffmpeg');
    if (installer && installer.path) return installer.path;
  } catch {
    // fallback
  }
  return 'ffmpeg';
}

// Configure FFmpeg binary path
const resolvedFfmpegPath = getFFmpegPath();
ffmpeg.setFfmpegPath(resolvedFfmpegPath);

// In-memory job registry for local MVP (using globalThis for Next.js singleton)
const globalForJobs = globalThis as unknown as {
  renderJobsMap: Map<string, RenderJob>;
};

export const jobsMap = globalForJobs.renderJobsMap || new Map<string, RenderJob>();
if (!globalForJobs.renderJobsMap) {
  globalForJobs.renderJobsMap = jobsMap;
}

const BASE_TEMP_DIR = path.join(process.cwd(), '.temp_renders');
if (!fs.existsSync(BASE_TEMP_DIR)) {
  fs.mkdirSync(BASE_TEMP_DIR, { recursive: true });
}

export function createRenderJob(settings: RenderJobSettings): RenderJob {
  const id = uuidv4();
  const job: RenderJob = {
    id,
    createdAt: Date.now(),
    status: 'queued',
    progress: 5,
    stepMessage: 'Job queued in local render engine...',
    settings,
  };
  jobsMap.set(id, job);

  // Start execution asynchronously in background
  executeRenderJob(id).catch((err) => {
    console.error(`Render job ${id} failed:`, err);
    updateJob(id, {
      status: 'failed',
      progress: 100,
      stepMessage: 'Render failed',
      error: err instanceof Error ? err.message : String(err),
    });
  });

  return job;
}

export function getRenderJob(id: string): RenderJob | undefined {
  return jobsMap.get(id);
}

function updateJob(id: string, updates: Partial<RenderJob>) {
  const current = jobsMap.get(id);
  if (current) {
    const updated = { ...current, ...updates };
    jobsMap.set(id, updated);
  }
}

async function executeRenderJob(id: string) {
  const job = jobsMap.get(id);
  if (!job) return;

  const jobDir = path.join(BASE_TEMP_DIR, id);
  if (!fs.existsSync(jobDir)) {
    fs.mkdirSync(jobDir, { recursive: true });
  }

  const {
    html,
    width = 1920,
    height = 1080,
    duration = 5,
    fps = 60,
    delay = 600,
    crf = 18,
    backgroundColor,
    selector,
    scrollMode = 'static',
  } = job.settings;

  updateJob(id, {
    status: 'preparing',
    progress: 15,
    stepMessage: 'Setting up isolated Chromium sandbox...',
  });

  // Inject background override & font smoothing if specified
  let processedHtml = html;
  if (backgroundColor && backgroundColor !== 'transparent') {
    processedHtml = processedHtml.replace(
      /<body[^>]*>/i,
      (match) => `${match}\n<style>body { background-color: ${backgroundColor} !important; }</style>`
    );
  }

  // Strip unwanted player/replay/subtitle buttons (e.g. #rp, #st)
  processedHtml = cleanUnwantedButtons(processedHtml);

  // Ensure index.html exists
  const htmlPath = path.join(jobDir, 'index.html');
  fs.writeFileSync(htmlPath, processedHtml, 'utf-8');

  let browser: Browser | null = null;
  let webmPath: string | null = null;

  try {
    updateJob(id, {
      status: 'launching',
      progress: 25,
      stepMessage: 'Launching Chromium headless rendering engine...',
    });

    // In memory-constrained environments (e.g. Render free tier 512MB RAM),
    // cap FPS to 30 to prevent Chromium screencast buffer from triggering OOM
    const isConstrained = Boolean(process.env.RENDER || process.env.NODE_ENV === 'production');
    const effectiveFps = isConstrained && fps > 30 ? 30 : fps;

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--no-zygote',
        '--single-process',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-sync',
        '--mute-audio',
        '--hide-scrollbars',
        '--disable-web-security',
        '--allow-file-access-from-files',
        '--disable-features=Translate,OptimizationHints,MediaRouter',
        '--js-flags=--max-old-space-size=256',
      ],
    });

    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      recordVideo: {
        dir: jobDir,
        size: { width, height },
      },
    });

    const page = await context.newPage();

    updateJob(id, {
      status: 'capturing',
      progress: 40,
      stepMessage: 'Loading HTML animation and external assets...',
    });

    const fileUrl = pathToFileURL(htmlPath).href;
    await page.goto(fileUrl, { waitUntil: 'load', timeout: 30000 });

    // Wait for fonts & DOM stability
    try {
      await page.evaluate(() => (document as unknown as { fonts?: { ready?: Promise<void> } }).fonts?.ready);
    } catch {
      // ignore
    }

    // Explicitly remove #rp, #st and unwanted interactive control buttons from DOM
    try {
      await page.evaluate(() => {
        const rp = document.getElementById('rp');
        if (rp) rp.remove();
        const st = document.getElementById('st');
        if (st) st.remove();
        document.querySelectorAll('button, .btn, [role="button"]').forEach((btn) => {
          const t = (btn.textContent || '').trim().toLowerCase();
          if (
            t.includes('আবার চালান') ||
            t.includes('সাবটাইটেল') ||
            t === 'replay' ||
            t === 'restart' ||
            t === 'subtitles'
          ) {
            btn.remove();
          }
        });
      });
    } catch {
      // ignore
    }

    // Scroll to specific section if requested
    if (selector && selector !== 'full') {
      try {
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el) {
            el.scrollIntoView({ behavior: 'instant', block: 'start' });
          }
        }, selector);
      } catch {
        // ignore selector error
      }
    }

    // Pre-delay to settle animation clock
    if (delay > 0) {
      await page.waitForTimeout(delay);
    }

    const durationMs = Math.max(1, Math.min(180, duration)) * 1000;

    // Start auto-scroll if requested
    if (scrollMode === 'auto-scroll') {
      await page.evaluate((durMs) => {
        const maxScroll = Math.max(0, document.body.scrollHeight - window.innerHeight);
        if (maxScroll > 0) {
          const start = performance.now();
          function step(now: number) {
            const elapsed = now - start;
            const progress = Math.min(1, elapsed / durMs);
            window.scrollTo(0, progress * maxScroll);
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        }
      }, durationMs);
    }

    updateJob(id, {
      status: 'capturing',
      progress: 55,
      stepMessage: `Rendering ${duration}s motion frames at ${effectiveFps} FPS...`,
    });
    
    // Gradual progress counter while rendering frames
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(1, elapsed / durationMs);
      const currentProg = Math.round(55 + ratio * 25);
      updateJob(id, {
        progress: currentProg,
        stepMessage: `Rendering frames (${Math.round(ratio * duration)}s / ${duration}s)...`,
      });
    }, 500);

    try {
      await page.waitForTimeout(durationMs);
    } finally {
      clearInterval(progressInterval);
    }

    // Close page to finalize Chromium internal video stream
    await page.close();
    const video = page.video();
    if (video) {
      webmPath = await video.path();
    }
    await context.close();
    await browser.close();
    browser = null;

    if (!webmPath || !fs.existsSync(/*turbopackIgnore: true*/ webmPath)) {
      throw new Error('Chromium video capture stream failed to output file');
    }

    updateJob(id, {
      status: 'encoding',
      progress: 82,
      stepMessage: 'Transcoding frames to studio-grade H.264 MP4...',
    });

    const mp4Path = path.join(jobDir, 'motion-render.mp4');

    await new Promise<void>((resolve, reject) => {
      ffmpeg(webmPath!)
        .outputOptions([
          '-c:v libx264',
          '-pix_fmt yuv420p',
          `-r ${effectiveFps}`,
          '-preset veryfast',
          '-threads 2',
          `-crf ${crf}`,
          '-movflags +faststart',
          `-t ${duration}`,
        ])
        .save(mp4Path)
        .on('progress', (p) => {
          if (p.percent) {
            const mapped = Math.min(98, Math.round(82 + (p.percent / 100) * 15));
            updateJob(id, {
              progress: mapped,
              stepMessage: `FFmpeg Encoding: ${Math.round(p.percent)}% complete...`,
            });
          }
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    // Cleanup raw WebM file to free disk space immediately
    if (webmPath && fs.existsSync(/*turbopackIgnore: true*/ webmPath)) {
      try {
        fs.unlinkSync(/*turbopackIgnore: true*/ webmPath);
      } catch {
        // ignore
      }
    }

    const stat = fs.statSync(mp4Path);

    // Parse and generate subtitles if present
    const cues = parseSubtitles(html);
    let srtPath: string | undefined = undefined;
    if (cues.length > 0) {
      srtPath = path.join(jobDir, 'subtitles.srt');
      fs.writeFileSync(srtPath, generateSrtContent(cues), 'utf-8');
      const vttPath = path.join(jobDir, 'subtitles.vtt');
      fs.writeFileSync(vttPath, generateVttContent(cues), 'utf-8');
    }

    updateJob(id, {
      status: 'completed',
      progress: 100,
      stepMessage: cues.length > 0
        ? `Ready! MP4 & Subtitles (${cues.length} cues) rendered successfully.`
        : 'Ready! MP4 video rendered successfully.',
      mp4Path,
      fileSizeBytes: stat.size,
      hasSubtitles: cues.length > 0,
      subtitleCuesCount: cues.length,
      srtPath,
    });
  } catch (err) {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // ignore
      }
    }
    throw err;
  }
}

// Periodic cleanup of temp files older than 2 hours
setInterval(() => {
  try {
    const now = Date.now();
    for (const [id, job] of jobsMap.entries()) {
      if (now - job.createdAt > 2 * 60 * 60 * 1000) {
        jobsMap.delete(id);
        const dir = path.join(BASE_TEMP_DIR, id);
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      }
    }
  } catch (err) {
    console.error('Cleanup error:', err);
  }
}, 30 * 60 * 1000);
