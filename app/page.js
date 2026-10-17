'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import PastryArt from './components/PastryArt';
import Icon, { KIND_ICON } from './components/Icon';
import RecipeSheet from './components/RecipeSheet';
import RecipeEditor from './components/RecipeEditor';
import ShoppingList from './components/ShoppingList';
import BackupPanel from './components/BackupPanel';
import { SECTIONS, searchRecipesDetailed, searchQueryUrls } from './data/recipes';
import { useLibrary, readLegacy, clearLegacy } from './lib/library';
import LoginScreen from './components/LoginScreen';
import GateScreen from './components/GateScreen';

const FILTERS = [
  { label: 'הכול', icon: 'grid' },
  { label: 'המועדפים שלי', icon: 'bookmark' },
  { label: 'המתכונים שלי', icon: 'dough' },
  { label: 'יסודות', icon: 'layers' },
  { label: 'עוגות', icon: 'cake' },
  { label: 'פטיסרי', icon: 'patisserie' },
];

const FILTER_MAP = {
  יסודות: ['ספוג', 'קרם', 'מרנג', 'בצק', 'בסיס', 'ציפוי'],
  עוגות: ['עוגה'],
  פטיסרי: ['פטיסרי', 'מאפה שמרים'],
};

const SECTION_ICON = {
  foundations: 'layers',
  everyday: 'cream',
  signature: 'cake',
  france: 'patisserie',
  europe: 'meringue',
  americas: 'glaze',
  levant: 'base',
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

function RecipeCard({ r, onOpen, fav }) {
  return (
    <button className="rcard" onClick={() => onOpen(r.id)}>
      <div className="rcard-art">
        <div className="rcard-flags">
          {r.mine && <span className="rcard-badge mine">שלי</span>}
          {r.edited && <span className="rcard-badge edit">ערוך</span>}
          {r.essential && !r.mine && <span className="rcard-badge">בשליפה</span>}
        </div>
        {fav && (
          <span className="rcard-fav" aria-label="במועדפים">
            <Icon name="bookmark" size={15} />
          </span>
        )}
        <PastryArt name={r.art} />
      </div>
      <div className="rcard-body">
        <div className="rcard-kindrow">
          <Icon name={KIND_ICON[r.kind] || 'spark'} size={16} />
          <span>{r.kind}</span>
        </div>
        <h3>{r.title}</h3>
        {(r.sub || r.origin) && <div className="rcard-sub">{r.sub || r.origin}</div>}
        {r.blurb && <p className="rcard-blurb">{r.blurb}</p>}
        <div className="rcard-foot">
          <span>{r.yield}</span>
          <Dots n={r.difficulty} />
        </div>
      </div>
    </button>
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
  const lib = useLibrary();

  const [open, setOpen] = useState(null);
  const [editing, setEditing] = useState(null); // recipe | 'new' | null
  const [panel, setPanel] = useState(null); // 'cart' | 'backup' | null
  const [q, setQ] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [filter, setFilter] = useState('הכול');
  const [now, setNow] = useState(null);
  const [ai, setAi] = useState(null);
  const [aiErr, setAiErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(null);
  const [aiOn, setAiOn] = useState(true);
  const [legacy, setLegacy] = useState(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // מתכונים שנשמרו בדפדפן לפני שהיו חשבונות
  useEffect(() => {
    if (lib.user && lib.ready) setLegacy(readLegacy());
  }, [lib.user, lib.ready]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rada-ai');
      if (saved !== null) setAiOn(saved === 'on');
    } catch {}
    let alive = true;
    fetch('/api/recipe')
      .then((r) => r.json())
      .then((d) => alive && setAiConfigured(!!d?.aiConfigured))
      .catch(() => alive && setAiConfigured(false));
    return () => {
      alive = false;
    };
  }, []);

  function toggleAi() {
    const next = !aiOn;
    setAiOn(next);
    try {
      localStorage.setItem('rada-ai', next ? 'on' : 'off');
    } catch {}
  }

  const all = lib.library;
  const byId = useCallback((id) => all.find((r) => r.id === id) || null, [all]);

  // החיפוש רץ על הספרייה המלאה, כולל המתכונים שרדה כתבה
  const found = useMemo(
    () => (submitted ? searchRecipesDetailed(submitted, all) : null),
    [submitted, all]
  );
  const results = found?.results || [];
  const confident = !!found?.confident;
  const links = useMemo(() => searchQueryUrls(submitted), [submitted]);

  const essentials = useMemo(() => all.filter((r) => r.essential && !r.mine), [all]);
  const myRecipes = useMemo(() => all.filter((r) => r.mine), [all]);
  const open_ = useCallback((id) => setOpen(id), []);

  async function runSearch(e) {
    e?.preventDefault();
    const text = q.trim();
    setSubmitted(text);
    setAi(null);
    setAiErr(null);
    if (!text) return;
    setBusy(true);
    try {
      const res = await fetch('/api/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, ai: aiOn }),
      });
      const data = await res.json();
      if (data?.ai) setAi(data.ai);
      if (data?.aiError) setAiErr(data.aiError.message);
      if (typeof data?.aiConfigured === 'boolean') setAiConfigured(data.aiConfigured);
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
    setAiErr(null);
  }

  const visible = useCallback(
    (list) => {
      if (filter === 'הכול') return list;
      if (filter === 'המועדפים שלי') return list.filter((r) => lib.data.favorites.includes(r.id));
      if (filter === 'המתכונים שלי') return list.filter((r) => r.mine || r.edited);
      const kinds = FILTER_MAP[filter] || [];
      return list.filter((r) => kinds.includes(r.kind));
    },
    [filter, lib.data.favorites]
  );

  const favCount = lib.data.favorites.length;
  const cartCount = lib.data.cart.length;
  const openRecipe = open ? byId(open) : null;

  const sectionLists = SECTIONS.map((sec) => ({
    sec,
    list: visible(sec.ids.map(byId).filter(Boolean)),
  }));
  const nothingVisible =
    filter !== 'הכול' &&
    sectionLists.every((s) => s.list.length === 0) &&
    visible(myRecipes).length === 0;

  if (!lib.authReady) {
    return (
      <div className="boot">
        <Icon name="cake" size={34} />
        <span>טוען…</span>
      </div>
    );
  }

  // שער האתר קודם, ואחריו החשבון האישי
  if (lib.gate.required && !lib.gate.open) {
    return <GateScreen onOpen={lib.openGate} />;
  }

  if (!lib.user) return <LoginScreen lib={lib} />;

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
          <button
            className={'iconbtn' + (cartCount ? ' active' : '')}
            onClick={() => setPanel('cart')}
            aria-label="רשימת קניות"
          >
            <Icon name="list" size={19} />
            {cartCount > 0 && <i className="pip">{cartCount}</i>}
          </button>
          <button className="iconbtn work" onClick={() => setPanel('backup')} aria-label="העבודה שלי">
            <Icon name="bookmark" size={19} />
          </button>
          <ThemeToggle />
          <div className="usermenu">
            <button
              className="userchip"
              onClick={() => setMenu((m) => !m)}
              aria-label="החשבון שלי"
              aria-expanded={menu}
            >
              {lib.user.username.slice(0, 2)}
            </button>
            {menu && (
              <>
                <div className="menu-veil" onClick={() => setMenu(false)} />
                <div className="menu">
                  <div className="menu-head">
                    <b>{lib.user.username}</b>
                    <span>
                      {lib.sync === 'saving'
                        ? 'שומר…'
                        : lib.sync === 'offline'
                          ? 'אין רשת — נשמר במכשיר'
                          : lib.sync === 'error'
                            ? 'השמירה נכשלה'
                            : 'הכול שמור'}
                    </span>
                  </div>
                  <button
                    className="menu-item"
                    onClick={() => {
                      setMenu(false);
                      setPanel('backup');
                    }}
                  >
                    <Icon name="bookmark" size={17} />
                    העבודה שלי
                  </button>
                  <button
                    className="menu-item danger"
                    onClick={() => {
                      setMenu(false);
                      lib.logout();
                    }}
                  >
                    <Icon name="close" size={17} />
                    יציאה מהחשבון
                  </button>
                </div>
              </>
            )}
          </div>
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
            מתכונים במשקל, טמפרטורות, אבחון תקלות וסרטונים — ומקום לכתוב את המתכונים שלך, לתקן מה
            שלא מדויק ולסמן את מה שאת מכינה באמת.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <b>{all.length}</b>
              <span>מתכונים</span>
            </div>
            <div className="stat">
              <b>{myRecipes.length}</b>
              <span>שלי</span>
            </div>
            <div className="stat">
              <b>{favCount}</b>
              <span>מועדפים</span>
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
            <button type="button" className="chip add" onClick={() => setEditing('new')}>
              <Icon name="plus" size={15} />
              מתכון חדש
            </button>
          </div>

          {aiConfigured !== null && (
            <div className={'aibar' + (aiConfigured && aiOn ? ' on' : '')}>
              <span className="aidot" />
              <span className="ailabel">
                {!aiConfigured
                  ? 'יצירת מתכונים לא מחוברת'
                  : aiOn
                    ? 'יצירת מתכונים פעילה — בקשה שאינה במאגר תיווצר מחדש'
                    : 'יצירת מתכונים מנותקת — מחפשת רק במאגר'}
              </span>
              {aiConfigured && (
                <button
                  type="button"
                  className={'switch' + (aiOn ? ' on' : '')}
                  onClick={toggleAi}
                  role="switch"
                  aria-checked={aiOn}
                  aria-label={aiOn ? 'ניתוק יצירת מתכונים' : 'חיבור יצירת מתכונים'}
                >
                  <span className="knob" />
                </button>
              )}
            </div>
          )}
        </form>

        {legacy && (
          <div className="legacy">
            <Icon name="alert" size={20} className="ri" />
            <div>
              <b>נמצאו {legacy.count} פריטים שנשמרו במכשיר הזה לפני שהיו חשבונות.</b>
              <span>להעביר אותם לחשבון שלך? הם יהיו פרטיים לך בלבד.</span>
            </div>
            <button
              className="btn btn-primary"
              onClick={async () => {
                await lib.importLegacy(legacy.data);
                clearLegacy();
                setLegacy(null);
              }}
            >
              העברה
            </button>
            <button
              className="iconbtn"
              onClick={() => {
                clearLegacy();
                setLegacy(null);
              }}
              aria-label="התעלמות"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        )}

        {submitted && (
          <section className="sec" style={{ marginTop: 34 }}>
            <div className="sec-head">
              <span className="sec-icon">
                <Icon name="search" />
              </span>
              <div>
                <h2>“{submitted}”</h2>
                <p className="sec-note">
                  {busy
                    ? 'מחפשת…'
                    : confident
                      ? `${results.length} מתכונים תואמים`
                      : 'אין התאמה מדויקת במאגר'}
                </p>
              </div>
            </div>

            <div className="online-row">
              <a className="btn btn-video" href={links.video} target="_blank" rel="noopener noreferrer">
                <Icon name="play" size={18} />
                סרטון הדרכה
              </a>
              <a className="btn btn-ghost" href={links.web} target="_blank" rel="noopener noreferrer">
                <Icon name="search" size={18} />
                חיפוש באינטרנט
              </a>
              <button className="btn btn-ghost" onClick={() => setEditing('new')}>
                <Icon name="plus" size={18} />
                לכתוב בעצמי
              </button>
            </div>

            {busy && (
              <p className="results-note">
                <Icon name="spark" size={19} className="ri" />
                <span>מחפשת במאגר ומכינה מתכון…</span>
              </p>
            )}

            {ai && (
              <div className="ai-card">
                <h4>
                  <Icon name="spark" size={16} />
                  מתכון שנוצר לבקשתך
                </h4>
                {ai}
                <div className="ai-actions">
                  <a className="btn btn-video" href={links.video} target="_blank" rel="noopener noreferrer">
                    <Icon name="play" size={18} />
                    סרטון הדרכה
                  </a>
                  <a className="btn btn-ghost" href={links.web} target="_blank" rel="noopener noreferrer">
                    <Icon name="search" size={18} />
                    חיפוש באינטרנט
                  </a>
                </div>
              </div>
            )}

            {!busy && results.length === 0 && !ai && (
              <div className="results-note">
                <Icon name="search" size={19} className="ri" />
                {aiErr ? (
                  <span>
                    <b>לא נמצא במאגר, והיצירה לא הצליחה.</b>
                    <br />
                    {aiErr} בינתיים אפשר לחפש סרטון או באינטרנט בכפתורים שלמעלה.
                  </span>
                ) : (
                  <span>
                    <b>לא נמצא במאגר.</b>{' '}
                    {aiConfigured
                      ? 'יצירת המתכונים מנותקת — אפשר לחבר אותה במתג שמעל.'
                      : 'יצירת מתכונים חדשים אינה מחוברת כרגע.'}
                  </span>
                )}
              </div>
            )}

            {results.length > 0 && (
              <>
                {!confident && (
                  <p className="maybe-note">
                    <Icon name="alert" size={17} />
                    <span>
                      לא מצאתי “{submitted}” במאגר. אלה מתכונים שמזכירים חלק מהמילים — ייתכן שאף אחד
                      מהם אינו מה שחיפשת.
                    </span>
                  </p>
                )}
                <div className="grid">
                  {(confident ? results : results.slice(0, 6)).map((r) => (
                    <RecipeCard key={r.id} r={r} onOpen={open_} fav={lib.data.favorites.includes(r.id)} />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {!submitted && (
          <>
            {visible(myRecipes).length > 0 && (
              <section className="sec">
                <div className="sec-head">
                  <span className="sec-icon">
                    <Icon name="dough" />
                  </span>
                  <div>
                    <h2>המתכונים שלי</h2>
                    <p className="sec-note">מה שכתבת בעצמך</p>
                  </div>
                  <button className="btn btn-ghost sec-cta" onClick={() => setEditing('new')}>
                    <Icon name="plus" size={17} />
                    חדש
                  </button>
                </div>
                <div className="grid">
                  {visible(myRecipes).map((r) => (
                    <RecipeCard key={r.id} r={r} onOpen={open_} fav={lib.data.favorites.includes(r.id)} />
                  ))}
                </div>
              </section>
            )}

            {filter === 'הכול' && essentials.length > 0 && (
              <div className="band">
                <div className="band-top">
                  <span className="band-icon">
                    <Icon name="bookmark" size={21} />
                  </span>
                  <h2>בשליפה</h2>
                  <span className="band-tag">{essentials.length} מתכונים</span>
                </div>
                <p>
                  אלה המתכונים שכל עוגה נשענת עליהם. מי שיודע אותם בעל פה מרכיב כל עוגה בלי מתכון —
                  רק מחליף יחסים וטעמים.
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
            )}

            {sectionLists.map(({ sec, list }) =>
              list.length === 0 ? null : (
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
                      <RecipeCard key={r.id} r={r} onOpen={open_} fav={lib.data.favorites.includes(r.id)} />
                    ))}
                  </div>
                </section>
              )
            )}

            {nothingVisible && (
              <p className="results-note" style={{ marginTop: 30 }}>
                <Icon name="bookmark" size={19} className="ri" />
                <span>אין כאן עדיין כלום. פתחי מתכון וסמני אותו כמועדף, או כתבי מתכון משלך.</span>
              </p>
            )}
          </>
        )}

        <footer className="foot">
          <b>המטבח המתוק של ראדה</b>
          <div>© 2026 כל הזכויות שמורות לרדה פרייברג</div>
        </footer>
      </main>

      <button className="fab" onClick={() => setEditing('new')} aria-label="מתכון חדש">
        <Icon name="plus" size={24} />
      </button>

      {openRecipe && (
        <RecipeSheet
          recipe={openRecipe}
          lib={lib}
          onClose={() => setOpen(null)}
          onEdit={(r) => {
            setOpen(null);
            setEditing(r);
          }}
        />
      )}

      {editing && (
        <RecipeEditor
          initial={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSave={(r) => {
            lib.saveRecipe(r);
            setEditing(null);
            setOpen(r.id);
          }}
          onDelete={
            editing === 'new'
              ? null
              : () => {
                  lib.removeRecipe(editing.id);
                  setEditing(null);
                  setOpen(null);
                }
          }
        />
      )}

      {panel === 'cart' && (
        <ShoppingList
          lib={lib}
          onClose={() => setPanel(null)}
          onOpenRecipe={(id) => {
            setPanel(null);
            setOpen(id);
          }}
        />
      )}

      {panel === 'backup' && <BackupPanel lib={lib} onClose={() => setPanel(null)} />}
    </>
  );
}
