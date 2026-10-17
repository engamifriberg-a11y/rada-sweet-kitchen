'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';

/**
 * עמוד ההורדה. שתי דרכים להתקין, והוא בוחר לבד איזו להבליט:
 * באנדרואיד — קובץ ה־APK; בכל השאר — הוספה למסך הבית דרך הדפדפן.
 */
export default function InstallPanel({ onClose }) {
  const [env, setEnv] = useState({ android: false, ios: false, installed: false });
  const [deferred, setDeferred] = useState(null);
  const [apk, setApk] = useState(null);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    setEnv({
      android: /Android/i.test(ua),
      ios: /iPhone|iPad|iPod/i.test(ua),
      installed:
        window.matchMedia?.('(display-mode: standalone)')?.matches ||
        window.navigator.standalone === true ||
        Boolean(window.RadaNative),
    });

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // גודל הקובץ והגרסה מגיעים מהשרת, כדי שהעמוד לא ישקר כשאין APK
    fetch('/api/apk')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setApk(j))
      .catch(() => {});

    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  async function installPwa() {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet-in">
        <div className="sheet-bar">
          <button className="iconbtn" onClick={onClose} aria-label="סגירה">
            <Icon name="close" />
          </button>
          <b>הורדת האפליקציה</b>
        </div>

        <div className="block" style={{ marginTop: 20 }}>
          {env.installed && (
            <p className="inst-ok">
              <Icon name="bookmark" size={17} />
              האפליקציה כבר מותקנת במכשיר הזה.
            </p>
          )}

          <div className={'instcard' + (env.android || !env.ios ? ' lead' : '')}>
            <div className="instcard-head">
              <span className="instcard-icon">
                <Icon name="download" size={22} />
              </span>
              <div>
                <b>אנדרואיד — קובץ התקנה</b>
                <span>
                  {apk
                    ? `גרסה ${apk.version} · ${apk.size}`
                    : 'הקובץ עדיין לא הועלה'}
                </span>
              </div>
            </div>
            <p>
              מורידים את הקובץ, פותחים אותו, ומאשרים התקנה ממקור לא מוכר כשאנדרואיד שואל. זו
              אפליקציה עצמאית עם אייקון משלה, בלי שורת כתובת.
            </p>
            {apk ? (
              <a className="btn btn-primary" href="/api/apk?file=1" download>
                <Icon name="download" size={18} />
                הורדת קובץ ההתקנה
              </a>
            ) : (
              <span className="btn btn-soft is-off">הקובץ אינו זמין כרגע</span>
            )}
          </div>

          <div className={'instcard' + (env.ios ? ' lead' : '')}>
            <div className="instcard-head">
              <span className="instcard-icon">
                <Icon name="home" size={22} />
              </span>
              <div>
                <b>הוספה למסך הבית</b>
                <span>אייפון, וגם כל דפדפן אחר</span>
              </div>
            </div>
            {deferred ? (
              <>
                <p>הדפדפן מוכן להתקין את האפליקציה במכשיר הזה בלחיצה אחת.</p>
                <button className="btn btn-primary" onClick={installPwa}>
                  <Icon name="download" size={18} />
                  התקנה עכשיו
                </button>
              </>
            ) : env.ios ? (
              <ol className="inst-steps">
                <li>פותחים את האתר ב־Safari.</li>
                <li>לוחצים על כפתור השיתוף בתחתית המסך.</li>
                <li>בוחרים ״הוספה למסך הבית״.</li>
              </ol>
            ) : (
              <ol className="inst-steps">
                <li>פותחים את תפריט הדפדפן (שלוש נקודות).</li>
                <li>בוחרים ״התקנת אפליקציה״ או ״הוספה למסך הבית״.</li>
                <li>מאשרים, והאייקון נוסף למסך.</li>
              </ol>
            )}
          </div>

          <p className="inst-note">
            שתי הדרכים מובילות לאותה אפליקציה ולאותם נתונים. המתכונים שלך שמורים בחשבון, ולכן הם
            מופיעים בכל מכשיר שתתחברי בו.
          </p>
        </div>
      </div>
    </div>
  );
}
