# Use official Playwright base image with all Linux browser dependencies pre-installed
FROM mcr.microsoft.com/playwright:v1.49.0-noble AS runner

WORKDIR /app

# Install native system FFmpeg and clean up apt cache
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Set build environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=7860

# Copy package manifests and install all dependencies (including build tools)
COPY package.json package-lock.json* ./
RUN npm install --include=dev

# Install Playwright Chromium browser binary with all system dependencies
RUN npx playwright install --with-deps chromium

# Copy application source code
COPY . .

# Build Next.js production bundle
RUN npm run build

# Switch to production environment for runtime
ENV NODE_ENV=production

# Create temp renders directory with appropriate permissions for non-root users (Hugging Face UID 1000)
RUN mkdir -p .temp_renders && chmod -R 777 .temp_renders /app

EXPOSE 7860
EXPOSE 3000

# Launch Next.js production server (supports Hugging Face $PORT=7860 and Render $PORT)
CMD ["sh", "-c", "npx next start -H 0.0.0.0 -p ${PORT:-7860}"]

