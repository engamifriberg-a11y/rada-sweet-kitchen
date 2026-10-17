'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';
import PastryArt from './PastryArt';
import { ART_CHOICES, blankRecipe } from '../lib/library';

const KINDS = [
  'עוגה',
  'פטיסרי',
  'מאפה שמרים',
  'מאפה מלוח',
  'פאי',
  'ספוג',
  'קרם',
  'מרנג',
  'בצק',
  'בסיס',
  'ציפוי',
];

const UNITS = ['ג׳', 'מ״ל', 'יח׳', 'כף', 'כפית', 'כוס', 'קורט'];

function Field({ label, hint, children }) {
  return (
    <label className="fld">
      <span className="fld-l">
        {label}
        {hint && <em>{hint}</em>}
      </span>
      {children}
    </label>
  );
}

export default function RecipeEditor({ initial, onSave, onCancel, onDelete }) {
  const [r, setR] = useState(() => initial || blankRecipe());
  const [err, setErr] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const set = (patch) => setR((p) => ({ ...p, ...patch }));
  const setTime = (k, v) => setR((p) => ({ ...p, times: { ...p.times, [k]: v } }));

  // ── קבוצות ומרכיבים ──
  const setItem = (gi, ii, patch) =>
    setR((p) => {
      const groups = p.groups.map((g, i) =>
        i !== gi ? g : { ...g, items: g.items.map((it, j) => (j !== ii ? it : { ...it, ...patch })) }
      );
      return { ...p, groups };
    });

  const addItem = (gi) =>
    setR((p) => ({
      ...p,
      groups: p.groups.map((g, i) =>
        i !== gi ? g : { ...g, items: [...g.items, { n: '', q: 100, u: 'ג׳', note: '' }] }
      ),
    }));

  const delItem = (gi, ii) =>
    setR((p) => ({
      ...p,
      groups: p.groups.map((g, i) =>
        i !== gi ? g : { ...g, items: g.items.filter((_, j) => j !== ii) }
      ),
    }));

  const addGroup = () =>
    setR((p) => ({
      ...p,
      groups: [...p.groups, { name: '', items: [{ n: '', q: 100, u: 'ג׳', note: '' }] }],
    }));

  const delGroup = (gi) => setR((p) => ({ ...p, groups: p.groups.filter((_, i) => i !== gi) }));

  // ── רשימות פשוטות ──
  const setLine = (key, i, v) =>
    setR((p) => ({ ...p, [key]: p[key].map((x, j) => (j === i ? v : x)) }));
  const addLine = (key, v = '') => setR((p) => ({ ...p, [key]: [...(p[key] || []), v] }));
  const delLine = (key, i) => setR((p) => ({ ...p, [key]: p[key].filter((_, j) => j !== i) }));

  const setFix = (i, patch) =>
    setR((p) => ({ ...p, fixes: p.fixes.map((f, j) => (j === i ? { ...f, ...patch } : f)) }));

  function submit(e) {
    e.preventDefault();
    if (!r.title.trim()) {
      setErr('צריך שם למתכון.');
      return;
    }
    const clean = {
      ...r,
      title: r.title.trim(),
      allergens: Array.isArray(r.allergens)
        ? r.allergens
        : String(r.allergens || '')
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean),
      baseServings: Math.max(1, Number(r.baseServings) || 8),
      difficulty: Math.min(3, Math.max(1, Number(r.difficulty) || 1)),
      groups: r.groups
        .map((g) => ({
          name: g.name.trim() || 'מרכיבים',
          items: g.items
            .filter((it) => it.n.trim())
            .map((it) => ({
              n: it.n.trim(),
              q: Number(it.q) || 0,
              u: it.u || 'ג׳',
              ...(it.note?.trim() ? { note: it.note.trim() } : {}),
            })),
        }))
        .filter((g) => g.items.length),
      steps: r.steps.map((s) => s.trim()).filter(Boolean),
      notes: (r.notes || []).map((s) => s.trim()).filter(Boolean),
      fixes: (r.fixes || []).filter((f) => f.p?.trim()),
    };
    if (!clean.groups.length) {
      setErr('צריך לפחות מרכיב אחד עם שם.');
      return;
    }
    if (!clean.steps.length) {
      setErr('צריך לפחות שלב הכנה אחד.');
      return;
    }
    onSave(clean);
  }

  const isNew = !initial;

  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <form className="sheet-in" onSubmit={submit}>
        <div className="sheet-bar">
          <button type="button" className="iconbtn" onClick={onCancel} aria-label="ביטול">
            <Icon name="close" />
          </button>
          <b>{isNew ? 'מתכון חדש' : 'עריכת מתכון'}</b>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px' }}>
            שמירה
          </button>
        </div>

        <div className="ed">
          {err && (
            <p className="ed-err">
              <Icon name="alert" size={17} />
              {err}
            </p>
          )}

          <section className="ed-sec">
            <h3>הבסיס</h3>
            <Field label="שם המתכון">
              <input value={r.title} onChange={(e) => set({ title: e.target.value })} placeholder="עוגת חלווה של סבתא" />
            </Field>
            <div className="ed-row">
              <Field label="שם לועזי" hint="לא חובה">
                <input value={r.sub} onChange={(e) => set({ sub: e.target.value })} placeholder="Halva Cake" />
              </Field>
              <Field label="מוצא" hint="לא חובה">
                <input value={r.origin || ''} onChange={(e) => set({ origin: e.target.value })} placeholder="ישראל" />
              </Field>
            </div>
            <div className="ed-row">
              <Field label="סוג">
                <select value={r.kind} onChange={(e) => set({ kind: e.target.value })}>
                  {KINDS.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </Field>
              <Field label="רמת קושי">
                <select value={r.difficulty} onChange={(e) => set({ difficulty: Number(e.target.value) })}>
                  <option value={1}>קלה</option>
                  <option value={2}>בינונית</option>
                  <option value={3}>מתקדמת</option>
                </select>
              </Field>
            </div>
            <Field label="תיאור קצר" hint="שורה או שתיים שמופיעות על הכרטיס">
              <textarea rows={2} value={r.blurb} onChange={(e) => set({ blurb: e.target.value })} />
            </Field>
          </section>

          <section className="ed-sec">
            <h3>איור</h3>
            <p className="ed-hint">בחרי את החתך שהכי מזכיר את התוצאה.</p>
            <div className="art-pick">
              {ART_CHOICES.map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  className={'art-opt' + (r.art === key ? ' on' : '')}
                  onClick={() => set({ art: key })}
                  title={label}
                >
                  <PastryArt name={key} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="ed-sec">
            <h3>נתוני עבודה</h3>
            <div className="ed-row">
              <Field label="תפוקה">
                <input value={r.yield} onChange={(e) => set({ yield: e.target.value })} placeholder="תבנית 24 ס״מ · 12 מנות" />
              </Field>
              <Field label="מספר מנות" hint="לחישוב כמויות">
                <input type="number" min={1} value={r.baseServings} onChange={(e) => set({ baseServings: e.target.value })} />
              </Field>
            </div>
            <div className="ed-row">
              <Field label="תנור">
                <input value={r.oven} onChange={(e) => set({ oven: e.target.value })} placeholder="170°C" />
              </Field>
              <Field label="זמן הכנה">
                <input value={r.times.prep} onChange={(e) => setTime('prep', e.target.value)} placeholder="20 דק׳" />
              </Field>
            </div>
            <div className="ed-row">
              <Field label="זמן אפייה">
                <input value={r.times.bake} onChange={(e) => setTime('bake', e.target.value)} placeholder="45 דק׳" />
              </Field>
              <Field label="המתנה">
                <input value={r.times.rest} onChange={(e) => setTime('rest', e.target.value)} placeholder="לילה במקרר" />
              </Field>
            </div>
            <Field label="אלרגנים" hint="מופרדים בפסיק">
              <input
                value={Array.isArray(r.allergens) ? r.allergens.join(', ') : r.allergens}
                onChange={(e) => set({ allergens: e.target.value.split(',').map((x) => x.trim()) })}
                placeholder="ביצים, גלוטן, חלב"
              />
            </Field>
            <Field label="סרטון הדרכה" hint="קישור ליוטיוב, או מילות חיפוש">
              <input value={r.video} onChange={(e) => set({ video: e.target.value })} placeholder="https://youtube.com/..." />
            </Field>
          </section>

          <section className="ed-sec">
            <h3>מרכיבים</h3>
            {r.groups.map((g, gi) => (
              <div className="ed-group" key={gi}>
                <div className="ed-group-head">
                  <input
                    className="ed-group-name"
                    value={g.name}
                    onChange={(e) =>
                      setR((p) => ({
                        ...p,
                        groups: p.groups.map((x, i) => (i === gi ? { ...x, name: e.target.value } : x)),
                      }))
                    }
                    placeholder="שם הקבוצה — למשל: הבצק"
                  />
                  {r.groups.length > 1 && (
                    <button type="button" className="rowdel" onClick={() => delGroup(gi)} aria-label="מחיקת קבוצה">
                      <Icon name="close" size={16} />
                    </button>
                  )}
                </div>

                {g.items.map((it, ii) => (
                  <div className="ing-edit" key={ii}>
                    <input
                      className="q"
                      type="number"
                      step="any"
                      value={it.q}
                      onChange={(e) => setItem(gi, ii, { q: e.target.value })}
                      aria-label="כמות"
                    />
                    <select className="u" value={it.u} onChange={(e) => setItem(gi, ii, { u: e.target.value })} aria-label="יחידה">
                      {UNITS.map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                    <input
                      className="n"
                      value={it.n}
                      onChange={(e) => setItem(gi, ii, { n: e.target.value })}
                      placeholder="שם המרכיב"
                      aria-label="מרכיב"
                    />
                    <input
                      className="nt"
                      value={it.note || ''}
                      onChange={(e) => setItem(gi, ii, { note: e.target.value })}
                      placeholder="הערה"
                      aria-label="הערה"
                    />
                    <button type="button" className="rowdel" onClick={() => delItem(gi, ii)} aria-label="מחיקת שורה">
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" className="addrow" onClick={() => addItem(gi)}>
                  <Icon name="plus" size={16} />
                  מרכיב
                </button>
              </div>
            ))}
            <button type="button" className="addrow wide" onClick={addGroup}>
              <Icon name="plus" size={16} />
              קבוצת מרכיבים נוספת
            </button>
          </section>

          <section className="ed-sec">
            <h3>שלבי העבודה</h3>
            {r.steps.map((s, i) => (
              <div className="line-edit" key={i}>
                <span className="line-num">{i + 1}</span>
                <textarea rows={2} value={s} onChange={(e) => setLine('steps', i, e.target.value)} placeholder="מה עושים בשלב הזה" />
                <button type="button" className="rowdel" onClick={() => delLine('steps', i)} aria-label="מחיקת שלב">
                  <Icon name="close" size={16} />
                </button>
              </div>
            ))}
            <button type="button" className="addrow wide" onClick={() => addLine('steps')}>
              <Icon name="plus" size={16} />
              שלב
            </button>
          </section>

          <section className="ed-sec">
            <h3>הערות מקצועיות</h3>
            {(r.notes || []).map((s, i) => (
              <div className="line-edit" key={i}>
                <span className="line-num">
                  <Icon name="spark" size={15} />
                </span>
                <textarea rows={2} value={s} onChange={(e) => setLine('notes', i, e.target.value)} />
                <button type="button" className="rowdel" onClick={() => delLine('notes', i)} aria-label="מחיקה">
                  <Icon name="close" size={16} />
                </button>
              </div>
            ))}
            <button type="button" className="addrow wide" onClick={() => addLine('notes')}>
              <Icon name="plus" size={16} />
              הערה
            </button>
          </section>

          <section className="ed-sec">
            <h3>מה השתבש</h3>
            <p className="ed-hint">תקלה, הסיבה שלה, והתיקון. זה מה שהופך מתכון לידע.</p>
            {(r.fixes || []).map((f, i) => (
              <div className="fix-edit" key={i}>
                <input value={f.p || ''} onChange={(e) => setFix(i, { p: e.target.value })} placeholder="התקלה" />
                <input value={f.c || ''} onChange={(e) => setFix(i, { c: e.target.value })} placeholder="הסיבה" />
                <input value={f.f || ''} onChange={(e) => setFix(i, { f: e.target.value })} placeholder="התיקון" />
                <button type="button" className="rowdel" onClick={() => delLine('fixes', i)} aria-label="מחיקה">
                  <Icon name="close" size={16} />
                </button>
              </div>
            ))}
            <button type="button" className="addrow wide" onClick={() => addLine('fixes', { p: '', c: '', f: '' })}>
              <Icon name="plus" size={16} />
              תקלה
            </button>
          </section>

          <div className="ed-foot">
            <button type="submit" className="btn btn-primary">
              <Icon name="bookmark" size={18} />
              שמירת המתכון
            </button>
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              ביטול
            </button>
            {onDelete && (
              <button type="button" className="btn btn-danger" onClick={onDelete}>
                <Icon name="close" size={18} />
                מחיקה
              </button>
            )}
          </div>
          <div className="sheet-end" />
        </div>
      </form>
    </div>
  );
}
