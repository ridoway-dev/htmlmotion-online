import { NextRequest, NextResponse } from 'next/server';
import { getRenderJob } from '@/lib/render-manager';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  const job = getRenderJob(id);
  if (!job) {
    return NextResponse.json({ error: 'Job not found or expired' }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    stepMessage: job.stepMessage,
    fileSizeBytes: job.fileSizeBytes,
    hasSubtitles: job.hasSubtitles,
    subtitleCuesCount: job.subtitleCuesCount,
    error: job.error,
    settings: {
      width: job.settings.width,
      height: job.settings.height,
      fps: job.settings.fps,
      duration: job.settings.duration,
    },
  });
}
