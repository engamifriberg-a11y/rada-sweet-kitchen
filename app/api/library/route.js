import { userFromRequest } from '../../lib/auth';
import { readLibrary, writeLibrary, sanitizeLibrary } from '../../lib/store';
import { hit, clientIp } from '../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// תקרה לגוף הבקשה. בלעדיה אפשר למלא את האחסון בבקשה אחת.
const MAX_BYTES = 2 * 1024 * 1024;

/**
 * הספרייה הפרטית של המשתמש המחובר.
 *
 * כלל יחיד וקריטי: מזהה המשתמש נלקח תמיד מהעוגייה החתומה
 * (userFromRequest), ולעולם לא מגוף הבקשה, מהנתיב או מפרמטר.
 * זה מה שהופך את ההפרדה בין המשתמשים לאמיתית ולא לקוסמטית.
 */

export async function GET(request) {
  const user = userFromRequest(request);
  if (!user) return Response.json({ error: 'לא מחובר.' }, { status: 401 });

  try {
    const data = await readLibrary(user.id);
    return Response.json({ data }, { headers: { 'Cache-Control': 'no-store, private' } });
  } catch {
    return Response.json({ error: 'לא ניתן לקרוא את הספרייה כרגע.' }, { status: 503 });
  }
}

export async function PUT(request) {
  const user = userFromRequest(request);
  if (!user) return Response.json({ error: 'לא מחובר.' }, { status: 401 });

  const gate = hit(`lib:${user.id}:${clientIp(request)}`, 120, 60 * 1000);
  if (!gate.ok) {
    return Response.json({ error: 'יותר מדי שמירות. נסו שוב בעוד רגע.' }, { status: 429 });
  }

  const len = Number(request.headers.get('content-length') || 0);
  if (len && len > MAX_BYTES) {
    return Response.json({ error: 'הספרייה גדולה מדי לשמירה.' }, { status: 413 });
  }

  let body;
  try {
    const text = await request.text();
    if (text.length > MAX_BYTES) {
      return Response.json({ error: 'הספרייה גדולה מדי לשמירה.' }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: 'בקשה לא תקינה.' }, { status: 400 });
  }

  // הנתונים מגיעים מהדפדפן ולכן נחתכים לצורה מוכרת לפני שמירה
  const clean = sanitizeLibrary(body?.data);

  try {
    await writeLibrary(user.id, clean);
  } catch {
    return Response.json({ error: 'השמירה נכשלה. נסו שוב.' }, { status: 503 });
  }

  return Response.json({ ok: true, data: clean }, { headers: { 'Cache-Control': 'no-store, private' } });
}
