// Edit this file to change subjects, concern types, and teacher accounts.
// Teacher PINs are for the classroom demo only (there is no server).

export const SUBJECTS = [
  {
    id: 'si',
    code: 'SIA 101',
    name: 'System Integration and Architecture',
    short: 'System Integration',
    prefix: 'SIA',
    color: '#3B82C4',
    tint: '#E1EEF9',
  },

  {
    id: 'ipt2',
    code: 'IPT 102',
    name: 'Integrative Programming and Technologies 2',
    short: 'IPT 2',
    prefix: 'IPT',
    color: '#2F9E62',
    tint: '#DDF2E4',
  },
];

export const CONCERN_TYPES = [
  'Consultation request',
  'Project help',
  'Grade inquiry',
  'Technical problem',
  'Other',
];

export const TEACHERS = [
  {
    id: 't-jamer',
    name: 'Jeremy Zion L. Jamer',
    title: 'Instructor',
    pin: '1234',
    subjects: ['ipt2', 'si'],
  },
];

export const STATUS = {
  waiting: { label: 'Waiting', hint: 'In the queue' },
  in_progress: { label: 'In consultation', hint: 'Being attended to' },
  resolved: { label: 'Resolved', hint: 'Finished' },
};
