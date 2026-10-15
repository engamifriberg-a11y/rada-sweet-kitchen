import { searchRecipes, recipes } from '../../data/recipes';

export const runtime = 'nodejs';

/**
 * חיפוש מתכונים.
 *
 * המאגר המקומי הוא מקור האמת — האפליקציה עובדת במלואה בלי שום מפתח.
 * אם הוגדר GEMINI_API_KEY, בקשה שלא נמצאת במאגר מקבלת גם מתכון שנוצר לפי הבקשה.
 *
 * המפתח נקרא אך ורק ממשתני הסביבה של Vercel ולעולם לא מהקוד, לא מהבקשה
 * ולא מהדפדפן. שום תגובה כאן לא מחזירה אותו, גם לא חלקית.
 */

const MODEL = () => process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const hasKey = () => Boolean(process.env.GEMINI_API_KEY);

const SYSTEM =
  'את קונדיטורית מקצועית. השיבי בעברית בלבד. כל הכמויות במשקל (גרם). ' +
  'מבנה התשובה: שם המתכון, תפוקה, טמפרטורת תנור, זמני הכנה ואפייה, רשימת מרכיבים, ' +
  'שלבים ממוספרים, אלרגנים, ושתי הערות מקצועיות. בלי הקדמות ובלי סיכומים.';

/** קריאה אחת ל־Gemini. מחזירה { text } או { error } — לעולם לא את המפתח. */
async function callGemini({ prompt, maxTokens = 1800, timeoutMs = 15000 }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { error: 'not_configured' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' +
        encodeURIComponent(MODEL()) +
        ':generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: maxTokens, temperature: 0.4 },
        }),
        signal: controller.signal,
      }
    );

    if (!res.ok) {
      const code =
        res.status === 400
          ? 'bad_request'
          : res.status === 401 || res.status === 403
            ? 'invalid_key'
            : res.status === 429
              ? 'rate_limited'
              : 'provider_error';
      // נרשם לוג בלי המפתח ובלי גוף הבקשה
      console.error('Gemini rejected the request', res.status);
      let detail = null;
      try {
        detail = (await res.text()).slice(0, 400);
      } catch {}
      return { error: code, status: res.status, detail };
    }

    const data = await res.json();
    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || '')
      .join('')
      .trim();

    if (!text) return { error: 'empty_response' };
    if (!/[א-ת]/.test(text)) return { error: 'not_hebrew' };
    return { text };
  } catch (e) {
    return { error: e?.name === 'AbortError' ? 'timeout' : 'network_error' };
  } finally {
    clearTimeout(timer);
  }
}

const MESSAGES = {
  not_configured: 'יצירת מתכונים אינה מופעלת. יש להגדיר מפתח בהגדרות הפרויקט.',
  invalid_key: 'המפתח נדחה על ידי Google. צריך מפתח תקין מ־Google AI Studio.',
  rate_limited: 'הגעת למגבלת השימוש של המפתח. נסי שוב בעוד כמה דקות.',
  bad_request: 'הבקשה נדחתה. ייתכן שהדגם שהוגדר אינו זמין למפתח הזה.',
  provider_error: 'שירות היצירה לא זמין כרגע.',
  timeout: 'היצירה לא הספיקה להשיב בזמן. נסי שוב.',
  network_error: 'לא ניתן להגיע לשירות היצירה.',
  empty_response: 'השירות החזיר תשובה ריקה.',
  not_hebrew: 'השירות החזיר תשובה שאינה בעברית.',
};

function brief(r) {
  return {
    id: r.id,
    title: r.title,
    sub: r.sub,
    kind: r.kind,
    art: r.art,
    blurb: r.blurb,
    yield: r.yield,
    difficulty: r.difficulty,
    essential: !!r.essential,
    origin: r.origin || null,
  };
}

export async function POST(request) {
  let query = '';
  let wantAi = true;
  try {
    const body = await request.json();
    query = String(body?.query || '').trim();
    // המשתמשת יכולה לנתק את היצירה מהאתר. הניתוק מכובד כאן, בשרת.
    if (body?.ai === false) wantAi = false;
  } catch {
    return Response.json({ error: 'בקשה לא תקינה' }, { status: 400 });
  }

  if (!query) return Response.json({ error: 'יש להזין מה תרצי להכין' }, { status: 400 });
  if (query.length > 300)
    return Response.json({ error: 'הבקשה ארוכה מדי — עד 300 תווים' }, { status: 400 });

  const matches = searchRecipes(query).slice(0, 8);

  let ai = null;
  let aiError = null;
  if (wantAi && hasKey()) {
    const r = await callGemini({ prompt: query });
    if (r.text) ai = r.text;
    else aiError = { code: r.error, message: MESSAGES[r.error] || MESSAGES.provider_error };
  }

  return Response.json({
    query,
    matches: matches.map(brief),
    count: matches.length,
    total: recipes.length,
    ai,
    aiError,
    aiConfigured: hasKey(),
  });
}

/**
 * GET — מצב השירות.
 * ?probe=1 מריץ קריאה אמיתית וקצרה ל־Google כדי לדעת אם המפתח באמת עובד.
 * התשובה מכילה מצב בלבד; המפתח עצמו לא מוחזר ולא נרמז.
 */
export async function GET(request) {
  const probe = new URL(request.url).searchParams.get('probe') === '1';

  const base = {
    ok: true,
    total: recipes.length,
    aiConfigured: hasKey(),
    aiEnabled: hasKey(),
    model: hasKey() ? MODEL() : null,
  };

  if (!probe) return Response.json(base);

  if (!hasKey()) {
    return Response.json({ ...base, probe: 'not_configured', message: MESSAGES.not_configured });
  }

  const r = await callGemini({ prompt: 'כתבי את המילה: תקין', maxTokens: 16, timeoutMs: 10000 });

  // אם הקריאה נכשלה, שואלים את Google אילו דגמים המפתח בכלל רשאי לראות.
  // זה מפריד בין "מפתח לא תקין" לבין "שם הדגם לא קיים עבור המפתח הזה".
  let models = null;
  let modelsStatus = null;
  if (!r.text) {
    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
        headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY },
      });
      modelsStatus = res.status;
      if (res.ok) {
        const d = await res.json();
        models = (d.models || [])
          .map((m) => String(m.name || '').replace('models/', ''))
          .filter((n) => n.includes('flash') || n.includes('pro'))
          .slice(0, 12);
      }
    } catch {
      modelsStatus = 'network_error';
    }
  }

  return Response.json({
    ...base,
    probe: r.text ? 'ok' : r.error,
    // קודי סטטוס של Google לאבחון בלבד. אין בהם שום חלק מהמפתח.
    providerStatus: r.status || null,
    // הודעת השגיאה של Google עצמה. היא מתארת את הבקשה, לא את המפתח.
    providerDetail: r.detail || null,
    modelsStatus,
    availableModels: models,
    message: r.text
      ? 'המפתח תקין והיצירה פעילה.'
      : modelsStatus === 200
        ? 'המפתח תקין, אבל שם הדגם שהוגדר אינו זמין לו. יש לבחור דגם מהרשימה.'
        : MESSAGES[r.error] || MESSAGES.provider_error,
  });
}
