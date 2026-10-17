'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';

/**
 * מסך הכניסה. חוסם את כל האפליקציה עד שיש התחברות.
 * שדות הסיסמה הם type=password עם autoComplete מתאים, כדי שמנהל
 * הסיסמאות של המכשיר יזהה אותם ויציע לשמור.
 */
export default function LoginScreen({ lib }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [needCode, setNeedCode] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setNeedCode(Boolean(j?.signupCode)))
      .catch(() => {});
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr('');

    if (mode === 'register' && password !== confirm) {
      setErr('הסיסמאות אינן זהות.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'login') await lib.login(username, password);
      else await lib.register(username, password, code);
    } catch (e2) {
      setErr(e2.message || 'משהו השתבש.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-mark">
          <Icon name="cake" size={30} />
        </div>
        <h1>המטבח המתוק של ראדה</h1>
        <p className="login-sub">
          {mode === 'login'
            ? 'התחברי כדי להגיע למתכונים שלך'
            : 'פתיחת חשבון חדש — המתכונים שתכתבי יהיו פרטיים לך'}
        </p>

        <form onSubmit={submit}>
          <label className="fld">
            <span className="fld-l">שם משתמש</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
            />
          </label>

          <label className="fld">
            <span className="fld-l">סיסמה</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </label>

          {mode === 'register' && (
            <>
              <label className="fld">
                <span className="fld-l">אימות סיסמה</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>
              {needCode && (
                <label className="fld">
                  <span className="fld-l">
                    קוד הרשמה<em>התקבל ממי שפתח את האתר</em>
                  </span>
                  <input value={code} onChange={(e) => setCode(e.target.value)} required />
                </label>
              )}
              <p className="login-hint">
                <Icon name="alert" size={15} />
                <span>לפחות 8 תווים. אין דרך לשחזר סיסמה שנשכחה, אז שמרי אותה.</span>
              </p>
            </>
          )}

          {err && (
            <p className="login-err">
              <Icon name="alert" size={16} />
              {err}
            </p>
          )}

          <button className="btn btn-primary login-go" type="submit" disabled={busy}>
            {busy ? 'רגע…' : mode === 'login' ? 'כניסה' : 'פתיחת חשבון'}
          </button>
        </form>

        <button
          className="login-swap"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setErr('');
          }}
        >
          {mode === 'login' ? 'אין לך חשבון? פתחי חשבון חדש' : 'כבר יש לך חשבון? לכניסה'}
        </button>
      </div>

      <p className="login-foot">המתכונים שכל משתמש מכניס נשמרים בחשבון שלו בלבד.</p>
    </div>
  );
}
