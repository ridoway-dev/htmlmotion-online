export interface DetectedRatio {
  ratioLabel: string; // '16:9' | '9:16' | '1:1' | '4:5' | 'custom'
  width: number;
  height: number;
  confidence: 'high' | 'medium' | 'fallback';
}

/**
 * Statically detects aspect ratio from HTML, CSS rules, canvas, and svg
 */
export function detectHtmlAspectRatio(html: string): DetectedRatio {
  if (!html) {
    return { ratioLabel: '16:9', width: 1920, height: 1080, confidence: 'fallback' };
  }

  // 1. Check explicit CSS aspect-ratio: 9/16, 16/9, 1/1, 4/5
  const cssAspectRegex = /aspect-ratio\s*:\s*(\d+(?:\.\d+)?)\s*(?:\/|\s)\s*(\d+(?:\.\d+)?)/i;
  const aspectMatch = html.match(cssAspectRegex);
  if (aspectMatch) {
    const w = parseFloat(aspectMatch[1]);
    const h = parseFloat(aspectMatch[2]);
    return matchCommonRatio(w / h);
  }

  // 2. Check for Canvas width & height: <canvas width="1080" height="1920">
  const canvasRegex = /<canvas[^>]+(?:width=["'](\d+)["'][^>]+height=["'](\d+)["']|height=["'](\d+)["'][^>]+width=["'](\d+)["'])/i;
  const canvasMatch = html.match(canvasRegex);
  if (canvasMatch) {
    const w = parseInt(canvasMatch[1] || canvasMatch[4]);
    const h = parseInt(canvasMatch[2] || canvasMatch[3]);
    if (w > 0 && h > 0) {
      return matchCommonRatio(w / h, w, h);
    }
  }

  // 3. Check for SVG viewBox: viewBox="0 0 1080 1920"
  const svgRegex = /viewBox=["']\s*\d+\s+\d+\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*["']/i;
  const svgMatch = html.match(svgRegex);
  if (svgMatch) {
    const w = parseFloat(svgMatch[1]);
    const h = parseFloat(svgMatch[2]);
    if (w > 0 && h > 0) {
      return matchCommonRatio(w / h, Math.round(w), Math.round(h));
    }
  }

  // 4. Check for CSS container width and height (.card, .container, body, #app)
  // e.g. width: 1080px; height: 1920px or max-width: 420px; height: 800px
  const dimRegex = /(?:width|max-width)\s*:\s*(\d+)px[^;}]*;\s*(?:[^;}]*;\s*)*(?:height|max-height)\s*:\s*(\d+)px/gi;
  let dimMatch;
  while ((dimMatch = dimRegex.exec(html)) !== null) {
    const w = parseInt(dimMatch[1]);
    const h = parseInt(dimMatch[2]);
    if (w > 100 && h > 100) {
      return matchCommonRatio(w / h);
    }
  }

  // Reverse: height then width
  const dimRegexRev = /(?:height|max-height)\s*:\s*(\d+)px[^;}]*;\s*(?:[^;}]*;\s*)*(?:width|max-width)\s*:\s*(\d+)px/gi;
  while ((dimMatch = dimRegexRev.exec(html)) !== null) {
    const h = parseInt(dimMatch[1]);
    const w = parseInt(dimMatch[2]);
    if (w > 100 && h > 100) {
      return matchCommonRatio(w / h);
    }
  }

  // 5. Look for keywords (reels, shorts, tiktok, story, mobile, portrait, 9:16)
  if (/(reel|shorts|tiktok|story|mobile|phone|portrait|9:16)/i.test(html)) {
    return { ratioLabel: '9:16', width: 1080, height: 1920, confidence: 'medium' };
  }

  // 6. Look for square keywords (avatar, icon, square, 1:1, 1080x1080)
  if (/(square|instagram-post|avatar|1:1)/i.test(html)) {
    return { ratioLabel: '1:1', width: 1080, height: 1080, confidence: 'medium' };
  }

  // Default to standard 16:9 landscape
  return { ratioLabel: '16:9', width: 1920, height: 1080, confidence: 'fallback' };
}

function matchCommonRatio(ratio: number, customW?: number, customH?: number): DetectedRatio {
  // 9:16 Vertical (~0.5625)
  if (Math.abs(ratio - 9 / 16) < 0.08 || ratio < 0.65) {
    return { ratioLabel: '9:16', width: 1080, height: 1920, confidence: 'high' };
  }
  // 1:1 Square (1.0)
  if (Math.abs(ratio - 1.0) < 0.08) {
    return { ratioLabel: '1:1', width: 1080, height: 1080, confidence: 'high' };
  }
  // 4:5 Instagram feed (0.8)
  if (Math.abs(ratio - 4 / 5) < 0.06) {
    return { ratioLabel: '4:5', width: 1080, height: 1350, confidence: 'high' };
  }
  // 16:9 Landscape (~1.777)
  if (Math.abs(ratio - 16 / 9) < 0.1 || ratio > 1.5) {
    return { ratioLabel: '16:9', width: 1920, height: 1080, confidence: 'high' };
  }

  // Custom ratio
  const standardWidth = 1920;
  const standardHeight = Math.round(standardWidth / ratio);
  return {
    ratioLabel: `${Math.round(ratio * 10) / 10}:1`,
    width: customW || standardWidth,
    height: customH || standardHeight,
    confidence: 'high',
  };
}
