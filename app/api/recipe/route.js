import { searchRecipes, recipes } from '../../data/recipes';

export const runtime = 'nodejs';

/**
 * חיפוש מתכונים.
 * המאגר המקומי הוא מקור האמת — האפליקציה עובדת במלואה בלי שום מפתח API.
 * אם הוגדר GEMINI_API_KEY, נוסף לתשובה גם מתכון מותאם אישית. זו תוספת, לא תלות.
 */

async function aiSuggestion(query) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' +
        encodeURIComponent(model) +
        ':generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: 'את קונדיטורית מקצועית. השיבי בעברית בלבד. כל הכמויות במשקל (גרם). ציינו תפוקה, טמפרטורת תנור, זמני הכנה ואפייה, מרכיבים מדויקים, שלבים ממוספרים, אלרגנים ושתי הערות מקצועיות. בלי הקדמות ובלי סיכומים.',
              },
            ],
          },
          contents: [{ role: 'user', parts: [{ text: query }] }],
          generationConfig: { maxOutputTokens: 1800, temperature: 0.4 },
        }),
        signal: controller.signal,
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || '')
      .join('')
      .trim();
    return text && /[א-ת]/.test(text) ? text : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

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
  };
}

export async function POST(request) {
  let query = '';
  try {
    const body = await request.json();
    query = String(body?.query || '').trim();
  } catch {
    return Response.json({ error: 'בקשה לא תקינה' }, { status: 400 });
  }

  if (!query) return Response.json({ error: 'יש להזין מה תרצי להכין' }, { status: 400 });
  if (query.length > 300) return Response.json({ error: 'הבקשה ארוכה מדי — עד 300 תווים' }, { status: 400 });

  const matches = searchRecipes(query).slice(0, 8);
  const ai = await aiSuggestion(query);

  return Response.json({
    query,
    matches: matches.map(brief),
    count: matches.length,
    ai,
    aiEnabled: Boolean(process.env.GEMINI_API_KEY),
    total: recipes.length,
  });
}

export async function GET() {
  return Response.json({
    ok: true,
    total: recipes.length,
    aiEnabled: Boolean(process.env.GEMINI_API_KEY),
  });
}
