/**
 * Subtitle Cue and Parser utilities for Claude Motion / HTML exports.
 * Extracts subtitles from data-s, data-t, data-d, data-subtitle, data-caption,
 * and converts them into standard .SRT and .VTT files.
 */

export interface SubtitleCue {
  index: number;
  startTimeSec: number;
  endTimeSec: number;
  text: string;
}

/**
 * Format seconds into SRT timestamp: HH:MM:SS,mmm
 */
export function formatSrtTimestamp(seconds: number): string {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const hrs = Math.floor(totalMs / 3600000);
  const mins = Math.floor((totalMs % 3600000) / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
}

/**
 * Format seconds into WebVTT timestamp: HH:MM:SS.mmm
 */
export function formatVttTimestamp(seconds: number): string {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const hrs = Math.floor(totalMs / 3600000);
  const mins = Math.floor((totalMs % 3600000) / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`;
}

/**
 * Parses subtitles from HTML content
 */
export function parseSubtitles(html: string): SubtitleCue[] {
  if (!html) return [];

  const cues: SubtitleCue[] = [];
  let cueIndex = 1;

  // 1. Check for Claude standard data-t, data-d, data-s:
  // e.g. <section class="sc n" data-t="0" data-d="4" data-s="মেসেজ ক্যাম্পেইন চালাচ্ছেন...">
  // or any element with data-s="..."
  const dataSRegex = /<[a-zA-Z0-9_-]+[^>]*?\bdata-t=["']?(\d+(?:\.\d+)?)["']?[^>]*?\bdata-d=["']?(\d+(?:\.\d+)?)["']?[^>]*?\bdata-s=["']([^"']+)["'][^>]*>/gi;
  let match;

  while ((match = dataSRegex.exec(html)) !== null) {
    const start = parseFloat(match[1]);
    const duration = parseFloat(match[2]);
    const text = match[3].trim();

    if (text) {
      cues.push({
        index: cueIndex++,
        startTimeSec: start,
        endTimeSec: start + duration,
        text,
      });
    }
  }

  // Also check reverse attribute order: data-s before data-t / data-d
  if (cues.length === 0) {
    const dataSReverseRegex = /<[a-zA-Z0-9_-]+[^>]*?\bdata-s=["']([^"']+)["'][^>]*?\bdata-t=["']?(\d+(?:\.\d+)?)["']?[^>]*?\bdata-d=["']?(\d+(?:\.\d+)?)["'][^>]*>/gi;
    while ((match = dataSReverseRegex.exec(html)) !== null) {
      const text = match[1].trim();
      const start = parseFloat(match[2]);
      const duration = parseFloat(match[3]);

      if (text) {
        cues.push({
          index: cueIndex++,
          startTimeSec: start,
          endTimeSec: start + duration,
          text,
        });
      }
    }
  }

  // 2. Check for data-subtitle / data-caption
  if (cues.length === 0) {
    const dataSubRegex = /<[a-zA-Z0-9_-]+[^>]*?\b(?:data-subtitle|data-caption)=["']([^"']+)["'][^>]*>/gi;
    let t = 0;
    while ((match = dataSubRegex.exec(html)) !== null) {
      const text = match[1].trim();
      if (text) {
        cues.push({
          index: cueIndex++,
          startTimeSec: t,
          endTimeSec: t + 4,
          text,
        });
        t += 4;
      }
    }
  }

  // 3. Check for JS subtitles array: e.g. subtitles = [{ t: 0, d: 4, s: '...' }]
  if (cues.length === 0) {
    const jsArrayRegex = /\{\s*(?:t|start)\s*:\s*(\d+(?:\.\d+)?)\s*,\s*(?:d|dur|duration)\s*:\s*(\d+(?:\.\d+)?)\s*,\s*(?:s|text)\s*:\s*["']([^"']+)["']\s*\}/gi;
    while ((match = jsArrayRegex.exec(html)) !== null) {
      const start = parseFloat(match[1]);
      const duration = parseFloat(match[2]);
      const text = match[3].trim();
      if (text) {
        cues.push({
          index: cueIndex++,
          startTimeSec: start,
          endTimeSec: start + duration,
          text,
        });
      }
    }
  }

  // Sort by start time
  return cues.sort((a, b) => a.startTimeSec - b.startTimeSec);
}

/**
 * Generate standard .SRT subtitle content
 */
export function generateSrtContent(cues: SubtitleCue[]): string {
  if (!cues || cues.length === 0) return '';

  return cues
    .map((cue, idx) => {
      const startStr = formatSrtTimestamp(cue.startTimeSec);
      const endStr = formatSrtTimestamp(cue.endTimeSec);
      return `${idx + 1}\r\n${startStr} --> ${endStr}\r\n${cue.text}\r\n`;
    })
    .join('\r\n');
}

/**
 * Generate standard .VTT subtitle content
 */
export function generateVttContent(cues: SubtitleCue[]): string {
  if (!cues || cues.length === 0) return '';

  const header = 'WEBVTT\r\n\r\n';
  const body = cues
    .map((cue, idx) => {
      const startStr = formatVttTimestamp(cue.startTimeSec);
      const endStr = formatVttTimestamp(cue.endTimeSec);
      return `${idx + 1}\r\n${startStr} --> ${endStr}\r\n${cue.text}\r\n`;
    })
    .join('\r\n');

  return header + body;
}
