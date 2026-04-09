import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User, BookOpen, LayoutDashboard, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };
  const close = () => setOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={close}>
        <GraduationCap size={26} color="#6c63ff" />
        <span>Priyanka Coaching</span>
      </Link>

      {/* Desktop */}
      <div className="navbar-links">
        <Link to="/courses" className="navbar-link"><BookOpen size={15} /> Courses</Link>
        {!user ? (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="navbar-btn-primary">Sign Up Free</Link>
          </>
        ) : user.role === 'teacher' ? (
          <>
            <Link to="/teacher/dashboard" className="navbar-link"><LayoutDashboard size={15} /> Dashboard</Link>
            <button onClick={handleLogout} className="navbar-btn-outline"><LogOut size={15} /> Logout</button>
          </>
        ) : (
          <>
            <Link to="/my-courses" className="navbar-link"><User size={15} /> My Courses</Link>
            <button onClick={handleLogout} className="navbar-btn-outline"><LogOut size={15} /> Logout</button>
          </>
        )}
      </div>

      {/* Hamburger */}
      <button className="navbar-hamburger" onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {open && (
        <div className="navbar-mobile-menu">
          <Link to="/courses" className="navbar-mobile-link" onClick={close}><BookOpen size={16} /> Courses</Link>
          {!user ? (
            <>
              <Link to="/login" className="navbar-mobile-link" onClick={close}>Login</Link>
              <Link to="/register" className="navbar-mobile-primary" onClick={close}>Sign Up Free</Link>
            </>
          ) : user.role === 'teacher' ? (
            <>
              <Link to="/teacher/dashboard" className="navbar-mobile-link" onClick={close}><LayoutDashboard size={16} /> Dashboard</Link>
              <button onClick={handleLogout} className="navbar-mobile-logout"><LogOut size={16} /> Logout</button>
            </>
          ) : (
            <>
              <Link to="/my-courses" className="navbar-mobile-link" onClick={close}><User size={16} /> My Courses</Link>
              <button onClick={handleLogout} className="navbar-mobile-logout"><LogOut size={16} /> Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
