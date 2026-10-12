'use client';

import React from 'react';
import { Film, HelpCircle, GitBranch } from 'lucide-react';

interface HeaderProps {
  onOpenRoadmap: () => void;
  onOpenGuide: () => void;
}

export function Header({ onOpenRoadmap, onOpenGuide }: HeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Minimal Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-sm">
            <Film className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-sm tracking-tight text-zinc-950">
              HTMLMotion
            </span>
            <span className="text-[11px] font-mono text-zinc-500 border-l border-zinc-200 pl-2.5">
              html &rarr; mp4
            </span>
          </div>
        </div>

        {/* Engine status & Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-[11px] font-mono text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
            <span>engine: chromium+ffmpeg</span>
          </div>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Guide</span>
          </button>

          <button
            onClick={onOpenRoadmap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Roadmap</span>
          </button>
        </div>
      </div>
    </header>
  );
}

