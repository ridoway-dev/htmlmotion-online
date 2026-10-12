import { NextRequest, NextResponse } from 'next/server';
import { createRenderJob } from '@/lib/render-manager';
import { detectAnimationDuration } from '@/lib/duration-detector';
import { detectHtmlDimensions } from '@/lib/dimension-detector';
import JSZip from 'jszip';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let html = '';
    let width = 1920;
    let height = 1080;
    let duration = 5;
    let fps = 60;
    let delay = 600;
    let backgroundColor = 'transparent';
    let crf = 18;
    let selector: string | undefined = undefined;
    let scrollMode: 'static' | 'auto-scroll' | 'fit-section' = 'static';
    let sectionLabel: string | undefined = undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const htmlText = formData.get('html') as string | null;

      width = parseInt(formData.get('width') as string) || 1920;
      height = parseInt(formData.get('height') as string) || 1080;
      duration = Math.min(180, Math.max(1, parseFloat(formData.get('duration') as string) || 5));
      fps = parseInt(formData.get('fps') as string) || 60;
      delay = parseInt(formData.get('delay') as string) || 600;
      backgroundColor = (formData.get('backgroundColor') as string) || 'transparent';
      crf = parseInt(formData.get('crf') as string) || 18;
      selector = (formData.get('selector') as string) || undefined;
      scrollMode = ((formData.get('scrollMode') as string) as 'static' | 'auto-scroll' | 'fit-section') || 'static';
      sectionLabel = (formData.get('sectionLabel') as string) || undefined;

      if (file) {
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith('.zip')) {
          const buffer = await file.arrayBuffer();
          const zip = await JSZip.loadAsync(buffer);

          const htmlFile = zip.file('index.html') || zip.file(/^.*\.html$/i)[0];
          if (!htmlFile) {
            return NextResponse.json(
              { error: 'No HTML file found inside the ZIP archive.' },
              { status: 400 }
            );
          }
          html = await htmlFile.async('string');
        } else {
          html = await file.text();
        }
      } else if (htmlText) {
        html = htmlText;
      }
    } else {
      const json = await req.json();
      html = json.html || '';
      width = parseInt(json.width) || 1920;
      height = parseInt(json.height) || 1080;
      duration = Math.min(180, Math.max(1, parseFloat(json.duration) || 5));
      fps = parseInt(json.fps) || 60;
      delay = parseInt(json.delay) || 600;
      backgroundColor = json.backgroundColor || 'transparent';
      crf = parseInt(json.crf) || 18;
      selector = json.selector || undefined;
      scrollMode = json.scrollMode || 'static';
      sectionLabel = json.sectionLabel || undefined;
    }

    if (!html || !html.trim()) {
      return NextResponse.json(
        { error: 'HTML code or file is required.' },
        { status: 400 }
      );
    }

    if (!duration || duration <= 0) {
      duration = detectAnimationDuration(html);
    }

    const detectedDims = detectHtmlDimensions(html);
    if ((!width || width === 1920) && (!height || height === 1080) && !detectedDims.ratioLabel.includes('16:9')) {
      width = detectedDims.width;
      height = detectedDims.height;
    }

    const job = createRenderJob({
      html,
      width,
      height,
      duration,
      fps,
      delay,
      backgroundColor,
      crf,
      selector,
      scrollMode,
      sectionLabel,
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      message: 'Render job initiated successfully.',
    });
  } catch (error) {
    console.error('Error starting render job:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
