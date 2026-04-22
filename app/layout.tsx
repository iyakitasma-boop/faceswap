import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FaceForge AI — Neural Face Swap',
  description: 'Swap faces with AI-powered precision. Upload two photos and transform instantly.',
  keywords: 'face swap, AI, neural, photo edit, deep fake, face replace',
  openGraph: {
    title: 'FaceForge AI — Neural Face Swap',
    description: 'Swap faces with AI-powered precision.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
