'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import PastryArt from './components/PastryArt';
import { recipes, SECTIONS, getRecipe, searchRecipes, scaleQty, videoUrl } from './data/recipes';

const FILTERS = ['הכול', 'יסודות', 'עוגות', 'פטיסרי', 'בצקים וקרמים'];

const FILTER_MAP = {
  יסודות: ['ספוג', 'קרם', 'מרנג', 'בצק', 'בסיס', 'ציפוי'],
  עוגות: ['עוגה'],
  פטיסרי: ['פטיסרי', 'מאפה שמרים'],
  'בצקים וקרמים': ['בצק', 'קרם', 'ציפוי'],
};

function Dots({ n }) {
  return (
    <span className="dots" aria-label={`רמת קושי ${n} מתוך 3`}>
      {[1, 2, 3].map((i) => (
        <i key={i} className={'dot' + (i <= n ? ' on' : '')} />
      ))}
    </span>
  );
}

function RecipeCard({ r, onOpen }) {
  return (
    <button className="rcard" onClick={() => onOpen(r.id)}>
      <div className="rcard-art">
        {r.essential && <span className="rcard-badge">בשליפה</span>}
        <PastryArt name={r.art} />
      </div>
      <div className="rcard-body">
        <div className="rcard-kind">{r.kind}</div>
        <h3>{r.title}</h3>
        <div className="rcard-sub">{r.sub}</div>
        <p className="rcard-blurb">{r.blurb}</p>
        <div className="rcard-foot">
          <span>{r.yield}</span>
          <Dots n={r.difficulty} />
        </div>
      </div>
    </button>
  );
}

function Sheet({ id, onClose }) {
  const r = getRecipe(id);
  const [servings, setServings] = useState(r?.baseServings || 8);

  useEffect(() => {
    setServings(getRecipe(id)?.baseServings || 8);
  }, [id]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!r) return null;
  const factor = servings / r.baseServings;
  const scaled = Math.abs(factor - 1) > 0.001;

  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet-in">
        <div className="sheet-bar">
          <button className="iconbtn" onClick={onClose} aria-label="סגירה">
            ✕
          </button>
          <b>{r.title}</b>
          <button className="iconbtn" onClick={() => window.print()} aria-label="הדפסה" title="הדפסה">
            ⎙
          </button>
        </div>

        <div className="rhead">
          <div className="rhead-art">
            <PastryArt name={r.art} />
            <div className="rhead-cap">חתך התוצאה הסופית · איור מקורי לפי סדר השכבות במתכון</div>
          </div>
        </div>

        <div className="rtitle">
          <h2>{r.title}</h2>
          <div className="fr">{r.sub}</div>
          <p>{r.blurb}</p>
        </div>

        <div className="specs">
          <div className="spec">
            <span>תפוקה</span>
            <b>{r.yield}</b>
          </div>
          <div className="spec">
            <span>תנור</span>
            <b>{r.oven}</b>
          </div>
          <div className="spec">
            <span>הכנה</span>
            <b>{r.times.prep}</b>
          </div>
          <div className="spec">
            <span>אפייה</span>
            <b>{r.times.bake}</b>
          </div>
          <div className="spec">
            <span>המתנה</span>
            <b>{r.times.rest}</b>
          </div>
        </div>

        <section className="block">
          <div className="block-h">
            <h3>מרכיבים</h3>
            <span className="k">במשקל</span>
          </div>

          <div className="scaler">
            <span>כמות מנות</span>
            {scaled && <span style={{ color: 'var(--brass)' }}>×{factor.toFixed(2).replace(/\.?0+$/, '')}</span>}
            <div className="scaler-ctl">
              <button onClick={() => setServings((s) => Math.max(1, s - 1))} aria-label="פחות">
                −
              </button>
              <b>{servings}</b>
              <button onClick={() => setServings((s) => Math.min(200, s + 1))} aria-label="יותר">
                +
              </button>
            </div>
          </div>

          {r.groups.map((g) => (
            <div className="ing-group" key={g.name}>
              <h4>{g.name}</h4>
              <ul className="ing">
                {g.items.map((it) => (
                  <li key={it.n}>
                    <span className="ing-q">
                      {scaleQty(it.q, factor)} {it.u}
                    </span>
                    <span className="ing-n">
                      {it.n}
                      {it.note && <span className="ing-note">{it.note}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="block">
          <div className="block-h">
            <h3>שלבי העבודה</h3>
          </div>
          <ol className="steps">
            {r.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </section>

        {r.notes?.length > 0 && (
          <section className="block">
            <div className="block-h">
              <h3>הערות מקצועיות</h3>
            </div>
            <ul className="notes">
              {r.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </section>
        )}

        {r.fixes?.length > 0 && (
          <section className="block">
            <div className="block-h">
              <h3>מה השתבש</h3>
              <span className="k">אבחון</span>
            </div>
            <div className="fix">
              {r.fixes.map((f, i) => (
                <div className="fix-row" key={i}>
                  <div className="fix-p">{f.p}</div>
                  <div className="fix-c">הסיבה: {f.c}</div>
                  <div className="fix-f">
                    <b>תיקון:</b> {f.f}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {r.allergens?.length > 0 && (
          <section className="block">
            <div className="block-h">
              <h3>אלרגנים</h3>
            </div>
            <div className="tags">
              {r.allergens.map((a) => (
                <span className="tag" key={a}>
                  {a}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="cta-row">
          <a className="btn btn-video" href={videoUrl(r)} target="_blank" rel="noopener noreferrer">
            ▶ סרטון הדרכה להכנה
          </a>
          <button className="btn btn-ghost" onClick={() => window.print()}>
            ⎙ הדפסת דף עבודה
          </button>
        </div>

        <div className="sheet-end" />
      </div>
    </div>
  );
}

export default function Home() {
  const [open, setOpen] = useState(null);
  const [q, setQ] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [filter, setFilter] = useState('הכול');
  const [now, setNow] = useState(null);
  const [ai, setAi] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const essentials = useMemo(() => recipes.filter((r) => r.essential), []);

  const results = useMemo(() => (submitted ? searchRecipes(submitted) : null), [submitted]);

  const open_ = useCallback((id) => setOpen(id), []);

  async function runSearch(e) {
    e?.preventDefault();
    const text = q.trim();
    setSubmitted(text);
    setAi(null);
    if (!text) return;
    setBusy(true);
    try {
      const res = await fetch('/api/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      if (data?.ai) setAi(data.ai);
    } catch {
      /* המאגר המקומי כבר הציג תוצאות — אין צורך בהודעת שגיאה */
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    setQ('');
    setSubmitted('');
    setAi(null);
  }

  const visible = (list) => {
    if (filter === 'הכול') return list;
    const kinds = FILTER_MAP[filter] || [];
    return list.filter((r) => kinds.includes(r.kind));
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-in">
          <div className="brand">
            <div className="brand-mark">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3.5 20h17v-4.6c0-2.9-3.8-4.9-8.5-4.9s-8.5 2-8.5 4.9V20Z" fill="#F3D9E4" />
                <path d="M3.5 16.2c1.6 1.2 2.9-1 4.3 0 1.4 1 2.8-1.1 4.2 0 1.4 1.1 2.8-1 4.2 0 1.4 1 2.6-1.1 4.3 0" stroke="#E0C183" strokeWidth="1.1" fill="none" strokeLinecap="round" />
                <path d="M12 9.6V5.6" stroke="#E3A8C0" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="12" cy="4.3" r="1.7" fill="#E0C183" />
              </svg>
            </div>
            <div>
              <div className="brand-name">Rada</div>
              <div className="brand-sub">PÂTISSERIE</div>
            </div>
          </div>
          <div className="topbar-spacer" />
          <div className="clock">
            {now
              ? new Intl.DateTimeFormat('he-IL', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Asia/Jerusalem',
                }).format(now)
              : ''}
          </div>
        </div>
      </div>

      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">כלי עבודה לקונדיטורית</div>
          <h1>
            מטבח הקונדיטוריה של <em>רדה</em>
          </h1>
          <p className="hero-lead">
            מתכונים במשקל, טמפרטורות מדויקות, זמנים, אבחון תקלות וסרטוני הדרכה. מהיסודות שחייבים להיות
            בשליפה ועד עוגות החתימה.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <b>{recipes.length}</b>
              <span>מתכונים</span>
            </div>
            <div className="stat">
              <b>{essentials.length}</b>
              <span>בשליפה</span>
            </div>
            <div className="stat">
              <b>100%</b>
              <span>בגרמים</span>
            </div>
          </div>
          <div className="piping" aria-hidden="true" />
        </header>

        <form className="search-shell" onSubmit={runSearch}>
          <div className="search-row">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="מה מכינים היום? עוגת גבינה, קרם פטיסייר, גלסאז׳…"
              maxLength={300}
              aria-label="חיפוש מתכון"
            />
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'מחפשת…' : 'חיפוש'}
            </button>
          </div>
          <div className="chips">
            <span className="chips-label">סינון</span>
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={'chip' + (filter === f ? ' on' : '')}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
            {submitted && (
              <button type="button" className="chip" onClick={clear}>
                ✕ ניקוי חיפוש
              </button>
            )}
          </div>
        </form>

        {submitted && (
          <section className="sec" style={{ marginTop: 32 }}>
            <div className="sec-head">
              <span className="sec-num">?</span>
              <h2>תוצאות עבור “{submitted}”</h2>
            </div>
            <div className="ornament"><i /></div>
            {results.length > 0 ? (
              <div className="grid">
                {results.map((r) => (
                  <RecipeCard key={r.id} r={r} onOpen={open_} />
                ))}
              </div>
            ) : (
              <p className="results-note">
                אין התאמה במאגר. נסי מילה אחת — למשל <b>גבינה</b>, <b>שוקולד</b>, <b>לימון</b>,{' '}
                <b>קרם</b>, <b>בצק</b> או <b>מרנג</b>.
              </p>
            )}
            {ai && (
              <div className="ai-card">
                <h4>מתכון מותאם</h4>
                {ai}
              </div>
            )}
          </section>
        )}

        {!submitted && (
          <>
            <div className="band">
              <div className="band-top">
                <h2>בשליפה</h2>
                <span className="band-tag">ה־{essentials.length} שחייבים לדעת בעל פה</span>
              </div>
              <p>
                אלה המתכונים שכל עוגה נשענת עליהם. מי שיודע אותם בעל פה מרכיב כל עוגה בלי מתכון — רק
                מחליף יחסים וטעמים.
              </p>
              <div className="band-grid">
                {essentials.map((r) => (
                  <button key={r.id} className="band-item" onClick={() => open_(r.id)}>
                    <b>{r.title}</b>
                    <span>{r.kind}</span>
                  </button>
                ))}
              </div>
            </div>

            {SECTIONS.map((sec, i) => {
              const list = visible(sec.ids.map(getRecipe).filter(Boolean));
              if (!list.length) return null;
              return (
                <section className="sec" key={sec.id}>
                  <div className="sec-head">
                    <span className="sec-num">{i + 1}</span>
                    <div>
                      <h2>{sec.label}</h2>
                      <p className="sec-note">{sec.note}</p>
                    </div>
                  </div>
                  <div className="ornament"><i /></div>
                  <div className="grid">
                    {list.map((r) => (
                      <RecipeCard key={r.id} r={r} onOpen={open_} />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}

        <footer className="foot">
          <b>Rada — מטבח הקונדיטוריה</b>
          <div style={{ marginTop: 6 }}>© 2026 כל הזכויות שמורות לרדה פרייברג</div>
        </footer>
      </main>

      {open && <Sheet id={open} onClose={() => setOpen(null)} />}
    </>
  );
}
