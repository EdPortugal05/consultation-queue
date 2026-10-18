import { useEffect, useRef, useState } from 'react';
import { TEACHERS } from '../data';
import { Avatar, Brand, Icon, subjectOf } from '../ui';

const MAX_TRIES = 3;
const LOCK_SECONDS = 30;

export default function TeacherLogin({ onBack, onLogin }) {
  const [teacher, setTeacher] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [tries, setTries] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const pinRef = useRef('');

  const locked = lockedUntil > now;
  const secondsLeft = Math.ceil((lockedUntil - now) / 1000);

  useEffect(() => {
    if (!locked) return undefined;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [locked]);

  const press = (digit) => {
    if (locked || !teacher) return;
    const current = pinRef.current;
    if (current.length >= 4) return;
    const next = current + digit;
    pinRef.current = next;
    setPin(next);
    setError('');
    if (next.length === 4) setTimeout(() => check(next), 120);
  };

  const erase = () => {
    pinRef.current = pinRef.current.slice(0, -1);
    setPin(pinRef.current);
  };

  const check = (value) => {
    if (value === teacher.pin) {
      onLogin(teacher.id);
      return;
    }
    const used = tries + 1;
    setShake(true);
    setTimeout(() => setShake(false), 450);
    pinRef.current = '';
    setPin('');
    if (used >= MAX_TRIES) {
      setTries(0);
      setNow(Date.now());
      setLockedUntil(Date.now() + LOCK_SECONDS * 1000);
      setError(`Too many tries. Wait ${LOCK_SECONDS} seconds.`);
    } else {
      setTries(used);
      setError(
        `Wrong PIN. ${MAX_TRIES - used} ${
          MAX_TRIES - used === 1 ? 'try' : 'tries'
        } left.`
      );
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (/^\d$/.test(e.key)) press(e.key);
      if (e.key === 'Backspace') erase();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const choose = (t) => {
    setTeacher(t);
    pinRef.current = '';
    setPin('');
    setError('');
  };

  return (
    <div className="login-page">
      <button
        className="ghost-btn on-dark"
        onClick={teacher ? () => choose(null) : onBack}
      >
        <Icon name="back" size={18} /> Back
      </button>

      <div className="login-card">
        <Brand />
        {!teacher ? (
          <>
            <h2>Teacher sign in</h2>
            <p className="muted">Choose your account.</p>
            <ul className="account-list">
              {TEACHERS.map((t) => (
                <li key={t.id}>
                  <button className="account" onClick={() => choose(t)}>
                    <Avatar name={t.name} size={46} />
                    <span>
                      <strong>{t.name}</strong>
                      <small>
                        {t.title} ·{' '}
                        {t.subjects.map((s) => subjectOf(s).short).join(', ')}
                      </small>
                    </span>
                    <Icon name="arrow" size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="who">
              <Avatar name={teacher.name} size={56} />
              <strong>{teacher.name}</strong>
              <small>Enter your 4-digit PIN</small>
            </div>

            <div
              className={`pin-dots ${shake ? 'shake' : ''}`}
              aria-label="PIN entry"
            >
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={i < pin.length ? 'on' : ''} />
              ))}
            </div>
            <p className={`pin-msg ${error ? 'bad' : ''}`} role="status">
              {locked
                ? `Locked. Try again in ${secondsLeft}s.`
                : error || '\u00A0'}
            </p>

            <div className="keypad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <button key={d} onClick={() => press(d)} disabled={locked}>
                  {d}
                </button>
              ))}
              <span />
              <button onClick={() => press('0')} disabled={locked}>
                0
              </button>
              <button
                onClick={erase}
                aria-label="Delete last digit"
                disabled={locked}
              >
                <Icon name="backspace" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
