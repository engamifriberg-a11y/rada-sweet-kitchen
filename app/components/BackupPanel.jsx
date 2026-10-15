'use client';

import { useRef, useState } from 'react';
import Icon from './Icon';
import { recipes as builtIn } from '../data/recipes';

export default function BackupPanel({ lib, onClose }) {
  const fileRef = useRef(null);
  const [msg, setMsg] = useState(null);

  const d = lib.data;
  const mine = Object.keys(d.custom).length;
  const edited = Object.keys(d.edits).length;
  const hidden = d.hidden.length;
  const videos = Object.keys(d.videos).length;
  const notes = Object.keys(d.notes).length;

  const hiddenRecipes = d.hidden
    .map((id) => builtIn.find((r) => r.id === id))
    .filter(Boolean);

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const added = await lib.importFile(f);
      setMsg({ ok: true, text: `הגיבוי יובא. נוספו ${added} מתכונים חדשים.` });
    } catch (err) {
      setMsg({ ok: false, text: err.message || 'הייבוא נכשל.' });
    }
    e.target.value = '';
  }

  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet-in">
        <div className="sheet-bar">
          <button className="iconbtn" onClick={onClose} aria-label="סגירה">
            <Icon name="close" />
          </button>
          <b>העבודה שלי</b>
        </div>

        <div className="block" style={{ marginTop: 20 }}>
          <div className="mystats">
            <div>
              <b>{mine}</b>
              <span>מתכונים שלי</span>
            </div>
            <div>
              <b>{edited}</b>
              <span>ערוכים</span>
            </div>
            <div>
              <b>{notes}</b>
              <span>הערות</span>
            </div>
            <div>
              <b>{videos}</b>
              <span>סרטונים</span>
            </div>
            <div>
              <b>{hidden}</b>
              <span>מוסתרים</span>
            </div>
          </div>

          {lib.storageFull && (
            <p className="maybe-note" style={{ marginTop: 16 }}>
              <Icon name="alert" size={17} />
              <span>
                אחסון הדפדפן מלא והשמירה האחרונה נכשלה. ייצאי גיבוי עכשיו ומחקי מתכונים שאינך צריכה.
              </span>
            </p>
          )}

          <div className="backup-note">
            <Icon name="alert" size={18} className="ri" />
            <span>
              הכל נשמר <b>בדפדפן הזה בלבד</b> — אף אחד אחר לא יכול לראות או לשנות את העבודה שלך.
              המחיר הוא שהיא לא עוברת מעצמה למכשיר אחר, ושניקוי נתוני הדפדפן ימחק אותה. ייצאי גיבוי
              מדי פעם.
            </span>
          </div>

          <div className="cta-row" style={{ padding: 0, marginTop: 18 }}>
            <button className="btn btn-primary" onClick={() => lib.exportAll()}>
              <Icon name="bookmark" size={18} />
              ייצוא גיבוי לקובץ
            </button>
            <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
              <Icon name="plus" size={18} />
              ייבוא מקובץ
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              onChange={onFile}
              style={{ display: 'none' }}
            />
          </div>

          {msg && (
            <p className={'importmsg' + (msg.ok ? ' ok' : '')}>
              <Icon name={msg.ok ? 'spark' : 'alert'} size={17} />
              {msg.text}
            </p>
          )}

          {hiddenRecipes.length > 0 && (
            <>
              <div className="block-h" style={{ marginTop: 30 }}>
                <span className="bh-icon">
                  <Icon name="close" />
                </span>
                <h3>מתכונים שהסתרת</h3>
              </div>
              <div className="hidden-list">
                {hiddenRecipes.map((r) => (
                  <div className="hidden-row" key={r.id}>
                    <span>{r.title}</span>
                    <button className="linkbtn" onClick={() => lib.restoreRecipe(r.id)}>
                      שחזור
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {edited > 0 && (
            <>
              <div className="block-h" style={{ marginTop: 30 }}>
                <span className="bh-icon">
                  <Icon name="dough" />
                </span>
                <h3>מתכונים מובנים שערכת</h3>
              </div>
              <div className="hidden-list">
                {Object.keys(d.edits).map((id) => {
                  const base = builtIn.find((r) => r.id === id);
                  return (
                    <div className="hidden-row" key={id}>
                      <span>{d.edits[id].title || base?.title || id}</span>
                      <button className="linkbtn" onClick={() => lib.restoreRecipe(id)}>
                        חזרה למקור
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div className="sheet-end" />
      </div>
    </div>
  );
}
