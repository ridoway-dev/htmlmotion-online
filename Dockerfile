# Use official Playwright base image with all Linux browser dependencies pre-installed
FROM mcr.microsoft.com/playwright:v1.49.0-noble AS runner

WORKDIR /app

# Install native system FFmpeg and clean up apt cache
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Set build environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy package manifests and install all dependencies (including build tools)
COPY package.json package-lock.json* ./
RUN npm install --include=dev

# Install Playwright Chromium browser binary
RUN npx playwright install chromium

# Copy application source code
COPY . .

# Build Next.js production bundle
RUN npm run build

# Switch to production environment for runtime
ENV NODE_ENV=production

# Create temp renders directory with appropriate permissions
RUN mkdir -p .temp_renders

EXPOSE 3000

# Launch Next.js production server
CMD ["npm", "start"]

