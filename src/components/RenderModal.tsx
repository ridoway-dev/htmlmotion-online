'use client';

import React from 'react';
import {
  X,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { JobStatus } from '@/lib/types';

export interface RenderProgressData {
  id: string;
  status: JobStatus;
  progress: number;
  stepMessage: string;
  fileSizeBytes?: number;
  hasSubtitles?: boolean;
  subtitleCuesCount?: number;
  error?: string;
  blobUrl?: string;
  srtBlobUrl?: string;
  engine?: 'browser' | 'server';
  settings?: {
    width: number;
    height: number;
    fps: number;
    duration: number;
    selector?: string;
    sectionLabel?: string;
  };
}

interface RenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobData: RenderProgressData | null;
  onRetry: () => void;
}

export function RenderModal({ isOpen, onClose, jobData, onRetry }: RenderModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !jobData) return null;

  const isCompleted = jobData.status === 'completed';
  const isFailed = jobData.status === 'failed';
  const isBrowserEngine = jobData.engine === 'browser' || Boolean(jobData.blobUrl);
  const downloadUrl = jobData.blobUrl || `/api/render/download?id=${jobData.id}`;
  const streamUrl = jobData.blobUrl || `/api/render/download?id=${jobData.id}&stream=true`;
  const srtDownloadUrl = jobData.srtBlobUrl || `/api/render/download?id=${jobData.id}&format=srt`;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const copyLink = () => {
    const fullUrl = window.location.origin + downloadUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white border border-zinc-200 rounded-xl shadow-2xl overflow-hidden p-6 text-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-md ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isFailed
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : isFailed ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                {isCompleted
                  ? 'Render Complete'
                  : isFailed
                  ? 'Render Failed'
                  : 'Rendering Video...'}
              </h3>
              <p className="text-[11px] font-mono text-zinc-500">
                id: {jobData.id.slice(0, 8)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="mt-5">
          {/* Progress state */}
          {!isCompleted && !isFailed && (
            <div className="py-6 space-y-5 text-center">
              <div>
                <p className="text-xs font-medium text-zinc-800">
                  {jobData.stepMessage}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                  Chromium headless &rarr; FFmpeg H.264
                </p>
              </div>

              {/* Minimal Progress bar */}
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1.5 font-mono">
                  <span>Progress</span>
                  <span className="font-semibold text-zinc-900">{jobData.progress}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                  <div
                    className="h-full bg-zinc-900 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.max(5, jobData.progress)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Failed state */}
          {isFailed && (
            <div className="py-4 space-y-3">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-mono">
                {jobData.error || 'Rendering error occurred.'}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 text-xs hover:bg-zinc-200 transition font-medium"
                >
                  Close
                </button>
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 text-white font-medium text-xs transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            </div>
          )}

          {/* Completed state */}
          {isCompleted && (
            <div className="space-y-4">
              {/* Video Player */}
              <div className="relative rounded-lg overflow-hidden bg-black border border-zinc-200 aspect-video flex items-center justify-center">
                <video
                  src={streamUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Minimal specs grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2">
                  <span className="text-zinc-500 text-[10px] block">DIMENSIONS</span>
                  <span className="text-zinc-900 font-semibold mt-0.5 block">
                    {jobData.settings?.width}&times;{jobData.settings?.height}
                  </span>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2">
                  <span className="text-zinc-500 text-[10px] block">FPS</span>
                  <span className="text-zinc-900 font-semibold mt-0.5 block">
                    {jobData.settings?.fps}
                  </span>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2">
                  <span className="text-zinc-500 text-[10px] block">DURATION</span>
                  <span className="text-zinc-900 font-semibold mt-0.5 block">
                    {jobData.settings?.duration}s
                  </span>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2">
                  <span className="text-zinc-500 text-[10px] block">SIZE</span>
                  <span className="text-zinc-900 font-semibold mt-0.5 block">
                    {formatFileSize(jobData.fileSizeBytes)}
                  </span>
                </div>
              </div>

              {/* Subtitle Badge if available */}
              {jobData.hasSubtitles && (
                <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-medium">Subtitles detected ({jobData.subtitleCuesCount} dialogue cues)</span>
                  </div>
                  <a
                    href={srtDownloadUrl}
                    download={`htmlmotion-${jobData.id.slice(0, 8)}.srt`}
                    className="font-semibold underline text-emerald-800 hover:text-emerald-950 text-xs"
                  >
                    Download .SRT
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <a
                    href={downloadUrl}
                    download={`htmlmotion-${jobData.id.slice(0, 8)}.${isBrowserEngine ? 'webm' : 'mp4'}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-zinc-950 hover:bg-black text-white font-medium text-xs shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download {isBrowserEngine ? 'Video' : 'MP4'}
                  </a>

                  {jobData.hasSubtitles && (
                    <a
                      href={srtDownloadUrl}
                      download={`htmlmotion-${jobData.id.slice(0, 8)}.srt`}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-900 font-medium text-xs shadow-xs transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-zinc-600" />
                      <span>Download .SRT</span>
                    </a>
                  )}

                  <button
                    onClick={copyLink}
                    className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-medium transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="py-2 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
