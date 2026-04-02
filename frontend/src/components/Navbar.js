import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User, BookOpen, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        <GraduationCap size={28} color="#6c63ff" />
        <span style={styles.brandText}>Priyanka Coaching</span>
      </Link>

      <div style={styles.links}>
        <Link to="/courses" style={styles.link}>
          <BookOpen size={16} /> Courses
        </Link>

        {!user ? (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.btnPrimary}>Sign Up Free</Link>
          </>
        ) : user.role === 'teacher' ? (
          <>
            <Link to="/teacher/dashboard" style={styles.link}>
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <button onClick={handleLogout} style={styles.btnOutline}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/my-courses" style={styles.link}>
              <User size={16} /> My Courses
            </Link>
            <button onClick={handleLogout} style={styles.btnOutline}>
              <LogOut size={16} /> Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 2rem', height: '64px', background: '#fff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: '10px',
    textDecoration: 'none', color: '#1a1a2e'
  },
  brandText: { fontSize: '1.2rem', fontWeight: 700, color: '#1a1a2e' },
  links: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  link: {
    display: 'flex', alignItems: 'center', gap: '5px',
    textDecoration: 'none', color: '#555', fontWeight: 500,
    fontSize: '0.95rem', transition: 'color 0.2s'
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #6c63ff, #5a52d5)',
    color: '#fff', border: 'none', padding: '8px 20px',
    borderRadius: '25px', cursor: 'pointer', fontWeight: 600,
    textDecoration: 'none', fontSize: '0.9rem'
  },
  btnOutline: {
    display: 'flex', alignItems: 'center', gap: '5px',
    background: 'transparent', border: '1.5px solid #6c63ff',
    color: '#6c63ff', padding: '7px 16px', borderRadius: '25px',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
  }
};
