import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saurav Gusain — Video Editor',
  description: 'Cinematic stories, sharp cuts, and thoughtful edits by Saurav Gusain.',
  openGraph: {
    title: 'Saurav Gusain — Video Editor',
    description: 'Turning raw footage into stories that hit different.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
