import './globals.css';

export const metadata = {
  title: 'Rada — מטבח הקונדיטוריה',
  description:
    'כלי עבודה לקונדיטורית: מתכוני יסוד ועוגות חתימה בעברית, כמויות במשקל, טמפרטורות, פתרון תקלות וסרטוני הדרכה.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/cake-icon.svg', apple: '/cake-icon.svg' },
  appleWebApp: { capable: true, title: 'Rada', statusBarStyle: 'black-translucent' },
};

export const viewport = {
  themeColor: '#2B211A',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700;800&family=Heebo:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
