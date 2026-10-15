'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';

/**
 * רישום ה־service worker, והצעת התקנה כשאנדרואיד מאפשר אותה.
 * ההצעה מופיעה פעם אחת; אם נסגרה, היא לא חוזרת.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* בלי service worker האפליקציה עדיין עובדת, רק בלי מצב לא־מקוון */
      });
    }

    let dismissed = false;
    try {
      dismissed = localStorage.getItem('rada-install-dismissed') === '1';
    } catch {}

    const onPrompt = (e) => {
      e.preventDefault();
      if (dismissed) return;
      setDeferred(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => setShow(false));
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem('rada-install-dismissed', '1');
    } catch {}
  }

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="installbar" role="dialog" aria-label="התקנת האפליקציה">
      <span className="install-icon">
        <Icon name="cake" size={22} />
      </span>
      <div className="install-text">
        <b>להתקין את המטבח כאפליקציה?</b>
        <span>אייקון במסך הבית, מסך מלא, ועובד גם בלי אינטרנט</span>
      </div>
      <button className="btn btn-primary" onClick={install}>
        התקנה
      </button>
      <button className="iconbtn" onClick={dismiss} aria-label="לא עכשיו">
        <Icon name="close" size={18} />
      </button>
    </div>
  );
}
