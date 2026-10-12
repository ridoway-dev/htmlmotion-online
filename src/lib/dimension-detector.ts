/**
 * Auto-detects native video aspect ratio and viewport dimensions from user HTML/CSS
 */
export interface DetectedDimensions {
  width: number;
  height: number;
  ratioLabel: string; // e.g. '9:16 (Shorts/Reels)', '16:9 (Landscape)', '1:1 (Square)'
}

export function detectHtmlDimensions(html: string): DetectedDimensions {
  if (!html) {
    return { width: 1920, height: 1080, ratioLabel: '16:9 (Landscape)' };
  }

  // 1. Check for 9:16 aspect ratio (Mobile Vertical Ads, TikTok, Reels, Shorts)
  const is9to16 =
    /aspect-ratio\s*:\s*9\s*[\/:]\s*16/i.test(html) ||
    /\b9\s*\/\s*16\b/i.test(html) ||
    /width\s*:\s*1080px;\s*height\s*:\s*1920px/i.test(html) ||
    /height\s*:\s*1920px;\s*width\s*:\s*1080px/i.test(html);

  if (is9to16) {
    return {
      width: 1080,
      height: 1920,
      ratioLabel: '9:16 (Shorts / Reels)',
    };
  }

  // 2. Check for 1:1 aspect ratio (Square, Instagram Feed)
  const is1to1 =
    /aspect-ratio\s*:\s*1\s*[\/:]\s*1/i.test(html) ||
    /\b1\s*\/\s*1\b/i.test(html) ||
    /width\s*:\s*1080px;\s*height\s*:\s*1080px/i.test(html);

  if (is1to1) {
    return {
      width: 1080,
      height: 1080,
      ratioLabel: '1:1 (Square)',
    };
  }

  // 3. Check for 4:5 aspect ratio (Instagram Portrait)
  const is4to5 =
    /aspect-ratio\s*:\s*4\s*[\/:]\s*5/i.test(html) ||
    /\b4\s*\/\s*5\b/i.test(html);

  if (is4to5) {
    return {
      width: 1080,
      height: 1350,
      ratioLabel: '4:5 (Portrait)',
    };
  }

  // 4. Check for explicit 16:9 or default landscape
  const is16to9 =
    /aspect-ratio\s*:\s*16\s*[\/:]\s*9/i.test(html) ||
    /\b16\s*\/\s*9\b/i.test(html);

  if (is16to9) {
    return {
      width: 1920,
      height: 1080,
      ratioLabel: '16:9 (Landscape)',
    };
  }

  // Default: Full HD Landscape
  return {
    width: 1920,
    height: 1080,
    ratioLabel: 'Native (16:9)',
  };
}
