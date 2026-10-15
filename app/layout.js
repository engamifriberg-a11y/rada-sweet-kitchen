import './globals.css';

export const metadata = {
  title: 'המטבח המתוק של ראדה',
  description:
    'כלי עבודה לקונדיטורית: מתכוני יסוד ועוגות חתימה בעברית, כמויות במשקל, טמפרטורות, פתרון תקלות וסרטוני הדרכה.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/cake-icon.svg', apple: '/cake-icon.svg' },
  appleWebApp: { capable: true, title: 'המטבח של ראדה', statusBarStyle: 'default' },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F2FB' },
    { media: '(prefers-color-scheme: dark)', color: '#150F1F' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// קובע את ערכת הצבעים לפני הציור הראשון, כדי שלא תהיה הבזקה לבנה במצב כהה
const themeBoot = `(function(){try{var t=localStorage.getItem('rada-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&family=Frank+Ruhl+Libre:wght@500;700;800&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
