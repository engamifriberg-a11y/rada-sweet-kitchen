'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import PastryArt from './PastryArt';
import { scaleQty } from '../data/recipes';
import { panFactor, resolveVideo, hasOwnVideo } from '../lib/library';

const PAN_DEFAULT = { shape: 'round', d: 20, w: 20, h: 30 };

function PanBox({ title, pan, onChange }) {
  return (
    <div className="panbox">
      <span className="panbox-t">{title}</span>
      <div className="panbox-row">
        <select value={pan.shape} onChange={(e) => onChange({ ...pan, shape: e.target.value })} aria-label="צורת התבנית">
          <option value="round">עגולה</option>
          <option value="rect">מלבנית</option>
        </select>
        {pan.shape === 'round' ? (
          <label className="dim">
            <input type="number" min="1" value={pan.d} onChange={(e) => onChange({ ...pan, d: e.target.value })} />
            <span>קוטר ס״מ</span>
          </label>
        ) : (
          <>
            <label className="dim">
              <input type="number" min="1" value={pan.w} onChange={(e) => onChange({ ...pan, w: e.target.value })} />
              <span>רוחב</span>
            </label>
            <label className="dim">
              <input type="number" min="1" value={pan.h} onChange={(e) => onChange({ ...pan, h: e.target.value })} />
              <span>אורך</span>
            </label>
          </>
        )}
      </div>
    </div>
  );
}

export default function RecipeSheet({ recipe: r, lib, onClose, onEdit }) {
  const [servings, setServings] = useState(r.baseServings || 8);
  const [kitchen, setKitchen] = useState(false);
  const [showPan, setShowPan] = useState(false);
  const [fromPan, setFromPan] = useState(PAN_DEFAULT);
  const [toPan, setToPan] = useState({ ...PAN_DEFAULT, d: 24 });
  const [videoEdit, setVideoEdit] = useState(false);
  const [videoVal, setVideoVal] = useState(lib.data.videos[r.id] || '');
  const [note, setNote] = useState(lib.data.notes[r.id] || '');
  const [noteOpen, setNoteOpen] = useState(Boolean(lib.data.notes[r.id]));
  const wakeRef = useRef(null);

  useEffect(() => {
    setServings(r.baseServings || 8);
    setVideoVal(lib.data.videos[r.id] || '');
    setNote(lib.data.notes[r.id] || '');
    setNoteOpen(Boolean(lib.data.notes[r.id]));
  }, [r.id]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && (kitchen ? setKitchen(false) : onClose());
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, kitchen]);

  // במצב מטבח המסך לא נכבה באמצע העבודה
  useEffect(() => {
    let cancelled = false;
    async function lock() {
      try {
        if (kitchen && 'wakeLock' in navigator) {
          const s = await navigator.wakeLock.request('screen');
          if (cancelled) s.release();
          else wakeRef.current = s;
        }
      } catch {
        /* לא נתמך או נדחה — מצב המטבח עדיין עובד */
      }
    }
    if (kitchen) lock();
    return () => {
      cancelled = true;
      try {
        wakeRef.current?.release();
      } catch {}
      wakeRef.current = null;
    };
  }, [kitchen]);

  const factor = servings / (r.baseServings || 8);
  const scaled = Math.abs(factor - 1) > 0.001;
  const checks = lib.data.checks[r.id] || { ing: [], steps: [] };
  const fav = lib.data.favorites.includes(r.id);
  const inCart = lib.data.cart.some((c) => c.id === r.id);
  const pf = panFactor(fromPan, toPan);

  let ingIndex = -1;

  const specs = [
    { icon: 'scale', label: 'תפוקה', value: r.yield },
    { icon: 'thermometer', label: 'תנור', value: r.oven },
    { icon: 'clock', label: 'הכנה', value: r.times?.prep },
    { icon: 'clock', label: 'אפייה', value: r.times?.bake },
    { icon: 'clock', label: 'המתנה', value: r.times?.rest },
  ].filter((s) => s.value);

  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'sheet-in' + (kitchen ? ' kitchen' : '')}>
        <div className="sheet-bar">
          <button className="iconbtn" onClick={onClose} aria-label="סגירה">
            <Icon name="close" />
          </button>
          <b>{r.title}</b>
          <button
            className={'iconbtn' + (fav ? ' active' : '')}
            onClick={() => lib.toggleFavorite(r.id)}
            aria-label={fav ? 'הסרה מהמועדפים' : 'הוספה למועדפים'}
          >
            <Icon name="bookmark" />
          </button>
          <button
            className={'iconbtn' + (kitchen ? ' active' : '')}
            onClick={() => setKitchen((k) => !k)}
            aria-label="מצב מטבח"
            title="מצב מטבח"
          >
            <Icon name="grid" />
          </button>
          {onEdit && (
            <button className="iconbtn" onClick={() => onEdit(r)} aria-label="עריכה">
              <Icon name="dough" />
            </button>
          )}
        </div>

        {kitchen && (
          <div className="kitchen-bar">
            <Icon name="spark" size={16} />
            <span>מצב מטבח — המסך יישאר דלוק, וסימוני הווי נשמרים</span>
            <button className="linkbtn" onClick={() => lib.clearChecks(r.id)}>
              איפוס
            </button>
          </div>
        )}

        {!kitchen && (
          <>
            <div className="rhead">
              <div className="rhead-art">
                <PastryArt name={r.art} />
                <div className="rhead-cap">
                  חתך התוצאה הסופית · איור לפי סדר השכבות
                  {r.mine && ' · מתכון שלך'}
                </div>
              </div>
            </div>

            <div className="rtitle">
              <h2>{r.title}</h2>
              {(r.sub || r.origin) && (
                <div className="fr">
                  {r.sub}
                  {r.sub && r.origin && ' · '}
                  {r.origin}
                </div>
              )}
              {r.blurb && <p>{r.blurb}</p>}
            </div>

            {specs.length > 0 && (
              <div className="specs">
                {specs.map((s, i) => (
                  <div className="spec" key={i}>
                    <div className="sh">
                      <Icon name={s.icon} size={15} />
                      <span>{s.label}</span>
                    </div>
                    <b>{s.value}</b>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── הערה אישית ── */}
        <section className="block">
          {noteOpen ? (
            <div className="mynote">
              <div className="mynote-h">
                <Icon name="spark" size={16} />
                <span>ההערה שלך</span>
              </div>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={() => lib.setNote(r.id, note)}
                placeholder="בתנור שלי 165 ולא 170 · להכפיל את הקרם · הלקוחה של יום שישי אוהבת פחות מתוק"
              />
            </div>
          ) : (
            <button className="addnote" onClick={() => setNoteOpen(true)}>
              <Icon name="plus" size={16} />
              הוספת הערה אישית למתכון
            </button>
          )}
        </section>

        {/* ── מרכיבים ── */}
        <section className="block">
          <div className="block-h">
            <span className="bh-icon">
              <Icon name="list" />
            </span>
            <h3>מרכיבים</h3>
            <span className="k">במשקל</span>
          </div>

          <div className="scaler">
            <span>כמות מנות</span>
            {scaled && <span className="mult">×{factor.toFixed(2).replace(/\.?0+$/, '')}</span>}
            <div className="scaler-ctl">
              <button onClick={() => setServings((s) => Math.max(1, s - 1))} aria-label="פחות">
                <Icon name="minus" size={18} />
              </button>
              <b>{servings}</b>
              <button onClick={() => setServings((s) => Math.min(500, s + 1))} aria-label="יותר">
                <Icon name="plus" size={18} />
              </button>
            </div>
          </div>

          <button className="panbtn" onClick={() => setShowPan((v) => !v)}>
            <Icon name="scale" size={16} />
            התאמה לתבנית אחרת
            <span className="panbtn-x">{showPan ? '−' : '+'}</span>
          </button>

          {showPan && (
            <div className="pancalc">
              <PanBox title="התבנית במתכון" pan={fromPan} onChange={setFromPan} />
              <PanBox title="התבנית שלך" pan={toPan} onChange={setToPan} />
              <div className="panres">
                {pf ? (
                  <>
                    <b>×{pf.toFixed(2)}</b>
                    <span>יחס שטח בין התבניות</span>
                    <button
                      className="btn btn-primary"
                      onClick={() => setServings(Math.max(1, Math.round((r.baseServings || 8) * pf)))}
                    >
                      החלה על הכמויות
                    </button>
                  </>
                ) : (
                  <span>מלאי את מידות שתי התבניות.</span>
                )}
              </div>
              <p className="pannote">
                החישוב מניח גובה תבנית דומה. אם התבנית שלך עמוקה בהרבה — הוסיפי זמן אפייה ובדקי עם
                קיסם.
              </p>
            </div>
          )}

          {r.groups?.map((g, gi) => (
            <div className="ing-group" key={gi}>
              <h4>{g.name}</h4>
              <ul className="ing">
                {g.items.map((it) => {
                  ingIndex++;
                  const idx = ingIndex;
                  const done = checks.ing.includes(idx);
                  return (
                    <li
                      key={idx}
                      className={(kitchen ? 'tickable' : '') + (done ? ' done' : '')}
                      onClick={kitchen ? () => lib.toggleCheck(r.id, 'ing', idx) : undefined}
                    >
                      {kitchen && <span className="tick">{done ? '✓' : ''}</span>}
                      <span className="ing-q">
                        {scaleQty(it.q, factor)} {it.u}
                      </span>
                      <span className="ing-n">
                        {it.n}
                        {it.note && <span className="ing-note">{it.note}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <button
            className={'btn ' + (inCart ? 'btn-ghost' : 'btn-ghost')}
            style={{ width: '100%', marginTop: 4 }}
            onClick={() => (inCart ? lib.removeFromCart(r.id) : lib.addToCart(r.id, servings))}
          >
            <Icon name={inCart ? 'close' : 'plus'} size={18} />
            {inCart ? 'הסרה מרשימת הקניות' : 'הוספה לרשימת הקניות'}
          </button>
        </section>

        {/* ── שלבים ── */}
        <section className="block">
          <div className="block-h">
            <span className="bh-icon">
              <Icon name="dough" />
            </span>
            <h3>שלבי העבודה</h3>
          </div>
          <ol className="steps">
            {r.steps?.map((s, i) => {
              const done = checks.steps.includes(i);
              return (
                <li
                  key={i}
                  className={(kitchen ? 'tickable' : '') + (done ? ' done' : '')}
                  onClick={kitchen ? () => lib.toggleCheck(r.id, 'steps', i) : undefined}
                >
                  {s}
                </li>
              );
            })}
          </ol>
        </section>

        {!kitchen && r.notes?.length > 0 && (
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

        {!kitchen && r.fixes?.length > 0 && (
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
                  {f.c && <div className="fix-c">הסיבה: {f.c}</div>}
                  {f.f && (
                    <div className="fix-f">
                      <b>תיקון:</b> {f.f}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {!kitchen && r.allergens?.length > 0 && (
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

        {/* ── סרטון ── */}
        {!kitchen && (
          <section className="block">
            <div className="block-h">
              <span className="bh-icon">
                <Icon name="play" />
              </span>
              <h3>סרטון הדרכה</h3>
              {hasOwnVideo(r, lib.data) && <span className="k">הקישור שלך</span>}
            </div>

            {videoEdit ? (
              <div className="videdit">
                <input
                  value={videoVal}
                  onChange={(e) => setVideoVal(e.target.value)}
                  placeholder="הדביקי קישור ליוטיוב, או כתבי מילות חיפוש"
                />
                <div className="videdit-row">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      lib.setVideo(r.id, videoVal);
                      setVideoEdit(false);
                    }}
                  >
                    שמירה
                  </button>
                  <button className="btn btn-ghost" onClick={() => setVideoEdit(false)}>
                    ביטול
                  </button>
                  {hasOwnVideo(r, lib.data) && (
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        lib.setVideo(r.id, '');
                        setVideoVal('');
                        setVideoEdit(false);
                      }}
                    >
                      חזרה לברירת המחדל
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="cta-row" style={{ padding: 0, marginTop: 0 }}>
                <a className="btn btn-video" href={resolveVideo(r, lib.data)} target="_blank" rel="noopener noreferrer">
                  <Icon name="play" size={18} />
                  {hasOwnVideo(r, lib.data) ? 'הסרטון שבחרת' : 'חיפוש סרטון'}
                </a>
                <button className="btn btn-ghost" onClick={() => setVideoEdit(true)}>
                  <Icon name="dough" size={18} />
                  {hasOwnVideo(r, lib.data) ? 'החלפת הסרטון' : 'קישור סרטון משלך'}
                </button>
              </div>
            )}
          </section>
        )}

        {!kitchen && (
          <div className="cta-row">
            <a
              className="btn btn-ghost"
              href={'https://www.google.com/search?q=' + encodeURIComponent(r.title + ' ' + (r.sub || '') + ' מתכון')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="search" size={18} />
              חיפוש באינטרנט
            </a>
            <button className="btn btn-ghost" onClick={() => window.print()}>
              <Icon name="print" size={18} />
              הדפסה
            </button>
          </div>
        )}

        <div className="sheet-end" />
      </div>
    </div>
  );
}
