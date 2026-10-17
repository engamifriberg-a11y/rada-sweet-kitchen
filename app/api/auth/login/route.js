import {
  verifyPassword,
  hashPassword,
  createSession,
  sessionCookie,
  normUsername,
  hasSecret,
} from '../../../lib/auth';
import { findUser } from '../../../lib/store';
import { hit, clientIp } from '../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// תשובה זהה לשם לא קיים ולסיסמה שגויה — אחרת אפשר למפות שמות משתמשים
const SAME = 'שם המשתמש או הסיסמה שגויים.';

export async function POST(request) {
  if (!hasSecret()) {
    return Response.json({ error: 'השרת אינו מוגדר להתחברות.' }, { status: 503 });
  }

  const ip = clientIp(request);
  const byIp = hit(`login:${ip}`, 20, 15 * 60 * 1000);
  if (!byIp.ok) {
    return Response.json(
      { error: `יותר מדי ניסיונות. נסו שוב בעוד ${byIp.retrySec} שניות.` },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'בקשה לא תקינה.' }, { status: 400 });
  }

  const usernameNorm = normUsername(body?.username);
  const password = String(body?.password || '');

  if (!usernameNorm || !password) {
    return Response.json({ error: SAME }, { status: 401 });
  }

  // הגבלה גם לפי חשבון, כדי שלא יעזור להחליף כתובות
  const byUser = hit(`login-user:${usernameNorm}`, 10, 15 * 60 * 1000);
  if (!byUser.ok) {
    return Response.json(
      { error: `יותר מדי ניסיונות לחשבון הזה. נסו שוב בעוד ${byUser.retrySec} שניות.` },
      { status: 429 }
    );
  }

  const user = await findUser(usernameNorm);

  if (!user) {
    // גיבוב דמה: בלעדיו שם לא קיים חוזר מיד ושם קיים לוקח זמן,
    // והפרש הזמן מסגיר אילו שמות רשומים
    hashPassword(password);
    return Response.json({ error: SAME }, { status: 401 });
  }

  if (!verifyPassword(password, user.pw)) {
    return Response.json({ error: SAME }, { status: 401 });
  }

  return Response.json(
    { user: { id: user.id, username: user.username } },
    { headers: { 'Set-Cookie': sessionCookie(createSession(user.id, user.username)) } }
  );
}
