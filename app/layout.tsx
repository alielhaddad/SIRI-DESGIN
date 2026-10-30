import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Siri Designs | تشطيبات وديكورات وتصميم داخلي',
  description: 'Siri Designs — حلول التشطيبات والديكورات والتصميم الداخلي. اكتشف أعمالنا واطلب عرض سعر لمشروعك.',
  icons: { icon: '/logo.png', apple: '/logo.png' },
  openGraph: { title: 'Siri Designs', description: 'تشطيبات وديكورات وتصميم داخلي', images: ['/logo.png'], locale: 'ar_EG', type: 'website' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#102b2b' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
