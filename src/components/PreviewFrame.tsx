'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { cleanUnwantedButtons } from '@/lib/html-cleaner';

interface PreviewFrameProps {
  html: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  selector?: string;
  scrollMode?: 'static' | 'auto-scroll' | 'fit-section';
  sectionLabel?: string;
}

export function PreviewFrame({
  html,
  width,
  height,
  fps,
  duration,
  selector,
  scrollMode,
  sectionLabel,
}: PreviewFrameProps) {
  const [key, setKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const cleanedHtml = useMemo(() => cleanUnwantedButtons(html), [html]);

  const restartAnimation = () => {
    setKey((prev) => prev + 1);
  };

  // Scroll to targeted section when selector changes
  useEffect(() => {
    if (selector && selector !== 'full') {
      const timer = setTimeout(() => {
        try {
          const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
          const el = doc?.querySelector(selector);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } catch {
          // ignore
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [selector, key]);

  return (
    <div className="flex flex-col h-full bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
      {/* Top Bar Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 bg-zinc-50/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-800">Live Preview</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-zinc-600 border border-zinc-200">
            Native HTML
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-zinc-600 border border-zinc-200">
            {fps}fps
          </span>
          {selector && selector !== 'full' && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 border border-zinc-300 font-medium">
              {selector}
            </span>
          )}
          {scrollMode === 'auto-scroll' && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
              auto-scroll
            </span>
          )}
        </div>

        {/* Minimal Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={restartAnimation}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-900 text-xs font-medium transition shadow-xs"
          >
            <RotateCcw className="w-3 h-3 text-zinc-500" />
            <span>Replay</span>
          </button>
        </div>
      </div>

      {/* Frame Canvas: 100% natural, as uploaded by user */}
      <div className="flex-1 min-h-[520px] p-0 transition-colors overflow-hidden flex flex-col bg-[#0f0f11]">
        <div className="w-full flex-1 relative bg-black flex items-center justify-center">
          {html && html.trim() ? (
            <iframe
              ref={iframeRef}
              key={key}
              srcDoc={cleanedHtml}
              title="Animation Preview"
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-full border-0 absolute inset-0"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-500 p-8 text-center space-y-1">
              <p className="text-xs font-medium text-zinc-400">Waiting for HTML Animation</p>
              <p className="text-[11px] text-zinc-500">Upload an HTML/ZIP file or paste code on the left</p>
            </div>
          )}
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="px-4 py-2 bg-zinc-50/80 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <div>
          {sectionLabel ? `Target: ${sectionLabel}` : 'Scope: Native page output'}
        </div>
        <div>
          Length: {duration}s &bull; Format: H.264
        </div>
      </div>
    </div>
  );
}

