import crypto from 'node:crypto';
import { put, get, del } from '@vercel/blob';

/**
 * אחסון המשתמשים והספריות, מעל Vercel Blob.
 *
 * הנתיב של משתמש הוא גיבוב של שם המשתמש ולא השם עצמו. זה פותר שני דברים:
 * שמות בעברית לא צריכים קידוד בנתיב, ואי אפשר להסיק שמות משתמשים מרשימת
 * הקבצים.
 */

const PRIVATE = { access: 'private' };

function userPath(normUsername) {
  const h = crypto.createHash('sha256').update(normUsername, 'utf8').digest('hex');
  return `users/${h}.json`;
}

function libPath(userId) {
  // userId הוא UUID שהשרת ייצר, ולכן בטוח לשימוש בנתיב
  if (!/^[0-9a-f-]{36}$/i.test(userId)) throw new Error('bad user id');
  return `libs/${userId}.json`;
}

async function readJson(pathname) {
  let res;
  try {
    // useCache: false — חובה. קריאה ממטמון עלולה להחזיר גיבוב סיסמה ישן
    // או ספרייה ישנה אחרי שמירה.
    res = await get(pathname, { ...PRIVATE, useCache: false });
  } catch {
    return null;
  }
  if (!res || res.statusCode !== 200 || !res.stream) return null;
  try {
    const text = await new Response(res.stream).text();
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function writeJson(pathname, value, { create = false } = {}) {
  await put(pathname, JSON.stringify(value), {
    ...PRIVATE,
    addRandomSuffix: false,
    allowOverwrite: !create,
    contentType: 'application/json',
  });
}

/* ── משתמשים ─────────────────────────────── */

export async function findUser(normUsername) {
  return readJson(userPath(normUsername));
}

/**
 * יוצר משתמש. allowOverwrite:false הופך את זה לפעולה אטומית —
 * אם השם כבר תפוס הכתיבה נכשלת, במקום לדרוס משתמש קיים.
 * בדיקה ואז כתיבה הייתה משאירה חלון שבו שני רישומים מקבילים דורסים זה את זה.
 */
export async function createUser(record) {
  try {
    await writeJson(userPath(record.usernameNorm), record, { create: true });
    return true;
  } catch {
    return false;
  }
}

export async function updateUser(record) {
  await writeJson(userPath(record.usernameNorm), record);
}

/* ── ספריות ──────────────────────────────── */

export const EMPTY_LIB = {
  custom: {},
  edits: {},
  hidden: [],
  videos: {},
  notes: {},
  favorites: [],
  checks: {},
  cart: [],
};

export async function readLibrary(userId) {
  const data = await readJson(libPath(userId));
  if (!data || typeof data !== 'object') return { ...EMPTY_LIB };
  return { ...EMPTY_LIB, ...data };
}

export async function writeLibrary(userId, data) {
  await writeJson(libPath(userId), data);
}

export async function deleteLibrary(userId) {
  try {
    await del(libPath(userId));
  } catch {
    /* כבר לא קיים */
  }
}

/* ── ניקוי קלט ────────────────────────────
   הספרייה מגיעה מהדפדפן, ולכן נכנסת לשרת כנתון ולא כמבנה אמין.
   כאן היא נחתכת לצורה שהאפליקציה מכירה, עם תקרות גודל. */

const LIMITS = {
  custom: 400,
  steps: 120,
  items: 200,
  groups: 30,
  text: 4000,
  title: 200,
};

function str(v, max = LIMITS.text) {
  return String(v == null ? '' : v).slice(0, max);
}

function num(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function cleanRecipe(r) {
  if (!r || typeof r !== 'object') return null;
  const id = str(r.id, 80);
  if (!id) return null;
  return {
    id,
    title: str(r.title, LIMITS.title),
    sub: str(r.sub, LIMITS.title),
    kind: str(r.kind, 40),
    origin: str(r.origin, 80),
    art: str(r.art, 40),
    blurb: str(r.blurb, 600),
    yield: str(r.yield, 120),
    baseServings: num(r.baseServings, 1, 1000, 8),
    difficulty: num(r.difficulty, 1, 3, 1),
    oven: str(r.oven, 80),
    video: str(r.video, 600),
    times: {
      prep: str(r.times?.prep, 60),
      bake: str(r.times?.bake, 60),
      rest: str(r.times?.rest, 60),
    },
    allergens: Array.isArray(r.allergens) ? r.allergens.slice(0, 20).map((a) => str(a, 40)) : [],
    groups: Array.isArray(r.groups)
      ? r.groups.slice(0, LIMITS.groups).map((g) => ({
          name: str(g?.name, 120),
          items: Array.isArray(g?.items)
            ? g.items.slice(0, LIMITS.items).map((i) => ({
                n: str(i?.n, 200),
                q: num(i?.q, 0, 1e6, 0),
                u: str(i?.u, 20),
                ...(i?.note ? { note: str(i.note, 300) } : {}),
              }))
            : [],
        }))
      : [],
    steps: Array.isArray(r.steps) ? r.steps.slice(0, LIMITS.steps).map((s) => str(s, 2000)) : [],
    notes: Array.isArray(r.notes) ? r.notes.slice(0, 60).map((s) => str(s, 1200)) : [],
    fixes: Array.isArray(r.fixes)
      ? r.fixes.slice(0, 60).map((f) => ({
          p: str(f?.p, 300),
          c: str(f?.c, 600),
          f: str(f?.f, 900),
        }))
      : [],
    mine: true,
  };
}

function mapOf(obj, fn, limit) {
  const out = {};
  if (!obj || typeof obj !== 'object') return out;
  let n = 0;
  for (const [k, v] of Object.entries(obj)) {
    if (n++ >= limit) break;
    const key = str(k, 80);
    if (!key) continue;
    const val = fn(v);
    if (val !== null && val !== undefined) out[key] = val;
  }
  return out;
}

function ids(arr, limit = 500) {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.map((x) => str(x, 80)).filter(Boolean))].slice(0, limit);
}

export function sanitizeLibrary(input) {
  const d = input && typeof input === 'object' ? input : {};
  return {
    custom: mapOf(d.custom, cleanRecipe, LIMITS.custom),
    edits: mapOf(d.edits, cleanRecipe, LIMITS.custom),
    hidden: ids(d.hidden),
    videos: mapOf(d.videos, (v) => str(v, 600) || null, 600),
    notes: mapOf(d.notes, (v) => str(v, 4000) || null, 600),
    favorites: ids(d.favorites),
    checks: mapOf(
      d.checks,
      (v) => ({
        ing: Array.isArray(v?.ing) ? v.ing.slice(0, 300).map((x) => num(x, 0, 1000, 0)) : [],
        steps: Array.isArray(v?.steps) ? v.steps.slice(0, 300).map((x) => num(x, 0, 1000, 0)) : [],
      }),
      400
    ),
    cart: Array.isArray(d.cart)
      ? d.cart
          .slice(0, 100)
          .map((c) => ({ id: str(c?.id, 80), servings: num(c?.servings, 1, 1000, 8) }))
          .filter((c) => c.id)
      : [],
  };
}
