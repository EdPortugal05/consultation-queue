import { useState } from 'react';
import { useStore, actions } from '../store';
import { SUBJECTS, CONCERN_TYPES } from '../data';
import {
  Brand,
  Icon,
  StatusPill,
  SubjectChip,
  subjectOf,
  teacherFor,
  timeAgo,
} from '../ui';
import Thread from './Thread.jsx';

const NAME_KEY = 'cq:student-name';
const loadName = () => {
  try {
    return localStorage.getItem(NAME_KEY) || '';
  } catch (e) {
    return '';
  }
};
const saveName = (n) => {
  try {
    localStorage.setItem(NAME_KEY, n);
  } catch (e) {
    /* ignore */
  }
};

export default function StudentPortal({ onBack }) {
  const { tickets } = useStore();
  const [name, setName] = useState(loadName);
  const [subjectId, setSubjectId] = useState('');
  const [type, setType] = useState(CONCERN_TYPES[0]);
  const [concern, setConcern] = useState('');
  const [errors, setErrors] = useState({});
  const [lookup, setLookup] = useState(loadName);
  const [selectedId, setSelectedId] = useState(null);
  const [filed, setFiled] = useState(null);

  const key = lookup.trim().toLowerCase();
  const mine = tickets
    .filter((t) => key && t.studentName.trim().toLowerCase() === key)
    .sort((a, b) => b.createdAt - a.createdAt);
  const selected = mine.find((t) => t.id === selectedId) || null;

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (name.trim().length < 2) next.name = 'Enter your full name.';
    if (!subjectId) next.subject = 'Choose a subject.';
    if (concern.trim().length < 10)
      next.concern = 'Describe your concern in at least 10 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;

    const ticket = actions.addTicket({
      studentName: name,
      subjectId,
      type,
      concern,
    });
    saveName(name.trim());
    setLookup(name.trim());
    setSelectedId(ticket.id);
    setFiled(ticket);
    setConcern('');
    setSubjectId('');
    setType(CONCERN_TYPES[0]);
  };

  const ahead = (t) =>
    tickets.filter(
      (x) =>
        x.subjectId === t.subjectId &&
        x.status === 'waiting' &&
        x.createdAt < t.createdAt
    ).length;

  const open = (t) => {
    setSelectedId(t.id);
    if (t.unread.student) actions.markRead(t.id, 'student');
  };

  const filedLive = filed && tickets.find((t) => t.id === filed.id);

  return (
    <div className="page">
      <header className="topbar">
        <button className="ghost-btn" onClick={onBack}>
          <Icon name="back" size={18} /> Back
        </button>
        <Brand />
        <span className="role-badge">
          <Icon name="cap" size={16} /> Student
        </span>
      </header>

      <div className="student-grid">
        <div className="col">
          <form className="card" onSubmit={submit} noValidate>
            <h2>Send a concern</h2>
            <p className="muted">
              Your teacher sees it in their queue and replies in a private
              thread.
            </p>

            {filedLive && (
              <div className="filed">
                <div className="filed-number">{filedLive.number}</div>
                <div>
                  <strong>You're in the queue.</strong>
                  <small>
                    {ahead(filedLive) === 0
                      ? 'No one is ahead of you.'
                      : `${ahead(filedLive)} ${
                          ahead(filedLive) === 1 ? 'student is' : 'students are'
                        } ahead of you.`}
                  </small>
                </div>
              </div>
            )}

            <label className="field">
              <span>Student name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Angela Dizon"
                autoComplete="name"
              />
              {errors.name && <em className="error">{errors.name}</em>}
            </label>

            <div className="field">
              <span>Subject</span>
              <div className="choice-grid">
                {SUBJECTS.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    className={`choice ${subjectId === s.id ? 'on' : ''}`}
                    style={{ '--c': s.color, '--t': s.tint }}
                    onClick={() => setSubjectId(s.id)}
                    aria-pressed={subjectId === s.id}
                  >
                    <b>{s.code}</b>
                    <small>{s.name}</small>
                  </button>
                ))}
              </div>
              {errors.subject && <em className="error">{errors.subject}</em>}
            </div>

            <div className="field">
              <span>Type of concern</span>
              <div className="chips">
                {CONCERN_TYPES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    className={`chip ${type === t ? 'on' : ''}`}
                    onClick={() => setType(t)}
                    aria-pressed={type === t}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <label className="field">
              <span>Concern</span>
              <textarea
                rows={5}
                maxLength={500}
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                placeholder="What do you need help with? Add details so your teacher can prepare."
              />
              <small className="counter">{concern.length}/500</small>
              {errors.concern && <em className="error">{errors.concern}</em>}
            </label>

            <button className="primary" type="submit">
              Join the queue <Icon name="arrow" size={18} />
            </button>
          </form>

          <div className="card board">
            <h3>Queue right now</h3>
            {SUBJECTS.map((s) => {
              const w = tickets.filter(
                (t) => t.subjectId === s.id && t.status === 'waiting'
              ).length;
              return (
                <div className="board-row" key={s.id}>
                  <span className="dot" style={{ background: s.color }} />
                  <div>
                    <strong>{s.short}</strong>
                    <small>{s.name}</small>
                  </div>
                  <span className="count">{w} waiting</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col">
          <div className="card">
            <h2>My concerns</h2>
            <label className="field inline">
              <span>Find by name</span>
              <div className="search">
                <Icon name="search" size={18} />
                <input
                  value={lookup}
                  onChange={(e) => {
                    setLookup(e.target.value);
                    setSelectedId(null);
                  }}
                  placeholder="Type the name you used"
                />
              </div>
            </label>

            {mine.length === 0 ? (
              <div className="empty">
                <Icon name="inbox" size={30} />
                <strong>
                  {key ? 'No concerns found for that name' : 'Nothing here yet'}
                </strong>
                <small>
                  {key
                    ? 'Check the spelling, or send a new concern.'
                    : 'Send a concern or type your name to see your threads.'}
                </small>
              </div>
            ) : (
              <ul className="ticket-list">
                {mine.map((t) => (
                  <li key={t.id}>
                    <button
                      className={`ticket-row ${
                        selectedId === t.id ? 'on' : ''
                      }`}
                      onClick={() => open(t)}
                    >
                      <span
                        className="num"
                        style={{
                          background: subjectOf(t.subjectId).tint,
                          color: subjectOf(t.subjectId).color,
                        }}
                      >
                        {t.number}
                      </span>
                      <span className="ticket-main">
                        <strong>{t.type}</strong>
                        <small>{t.concern}</small>
                      </span>
                      <span className="ticket-meta">
                        <StatusPill status={t.status} />
                        <small>{timeAgo(t.createdAt)}</small>
                      </span>
                      {t.unread.student > 0 && (
                        <span className="unread">{t.unread.student}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selected && (
            <div className="card">
              <div className="detail-head">
                <div>
                  <h3>
                    {selected.number}{' '}
                    <SubjectChip subjectId={selected.subjectId} />
                  </h3>
                  <small className="muted">
                    {selected.status === 'waiting'
                      ? `${ahead(selected)} ahead of you`
                      : selected.status === 'in_progress'
                      ? 'Your teacher is attending to this now'
                      : 'Marked resolved by your teacher'}
                  </small>
                </div>
                {selected.status === 'waiting' && (
                  <button
                    className="ghost-btn danger"
                    onClick={() => {
                      if (confirm('Withdraw this concern from the queue?')) {
                        actions.withdraw(selected.id);
                        setSelectedId(null);
                      }
                    }}
                  >
                    <Icon name="trash" size={16} /> Withdraw
                  </button>
                )}
              </div>
              {selected.scheduled && (
                <div className="slot">
                  <Icon name="calendar" size={18} /> Consultation set for{' '}
                  {new Date(selected.scheduled).toLocaleString([], {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              )}
              <Thread
                ticket={selected}
                role="student"
                myName={selected.studentName}
                otherName={
                  teacherFor(selected.subjectId)?.name || 'your teacher'
                }
                onSend={(text) =>
                  actions.addComment(
                    selected.id,
                    'student',
                    selected.studentName,
                    text
                  )
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
