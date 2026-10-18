import { useEffect, useMemo, useState } from 'react';
import { useStore, actions } from '../store';
import { TEACHERS } from '../data';
import {
  Avatar,
  Brand,
  Icon,
  StatusPill,
  SubjectChip,
  formatSlot,
  subjectOf,
  timeAgo,
} from '../ui';
import Thread from './Thread.jsx';

const RANK = { in_progress: 0, waiting: 1, resolved: 2 };

export default function TeacherDashboard({ teacherId, onLogout }) {
  const teacher = TEACHERS.find((t) => t.id === teacherId) || TEACHERS[0];
  const { tickets } = useStore();
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [slot, setSlot] = useState('');

  const mine = useMemo(
    () => tickets.filter((t) => teacher.subjects.includes(t.subjectId)),
    [tickets, teacher]
  );

  const list = mine
    .filter((t) => subjectFilter === 'all' || t.subjectId === subjectFilter)
    .filter((t) => statusFilter === 'all' || t.status === statusFilter)
    .filter((t) => {
      const q = query.trim().toLowerCase();
      return (
        !q ||
        t.studentName.toLowerCase().includes(q) ||
        t.number.toLowerCase().includes(q) ||
        t.concern.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (RANK[a.status] !== RANK[b.status])
        return RANK[a.status] - RANK[b.status];
      if (a.priority !== b.priority) return a.priority ? -1 : 1;
      return a.status === 'resolved'
        ? b.createdAt - a.createdAt
        : a.createdAt - b.createdAt;
    });

  const selected = list.find((t) => t.id === selectedId) || list[0] || null;

  useEffect(() => {
    if (selected && selected.unread.teacher > 0)
      actions.markRead(selected.id, 'teacher');
  }, [selected?.id, selected?.unread.teacher]);

  useEffect(() => {
    setSlot(selected?.scheduled || '');
  }, [selected?.id]);

  const count = (status) => mine.filter((t) => t.status === status).length;
  const unread = mine.reduce((n, t) => n + t.unread.teacher, 0);

  const saveSlot = () => {
    if (!slot || !selected) return;
    actions.setSchedule(selected.id, slot);
    actions.addComment(
      selected.id,
      'teacher',
      teacher.name,
      `Consultation scheduled for ${formatSlot(slot)}.`
    );
  };

  const tabs = [
    ['all', 'All'],
    ['waiting', 'Waiting'],
    ['in_progress', 'In consultation'],
    ['resolved', 'Resolved'],
  ];

  return (
    <div className="dash">
      <aside className="side">
        <Brand light />
        <div className="me">
          <Avatar name={teacher.name} size={52} />
          <strong>{teacher.name}</strong>
          <small>{teacher.title}</small>
        </div>

        <nav>
          <span className="side-label">Your subjects</span>
          <button
            className={subjectFilter === 'all' ? 'on' : ''}
            onClick={() => setSubjectFilter('all')}
          >
            <Icon name="inbox" size={18} /> All concerns
            <b>{mine.length}</b>
          </button>
          {teacher.subjects.map((id) => (
            <button
              key={id}
              className={subjectFilter === id ? 'on' : ''}
              onClick={() => setSubjectFilter(id)}
            >
              <i style={{ background: subjectOf(id).color }} />
              {subjectOf(id).short}
              <b>{mine.filter((t) => t.subjectId === id).length}</b>
            </button>
          ))}
        </nav>

        <button className="logout" onClick={onLogout}>
          <Icon name="logout" size={18} /> Sign out
        </button>
      </aside>

      <main className="dash-main">
        <header className="dash-head">
          <div>
            <h1>Today's queue</h1>
            <p className="muted">
              Oldest waiting concern first. Starred ones jump the line.
            </p>
          </div>
        </header>

        <div className="stats">
          <div className="stat amber">
            <Icon name="clock" />
            <div>
              <b>{count('waiting')}</b>
              <span>Waiting</span>
            </div>
          </div>
          <div className="stat violet">
            <Icon name="user" />
            <div>
              <b>{count('in_progress')}</b>
              <span>In consultation</span>
            </div>
          </div>
          <div className="stat green">
            <Icon name="check" />
            <div>
              <b>{count('resolved')}</b>
              <span>Resolved</span>
            </div>
          </div>
          <div className="stat coral">
            <Icon name="chat" />
            <div>
              <b>{unread}</b>
              <span>Unread replies</span>
            </div>
          </div>
        </div>

        <div className="dash-grid">
          <section className="card list-card">
            <div className="search">
              <Icon name="search" size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, number, or concern"
              />
            </div>
            <div className="tabs" role="tablist">
              {tabs.map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={statusFilter === id}
                  className={statusFilter === id ? 'on' : ''}
                  onClick={() => setStatusFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {list.length === 0 ? (
              <div className="empty">
                <Icon name="inbox" size={30} />
                <strong>No concerns here</strong>
                <small>
                  New concerns from students will appear in this list.
                </small>
              </div>
            ) : (
              <ul className="ticket-list">
                {list.map((t) => (
                  <li key={t.id}>
                    <button
                      className={`ticket-row ${
                        selected?.id === t.id ? 'on' : ''
                      }`}
                      onClick={() => setSelectedId(t.id)}
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
                        <strong>
                          {t.studentName}
                          {t.priority && (
                            <span className="starred">
                              <Icon name="star" size={14} />
                            </span>
                          )}
                        </strong>
                        <small>{t.concern}</small>
                      </span>
                      <span className="ticket-meta">
                        <StatusPill status={t.status} />
                        <small>{timeAgo(t.createdAt)}</small>
                      </span>
                      {t.unread.teacher > 0 && (
                        <span className="unread">{t.unread.teacher}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card detail-card">
            {!selected ? (
              <div className="empty">
                <Icon name="chat" size={30} />
                <strong>Select a concern</strong>
                <small>Its private thread opens here.</small>
              </div>
            ) : (
              <>
                <div className="detail-head">
                  <div>
                    <h3>
                      {selected.number} · {selected.studentName}
                    </h3>
                    <div className="meta-row">
                      <SubjectChip subjectId={selected.subjectId} />
                      <span className="tag">{selected.type}</span>
                      <StatusPill status={selected.status} />
                    </div>
                  </div>
                  <button
                    className={`icon-toggle ${selected.priority ? 'on' : ''}`}
                    onClick={() => actions.togglePriority(selected.id)}
                    aria-pressed={selected.priority}
                    title="Mark as priority"
                  >
                    <Icon name="star" size={18} />
                  </button>
                </div>

                <div className="actions">
                  {selected.status === 'waiting' && (
                    <button
                      className="primary small"
                      onClick={() =>
                        actions.setStatus(selected.id, 'in_progress')
                      }
                    >
                      Start consultation
                    </button>
                  )}
                  {selected.status === 'in_progress' && (
                    <button
                      className="primary small"
                      onClick={() => actions.setStatus(selected.id, 'resolved')}
                    >
                      <Icon name="check" size={16} /> Mark resolved
                    </button>
                  )}
                  {selected.status === 'resolved' && (
                    <button
                      className="ghost-btn"
                      onClick={() => actions.setStatus(selected.id, 'waiting')}
                    >
                      Reopen
                    </button>
                  )}
                  <div className="slot-edit">
                    <Icon name="calendar" size={18} />
                    <input
                      type="datetime-local"
                      value={slot}
                      onChange={(e) => setSlot(e.target.value)}
                      aria-label="Consultation date and time"
                    />
                    <button
                      className="ghost-btn"
                      onClick={saveSlot}
                      disabled={!slot}
                    >
                      Set slot
                    </button>
                  </div>
                </div>

                {selected.scheduled && (
                  <div className="slot">
                    <Icon name="calendar" size={18} /> Consultation set for{' '}
                    {formatSlot(selected.scheduled)}
                  </div>
                )}

                <Thread
                  ticket={selected}
                  role="teacher"
                  myName={teacher.name}
                  otherName={selected.studentName}
                  onSend={(text) =>
                    actions.addComment(
                      selected.id,
                      'teacher',
                      teacher.name,
                      text
                    )
                  }
                />
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
