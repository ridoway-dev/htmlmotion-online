'use client';

import { parseSubtitles, generateSrtContent, generateVttContent } from './subtitle-parser';

export interface BrowserRecordOptions {
  duration: number; // in seconds
  fps?: number;
  html: string;
  previewElement?: HTMLElement | null;
  onProgress?: (progress: number, stepMessage: string) => void;
}

export interface BrowserRecordResult {
  blobUrl: string;
  srtBlobUrl?: string;
  vttBlobUrl?: string;
  fileSizeBytes: number;
  hasSubtitles: boolean;
  subtitleCuesCount: number;
}

/**
 * Records the HTML animation directly inside the user's browser using
 * GPU-accelerated MediaRecorder and getDisplayMedia (Current Tab capture).
 * Zero server load, zero memory crashes, 100% free and unlimited.
 */
export async function recordInBrowser(options: BrowserRecordOptions): Promise<BrowserRecordResult> {
  const { duration, fps = 30, html, previewElement, onProgress } = options;

  if (typeof window === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('Your browser does not support in-browser screen/tab recording.');
  }

  onProgress?.(10, 'Requesting browser tab capture permission...');

  // 1. Request Current Tab capture
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'browser',
        frameRate: fps,
      },
      audio: false,
      preferCurrentTab: true,
      selfBrowserSurface: 'include',
      systemAudio: 'exclude',
    } as MediaStreamConstraints);
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };
    if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
      throw new Error('Screen capture cancelled. Please select the tab to record.');
    }
    throw new Error('Could not access tab capture: ' + (error.message || String(err)));
  }

  // 2. Crop to preview element if Region Capture (CropTarget) is supported
  const videoTrack = stream.getVideoTracks()[0];
  if (previewElement && typeof window !== 'undefined' && 'CropTarget' in window) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cropTarget = await (window as any).CropTarget.fromElement(previewElement);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (videoTrack && typeof (videoTrack as any).cropTo === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (videoTrack as any).cropTo(cropTarget);
      }
    } catch {
      // CropTarget optional fallback
    }
  }

  // 3. Setup MediaRecorder with best supported webm format
  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
  }

  const recordedChunks: Blob[] = [];
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 12000000, // 12 Mbps studio quality
  });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  const durationMs = Math.max(1, duration) * 1000;
  onProgress?.(25, `Recording animation in browser (0s / ${duration}s)...`);

  // Start recording
  mediaRecorder.start(250);
  const startTime = Date.now();

  // Progress ticker
  const progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const ratio = Math.min(1, elapsed / durationMs);
    const percent = Math.round(25 + ratio * 65);
    const secs = Math.round(ratio * duration);
    onProgress?.(percent, `Recording animation in browser (${secs}s / ${duration}s)...`);
  }, 400);

  // Wait for animation duration to complete
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, durationMs);
  });

  clearInterval(progressInterval);
  onProgress?.(92, 'Finalizing video stream & packaging file...');

  // Stop recorder and wait for final blob
  const recordStopPromise = new Promise<Blob>((resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: mimeType });
      resolve(blob);
    };
  });

  mediaRecorder.stop();
  stream.getTracks().forEach((track) => track.stop());

  const videoBlob = await recordStopPromise;
  const blobUrl = URL.createObjectURL(videoBlob);

  // 4. Extract and generate Subtitles if present
  const cues = parseSubtitles(html);
  let srtBlobUrl: string | undefined = undefined;
  let vttBlobUrl: string | undefined = undefined;

  if (cues.length > 0) {
    const srtContent = generateSrtContent(cues);
    const srtBlob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    srtBlobUrl = URL.createObjectURL(srtBlob);

    const vttContent = generateVttContent(cues);
    const vttBlob = new Blob([vttContent], { type: 'text/vtt;charset=utf-8' });
    vttBlobUrl = URL.createObjectURL(vttBlob);
  }

  onProgress?.(100, cues.length > 0
    ? `Ready! Video & Subtitles (${cues.length} cues) recorded successfully.`
    : 'Ready! Video recorded successfully in your browser.'
  );

  return {
    blobUrl,
    srtBlobUrl,
    vttBlobUrl,
    fileSizeBytes: videoBlob.size,
    hasSubtitles: cues.length > 0,
    subtitleCuesCount: cues.length,
  };
}
