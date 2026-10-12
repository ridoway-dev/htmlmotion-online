'use client';

import React from 'react';
import { X, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoadmapModal({ isOpen, onClose }: RoadmapModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white border border-zinc-200 rounded-xl shadow-2xl p-6 overflow-hidden text-zinc-900">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Architecture Roadmap</h3>
            <p className="text-[11px] text-zinc-500">From local prototype to production micro-SaaS</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs">
          {/* Phase 1 */}
          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-zinc-900">Phase 1 &bull; Local Engine (Active)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                ACTIVE
              </span>
            </div>
            <p className="text-zinc-600 text-[11px] leading-relaxed">
              Playwright + Chromium + FFmpeg running locally on machine. Zero server costs. Supports all sections, auto-scroll, and multi-resolution MP4 rendering.
            </p>
          </div>

          {/* Phase 2 */}
          <div className="p-3 rounded-lg bg-white border border-zinc-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-zinc-800">Phase 2 &bull; Cloud Infrastructure</span>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">NEXT</span>
            </div>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              Vercel Frontend + Dockerized Chromium Worker on VPS + Redis/BullMQ task queue + Cloudflare R2 storage for fast zero-egress downloads.
            </p>
          </div>

          {/* Phase 3 */}
          <div className="p-3 rounded-lg bg-white border border-zinc-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-zinc-800">Phase 3 &bull; Monetization</span>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">SCALE</span>
            </div>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              Free plan with rate limits + Pro plan ($9-19/mo) for 4K 60fps exports, unlimited batch renders, and priority queues.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-start gap-2 text-[11px] text-zinc-600 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-700 mt-0.5 shrink-0" />
            <span>Browser Sandboxing: User HTML is isolated in dedicated headless Chromium context without file system access.</span>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-zinc-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-black text-white text-xs font-medium transition shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

