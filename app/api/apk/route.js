import { get } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * קובץ ההתקנה לאנדרואיד.
 *
 * הקובץ עצמו לא במאגר — המאגר ציבורי, ו־APK בינארי בכל גרסה מנפח אותו
 * בלי סיבה. הוא יושב באחסון הפרטי של הפרויקט, ומוגש דרך כאן.
 *
 * האחסון הזה מכיל גם את המתכונים של המשתמשים, ולכן הוא נשאר פרטי:
 * הקובץ נקרא בצד השרת ומוזרם ללקוח, במקום להפוך את כל המאגר לציבורי
 * בשביל קובץ אחד.
 *
 *   GET /api/apk          → פרטי הגרסה, או 404 כשאין קובץ
 *   GET /api/apk?file=1   → הקובץ עצמו
 *
 * הנתיב פתוח בכוונה: האפליקציה היא מעטפת לאתר בלבד, אין בה נתונים ואין
 * בה סודות. מי שמתקין אותה נתקל בסיסמת הכניסה ובהתחברות בדיוק כמו בדפדפן.
 */

const APK_PATH = process.env.APK_PATH || 'app/rada-kitchen-1.0.apk';
const FILENAME = 'rada-kitchen.apk';

export async function GET(request) {
  const version = process.env.APK_VERSION || '';
  if (!version) {
    return Response.json({ error: 'אין כרגע קובץ התקנה.' }, { status: 404 });
  }

  if (new URL(request.url).searchParams.get('file') !== '1') {
    return Response.json(
      {
        version,
        size: process.env.APK_SIZE || '',
        updated: process.env.APK_UPDATED || '',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  let res;
  try {
    res = await get(APK_PATH, { access: 'private', useCache: false });
  } catch {
    res = null;
  }
  if (!res || res.statusCode !== 200 || !res.stream) {
    return Response.json({ error: 'קובץ ההתקנה אינו זמין כרגע.' }, { status: 503 });
  }

  return new Response(res.stream, {
    headers: {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': `attachment; filename="${FILENAME}"`,
      // אנדרואיד מתקין מהקובץ שהורד, אין טעם לשמור עותק בדפדפן
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
