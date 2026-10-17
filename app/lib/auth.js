import crypto from 'node:crypto';

/**
 * אימות — פונקציות שרת בלבד.
 *
 * הקובץ הזה לעולם לא מגיע לדפדפן. הוא מחזיק את גיבוב הסיסמאות ואת חתימת
 * העוגיות, ושום פונקציה כאן לא מחזירה סיסמה, מלח או גיבוב החוצה.
 */

/* ── סיסמאות ──────────────────────────────────
   scrypt עם מלח אקראי לכל משתמש. הפרמטרים נשמרים לצד הגיבוב כדי
   שאפשר יהיה לחזק אותם בעתיד בלי לפסול סיסמאות קיימות. */

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password.normalize('NFKC'), salt, SCRYPT.keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
    maxmem: 64 * 1024 * 1024,
  });
  return {
    algo: 'scrypt',
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
    salt: salt.toString('base64'),
    hash: hash.toString('base64'),
  };
}

export function verifyPassword(password, rec) {
  if (!rec || rec.algo !== 'scrypt') return false;
  try {
    const salt = Buffer.from(rec.salt, 'base64');
    const expected = Buffer.from(rec.hash, 'base64');
    const actual = crypto.scryptSync(password.normalize('NFKC'), salt, expected.length, {
      N: rec.N || SCRYPT.N,
      r: rec.r || SCRYPT.r,
      p: rec.p || SCRYPT.p,
      maxmem: 64 * 1024 * 1024,
    });
    // השוואה בזמן קבוע — השוואה רגילה מדליפה מידע דרך זמן התגובה
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/* ── עוגיית התחברות ───────────────────────────
   אסימון חתום ב־HMAC, חסר מצב: אין צורך לשמור הפעלות בשרת.
   המטען גלוי אך חתום, ולכן אי אפשר לזייף אותו בלי הסוד. */

export const COOKIE = 'rada_session';
const DAYS = 60;
const MAX_AGE = DAYS * 24 * 60 * 60;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error('AUTH_SECRET missing or too short');
  }
  return s;
}

export function hasSecret() {
  const s = process.env.AUTH_SECRET;
  return Boolean(s && s.length >= 32);
}

function sign(data) {
  return crypto.createHmac('sha256', secret()).update(data).digest('base64url');
}

export function createSession(userId, username) {
  const exp = Date.now() + MAX_AGE * 1000;
  // שם התצוגה נשמר באסימון כדי לחסוך קריאת אחסון בכל טעינת דף.
  // הוא חתום ולכן לא ניתן לזיוף, אך אינו סוד.
  const payload = Buffer.from(JSON.stringify({ uid: userId, u: username || '', exp })).toString(
    'base64url'
  );
  return `${payload}.${sign(payload)}`;
}

/** מחזיר userId לאסימון תקף, או null. לעולם לא זורק. */
export function readSession(token) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return null;

  const payload = token.slice(0, dot);
  const given = token.slice(dot + 1);

  let expectedBuf;
  let givenBuf;
  try {
    expectedBuf = Buffer.from(sign(payload), 'utf8');
    givenBuf = Buffer.from(given, 'utf8');
  } catch {
    return null;
  }
  if (expectedBuf.length !== givenBuf.length) return null;
  if (!crypto.timingSafeEqual(expectedBuf, givenBuf)) return null;

  try {
    const { uid, u, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!uid || typeof exp !== 'number' || Date.now() > exp) return null;
    return { id: uid, username: typeof u === 'string' ? u : '' };
  } catch {
    return null;
  }
}

export function sessionCookie(token) {
  // Secure + HttpOnly + SameSite=Lax:
  // HttpOnly חוסם גישה מ־JavaScript, Secure מחייב HTTPS, Lax מגן מ־CSRF בסיסי.
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;
}

export function clearCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

/**
 * מוציא את המשתמש מהבקשה. זה המקור היחיד לזהות בכל האפליקציה.
 * שום נתיב לא לוקח מזהה משתמש מגוף הבקשה או מפרמטר — אחרת כל אחד
 * היה יכול לבקש את הנתונים של מישהו אחר.
 */
export function userFromRequest(request) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() !== COOKIE) continue;
    return readSession(part.slice(eq + 1).trim());
  }
  return null;
}

/* ── שער האתר ─────────────────────────────
   סיסמה משותפת אחת לפני מסך הכניסה, כדי שלא כל מי שמגיע לכתובת
   יוכל אפילו לנסות להירשם. היא נבדקת בשרת ומונפקת כעוגייה חתומה
   נפרדת — חסימה בממשק בלבד לא הייתה חוסמת כלום. */

export const GATE_COOKIE = 'rada_gate';
const GATE_AGE = 180 * 24 * 60 * 60;

export function gateRequired() {
  return Boolean(process.env.SITE_PASSCODE);
}

export function checkPasscode(given) {
  const want = process.env.SITE_PASSCODE;
  if (!want) return true;
  const a = Buffer.from(String(given || ''), 'utf8');
  const b = Buffer.from(want, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createGate() {
  const exp = Date.now() + GATE_AGE * 1000;
  // חתימה על ערך הסיסמה הנוכחית: שינוי הסיסמה מבטל אוטומטית
  // את כל השערים שהונפקו קודם
  const stamp = crypto
    .createHash('sha256')
    .update(String(process.env.SITE_PASSCODE || ''))
    .digest('base64url')
    .slice(0, 16);
  const payload = Buffer.from(JSON.stringify({ g: stamp, exp })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readGate(token) {
  if (!gateRequired()) return true;
  if (!token || typeof token !== 'string') return false;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  let expectedBuf;
  let givenBuf;
  try {
    expectedBuf = Buffer.from(sign(payload), 'utf8');
    givenBuf = Buffer.from(token.slice(dot + 1), 'utf8');
  } catch {
    return false;
  }
  if (expectedBuf.length !== givenBuf.length) return false;
  if (!crypto.timingSafeEqual(expectedBuf, givenBuf)) return false;
  try {
    const { g, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof exp !== 'number' || Date.now() > exp) return false;
    const stamp = crypto
      .createHash('sha256')
      .update(String(process.env.SITE_PASSCODE || ''))
      .digest('base64url')
      .slice(0, 16);
    return g === stamp;
  } catch {
    return false;
  }
}

export function gateCookie(token) {
  return `${GATE_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${GATE_AGE}`;
}

export function gateFromRequest(request) {
  if (!gateRequired()) return true;
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() !== GATE_COOKIE) continue;
    return readGate(part.slice(eq + 1).trim());
  }
  return false;
}

/* ── ולידציה ─────────────────────────────── */

export function normUsername(name) {
  return String(name || '')
    .normalize('NFKC')
    .trim()
    .toLowerCase();
}

export function checkUsername(name) {
  const n = normUsername(name);
  if (n.length < 2) return 'שם המשתמש קצר מדי — לפחות 2 תווים.';
  if (n.length > 32) return 'שם המשתמש ארוך מדי — עד 32 תווים.';
  // אותיות עברית ולטינית, ספרות, מקף, קו תחתון ונקודה
  if (!/^[֐-׿a-z0-9._-]+$/.test(n)) {
    return 'שם המשתמש יכול להכיל אותיות, ספרות, נקודה, מקף וקו תחתון בלבד.';
  }
  return null;
}

export function checkPassword(pw) {
  const p = String(pw || '');
  if (p.length < 8) return 'הסיסמה קצרה מדי — לפחות 8 תווים.';
  if (p.length > 200) return 'הסיסמה ארוכה מדי.';
  return null;
}

export function newUserId() {
  return crypto.randomUUID();
}
