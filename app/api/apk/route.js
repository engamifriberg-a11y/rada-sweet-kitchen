export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * קובץ ההתקנה לאנדרואיד.
 *
 * הקובץ עצמו מאוחסן מחוץ למאגר — המאגר ציבורי, ו־APK בינארי בכל גרסה
 * מנפח אותו בלי סיבה. הכתובת נשמרת כמשתנה סביבה, כך שאפשר להעלות
 * גרסה חדשה בלי לפרוס מחדש את האתר.
 *
 *   GET /api/apk          → פרטי הגרסה, או 404 כשאין קובץ
 *   GET /api/apk?file=1   → הפניה להורדת הקובץ
 *
 * הנתיב פתוח בכוונה: האפליקציה היא מעטפת לאתר בלבד, אין בה נתונים
 * ואין בה סודות. מי שמתקין אותה עדיין נתקל בסיסמת הכניסה ובהתחברות.
 */
export async function GET(request) {
  const url = process.env.APK_URL;
  if (!url) {
    return Response.json({ error: 'אין כרגע קובץ התקנה.' }, { status: 404 });
  }

  const wantsFile = new URL(request.url).searchParams.get('file') === '1';
  if (wantsFile) {
    return Response.redirect(url, 302);
  }

  return Response.json(
    {
      version: process.env.APK_VERSION || '1.0',
      size: process.env.APK_SIZE || '',
      updated: process.env.APK_UPDATED || '',
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
