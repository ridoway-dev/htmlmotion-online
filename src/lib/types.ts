export interface RenderJobSettings {
  html: string;
  width: number;
  height: number;
  duration: number; // in seconds
  fps: number; // 30 or 60
  delay?: number; // wait in ms before recording starts (e.g., 500)
  backgroundColor?: string;
  crf?: number; // 18 - 28
  aspectRatioLabel?: string;
  selector?: string; // Target specific section / element selector (e.g. '#hero', '#features')
  scrollMode?: 'static' | 'auto-scroll' | 'fit-section'; // Full page, auto scroll through sections, or isolate section
  sectionLabel?: string;
}

export type JobStatus = 'queued' | 'preparing' | 'launching' | 'capturing' | 'encoding' | 'completed' | 'failed';

export interface RenderJob {
  id: string;
  createdAt: number;
  status: JobStatus;
  progress: number; // 0 - 100
  stepMessage: string;
  settings: RenderJobSettings;
  videoPath?: string;
  mp4Path?: string;
  fileSizeBytes?: number;
  hasSubtitles?: boolean;
  subtitleCuesCount?: number;
  srtPath?: string;
  error?: string;
}

export interface PresetTemplate {
  id: string;
  title: string;
  description: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  width: number;
  height: number;
  duration: number;
  fps: number;
  html: string;
}
