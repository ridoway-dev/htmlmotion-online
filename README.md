# HTMLMotion 🎬

> **Turn Claude AI HTML & CSS animations into studio-grade MP4/WebM videos and synced Subtitles (.SRT/.VTT) — 100% free, private, and open source.**

[![MIT License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black.svg?logo=next.js)](https://nextjs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Chromium-red.svg?logo=playwright)](https://playwright.dev/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-Transcoding-green.svg?logo=ffmpeg)](https://ffmpeg.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌟 Why HTMLMotion?

Claude 3.5 Sonnet, Claude Design, and Claude Motion can generate breathtaking web animations using pure CSS keyframes, SVGs, 3D CSS transforms, or HTML5 Canvas.

However, content creators, marketers, social media managers, and developers need these animations in **MP4 or WebM video format** for **YouTube Shorts, Instagram Reels, TikTok, LinkedIn, and video editing suites** (Premiere Pro, DaVinci Resolve, CapCut).

**HTMLMotion bridges this gap:**
- **No paid subscriptions** or watermark restrictions.
- **Run on your own machine** (Windows, macOS, Linux) with unlimited duration and 4K/1080p resolution.
- **Dual-Engine Architecture**: Choose between instant **In-Browser GPU Recording** (zero server load) or **Local Headless Playwright + FFmpeg Engine** (pixel-perfect frame accuracy).

---

## ✨ Features

- ⚡ **Dual Render Engines**:
  - **In-Browser Engine (Client-Side)**: Uses browser hardware GPU acceleration via `MediaRecorder`. Zero server load, works anywhere.
  - **Headless Engine (Playwright + FFmpeg)**: Uses isolated Chromium sandboxing and FFmpeg H.264 transcoding for deterministic, studio-grade video outputs.
- 🎙️ **Synchronized Subtitle Generator**:
  - Automatically parses Claude timeline tags (`data-s`, `data-t`, `data-d`, `data-subtitle`, `data-caption`).
  - Exports standard `.srt` (SubRip) and `.vtt` (WebVTT) subtitle files synced to the animation timestamps.
- 📐 **Smart Dimension & Ratio Detection**:
  - Automatically detects **9:16 Vertical** (`1080×1920` for Reels/Shorts), **16:9 Landscape** (`1920×1080`), or **1:1 Square** (`1080×1080`).
- ⏱️ **Automatic Duration Detection**:
  - Scans CSS keyframes, inline durations, and DOM delays to pre-fill the exact animation loop time.
- 📦 **Multi-Format Input**:
  - Drag and drop `.html` files or `.zip` export bundles from Claude.
  - Live Monaco/Code Editor to paste and tweak HTML/CSS on the fly.
- 🎨 **Anti-Slop Clean Design**:
  - Minimal white mode, modern Bricolage Grotesque typography, and responsive split-view preview.
- 🔒 **100% Private**:
  - All renders happen locally on your computer or directly in your browser. No files are uploaded to external third-party servers.

---

## 🚀 Quick Start (Run Locally on Your PC)

You can set up and run HTMLMotion on your local computer in **under 2 minutes**.

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or later (tested on Node v20 / v24)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/ridoway-dev/htmlmotion-online.git
cd htmlmotion-online
```

### 2. Install Dependencies & Playwright
```bash
# Install NPM packages
npm install

# Install Playwright Chromium browser binary (one-time setup)
npm run setup
```
*(Or manually run: `npx playwright install chromium`)*

### 3. Start Local Studio
```bash
npm run dev
```

Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**. 

Paste your Claude HTML animation, select your options, and click **Export Video**!

---

## 🐳 Docker Self-Hosting

HTMLMotion is fully containerized with Playwright and system FFmpeg pre-installed.

### Build and Run with Docker
```bash
# Build the Docker image
docker build -t htmlmotion .

# Run the container locally
docker run -p 3000:7860 htmlmotion
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 💡 Tips for Claude Animations & Subtitles

To get the best results when prompting Claude:

### 1. Aspect Ratio Prompting
Ask Claude to format the container for your desired platform:
- **Instagram Reels / YouTube Shorts (9:16)**:
  > *"Create a 1080x1920 vertical mobile card animation using pure CSS keyframes..."*
- **YouTube / Presentations (16:9)**:
  > *"Create a 1920x1080 cinematic landscape card animation with glassmorphic glow..."*

### 2. Syncing Subtitles with Data Attributes
Ask Claude to include `data-t` (start time in seconds), `data-d` (duration in seconds), and `data-s` (subtitle text):
```html
<section class="card" data-t="0" data-d="4" data-s="Boost your conversion with AI animations">
  <h2>Boost your conversion with AI animations</h2>
</section>
<section class="card" data-t="4" data-d="5" data-s="Export studio-grade videos in one click">
  <h2>Export studio-grade videos in one click</h2>
</section>
```
HTMLMotion will automatically extract these cues and generate downloadable `.srt` files matching the video!

---

## 📁 Project Structure

```
htmlmotion-online/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── render/
│   │   │       ├── route.ts            # POST /api/render (initiates server job)
│   │   │       ├── status/route.ts     # GET /api/render/status (job polling)
│   │   │       └── download/route.ts   # GET /api/render/download (stream/download MP4 & SRT)
│   │   ├── globals.css                 # Clean modern typography & tokens
│   │   ├── layout.tsx                  # Root layout with Google Fonts
│   │   └── page.tsx                    # Dual-engine dashboard (Upload/Editor/Preview)
│   ├── components/
│   │   ├── Header.tsx                  # Top bar with status badges & modals
│   │   ├── PreviewFrame.tsx            # Live sandbox preview iframe
│   │   ├── RenderModal.tsx             # Progress modal with video player & download links
│   │   ├── RoadmapModal.tsx            # Future roadmap & architecture
│   │   └── ClaudeGuideModal.tsx        # Prompt guides and templates
│   └── lib/
│       ├── browser-recorder.ts         # In-Browser GPU MediaRecorder client engine
│       ├── render-manager.ts           # Playwright + FFmpeg server transcoding engine
│       ├── subtitle-parser.ts          # .SRT & .VTT subtitle parser & generator
│       ├── dimension-detector.ts       # 16:9 / 9:16 / 1:1 dimension analyzer
│       ├── duration-detector.ts        # Animation loop duration detector
│       ├── html-cleaner.ts             # Strips unwanted playback buttons & controls
│       ├── presets.ts                  # Ready-to-test Claude animation presets
│       └── types.ts                    # TypeScript interface definitions
├── Dockerfile                          # Optimized Playwright + FFmpeg Linux container
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation Recording**: [Playwright](https://playwright.dev/) (Headless Chromium) + [Web MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- **Video Transcoding**: [Fluent FFmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) (H.264 / libx264, yuv420p, faststart)
- **Archive Extraction**: [JSZip](https://stuk.github.io/jszip/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

Made with ❤️ for the AI & motion animation community by [ridoway-dev](https://github.com/ridoway-dev).
