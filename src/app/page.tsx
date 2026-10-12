'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  FolderOpen,
  ArrowRight,
  ChevronDown,
  FileCode,
} from 'lucide-react';
import JSZip from 'jszip';
import { Header } from '@/components/Header';
import { PreviewFrame } from '@/components/PreviewFrame';
import { RenderModal } from '@/components/RenderModal';
import { RoadmapModal } from '@/components/RoadmapModal';
import { ClaudeGuideModal } from '@/components/ClaudeGuideModal';
import { detectAnimationDuration } from '@/lib/duration-detector';
import { detectHtmlDimensions } from '@/lib/dimension-detector';
import { recordInBrowser } from '@/lib/browser-recorder';
import { RenderProgressData } from '@/components/RenderModal';

export default function HomePage() {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');

  // Render Settings
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [duration, setDuration] = useState<number>(8);
  const [durationMode, setDurationMode] = useState<'auto' | 'manual'>('auto');
  const [detectedDuration, setDetectedDuration] = useState<number>(8);
  const [detectedRatio, setDetectedRatio] = useState<string>('Native HTML');
  const [fps, setFps] = useState<number>(30);
  const [delay, setDelay] = useState<number>(600);
  const [backgroundColor, setBackgroundColor] = useState<string>('transparent');
  const [crf, setCrf] = useState<number>(18);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Modals state
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Active Job state
  const [activeJob, setActiveJob] = useState<RenderProgressData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect duration and dimensions whenever HTML content changes
  useEffect(() => {
    const detectedDur = detectAnimationDuration(htmlContent);
    setDetectedDuration(detectedDur);
    if (durationMode === 'auto') {
      setDuration(detectedDur);
    }

    const dims = detectHtmlDimensions(htmlContent);
    setWidth(dims.width);
    setHeight(dims.height);
    setDetectedRatio(dims.ratioLabel);
  }, [htmlContent, durationMode]);

  // Handle File Upload or Drop (.html or .zip)
  const processUploadedFile = async (file: File) => {
    setUploadFileName(file.name);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.zip')) {
      try {
        const buffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(buffer);
        const htmlFile = zip.file('index.html') || zip.file(/^.*\.html$/i)[0];
        if (htmlFile) {
          const content = await htmlFile.async('string');
          setHtmlContent(content);
        } else {
          alert('No HTML file found inside the ZIP archive.');
        }
      } catch (err) {
        alert('Failed to read ZIP file: ' + (err as Error).message);
      }
    } else {
      const text = await file.text();
      setHtmlContent(text);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  const [engineMode, setEngineMode] = useState<'browser' | 'server'>('browser');

  // Start Render Job (Dispatches to Browser Engine or Cloud Server Engine)
  const handleStartRender = async () => {
    if (!htmlContent.trim()) {
      alert('Please provide or upload HTML code first.');
      return;
    }

    if (engineMode === 'browser') {
      await handleBrowserRender();
    } else {
      await handleServerRender();
    }
  };

  // 1. In-Browser Direct GPU Recording (Zero server load, 100% free & unlimited)
  const handleBrowserRender = async () => {
    const jobId = 'browser-' + Math.random().toString(36).substring(2, 9);
    setActiveJob({
      id: jobId,
      status: 'launching',
      progress: 10,
      stepMessage: 'Select your tab in the browser dialog to start recording...',
      engine: 'browser',
      settings: {
        width,
        height,
        fps,
        duration,
      },
    });
    setIsRenderModalOpen(true);
    setIsSubmitting(true);

    try {
      const previewEl = document.getElementById('motion-preview-container');
      const result = await recordInBrowser({
        duration,
        fps,
        html: htmlContent,
        previewElement: previewEl,
        onProgress: (progress, stepMessage) => {
          setActiveJob((prev) =>
            prev
              ? {
                  ...prev,
                  progress,
                  stepMessage,
                  status: progress >= 100 ? 'completed' : progress > 85 ? 'encoding' : 'capturing',
                }
              : null
          );
        },
      });

      setActiveJob({
        id: jobId,
        status: 'completed',
        progress: 100,
        stepMessage: result.hasSubtitles
          ? `Ready! Video & Subtitles (${result.subtitleCuesCount} cues) rendered successfully in browser.`
          : 'Ready! Video rendered successfully in your browser.',
        blobUrl: result.blobUrl,
        srtBlobUrl: result.srtBlobUrl,
        fileSizeBytes: result.fileSizeBytes,
        hasSubtitles: result.hasSubtitles,
        subtitleCuesCount: result.subtitleCuesCount,
        engine: 'browser',
        settings: {
          width,
          height,
          fps,
          duration,
        },
      });
    } catch (err: unknown) {
      const errMsg = (err as Error).message || String(err);
      if (errMsg.includes('cancelled')) {
        setIsRenderModalOpen(false);
      } else {
        setActiveJob({
          id: jobId,
          status: 'failed',
          progress: 100,
          stepMessage: 'In-browser render failed',
          error: errMsg,
          engine: 'browser',
          settings: {
            width,
            height,
            fps,
            duration,
          },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Cloud Server Engine (Playwright Headless + FFmpeg for VPS / Dedicated Server)
  const handleServerRender = async () => {
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: htmlContent,
          width,
          height,
          duration,
          fps,
          delay,
          backgroundColor,
          crf,
          scrollMode: 'static',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to start render');
      }

      const jobId = data.jobId;
      setActiveJob({
        id: jobId,
        status: 'preparing',
        progress: 10,
        stepMessage: 'Launching Chromium sandbox on Cloud Server...',
        engine: 'server',
        settings: {
          width,
          height,
          fps,
          duration,
        },
      });
      setIsRenderModalOpen(true);
      setIsSubmitting(false);

      // Start Polling Status
      pollJobStatus(jobId);
    } catch (err) {
      setIsSubmitting(false);
      alert('Cloud server render failed: ' + (err as Error).message);
    }
  };

  // Poll Job Status for Cloud Server Engine
  const pollJobStatus = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/render/status?id=${jobId}`);
        if (!res.ok) return;

        const data: RenderProgressData = await res.json();
        setActiveJob({ ...data, engine: 'server' });

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Minimal Header */}
      <Header
        onOpenRoadmap={() => setIsRoadmapModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Source, Section Scope & Output Specs (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* HTML Source Panel: 2 Distinct Options */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm,.zip"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Two Option Switcher */}
              <div className="flex p-0.5 bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md transition font-medium ${
                    inputMode === 'upload'
                      ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80 font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Upload HTML / ZIP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md transition font-medium ${
                    inputMode === 'paste'
                      ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80 font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Write / Paste HTML</span>
                </button>
              </div>

              {/* Option 1: Upload HTML File Box */}
              {inputMode === 'upload' && (
                <div className="space-y-2.5">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) processUploadedFile(file);
                    }}
                    className="border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition bg-zinc-50/50 hover:bg-zinc-50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 shadow-xs mb-2">
                      <FolderOpen className="w-4 h-4 text-zinc-700" />
                    </div>
                    <p className="text-xs font-semibold text-zinc-900">
                      Upload .html or .zip file
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Drag & drop here or click to browse
                    </p>
                  </div>

                  {uploadFileName && (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-mono text-emerald-900 font-medium truncate">
                          {uploadFileName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[11px] font-mono shrink-0">
                        <button
                          type="button"
                          onClick={() => setInputMode('paste')}
                          className="text-zinc-700 hover:text-zinc-950 underline font-medium"
                        >
                          View code
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHtmlContent('');
                            setUploadFileName(null);
                          }}
                          className="text-zinc-400 hover:text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Option 2: Write / Paste HTML Box */}
              {inputMode === 'paste' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>
                      {htmlContent ? `${htmlContent.length.toLocaleString()} characters` : 'HTML Source Code'}
                    </span>
                    {htmlContent && (
                      <button
                        type="button"
                        onClick={() => {
                          setHtmlContent('');
                          setUploadFileName(null);
                        }}
                        className="text-zinc-400 hover:text-rose-600 transition"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) processUploadedFile(file);
                    }}
                  >
                    <textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      placeholder="Type or paste your HTML code here..."
                      rows={9}
                      className="w-full bg-[#fcfcfd] border border-zinc-200 rounded-lg p-3 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white focus:ring-1 focus:ring-zinc-950 resize-none transition-all"
                      spellCheck={false}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Video Settings Panel */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <span className="text-xs font-semibold text-zinc-900">
                  Video Settings
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {detectedRatio} • {width}&times;{height}
                </span>
              </div>

              {/* Duration & FPS Row */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-zinc-600 font-medium">
                      Duration:
                    </label>
                    <div className="flex items-center gap-1 text-[10px] font-mono">
                      <button
                        onClick={() => {
                          setDurationMode('auto');
                          setDuration(detectedDuration);
                        }}
                        className={`px-1.5 py-0.5 rounded transition ${
                          durationMode === 'auto'
                            ? 'bg-zinc-950 text-white font-medium shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                      >
                        Auto ({detectedDuration}s)
                      </button>
                      <button
                        onClick={() => setDurationMode('manual')}
                        className={`px-1.5 py-0.5 rounded transition ${
                          durationMode === 'manual'
                            ? 'bg-zinc-950 text-white font-medium shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={duration}
                      onChange={(e) => {
                        setDurationMode('manual');
                        setDuration(Math.max(1, parseInt(e.target.value) || 5));
                      }}
                      className="w-full bg-[#fcfcfd] border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                    />
                    <span className="absolute right-2.5 top-1.5 text-[10px] font-mono text-zinc-400 pointer-events-none">
                      sec
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-600 font-medium block mb-1">
                    Frame Rate:
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-zinc-100 border border-zinc-200 rounded-md p-0.5">
                    <button
                      onClick={() => setFps(30)}
                      className={`py-1 rounded text-xs font-mono transition ${
                        fps === 30 ? 'bg-white text-zinc-950 font-semibold shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      30fps
                    </button>
                    <button
                      onClick={() => setFps(60)}
                      className={`py-1 rounded text-xs font-mono transition ${
                        fps === 60 ? 'bg-white text-zinc-950 font-semibold shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      60fps
                    </button>
                  </div>
                </div>
              </div>

              {/* Advanced toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-[11px] font-mono text-zinc-500 hover:text-zinc-800 flex items-center gap-1 pt-1"
              >
                <span>{showAdvanced ? 'Hide advanced' : 'Advanced settings'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 text-xs">
                  <div>
                    <label className="text-[11px] font-mono text-zinc-500 block mb-1">Asset Delay</label>
                    <select
                      value={delay}
                      onChange={(e) => setDelay(parseInt(e.target.value))}
                      className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-800 focus:outline-none focus:border-zinc-950"
                    >
                      <option value={300}>0.3s</option>
                      <option value={600}>0.6s</option>
                      <option value={1200}>1.2s</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-zinc-500 block mb-1">CRF Quality</label>
                    <select
                      value={crf}
                      onChange={(e) => setCrf(parseInt(e.target.value))}
                      className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-800 focus:outline-none focus:border-zinc-950"
                    >
                      <option value={18}>18 (High)</option>
                      <option value={22}>22 (Balanced)</option>
                      <option value={26}>26 (Compact)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Engine Mode Selector */}
              <div className="pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-900">Engine:</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                        engineMode === 'browser'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {engineMode === 'browser' ? '⚡ In-Browser (Free & Unlimited)' : '☁️ Cloud Server (VPS)'}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">
                      {engineMode === 'browser'
                        ? 'Zero server load • GPU accelerated • No crash'
                        : 'Headless Playwright + FFmpeg on VPS'}
                    </span>
                  </div>
                  <div className="flex bg-zinc-200/80 p-0.5 rounded-md text-xs font-mono ml-2 shrink-0">
                    <button
                      onClick={() => setEngineMode('browser')}
                      className={`px-2.5 py-0.5 rounded text-[11px] transition ${
                        engineMode === 'browser'
                          ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      Browser
                    </button>
                    <button
                      onClick={() => setEngineMode('server')}
                      className={`px-2.5 py-0.5 rounded text-[11px] transition ${
                        engineMode === 'server'
                          ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      Cloud
                    </button>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div className="pt-1">
                <button
                  onClick={handleStartRender}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-950 hover:bg-black text-white font-medium text-xs shadow-xs hover:shadow active:scale-[0.99] transition disabled:opacity-50"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>
                    {engineMode === 'browser' ? 'Record Motion Video' : 'Render Motion MP4'} ({duration}s @ {fps}fps)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Sandbox Preview (7 Cols) */}
          <div className="lg:col-span-7">
            <PreviewFrame
              html={htmlContent}
              width={width}
              height={height}
              fps={fps}
              duration={duration}
            />
          </div>
        </div>
      </main>

      {/* Render Modal */}
      <RenderModal
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
        jobData={activeJob}
        onRetry={handleStartRender}
      />

      {/* Roadmap Modal */}
      <RoadmapModal
        isOpen={isRoadmapModalOpen}
        onClose={() => setIsRoadmapModalOpen(false)}
      />

      {/* Claude Guide Modal */}
      <ClaudeGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}

