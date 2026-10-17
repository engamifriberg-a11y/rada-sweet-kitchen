'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { recipes as builtIn, scaleQty } from '../data/recipes';

/**
 * הספרייה האישית של המשתמש המחובר.
 *
 * מקור האמת הוא השרת, והדפדפן מחזיק עותק מקומי כדי שהאפליקציה תיפתח
 * מיד ותעבוד גם בלי רשת. העותק נשמר תחת מפתח שכולל את מזהה המשתמש,
 * כך ששני משתמשים על אותו מכשיר לא רואים זה את נתוני זה.
 */

const LEGACY_KEY = 'rada-library-v1';
const cacheKey = (userId) => `rada-lib-${userId}`;

export const EMPTY = {
  custom: {},
  edits: {},
  hidden: [],
  videos: {},
  notes: {},
  favorites: [],
  checks: {},
  cart: [],
};

function readCache(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/** נתונים שנשמרו לפני שהיו חשבונות, שממתינים להעלאה */
export function readLegacy() {
  const d = readCache(LEGACY_KEY);
  if (!d) return null;
  const count =
    Object.keys(d.custom || {}).length +
    Object.keys(d.edits || {}).length +
    Object.keys(d.notes || {}).length +
    Object.keys(d.videos || {}).length +
    (d.favorites || []).length;
  return count > 0 ? { data: d, count } : null;
}

export function clearLegacy() {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {}
}

export function newRecipeId() {
  return 'my-' + Date.now().toString(36);
}

export function blankRecipe() {
  return {
    id: newRecipeId(),
    title: '',
    sub: '',
    kind: 'עוגה',
    origin: '',
    art: 'genoise',
    blurb: '',
    yield: '',
    baseServings: 8,
    times: { prep: '', bake: '', rest: '' },
    oven: '',
    difficulty: 1,
    allergens: [],
    video: '',
    groups: [{ name: 'מרכיבים', items: [{ n: '', q: 100, u: 'ג׳', note: '' }] }],
    steps: [''],
    notes: [],
    fixes: [],
    mine: true,
  };
}

export const ART_CHOICES = [
  ['genoise', 'חתך ספוג'],
  ['chocsponge', 'חתך שוקולד'],
  ['marble', 'עוגה בחושה'],
  ['bundt', 'עוגת קוגלהוף'],
  ['honey', 'פרוסה כהה'],
  ['victoria', 'עוגת שכבות'],
  ['blackforest', 'שכבות ושמנת'],
  ['nycheesecake', 'עוגת גבינה'],
  ['basque', 'גבינה שרופה'],
  ['mousse', 'כיפת מוס'],
  ['glaze', 'גלסאז׳ מראה'],
  ['choctart', 'טארט שוקולד'],
  ['lemontart', 'טארט מרנג'],
  ['sucree', 'תחתית טארט'],
  ['applepie', 'פאי'],
  ['crumble', 'קראמבל'],
  ['babka', 'בבקה וקראנץ'],
  ['cinnamonroll', 'רול ספירלה'],
  ['croissant', 'קרואסון'],
  ['brioche', 'מאפה שמרים'],
  ['cookie', 'עוגייה'],
  ['macaron', 'מקרון'],
  ['eclair', 'אקלר'],
  ['patissiere', 'קערת קרם'],
  ['ganache', 'קערת שוקולד'],
  ['meringue', 'מרנג'],
  ['pannacotta', 'קינוח בכוס'],
  ['knafeh', 'כנאפה'],
  ['baklava', 'שכבות פילו'],
  ['brigadeiro', 'כדורים'],
];

function applyEdit(base, edit) {
  if (!edit) return base;
  return { ...base, ...edit, times: { ...base.times, ...(edit.times || {}) }, edited: true };
}

export function buildLibrary(data) {
  const out = [];
  for (const r of builtIn) {
    if (data.hidden.includes(r.id)) continue;
    out.push(applyEdit(r, data.edits[r.id]));
  }
  for (const r of Object.values(data.custom)) out.push({ ...r, mine: true });
  return out;
}

export function resolveVideo(recipe, data) {
  const own = data?.videos?.[recipe.id];
  if (own) {
    const t = own.trim();
    if (/^https?:\/\//i.test(t)) return t;
    return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(t);
  }
  return (
    'https://www.youtube.com/results?search_query=' +
    encodeURIComponent(recipe.video || recipe.title + ' מתכון')
  );
}

export function hasOwnVideo(recipe, data) {
  return Boolean(data?.videos?.[recipe.id]);
}

/* ── מחשבון תבניות ─────────────────────── */
export function panArea(pan) {
  if (!pan) return 0;
  if (pan.shape === 'round') {
    const d = Number(pan.d) || 0;
    return Math.PI * (d / 2) ** 2;
  }
  return (Number(pan.w) || 0) * (Number(pan.h) || 0);
}

export function panFactor(from, to) {
  const a = panArea(from);
  const b = panArea(to);
  if (!a || !b) return null;
  return b / a;
}

/* ── רשימת קניות ───────────────────────── */
function normName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[֑-ׇ]/g, '')
    .replace(/[(（].*?[)）]/g, '')
    .replace(/[,،].*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildShoppingList(cart, library) {
  const lines = new Map();
  const missing = [];
  for (const entry of cart) {
    const r = library.find((x) => x.id === entry.id);
    if (!r) {
      missing.push(entry.id);
      continue;
    }
    const factor = (entry.servings || r.baseServings) / r.baseServings;
    for (const g of r.groups || []) {
      for (const it of g.items || []) {
        const key = normName(it.n) + '|' + (it.u || '');
        const prev = lines.get(key);
        const qty = scaleQty(it.q, factor) || 0;
        if (prev) {
          prev.q += qty;
          if (!prev.from.includes(r.title)) prev.from.push(r.title);
        } else {
          lines.set(key, { n: it.n, u: it.u, q: qty, from: [r.title] });
        }
      }
    }
  }
  return { items: [...lines.values()].sort((a, b) => b.q - a.q), missing };
}

export function shoppingListText(list) {
  return list.items.map((i) => `☐ ${Math.round(i.q * 10) / 10} ${i.u} — ${i.n}`).join('\n');
}

/* ── ה־hook ────────────────────────────── */

export function useLibrary() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [data, setData] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState('idle'); // idle | saving | offline | error
  const [storageFull, setStorageFull] = useState(false);

  const timer = useRef(null);
  const pending = useRef(null);
  const userRef = useRef(null);

  /* שומר בשרת, עם המתנה קצרה כדי לא לשלוח בקשה על כל הקלדה */
  const push = useCallback(async (payload) => {
    const u = userRef.current;
    if (!u) return;
    setSync('saving');
    try {
      const res = await fetch('/api/library', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload }),
      });
      if (res.status === 401) {
        // ההתחברות פגה
        setUser(null);
        userRef.current = null;
        setSync('error');
        return;
      }
      setSync(res.ok ? 'idle' : 'error');
    } catch {
      // אין רשת — העותק המקומי נשמר וינסה שוב בשינוי הבא
      setSync('offline');
    }
  }, []);

  const schedule = useCallback(
    (payload) => {
      pending.current = payload;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        const p = pending.current;
        pending.current = null;
        if (p) push(p);
      }, 1000);
    },
    [push]
  );

  /* שמירה מיידית כשעוזבים את הדף, כדי שלא יאבד שינוי אחרון */
  useEffect(() => {
    const flush = () => {
      if (!pending.current || !userRef.current) return;
      const body = JSON.stringify({ data: pending.current });
      pending.current = null;
      // keepalive מאפשר לבקשה להסתיים גם אחרי שהדף נסגר
      try {
        fetch('/api/library', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        });
      } catch {}
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
    return () => window.removeEventListener('pagehide', flush);
  }, []);

  /* טעינה: מצב ההתחברות, ואז מטמון מקומי להצגה מיידית, ואז השרת */
  const load = useCallback(async () => {
    let me = null;
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const j = await res.json();
      me = j?.user || null;
    } catch {
      // אין רשת: אם יש התחברות קודמת שמורה, ממשיכים ממנה
      try {
        const saved = localStorage.getItem('rada-user');
        if (saved) me = JSON.parse(saved);
      } catch {}
    }

    setUser(me);
    userRef.current = me;
    setAuthReady(true);

    if (!me) {
      setData(EMPTY);
      setReady(true);
      return;
    }

    try {
      localStorage.setItem('rada-user', JSON.stringify(me));
    } catch {}

    const cached = readCache(cacheKey(me.id));
    if (cached) setData(cached);
    setReady(true);

    try {
      const res = await fetch('/api/library', { cache: 'no-store' });
      if (res.ok) {
        const j = await res.json();
        const fresh = { ...EMPTY, ...(j.data || {}) };
        setData(fresh);
        writeCache(cacheKey(me.id), fresh);
        setSync('idle');
      } else if (res.status === 401) {
        setUser(null);
        userRef.current = null;
      }
    } catch {
      setSync('offline');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback(
    (fn) => {
      setData((prev) => {
        const next = fn(prev);
        const u = userRef.current;
        if (u) {
          if (!writeCache(cacheKey(u.id), next)) setStorageFull(true);
          schedule(next);
        }
        return next;
      });
    },
    [schedule]
  );

  const library = useMemo(() => buildLibrary(data), [data]);

  const api = useMemo(
    () => ({
      data,
      ready,
      user,
      authReady,
      sync,
      storageFull,
      library,

      async login(username, password) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j.error || 'ההתחברות נכשלה.');
        await load();
        return j.user;
      },

      async register(username, password, code) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, code }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j.error || 'ההרשמה נכשלה.');
        await load();
        return j.user;
      },

      async logout() {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch {}
        const u = userRef.current;
        // ניקוי העותק המקומי: במכשיר משותף אסור שהנתונים יישארו אחרי יציאה
        try {
          if (u) localStorage.removeItem(cacheKey(u.id));
          localStorage.removeItem('rada-user');
        } catch {}
        setUser(null);
        userRef.current = null;
        setData(EMPTY);
      },

      /** מעלה נתונים שנשמרו בדפדפן לפני שהיו חשבונות */
      async importLegacy(legacy) {
        update((d) => ({
          ...d,
          custom: { ...d.custom, ...(legacy.custom || {}) },
          edits: { ...d.edits, ...(legacy.edits || {}) },
          videos: { ...d.videos, ...(legacy.videos || {}) },
          notes: { ...d.notes, ...(legacy.notes || {}) },
          hidden: [...new Set([...d.hidden, ...(legacy.hidden || [])])],
          favorites: [...new Set([...d.favorites, ...(legacy.favorites || [])])],
        }));
      },

      saveRecipe(recipe) {
        update((d) => {
          if (recipe.mine || d.custom[recipe.id]) {
            return { ...d, custom: { ...d.custom, [recipe.id]: { ...recipe, mine: true } } };
          }
          return { ...d, edits: { ...d.edits, [recipe.id]: recipe } };
        });
      },

      removeRecipe(id) {
        update((d) => {
          if (d.custom[id]) {
            const custom = { ...d.custom };
            delete custom[id];
            return { ...d, custom };
          }
          return { ...d, hidden: [...new Set([...d.hidden, id])] };
        });
      },

      restoreRecipe(id) {
        update((d) => {
          const edits = { ...d.edits };
          delete edits[id];
          return { ...d, hidden: d.hidden.filter((x) => x !== id), edits };
        });
      },

      setVideo(id, url) {
        update((d) => {
          const videos = { ...d.videos };
          if (url && url.trim()) videos[id] = url.trim();
          else delete videos[id];
          return { ...d, videos };
        });
      },

      setNote(id, text) {
        update((d) => {
          const notes = { ...d.notes };
          if (text && text.trim()) notes[id] = text;
          else delete notes[id];
          return { ...d, notes };
        });
      },

      toggleFavorite(id) {
        update((d) => ({
          ...d,
          favorites: d.favorites.includes(id)
            ? d.favorites.filter((x) => x !== id)
            : [...d.favorites, id],
        }));
      },

      toggleCheck(id, kind, index) {
        update((d) => {
          const cur = d.checks[id] || { ing: [], steps: [] };
          const arr = cur[kind] || [];
          const next = arr.includes(index) ? arr.filter((x) => x !== index) : [...arr, index];
          return { ...d, checks: { ...d.checks, [id]: { ...cur, [kind]: next } } };
        });
      },

      clearChecks(id) {
        update((d) => {
          const checks = { ...d.checks };
          delete checks[id];
          return { ...d, checks };
        });
      },

      addToCart(id, servings) {
        update((d) => ({ ...d, cart: [...d.cart.filter((c) => c.id !== id), { id, servings }] }));
      },

      removeFromCart(id) {
        update((d) => ({ ...d, cart: d.cart.filter((c) => c.id !== id) }));
      },

      clearCart() {
        update((d) => ({ ...d, cart: [] }));
      },

      exportAll() {
        const payload = {
          app: 'rada-sweet-kitchen',
          version: 2,
          user: user?.username || null,
          exportedAt: new Date().toISOString(),
          data,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rada-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },

      async importFile(file) {
        const text = await file.text();
        let parsed;
        try {
          parsed = JSON.parse(text);
        } catch {
          throw new Error('הקובץ אינו קובץ גיבוי תקין.');
        }
        const incoming = parsed?.data;
        if (!incoming || typeof incoming !== 'object' || !('custom' in incoming)) {
          throw new Error('הקובץ אינו גיבוי של המטבח של ראדה.');
        }
        let added = 0;
        update((d) => {
          const custom = { ...d.custom };
          for (const [id, r] of Object.entries(incoming.custom || {})) {
            if (!custom[id]) added++;
            custom[id] = r;
          }
          return {
            ...d,
            custom,
            edits: { ...d.edits, ...(incoming.edits || {}) },
            videos: { ...d.videos, ...(incoming.videos || {}) },
            notes: { ...d.notes, ...(incoming.notes || {}) },
            hidden: [...new Set([...d.hidden, ...(incoming.hidden || [])])],
            favorites: [...new Set([...d.favorites, ...(incoming.favorites || [])])],
          };
        });
        return added;
      },
    }),
    [data, ready, user, authReady, sync, storageFull, library, update, load]
  );

  return api;
}
