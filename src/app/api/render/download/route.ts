import { NextRequest, NextResponse } from 'next/server';
import { getRenderJob } from '@/lib/render-manager';
import { parseSubtitles, generateSrtContent, generateVttContent } from '@/lib/subtitle-parser';
import fs from 'fs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const format = (searchParams.get('format') || searchParams.get('type') || '').toLowerCase();

  if (!id) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  const job = getRenderJob(id);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  // Handle Subtitle Download (.srt or .vtt)
  if (format === 'srt' || format === 'vtt') {
    let subtitleText = '';
    const cues = parseSubtitles(job.settings.html);

    if (format === 'srt') {
      subtitleText = generateSrtContent(cues);
      if (!subtitleText) {
        return NextResponse.json({ error: 'No subtitles found in this HTML' }, { status: 404 });
      }
      return new NextResponse(subtitleText, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="htmlmotion-${job.id.slice(0, 8)}.srt"`,
        },
      });
    }

    if (format === 'vtt') {
      subtitleText = generateVttContent(cues);
      if (!subtitleText) {
        return NextResponse.json({ error: 'No subtitles found in this HTML' }, { status: 404 });
      }
      return new NextResponse(subtitleText, {
        status: 200,
        headers: {
          'Content-Type': 'text/vtt; charset=utf-8',
          'Content-Disposition': `attachment; filename="htmlmotion-${job.id.slice(0, 8)}.vtt"`,
        },
      });
    }
  }

  // Handle MP4 Video Download
  if (!job.mp4Path || !fs.existsSync(job.mp4Path)) {
    return NextResponse.json({ error: 'Video file not found or render in progress' }, { status: 404 });
  }

  const stat = fs.statSync(job.mp4Path);
  const fileBuffer = fs.readFileSync(job.mp4Path);

  const isAttachment = searchParams.get('stream') !== 'true';

  const headers = new Headers();
  headers.set('Content-Type', 'video/mp4');
  headers.set('Content-Length', stat.size.toString());
  headers.set('Accept-Ranges', 'bytes');
  if (isAttachment) {
    headers.set('Content-Disposition', `attachment; filename="htmlmotion-${job.id.slice(0, 8)}.mp4"`);
  } else {
    headers.set('Content-Disposition', `inline; filename="htmlmotion-${job.id.slice(0, 8)}.mp4"`);
  }

  return new NextResponse(fileBuffer, {
    status: 200,
    headers,
  });
}

