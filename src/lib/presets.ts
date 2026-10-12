import { PresetTemplate } from './types';

export const SAMPLE_PRESETS: PresetTemplate[] = [
  {
    id: 'claude-glow-card',
    title: 'Claude 3D Motion Card',
    description: 'Cinematic glassmorphic product card with dynamic holographic aurora reflection and floating badges.',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    duration: 5,
    fps: 60,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claude Motion Card</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #030712 100%);
      font-family: 'Plus Jakarta Sans', sans-serif;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      perspective: 1200px;
    }

    /* Ambient background orbs */
    .orb-1, .orb-2 {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      opacity: 0.6;
      animation: floatOrb 8s infinite alternate ease-in-out;
    }
    .orb-1 { width: 450px; height: 450px; background: #6366f1; top: 10%; left: 15%; }
    .orb-2 { width: 400px; height: 400px; background: #ec4899; bottom: 10%; right: 15%; animation-delay: -4s; }

    @keyframes floatOrb {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(60px, 40px) scale(1.15); }
    }

    /* Main 3D Card */
    .card {
      width: 620px;
      padding: 44px;
      background: rgba(17, 24, 39, 0.7);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 28px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 50px rgba(99, 102, 241, 0.25);
      position: relative;
      z-index: 10;
      animation: cardRotate 6s infinite ease-in-out alternate;
      transform-style: preserve-3d;
    }

    @keyframes cardRotate {
      0% { transform: rotateY(-8deg) rotateX(6deg) translateY(0px); }
      50% { transform: rotateY(0deg) rotateX(0deg) translateY(-12px); }
      100% { transform: rotateY(8deg) rotateX(-6deg) translateY(0px); }
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: #a5b4fc;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 20px;
    }
    .badge-dot {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 10px #22c55e;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }

    h1 {
      color: #ffffff;
      font-size: 38px;
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 14px;
      background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p {
      color: #94a3b8;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 28px;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .stat-item {
      display: flex;
      flex-direction: column;
    }
    .stat-num {
      font-size: 24px;
      font-weight: 700;
      color: #f8fafc;
    }
    .stat-label {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    /* Floating shine */
    .card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent 45%,
        rgba(255, 255, 255, 0.08) 50%,
        transparent 55%
      );
      transform: rotate(30deg);
      animation: sweepShine 4s infinite linear;
      pointer-events: none;
    }
    @keyframes sweepShine {
      0% { transform: translateY(-100%) rotate(30deg); }
      100% { transform: translateY(100%) rotate(30deg); }
    }
  </style>
</head>
<body>
  <div class="orb-1"></div>
  <div class="orb-2"></div>

  <div class="card">
    <div class="badge">
      <span class="badge-dot"></span>
      CLAUDE MOTION ENGINE v2.0
    </div>
    <h1>Autonomous Design to Pure Cinema</h1>
    <p>Render seamless high-framerate vector & HTML animations directly to studio-grade H.264 MP4 footage.</p>
    <div class="stats">
      <div class="stat-item">
        <span class="stat-num">60 FPS</span>
        <span class="stat-label">Frame Rate</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">4K UHD</span>
        <span class="stat-label">Resolution</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">0.02s</span>
        <span class="stat-label">Latency</span>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'mobile-story-reel',
    title: 'Mobile Reels / Story Promo (9:16)',
    description: 'Vertical format animation for Instagram Stories, TikTok, and YouTube Shorts with animated notification badge.',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    duration: 5,
    fps: 60,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vertical Mobile Reel</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #09090b;
      font-family: 'Inter', sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 90px 48px;
      color: #fff;
      overflow: hidden;
      position: relative;
    }

    /* Ambient lighting */
    .glow {
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
      top: 30%;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.5;
      animation: pulseGlow 4s infinite alternate ease-in-out;
    }
    @keyframes pulseGlow {
      0% { transform: scale(0.9); opacity: 0.3; }
      100% { transform: scale(1.2); opacity: 0.6; }
    }

    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      z-index: 10;
    }
    .brand {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      background: linear-gradient(to right, #60a5fa, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .tag {
      background: #18181b;
      border: 1px solid #27272a;
      padding: 8px 18px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 600;
      color: #a1a1aa;
    }

    .center-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      z-index: 10;
      width: 100%;
    }

    .card-preview {
      width: 100%;
      max-width: 420px;
      background: linear-gradient(135deg, rgba(39, 39, 42, 0.7), rgba(24, 24, 27, 0.9));
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 36px;
      padding: 40px 32px;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(59, 130, 246, 0.2);
      animation: hoverCard 4s infinite alternate ease-in-out;
      margin-bottom: 48px;
    }
    @keyframes hoverCard {
      0% { transform: translateY(0px) scale(1); }
      100% { transform: translateY(-16px) scale(1.02); }
    }

    .icon-box {
      width: 76px;
      height: 76px;
      border-radius: 22px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 34px;
      margin: 0 auto 24px auto;
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
    }

    .card-title {
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }

    .card-desc {
      color: #a1a1aa;
      font-size: 16px;
      line-height: 1.5;
    }

    .headline {
      font-size: 52px;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -1.5px;
      margin-bottom: 18px;
    }
    .highlight {
      color: #38bdf8;
    }

    .subline {
      font-size: 20px;
      color: #71717a;
      max-width: 380px;
    }

    .cta-button {
      z-index: 10;
      width: 100%;
      max-width: 420px;
      background: #ffffff;
      color: #000000;
      padding: 24px;
      border-radius: 24px;
      font-size: 20px;
      font-weight: 800;
      text-align: center;
      box-shadow: 0 15px 35px rgba(255, 255, 255, 0.2);
      animation: btnPulse 2s infinite ease-in-out;
    }
    @keyframes btnPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.03); }
    }
  </style>
</head>
<body>
  <div class="glow"></div>
  <div class="top-bar">
    <div class="brand">HTMLMOTION</div>
    <div class="tag">9:16 Shorts / Reel</div>
  </div>

  <div class="center-content">
    <div class="card-preview">
      <div class="icon-box">⚡</div>
      <div class="card-title">Instant Video Render</div>
      <div class="card-desc">Turn HTML code into high-res MP4 clips ready for Instagram & TikTok.</div>
    </div>
    <div class="headline">Code to <span class="highlight">Motion</span> in Seconds</div>
    <div class="subline">Next-generation micro-SaaS converter built for Claude creators.</div>
  </div>

  <div class="cta-button">Swipe Up / Learn More</div>
</body>
</html>`
  },
  {
    id: 'cyberpunk-hologram',
    title: 'Cyberpunk Hologram Sphere (1:1)',
    description: 'Geometric 3D particle canvas animation in a square format ideal for social feeds and avatars.',
    aspectRatio: '1:1',
    width: 1080,
    height: 1080,
    duration: 6,
    fps: 60,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyberpunk Hologram</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #020617;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      overflow: hidden;
      font-family: system-ui, sans-serif;
    }
    canvas {
      display: block;
    }
    .overlay {
      position: absolute;
      bottom: 60px;
      text-align: center;
      color: #38bdf8;
      font-size: 18px;
      letter-spacing: 5px;
      text-transform: uppercase;
      font-weight: 700;
      text-shadow: 0 0 15px rgba(56, 189, 248, 0.8);
      animation: blink 2s infinite ease-in-out;
    }
    @keyframes blink {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 0.3; }
    }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <div class="overlay">SYSTEM ONLINE // MOTION MATRIX</div>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const numPoints = 160;
    const radius = 240;
    let angleX = 0;
    let angleY = 0;

    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const theta = Math.acos(2 * (i / numPoints) - 1);
      const phi = Math.sqrt(numPoints * Math.PI) * theta;
      points.push({
        x: radius * Math.cos(phi) * Math.sin(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(theta)
      });
    }

    function animate() {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
      ctx.fillRect(0, 0, width, height);

      angleX += 0.015;
      angleY += 0.02;

      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < points.length; i++) {
        let p = points[i];
        // Rotate Y
        let x1 = p.x * Math.cos(angleY) - p.z * Math.sin(angleY);
        let z1 = p.x * Math.sin(angleY) + p.z * Math.cos(angleY);
        // Rotate X
        let y1 = p.y * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = p.y * Math.sin(angleX) + z1 * Math.cos(angleX);

        let fov = 400;
        let scale = fov / (fov + z2 + 300);
        let sx = cx + x1 * scale;
        let sy = cy + y1 * scale;

        let alpha = (z2 + radius) / (2 * radius);
        alpha = Math.max(0.1, Math.min(1, alpha));

        ctx.beginPath();
        ctx.arc(sx, sy, 3.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, ' + alpha + ')' : 'rgba(236, 72, 153, ' + alpha + ')';
        ctx.shadowBlur = 10;
        ctx.shadowColor = i % 2 === 0 ? '#38bdf8' : '#ec4899';
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }
    animate();
  </script>
</body>
</html>`
  },
  {
    id: 'saas-metrics-counter',
    title: 'SaaS Metric Pulse Counter (16:9)',
    description: 'Dynamic animated conversion metric dashboard with progress bars and glowing neon accents.',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    duration: 5,
    fps: 60,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SaaS Metrics Pulse</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090d16;
      font-family: 'Space Grotesk', sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      overflow: hidden;
    }

    .grid-bg {
      position: absolute;
      inset: 0;
      background-size: 40px 40px;
      background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
    }

    .container {
      position: relative;
      z-index: 10;
      display: flex;
      gap: 32px;
      width: 90%;
      max-width: 1100px;
    }

    .metric-card {
      flex: 1;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: 24px;
      padding: 36px 30px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      position: relative;
      overflow: hidden;
    }

    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #38bdf8, #818cf8);
    }

    .metric-title {
      color: #94a3b8;
      font-size: 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }

    .metric-value {
      font-size: 54px;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 18px;
    }

    .progress-bar-bg {
      width: 100%;
      height: 8px;
      background: rgba(255,255,255,0.08);
      border-radius: 99px;
      overflow: hidden;
    }

    .progress-fill-1 {
      height: 100%;
      width: 0%;
      background: #10b981;
      border-radius: 99px;
      animation: loadFill1 2.5s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
    }
    .progress-fill-2 {
      height: 100%;
      width: 0%;
      background: #6366f1;
      border-radius: 99px;
      animation: loadFill2 2.5s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
    }
    .progress-fill-3 {
      height: 100%;
      width: 0%;
      background: #f59e0b;
      border-radius: 99px;
      animation: loadFill3 2.5s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
    }

    @keyframes loadFill1 { 0% { width: 0%; } 100% { width: 88%; } }
    @keyframes loadFill2 { 0% { width: 0%; } 100% { width: 94%; } }
    @keyframes loadFill3 { 0% { width: 0%; } 100% { width: 76%; } }

    .tag-trend {
      display: inline-block;
      margin-top: 14px;
      font-size: 13px;
      color: #34d399;
    }
  </style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="container">
    <div class="metric-card">
      <div class="metric-title">Active Render Workers</div>
      <div class="metric-value">12 / 12</div>
      <div class="progress-bar-bg"><div class="progress-fill-1"></div></div>
      <div class="tag-trend">↑ 100% Capacity Operational</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Render Accuracy</div>
      <div class="metric-value">99.8%</div>
      <div class="progress-bar-bg"><div class="progress-fill-2"></div></div>
      <div class="tag-trend">↑ Studio Grade H.264</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Export Speed</div>
      <div class="metric-value">4.2x</div>
      <div class="progress-bar-bg"><div class="progress-fill-3"></div></div>
      <div class="tag-trend">↑ Hardware Accelerated</div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'multi-section-showcase',
    title: 'Multi-Section Full Page (#hero, #features, #cta)',
    description: 'Complete multi-section landing page. Export individual sections (#hero, #features, #cta) or auto-scroll.',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    duration: 8,
    fps: 60,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Multi-Section Showcase</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #09090b; font-family: 'Inter', sans-serif; color: #fafafa; }
    nav { position: sticky; top: 0; z-index: 100; background: rgba(9, 9, 11, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid #27272a; padding: 18px 48px; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-weight: 800; font-size: 18px; letter-spacing: -0.5px; }
    section { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px 48px; position: relative; }
    #hero { background: radial-gradient(circle at 50% 30%, #18181b 0%, #09090b 100%); border-bottom: 1px solid #27272a; text-align: center; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 99px; background: #18181b; border: 1px solid #27272a; font-size: 12px; color: #a1a1aa; margin-bottom: 24px; }
    h1 { font-size: 64px; font-weight: 900; letter-spacing: -2px; margin-bottom: 20px; }
    .sub { color: #a1a1aa; font-size: 20px; max-width: 600px; }
    #features { background: #09090b; border-bottom: 1px solid #27272a; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1200px; width: 100%; }
    .card { background: #121215; border: 1px solid #27272a; border-radius: 20px; padding: 40px 32px; }
    .card h3 { font-size: 20px; font-weight: 700; margin: 16px 0 10px 0; }
    .card p { color: #a1a1aa; font-size: 14px; line-height: 1.6; }
    #cta { background: radial-gradient(circle at 50% 50%, #18181b 0%, #09090b 100%); text-align: center; }
    .cta-box { background: #121215; border: 1px solid #27272a; border-radius: 32px; padding: 64px; max-width: 800px; width: 100%; }
  </style>
</head>
<body>
  <nav><div class="logo">HTMLMOTION</div><div style="font-size:13px;color:#a1a1aa">MULTI-SECTION TEST</div></nav>
  <section id="hero">
    <div class="badge">Section 1 &bull; #hero</div>
    <h1>Engineered for Motion</h1>
    <p class="sub">Convert any single section or the entire page into smooth digital video.</p>
  </section>
  <section id="features">
    <div class="badge" style="margin-bottom:40px;">Section 2 &bull; #features</div>
    <div class="grid">
      <div class="card"><div style="font-size:28px">⚡</div><h3>Target Any Section</h3><p>Select #hero, #features, or any custom element ID to export only that part.</p></div>
      <div class="card"><div style="font-size:28px">🎞</div><h3>Continuous Scroll</h3><p>Automatically records an auto-scrolling walkthrough video of all sections.</p></div>
      <div class="card"><div style="font-size:28px">🎯</div><h3>No Slop UI</h3><p>Minimal, clean, ultra-fast interface designed for serious creators.</p></div>
    </div>
  </section>
  <section id="cta">
    <div class="cta-box">
      <div class="badge">Section 3 &bull; #cta</div>
      <h2 style="font-size:40px;font-weight:800;margin-bottom:16px;">Export Any Section</h2>
      <p style="color:#a1a1aa;margin-bottom:30px;">Choose this section directly from the section picker in HTMLMotion.</p>
      <div style="display:inline-block;padding:16px 36px;background:#fff;color:#000;font-weight:800;border-radius:14px;">Instant Render</div>
    </div>
  </section>
</body>
</html>`
  }
];
