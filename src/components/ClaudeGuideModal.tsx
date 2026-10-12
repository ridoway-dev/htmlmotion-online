'use client';

import React from 'react';
import { X, Copy, Check } from 'lucide-react';

interface ClaudeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClaudeGuideModal({ isOpen, onClose }: ClaudeGuideModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const examplePrompt = `Create a standalone HTML file with multiple clean sections (#hero, #features, #cta).
Requirements:
1. Pure HTML and modern CSS keyframes or vanilla JS. Single-file.
2. Structure sections clearly using <section id="hero">, <section id="features">, <section id="cta">.
3. 16:9 aspect ratio, dark background (#09090b).
4. Each section should have its own animated components.
5. Loop smoothly.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(examplePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white border border-zinc-200 rounded-xl shadow-2xl p-6 overflow-hidden text-zinc-900">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Claude Prompt Guide</h3>
            <p className="text-[11px] text-zinc-500">Creating clean multi-section HTML animations</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs text-zinc-700">
          <p className="text-zinc-600 leading-relaxed">
            Claude-কে স্পষ্ট সেকশন আইডি (<code className="text-zinc-900 font-mono bg-zinc-100 px-1 py-0.5 rounded">#hero</code>, <code className="text-zinc-900 font-mono bg-zinc-100 px-1 py-0.5 rounded">#features</code>, <code className="text-zinc-900 font-mono bg-zinc-100 px-1 py-0.5 rounded">#pricing</code>) দিয়ে কোড জেনারেট করতে বললে HTMLMotion স্বয়ংক্রিয়ভাবে প্রতিটি সেকশন আলাদা করে অথবা পুরো পেজ স্ক্রোল করে ভিডিও রেন্ডার করতে পারে।
          </p>

          <div className="relative bg-zinc-50 rounded-lg p-3 border border-zinc-200 font-mono text-[11px] text-zinc-800">
            <pre className="whitespace-pre-wrap">{examplePrompt}</pre>
            <button
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-zinc-100 text-[10px] text-zinc-700 border border-zinc-200 transition shadow-xs"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-zinc-500" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
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

