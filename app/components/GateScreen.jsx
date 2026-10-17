'use client';

import { useState } from 'react';
import Icon from './Icon';

/**
 * שער האתר — סיסמה משותפת אחת לפני מסך הכניסה.
 * זו לא הסיסמה האישית: היא רק קובעת מי בכלל מגיע לאפליקציה.
 */
export default function GateScreen({ onOpen }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const res = await fetch('/api/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: code }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(j.error || 'סיסמת הכניסה שגויה.');
        return;
      }
      onOpen();
    } catch {
      setErr('אין חיבור לרשת.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-mark gate">
          <Icon name="bookmark" size={28} />
        </div>
        <h1>אזור פרטי</h1>
        <p className="login-sub">הזינו את סיסמת הכניסה לאתר כדי להמשיך</p>

        <form onSubmit={submit}>
          <label className="fld">
            <span className="fld-l">סיסמת כניסה</span>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
              required
            />
          </label>

          {err && (
            <p className="login-err">
              <Icon name="alert" size={16} />
              {err}
            </p>
          )}

          <button className="btn btn-primary login-go" type="submit" disabled={busy}>
            {busy ? 'בודקת…' : 'כניסה'}
          </button>
        </form>
      </div>

      <p className="login-foot">
        זו סיסמה משותפת לאתר. אחריה תתבקשו להתחבר לחשבון האישי שלכם.
      </p>
    </div>
  );
}
