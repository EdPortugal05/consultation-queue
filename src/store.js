import { useSyncExternalStore } from 'react';
import { SUBJECTS } from './data';

const KEY = 'consultation-queue:v1';
const ago = (minutes) => Date.now() - minutes * 60000;
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function seed() {
  const c = (from, name, text, minutes) => ({
    id: uid(),
    from,
    name,
    text,
    at: ago(minutes),
  });
  return {
    counters: { ipt2: 3, si: 2, capstone: 0 },
    tickets: [
      {
        id: uid(),
        number: 'IPT-001',
        subjectId: 'ipt2',
        studentName: 'Angela Dizon',
        type: 'Project help',
        concern:
          'Sir, my React app gets a CORS error when it calls my Express API on localhost. Can I consult before our sprint review?',
        status: 'in_progress',
        createdAt: ago(95),
        scheduled: null,
        priority: true,
        unread: { student: 0, teacher: 1 },
        comments: [
          c(
            'teacher',
            'Jeremy Zion L. Jamer',
            'Hi Angela! Are you using the cors package in Express? Please share your server.js setup.',
            70
          ),
          c(
            'student',
            'Angela Dizon',
            'Yes sir, I added app.use(cors()) but only after my routes.',
            40
          ),
        ],
      },
      {
        id: uid(),
        number: 'IPT-002',
        subjectId: 'ipt2',
        studentName: 'Marco Villanueva',
        type: 'Consultation request',
        concern:
          'We need help splitting our user stories into tasks for the sprint backlog. Is Wednesday afternoon okay?',
        status: 'waiting',
        createdAt: ago(48),
        scheduled: null,
        priority: false,
        unread: { student: 0, teacher: 0 },
        comments: [],
      },
      {
        id: uid(),
        number: 'IPT-003',
        subjectId: 'ipt2',
        studentName: 'Bea Santos',
        type: 'Technical problem',
        concern:
          "GitHub says I can't merge my pull request because main is protected. What am I missing?",
        status: 'waiting',
        createdAt: ago(22),
        scheduled: null,
        priority: false,
        unread: { student: 0, teacher: 0 },
        comments: [],
      },
      {
        id: uid(),
        number: 'SIA-001',
        subjectId: 'si',
        studentName: 'Kyla Mercado',
        type: 'Grade inquiry',
        concern:
          'Maam, may I ask how my midterm activity was scored? I would like to understand the rubric.',
        status: 'waiting',
        createdAt: ago(61),
        scheduled: null,
        priority: false,
        unread: { student: 0, teacher: 0 },
        comments: [],
      },
      {
        id: uid(),
        number: 'SIA-002',
        subjectId: 'si',
        studentName: 'Jose Ramirez',
        type: 'Technical problem',
        concern:
          'My REST API keeps returning 401 after login even though the token is saved.',
        status: 'resolved',
        createdAt: ago(300),
        scheduled: null,
        priority: false,
        unread: { student: 0, teacher: 0 },
        comments: [
          c(
            'teacher',
            'Maria Santos',
            'Check that the Authorization header uses "Bearer <token>" with a space.',
            280
          ),
          c('student', 'Jose Ramirez', 'That was it, thank you Maam!', 270),
        ],
      },
    ],
  };
}

// ---- tiny external store (localStorage + cross-tab sync) ----
let memory = null;
function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* storage unavailable, fall back to memory */
  }
  return memory;
}
function write(next) {
  memory = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch (e) {
    /* ignore */
  }
}

let state = read();
if (!state) {
  state = seed();
  write(state);
}

const listeners = new Set();
const notify = () => listeners.forEach((l) => l());
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY && e.newValue) {
      state = JSON.parse(e.newValue);
      notify();
    }
  });
}

function commit(next) {
  state = next;
  write(next);
  notify();
}
const mapTicket = (id, fn) =>
  commit({
    ...state,
    tickets: state.tickets.map((t) => (t.id === id ? fn(t) : t)),
  });

export function useStore() {
  return useSyncExternalStore(subscribe, () => state);
}

export const actions = {
  addTicket({ studentName, subjectId, type, concern }) {
    const subject = SUBJECTS.find((s) => s.id === subjectId);
    const n = (state.counters[subjectId] || 0) + 1;
    const ticket = {
      id: uid(),
      number: `${subject.prefix}-${String(n).padStart(3, '0')}`,
      subjectId,
      studentName: studentName.trim(),
      type,
      concern: concern.trim(),
      status: 'waiting',
      createdAt: Date.now(),
      scheduled: null,
      priority: false,
      unread: { student: 0, teacher: 1 },
      comments: [],
    };
    commit({
      counters: { ...state.counters, [subjectId]: n },
      tickets: [...state.tickets, ticket],
    });
    return ticket;
  },
  addComment(id, from, name, text) {
    const other = from === 'student' ? 'teacher' : 'student';
    mapTicket(id, (t) => ({
      ...t,
      comments: [
        ...t.comments,
        { id: uid(), from, name, text: text.trim(), at: Date.now() },
      ],
      unread: { ...t.unread, [other]: t.unread[other] + 1 },
    }));
  },
  setStatus(id, status) {
    mapTicket(id, (t) => ({ ...t, status }));
  },
  setSchedule(id, scheduled) {
    mapTicket(id, (t) => ({ ...t, scheduled }));
  },
  togglePriority(id) {
    mapTicket(id, (t) => ({ ...t, priority: !t.priority }));
  },
  markRead(id, role) {
    mapTicket(id, (t) => ({ ...t, unread: { ...t.unread, [role]: 0 } }));
  },
  withdraw(id) {
    commit({ ...state, tickets: state.tickets.filter((t) => t.id !== id) });
  },
  resetDemo() {
    commit(seed());
  },
};
