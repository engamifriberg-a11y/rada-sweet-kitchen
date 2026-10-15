import './globals.css';
import InstallPrompt from './components/InstallPrompt';

export const metadata = {
  title: 'המטבח המתוק של ראדה',
  description:
    'כלי עבודה לקונדיטורית: מתכוני יסוד ועוגות חתימה בעברית, כמויות במשקל, טמפרטורות, פתרון תקלות וסרטוני הדרכה.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/cake-icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192' }],
  },
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
      <body>
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
