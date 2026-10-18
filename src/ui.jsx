import { SUBJECTS, STATUS, TEACHERS } from './data';

export const subjectOf = (id) =>
  SUBJECTS.find((s) => s.id === id) || SUBJECTS[0];
export const teacherFor = (subjectId) =>
  TEACHERS.find((t) => t.subjects.includes(subjectId));

export function initials(name = '') {
  return name
    .replace(/^(Mr|Ms|Mrs|Sir|Maam|Dr)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

const AVATAR_COLORS = [
  '#2F9E62',
  '#3B82C4',
  '#7C5CD6',
  '#E2674F',
  '#D9962B',
  '#14873F',
  '#C2518F',
];
export function avatarColor(name = '') {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return new Date(ts).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
}

export function formatSlot(value) {
  if (!value) return '';
  return new Date(value).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const PATHS = {
  arrow: 'M5 12h14M13 6l6 6-6 6',
  back: 'M19 12H5M11 18l-6-6 6-6',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  check: 'M20 6 9 17l-5-5',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3',
  calendar: 'M5 5h14v15H5zM5 10h14M9 3v4M15 3v4',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  chat: 'M4 5h16v11H9l-5 4z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  logout: 'M9 4H5v16h4M16 8l4 4-4 4M20 12H9',
  plus: 'M12 5v14M5 12h14',
  book: 'M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3zM8 8h7M8 12h7',
  cap: 'M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5',
  backspace: 'M9 5h11v14H9l-6-7zM13 9l4 6M17 9l-4 6',
  inbox: 'M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5',
};

export function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export function Avatar({ name, size = 38 }) {
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        background: avatarColor(name),
        fontSize: size * 0.38,
      }}
    >
      {initials(name)}
    </span>
  );
}

export function StatusPill({ status }) {
  return <span className={`pill ${status}`}>{STATUS[status].label}</span>;
}

export function SubjectChip({ subjectId, short = true }) {
  const s = subjectOf(subjectId);
  return (
    <span
      className="subject-chip"
      style={{ background: s.tint, color: s.color }}
    >
      <i style={{ background: s.color }} />
      {short ? s.short : s.name}
    </span>
  );
}

export function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? 'light' : ''}`}>
      <span className="brand-mark">
        <Icon name="chat" size={18} />
      </span>
      Consultation Queue
    </div>
  );
}
