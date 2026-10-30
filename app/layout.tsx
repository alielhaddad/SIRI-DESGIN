import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Siri Designs | Interior Design, Fit-Out & Decoration',
  description: 'Siri Designs delivers thoughtful interior design, commercial fit-outs, and decorative solutions. Explore our work and request a project consultation.',
  icons: { icon: '/logo.png', apple: '/logo.png' },
  openGraph: { title: 'Siri Designs', description: 'Interior Design, Fit-Out & Decoration', images: ['/logo.png'], locale: 'en_US', type: 'website' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#102b2b' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" dir="ltr"><body>{children}</body></html>;
}
