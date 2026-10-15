'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { recipes as builtIn, scaleQty } from '../data/recipes';

/**
 * הספרייה האישית של רדה.
 *
 * הכל נשמר בדפדפן שלה בלבד. זו החלטה מכוונת: האתר ציבורי וללא התחברות,
 * ולכן נתונים בשרת היו פתוחים לעריכה ולמחיקה בידי כל מי שיש לו את הקישור.
 * המחיר הוא שהמידע חי בדפדפן אחד — ולכן יש ייצוא וייבוא לקובץ.
 */

const KEY = 'rada-library-v1';

const EMPTY = {
  custom: {}, // מתכונים שרדה כתבה
  edits: {}, // שינויים על מתכונים מובנים
  hidden: [], // מתכונים מובנים שהוסתרו
  videos: {}, // קישור סרטון משלה לכל מתכון
  notes: {}, // הערות אישיות
  favorites: [], // הרפרטואר שלה
  checks: {}, // סימוני וי במצב מטבח
  cart: [], // רשימת קניות: [{ id, servings }]
};

function read() {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return EMPTY;
  }
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    // מכסת האחסון מלאה — עדיף לדעת מאשר לאבד בשקט
    return false;
  }
}

export function newRecipeId() {
  return 'my-' + Date.now().toString(36);
}

/** שלד ריק למתכון חדש */
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

/** איורים שרדה יכולה לבחור מהם, עם שמות בעברית */
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

/** ממזג מתכון מובנה עם השינויים שרדה עשתה עליו */
function applyEdit(base, edit) {
  if (!edit) return base;
  return {
    ...base,
    ...edit,
    times: { ...base.times, ...(edit.times || {}) },
    edited: true,
  };
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

/** הסרטון של רדה גובר על ברירת המחדל */
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

/* ── מחשבון תבניות ───────────────────────────
   היחס הוא יחס שטח, בהנחה שגובה התבנית דומה. */
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

/* ── רשימת קניות ─────────────────────────────
   מאחדת שורות זהות ומסכמת כמויות באותה יחידה. */
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

  const items = [...lines.values()].sort((a, b) => b.q - a.q);
  return { items, missing };
}

export function shoppingListText(list) {
  return list.items.map((i) => `☐ ${Math.round(i.q * 10) / 10} ${i.u} — ${i.n}`).join('\n');
}

/* ── ה־hook ──────────────────────────────── */
export function useLibrary() {
  const [data, setData] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const [full, setFull] = useState(false);

  useEffect(() => {
    setData(read());
    setReady(true);
  }, []);

  const update = useCallback((fn) => {
    setData((prev) => {
      const next = fn(prev);
      if (!write(next)) setFull(true);
      return next;
    });
  }, []);

  const library = useMemo(() => buildLibrary(data), [data]);

  const api = useMemo(
    () => ({
      data,
      ready,
      storageFull: full,
      library,

      saveRecipe(recipe) {
        update((d) => {
          if (recipe.mine || d.custom[recipe.id]) {
            return { ...d, custom: { ...d.custom, [recipe.id]: { ...recipe, mine: true } } };
          }
          // מתכון מובנה — שומרים רק את השינוי, כדי שעדכון המאגר לא ידרוס אותו
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
        update((d) => {
          const without = d.cart.filter((c) => c.id !== id);
          return { ...d, cart: [...without, { id, servings }] };
        });
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
          version: 1,
          exportedAt: new Date().toISOString(),
          data,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rada-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },

      /** מייבא גיבוי. מוסיף ולא מוחק — עדיף כפילות מאשר אובדן. */
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
    [data, ready, full, library, update]
  );

  return api;
}
