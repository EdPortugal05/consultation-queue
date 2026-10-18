import { useState } from 'react';
import Landing from './components/Landing.jsx';
import StudentPortal from './components/StudentPortal.jsx';
import TeacherLogin from './components/TeacherLogin.jsx';
import TeacherDashboard from './components/TeacherDashboard.jsx';

const SESSION_KEY = 'cq:teacher';
const getSession = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch (e) {
    return null;
  }
};

export default function App() {
  const [teacherId, setTeacherId] = useState(getSession);
  const [view, setView] = useState(() =>
    getSession() ? 'teacher' : 'landing'
  );

  const login = (id) => {
    try {
      sessionStorage.setItem(SESSION_KEY, id);
    } catch (e) {
      /* ignore */
    }
    setTeacherId(id);
    setView('teacher');
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
      /* ignore */
    }
    setTeacherId(null);
    setView('landing');
  };

  if (view === 'student')
    return <StudentPortal onBack={() => setView('landing')} />;
  if (view === 'teacher-login')
    return <TeacherLogin onBack={() => setView('landing')} onLogin={login} />;
  if (view === 'teacher' && teacherId)
    return <TeacherDashboard teacherId={teacherId} onLogout={logout} />;

  return (
    <Landing
      onStudent={() => setView('student')}
      onTeacher={() => setView('teacher-login')}
    />
  );
}
