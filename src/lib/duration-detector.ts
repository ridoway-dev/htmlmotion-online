/**
 * Auto-detects animation duration in seconds from HTML, CSS, and JS
 */
export function detectAnimationDuration(html: string): number {
  if (!html) return 5;

  let maxDuration = 0;

  // 1. Scan data-t and data-d on sections (e.g. data-t="22" data-d="5" => 27s)
  const dataTimelineRegex = /data-t=["']?(\d+(?:\.\d+)?)["']?\s+data-d=["']?(\d+(?:\.\d+)?)["']?/gi;
  let dtMatch;
  while ((dtMatch = dataTimelineRegex.exec(html)) !== null) {
    const t = parseFloat(dtMatch[1]);
    const d = parseFloat(dtMatch[2]);
    const total = t + d;
    if (total > maxDuration && total <= 300) {
      maxDuration = total;
    }
  }

  // 2. Scan JS loop conditions like if (e < 27) or if (time < 30) or if (elapsed < 27)
  const jsConditionRegex = /(?:if\s*\(\s*(?:e|t|time|elapsed|sec|seconds)\s*<\s*(\d+(?:\.\d+)?)\s*\))/gi;
  let jsCondMatch;
  while ((jsCondMatch = jsConditionRegex.exec(html)) !== null) {
    const num = parseFloat(jsCondMatch[1]);
    if (num > maxDuration && num <= 300) {
      maxDuration = num;
    }
  }

  // 3. Scan CSS animation-duration: 4s / 4000ms
  const durationRegex = /(?:animation-duration|transition-duration)\s*:\s*([^;]+)/gi;
  let match;

  while ((match = durationRegex.exec(html)) !== null) {
    const val = match[1];
    const secMatches = val.matchAll(/(\d+(?:\.\d+)?)\s*(s|ms)/gi);
    for (const sm of secMatches) {
      const num = parseFloat(sm[1]);
      const unit = sm[2].toLowerCase();
      const inSec = unit === 'ms' ? num / 1000 : num;
      if (inSec > maxDuration && inSec <= 300) {
        maxDuration = inSec;
      }
    }
  }

  // 4. Scan shorthand animation: name 5s ease ...
  const shorthandRegex = /animation\s*:\s*([^;]+)/gi;
  while ((match = shorthandRegex.exec(html)) !== null) {
    const val = match[1];
    const secMatches = val.matchAll(/(?:^|\s)(\d+(?:\.\d+)?)\s*(s|ms)(?:\s|$)/gi);
    for (const sm of secMatches) {
      const num = parseFloat(sm[1]);
      const unit = sm[2].toLowerCase();
      const inSec = unit === 'ms' ? num / 1000 : num;
      if (inSec > maxDuration && inSec <= 300) {
        maxDuration = inSec;
      }
    }
  }

  // 5. Scan JavaScript GSAP / Anime.js / timeline duration: 4 or duration: 4000
  const jsDurationRegex = /duration\s*:\s*(\d+(?:\.\d+)?)/gi;
  while ((match = jsDurationRegex.exec(html)) !== null) {
    let num = parseFloat(match[1]);
    if (num > 100) num = num / 1000; // was in ms
    if (num > maxDuration && num <= 300) {
      maxDuration = num;
    }
  }

  // Round up to clean integer
  if (maxDuration > 0) {
    if (maxDuration < 2) return Math.ceil(maxDuration * 2);
    return Math.ceil(maxDuration);
  }

  // Default fallback if no explicit duration found
  return 5;
}

