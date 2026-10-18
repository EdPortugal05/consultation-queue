import { useStore, actions } from '../store';
import { SUBJECTS } from '../data';
import { Brand, Icon, SubjectChip, subjectOf } from '../ui';

export default function Landing({ onStudent, onTeacher }) {
  const { tickets } = useStore();
  const waiting = tickets.filter((t) => t.status === 'waiting').length;
  const open = tickets
    .filter((t) => t.status !== 'resolved')
    .sort(
      (a, b) =>
        (a.status === 'in_progress' ? -1 : 0) -
          (b.status === 'in_progress' ? -1 : 0) || b.createdAt - a.createdAt
    )
    .slice(0, 3);

  return (
    <main className="landing">
      <section className="hero">
        <Brand light />
        <div className="hero-copy">
          <h1>
            Line up your concern.
            <br />
            Get a private answer.
          </h1>
          <p>
            Skip the hallway line. Send your concern to your teacher, wait for
            your turn, and keep the whole conversation in one private thread.
          </p>
        </div>

        <div className="stubs" aria-hidden="true">
          {open.map((t, i) => {
            const s = subjectOf(t.subjectId);
            return (
              <div key={t.id} className={`stub stub-${i}`}>
                <div className="stub-top">
                  <span style={{ color: s.color }}>{s.short}</span>
                  <span>
                    {t.status === 'in_progress' ? 'In consultation' : 'Waiting'}
                  </span>
                </div>
                <div className="stub-number">{t.number}</div>
              </div>
            );
          })}
        </div>

        <div className="hero-foot">
          <span className="live-dot" />
          {waiting === 0
            ? 'The queue is empty right now'
            : `${waiting} ${
                waiting === 1 ? 'student is' : 'students are'
              } waiting right now`}
        </div>
      </section>

      <section className="choose">
        <div className="choose-inner">
          <h2>Who is using the queue?</h2>
          <p className="muted">Pick your role to continue.</p>

          <button className="role-card student" onClick={onStudent}>
            <span className="role-icon">
              <Icon name="cap" size={26} />
            </span>
            <span className="role-text">
              <strong>I'm a student</strong>
              <small>Send a concern to your teacher. No account needed.</small>
            </span>
            <Icon name="arrow" />
          </button>

          <button className="role-card teacher" onClick={onTeacher}>
            <span className="role-icon">
              <Icon name="book" size={26} />
            </span>
            <span className="role-text">
              <strong>I'm a teacher</strong>
              <small>Open your queue with your 4-digit PIN.</small>
            </span>
            <Icon name="lock" />
          </button>

          <div className="subject-row">
            {SUBJECTS.map((s) => (
              <SubjectChip key={s.id} subjectId={s.id} short={false} />
            ))}
          </div>

          <button
            className="link-btn"
            onClick={() =>
              confirm('Reset all demo data?') && actions.resetDemo()
            }
          >
            Reset demo data
          </button>
        </div>
      </section>
    </main>
  );
}
