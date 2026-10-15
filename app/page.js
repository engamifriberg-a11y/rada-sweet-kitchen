'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import PastryArt from './components/PastryArt';
import Icon, { KIND_ICON } from './components/Icon';
import { recipes, SECTIONS, getRecipe, searchRecipes, scaleQty, videoUrl } from './data/recipes';

const FILTERS = [
  { label: 'הכול', icon: 'grid' },
  { label: 'יסודות', icon: 'layers' },
  { label: 'עוגות', icon: 'cake' },
  { label: 'פטיסרי', icon: 'patisserie' },
  { label: 'בצקים וקרמים', icon: 'cream' },
];

const FILTER_MAP = {
  יסודות: ['ספוג', 'קרם', 'מרנג', 'בצק', 'בסיס', 'ציפוי'],
  עוגות: ['עוגה'],
  פטיסרי: ['פטיסרי', 'מאפה שמרים'],
  'בצקים וקרמים': ['בצק', 'קרם', 'ציפוי'],
};

const SECTION_ICON = { foundations: 'layers', everyday: 'cream', signature: 'cake' };

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
        <div className="rcard-kindrow">
          <Icon name={KIND_ICON[r.kind] || 'spark'} size={16} />
          <span>{r.kind}</span>
        </div>
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

  const specs = [
    { icon: 'scale', label: 'תפוקה', value: r.yield },
    { icon: 'thermometer', label: 'תנור', value: r.oven },
    { icon: 'clock', label: 'הכנה', value: r.times.prep },
    { icon: 'clock', label: 'אפייה', value: r.times.bake },
    { icon: 'clock', label: 'המתנה', value: r.times.rest },
  ];

  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet-in">
        <div className="sheet-bar">
          <button className="iconbtn" onClick={onClose} aria-label="סגירה">
            <Icon name="close" />
          </button>
          <b>{r.title}</b>
          <button className="iconbtn" onClick={() => window.print()} aria-label="הדפסה">
            <Icon name="print" />
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
          {specs.map((s) => (
            <div className="spec" key={s.label}>
              <div className="sh">
                <Icon name={s.icon} size={15} />
                <span>{s.label}</span>
              </div>
              <b>{s.value}</b>
            </div>
          ))}
        </div>

        <section className="block">
          <div className="block-h">
            <span className="bh-icon">
              <Icon name="list" />
            </span>
            <h3>מרכיבים</h3>
            <span className="k">הכול בגרמים</span>
          </div>

          <div className="scaler">
            <span>כמות מנות</span>
            {scaled && <span className="mult">×{factor.toFixed(2).replace(/\.?0+$/, '')}</span>}
            <div className="scaler-ctl">
              <button onClick={() => setServings((s) => Math.max(1, s - 1))} aria-label="פחות">
                <Icon name="minus" size={18} />
              </button>
              <b>{servings}</b>
              <button onClick={() => setServings((s) => Math.min(200, s + 1))} aria-label="יותר">
                <Icon name="plus" size={18} />
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
            <span className="bh-icon">
              <Icon name="dough" />
            </span>
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
              <span className="bh-icon">
                <Icon name="spark" />
              </span>
              <h3>הערות מקצועיות</h3>
            </div>
            <ul className="notes">
              {r.notes.map((n, i) => (
                <li key={i}>
                  <Icon name="spark" size={17} className="ni" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {r.fixes?.length > 0 && (
          <section className="block">
            <div className="block-h">
              <span className="bh-icon">
                <Icon name="alert" />
              </span>
              <h3>מה השתבש</h3>
              <span className="k">אבחון מהיר</span>
            </div>
            <div className="fix">
              {r.fixes.map((f, i) => (
                <div className="fix-row" key={i}>
                  <div className="fix-p">
                    <Icon name="alert" size={17} className="fi" />
                    {f.p}
                  </div>
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
              <span className="bh-icon">
                <Icon name="leaf" />
              </span>
              <h3>אלרגנים</h3>
            </div>
            <div className="tags">
              {r.allergens.map((a) => (
                <span className="tag" key={a}>
                  <Icon name="leaf" size={14} />
                  {a}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="cta-row">
          <a className="btn btn-video" href={videoUrl(r)} target="_blank" rel="noopener noreferrer">
            <Icon name="play" size={18} />
            סרטון הדרכה להכנה
          </a>
          <button className="btn btn-ghost" onClick={() => window.print()}>
            <Icon name="print" size={18} />
            הדפסת דף עבודה
          </button>
        </div>

        <div className="sheet-end" />
      </div>
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let saved = null;
    try {
      saved = localStorage.getItem('rada-theme');
    } catch {}
    const prefers = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : !!prefers;
    setDark(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    try {
      localStorage.setItem('rada-theme', next ? 'dark' : 'light');
    } catch {}
  }

  return (
    <button className="iconbtn" onClick={toggle} aria-label={dark ? 'מצב בהיר' : 'מצב כהה'}>
      <Icon name={dark ? 'sun' : 'moon'} size={19} />
    </button>
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
  const [aiOn, setAiOn] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // בודק פעם אחת אם יצירת מתכונים מופעלת, כדי שהמסך הריק יגיד את האמת
  useEffect(() => {
    let alive = true;
    fetch('/api/recipe')
      .then((r) => r.json())
      .then((d) => alive && setAiOn(!!d?.aiEnabled))
      .catch(() => alive && setAiOn(false));
    return () => {
      alive = false;
    };
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
      /* המאגר המקומי כבר הציג תוצאות */
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
              <Icon name="cake" size={23} />
            </div>
            <div>
              <div className="brand-name">המטבח המתוק של ראדה</div>
              <div className="brand-sub">PÂTISSERIE</div>
            </div>
          </div>
          <div className="topbar-spacer" />
          <div className="clock">
            {now
              ? new Intl.DateTimeFormat('he-IL', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Asia/Jerusalem',
                }).format(now)
              : ''}
          </div>
          <ThemeToggle />
        </div>
      </div>

      <main className="wrap">
        <header className="hero">
          <span className="kicker">
            <Icon name="spark" size={16} />
            כלי עבודה לקונדיטורית
          </span>
          <h1>
            המטבח המתוק של <em>ראדה</em>
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
        </header>

        <form className="search-shell" onSubmit={runSearch}>
          <div className="search-row">
            <div className="search-field">
              <Icon name="search" size={19} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="מה מכינים היום?"
                maxLength={300}
                aria-label="חיפוש מתכון"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'מחפשת…' : 'חיפוש'}
            </button>
          </div>
          <div className="chips">
            {FILTERS.map((f) => (
              <button
                key={f.label}
                type="button"
                className={'chip' + (filter === f.label ? ' on' : '')}
                onClick={() => setFilter(f.label)}
              >
                <Icon name={f.icon} size={15} />
                {f.label}
              </button>
            ))}
            {submitted && (
              <button type="button" className="chip" onClick={clear}>
                <Icon name="close" size={14} />
                ניקוי
              </button>
            )}
          </div>
        </form>

        {submitted && (
          <section className="sec" style={{ marginTop: 34 }}>
            <div className="sec-head">
              <span className="sec-icon">
                <Icon name="search" />
              </span>
              <div>
                <h2>תוצאות עבור “{submitted}”</h2>
                <p className="sec-note">{results.length} מתכונים תואמים</p>
              </div>
            </div>
            {results.length > 0 && (
              <div className="grid">
                {results.map((r) => (
                  <RecipeCard key={r.id} r={r} onOpen={open_} />
                ))}
              </div>
            )}

            {busy && results.length === 0 && (
              <p className="results-note">
                <Icon name="spark" size={19} className="ri" />
                <span>מחפשת במאגר ומכינה מתכון…</span>
              </p>
            )}

            {!busy && results.length === 0 && !ai && (
              <div className="results-note">
                <Icon name="search" size={19} className="ri" />
                {aiOn ? (
                  <span>
                    לא מצאתי את זה במאגר, וגם יצירת המתכון לא החזירה תשובה כרגע. נסי שוב בעוד רגע, או
                    חפשי במילה אחת כמו <b>גבינה</b>, <b>שוקולד</b> או <b>דבש</b>.
                  </span>
                ) : (
                  <span>
                    <b>לא נמצא במאגר.</b> כרגע האתר מחפש רק בין {recipes.length} המתכונים שבתוכו.
                    <br />
                    כדי שכל בקשה תיצור מתכון חדש בעברית ובגרמים, צריך להפעיל יצירת מתכונים בהגדרות
                    הפרויקט ב־Vercel (משתנה <b>GEMINI_API_KEY</b>). עד אז — נסי מילה אחת, למשל{' '}
                    <b>גבינה</b>, <b>שוקולד</b>, <b>לימון</b> או <b>דבש</b>.
                  </span>
                )}
              </div>
            )}

            {ai && (
              <div className="ai-card">
                <h4>
                  <Icon name="spark" size={16} />
                  מתכון שנוצר לבקשתך
                </h4>
                {ai}
              </div>
            )}
          </section>
        )}

        {!submitted && (
          <>
            <div className="band">
              <div className="band-top">
                <span className="band-icon">
                  <Icon name="bookmark" size={21} />
                </span>
                <h2>בשליפה</h2>
                <span className="band-tag">{essentials.length} מתכונים</span>
              </div>
              <p>
                אלה המתכונים שכל עוגה נשענת עליהם. מי שיודע אותם בעל פה מרכיב כל עוגה בלי מתכון — רק
                מחליף יחסים וטעמים.
              </p>
              <div className="band-grid">
                {essentials.map((r) => (
                  <button key={r.id} className="band-item" onClick={() => open_(r.id)}>
                    <span className="bi">
                      <Icon name={KIND_ICON[r.kind] || 'spark'} size={17} />
                    </span>
                    <span>
                      <b>{r.title}</b>
                      <span>{r.kind}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {SECTIONS.map((sec) => {
              const list = visible(sec.ids.map(getRecipe).filter(Boolean));
              if (!list.length) return null;
              return (
                <section className="sec" key={sec.id}>
                  <div className="sec-head">
                    <span className="sec-icon">
                      <Icon name={SECTION_ICON[sec.id] || 'grid'} />
                    </span>
                    <div>
                      <h2>{sec.label}</h2>
                      <p className="sec-note">{sec.note}</p>
                    </div>
                  </div>
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
          <b>המטבח המתוק של ראדה</b>
          <div>© 2026 כל הזכויות שמורות לרדה פרייברג</div>
        </footer>
      </main>

      {open && <Sheet id={open} onClose={() => setOpen(null)} />}
    </>
  );
}
