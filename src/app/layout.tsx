import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const bricolageGrotesque = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HTMLMotion — Claude HTML to Video & MP4 Converter',
  description: 'Convert Claude AI HTML & CSS animations into studio-grade 1080p/4K MP4 or WebM videos and synced Subtitles (.SRT). 100% free, private, and open source.',
  keywords: [
    'claude html to video',
    'claude html to mp4',
    'claude animation to video',
    'claude motion to mp4',
    'convert claude animation to video',
    'claude artifacts to video',
    'html to video converter',
    'html css animation to mp4',
    'turn claude animation into video',
    'claude ai video generator',
    'htmlmotion',
  ],
  authors: [{ name: 'ridoway-dev' }],
  metadataBase: new URL('https://htmlmotion.online'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'HTMLMotion — Claude HTML to Video & MP4 Converter',
    description: 'Convert Claude AI HTML & CSS animations into studio-grade MP4 videos & synced subtitles (.SRT).',
    url: 'https://htmlmotion.online',
    siteName: 'HTMLMotion',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HTMLMotion — Claude HTML to Video & MP4 Converter',
    description: 'Convert Claude AI HTML & CSS animations into studio-grade MP4 videos & synced subtitles (.SRT).',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolageGrotesque.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#fafafa] text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}

