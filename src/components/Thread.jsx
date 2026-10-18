import { useEffect, useRef, useState } from 'react';
import { Avatar, Icon, timeAgo } from '../ui';

// Private comments, styled after Google Classroom: only the student and the teacher see this thread.
export default function Thread({ ticket, role, myName, otherName, onSend }) {
  const [text, setText] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [ticket.id, ticket.comments.length]);

  const submit = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="thread">
      <div className="thread-head">
        <Icon name="lock" size={16} />
        <span>
          Private comments between{' '}
          {role === 'student' ? 'you' : ticket.studentName} and{' '}
          {role === 'student' ? otherName : 'you'}
        </span>
      </div>

      <div className="thread-list" ref={listRef}>
        <article className="comment original">
          <Avatar name={ticket.studentName} />
          <div className="comment-body">
            <header>
              <strong>{ticket.studentName}</strong>
              <span className="tag">Concern</span>
              <time>{timeAgo(ticket.createdAt)}</time>
            </header>
            <p>{ticket.concern}</p>
          </div>
        </article>

        {ticket.comments.map((c) => (
          <article key={c.id} className={`comment ${c.from}`}>
            <Avatar name={c.name} />
            <div className="comment-body">
              <header>
                <strong>{c.name}</strong>
                {c.from === 'teacher' && (
                  <span className="tag teacher">Teacher</span>
                )}
                <time>{timeAgo(c.at)}</time>
              </header>
              <p>{c.text}</p>
            </div>
          </article>
        ))}

        {ticket.comments.length === 0 && (
          <p className="thread-empty">
            No replies yet.{' '}
            {role === 'student'
              ? 'Your teacher will answer here.'
              : 'Say hello to start the thread.'}
          </p>
        )}
      </div>

      <div className="composer">
        <Avatar name={myName} size={34} />
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder="Add private comment…"
          aria-label="Add private comment"
        />
        <button
          className="send"
          onClick={submit}
          disabled={!text.trim()}
          aria-label="Send comment"
        >
          <Icon name="send" size={18} />
        </button>
      </div>
    </div>
  );
}
