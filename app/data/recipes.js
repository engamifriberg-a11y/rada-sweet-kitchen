import { foundations } from './foundations';
import { cakes } from './cakes';
import { israeli } from './israeli';
import { france } from './france';
import { europe } from './europe';
import { americas } from './americas';
import { levant } from './levant';

export const recipes = [
  ...foundations,
  ...israeli,
  ...cakes,
  ...france,
  ...europe,
  ...americas,
  ...levant,
];

export const SECTIONS = [
  {
    id: 'foundations',
    label: 'יסודות הקונדיטור',
    note: 'מה שחייב להיות בשליפה כשמכינים עוגות',
    ids: foundations.map((r) => r.id),
  },
  {
    id: 'everyday',
    label: 'הקלאסיקות של הבית',
    note: 'מה שמכינים פה בפועל — מעוגת דבש ועד בבקה',
    ids: israeli.map((r) => r.id),
  },
  {
    id: 'signature',
    label: 'עוגות ופטיסרי',
    note: 'מתכוני חתימה מלאים, מההרכבה ועד החיתוך',
    ids: cakes.map((r) => r.id),
  },
  {
    id: 'france',
    label: 'צרפת',
    note: 'הקלאסיקות שעליהן בנויה כל קונדיטוריה במערב',
    ids: france.map((r) => r.id),
  },
  {
    id: 'europe',
    label: 'אירופה',
    note: 'איטליה, אוסטריה וגרמניה, בריטניה',
    ids: europe.map((r) => r.id),
  },
  {
    id: 'americas',
    label: 'אמריקה',
    note: 'צפון אמריקה, איבריה ואמריקה הלטינית',
    ids: americas.map((r) => r.id),
  },
  {
    id: 'levant',
    label: 'אסיה והמזרח',
    note: 'יפן, הלבנט וישראל',
    ids: levant.map((r) => r.id),
  },
];

export const KINDS = ['הכול', 'ספוג', 'קרם', 'מרנג', 'בצק', 'בסיס', 'ציפוי', 'עוגה', 'פטיסרי', 'מאפה שמרים'];

export function getRecipe(id) {
  return recipes.find((r) => r.id === id) || null;
}

// חיפוש בעברית — מנרמל ניקוד, גרשיים ואותיות סופיות
function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[֑-ׇ]/g, '')
    .replace(/[׳’'`]/g, '')
    .replace(/[״"]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const FINALS = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' };
function fold(s) {
  return normalize(s).replace(/[ךםןףץ]/g, (c) => FINALS[c]);
}

const SYNONYMS = {
  צזקייק: 'גבינה',
  cheesecake: 'גבינה',
  שוקולד: 'שוקולד קקאו',
  פרווה: 'ללא חלב',
  קרם: 'קרם',
  בצק: 'בצק',
  טארט: 'טארט בצק פריך',
  שמרים: 'שמרים מאפה',
  מרנג: 'מרנג חלבונים',
  ציפוי: 'ציפוי גלסאז קרם חמאה',
  קפה: 'קפה אופרה',
  לימון: 'לימון הדרים',
};

function haystack(r) {
  const ing = r.groups.flatMap((g) => g.items.map((i) => i.n)).join(' ');
  return fold(
    [r.title, r.sub, r.kind, r.origin || '', r.blurb, ing, (r.notes || []).join(' ')].join(' ')
  );
}

export function searchRecipesDetailed(query) {
  const q = fold(query);
  if (!q) return { results: [], confident: false };
  const expanded = q
    .split(' ')
    .map((w) => fold(SYNONYMS[w] || w))
    .join(' ');
  const terms = [...new Set(expanded.split(' ').filter((w) => w.length > 1))];

  const scored = recipes
    .map((r) => {
      const hay = haystack(r);
      const title = fold(r.title + ' ' + r.sub);
      let score = 0;
      let hits = 0;
      for (const t of terms) {
        if (title.includes(t)) {
          score += 10;
          hits++;
        } else if (hay.includes(t)) {
          score += 3;
          hits++;
        } else if (t.length >= 5 && hay.includes(t.slice(0, -1))) {
          score += 1;
          hits++;
        }
      }
      // בלי התאמה אמיתית אין תוצאה. בונוס "בשליפה" ניתן רק למתכון שכבר נמצא.
      if (hits === 0) return { recipe: r, score: 0 };
      // דרישת כיסוי: בחיפוש של כמה מילים, מתכון שענה רק על מילה אחת מתוך שלוש ומעלה יורד
      if (terms.length >= 3 && hits === 1) return { recipe: r, score: 0 };
      score += hits * 2;
      if (title === q) score += 50;
      if (r.essential) score += 1;
      return { recipe: r, score, hits };
    })
    .filter((x) => x.score > 0);

  // אם יש מתכונים שעונים על כל מילות החיפוש — מציגים רק אותם.
  // אחרת נופלים חזרה להתאמות חלקיות, כדי שחיפוש לא יחזור ריק סתם.
  const full = scored.filter((x) => x.hits === terms.length);
  const chosen = full.length ? full : scored;

  return {
    results: chosen.sort((a, b) => b.score - a.score).map((x) => x.recipe),
    // true רק כשמתכון ענה על כל מילות החיפוש. בלי זה התוצאות הן ניחוש,
    // ואסור להציג אותן כאילו נמצא מה שביקשו.
    confident: full.length > 0,
  };
}

export function searchRecipes(query) {
  return searchRecipesDetailed(query).results;
}

export function searchQueryUrls(query) {
  const q = String(query || '').trim();
  return {
    video: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q + ' מתכון הכנה'),
    web: 'https://www.google.com/search?q=' + encodeURIComponent(q + ' מתכון'),
  };
}

export function scaleQty(q, factor) {
  if (q == null) return null;
  const v = q * factor;
  if (v >= 100) return Math.round(v / 5) * 5;
  if (v >= 20) return Math.round(v);
  if (v >= 1) return Math.round(v * 10) / 10;
  return Math.round(v * 100) / 100;
}

export function videoUrl(recipe) {
  return (
    'https://www.youtube.com/results?search_query=' +
    encodeURIComponent(recipe.video || recipe.title + ' מתכון')
  );
}
