import {
  hashPassword,
  createSession,
  sessionCookie,
  checkUsername,
  checkPassword,
  normUsername,
  newUserId,
  hasSecret,
} from '../../../lib/auth';
import { createUser, findUser } from '../../../lib/store';
import { hit, clientIp } from '../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!hasSecret()) {
    return Response.json({ error: 'השרת אינו מוגדר להתחברות.' }, { status: 503 });
  }

  const gate = hit(`reg:${clientIp(request)}`, 5, 60 * 60 * 1000);
  if (!gate.ok) {
    return Response.json(
      { error: 'יותר מדי הרשמות מהכתובת הזו. נסו שוב מאוחר יותר.' },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'בקשה לא תקינה.' }, { status: 400 });
  }

  // קוד הרשמה — פעיל רק אם הוגדר SIGNUP_CODE. בלעדיו ההרשמה פתוחה.
  const required = process.env.SIGNUP_CODE;
  if (required) {
    if (String(body?.code || '').trim() !== required) {
      return Response.json({ error: 'קוד ההרשמה שגוי.' }, { status: 403 });
    }
  }

  const display = String(body?.username || '')
    .normalize('NFKC')
    .trim()
    .slice(0, 32);
  const password = String(body?.password || '');

  const nameErr = checkUsername(display);
  if (nameErr) return Response.json({ error: nameErr }, { status: 400 });

  const pwErr = checkPassword(password);
  if (pwErr) return Response.json({ error: pwErr }, { status: 400 });

  const usernameNorm = normUsername(display);

  // בדיקה מקדימה לשגיאה ברורה; המניעה האמיתית של כפילות היא הכתיבה האטומית
  if (await findUser(usernameNorm)) {
    return Response.json({ error: 'שם המשתמש כבר תפוס.' }, { status: 409 });
  }

  const id = newUserId();
  const record = {
    id,
    username: display,
    usernameNorm,
    pw: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  const created = await createUser(record);
  if (!created) {
    return Response.json({ error: 'שם המשתמש כבר תפוס.' }, { status: 409 });
  }

  return Response.json(
    { user: { id, username: display } },
    { status: 201, headers: { 'Set-Cookie': sessionCookie(createSession(id, display)) } }
  );
}
