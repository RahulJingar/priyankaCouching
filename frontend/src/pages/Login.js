import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/courses');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <GraduationCap size={40} color="#6c63ff" />
          <h2>Welcome Back!</h2>
          <p>Login to continue your learning journey</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email" placeholder="Enter your email" value={form.email}
              onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
              className={errors.email ? 'auth-input error' : 'auth-input'}
            />
            {errors.email && <span className="auth-error">{errors.email}</span>}
          </div>
          <div className="auth-field">
            <label>Password</label>
            <div className="pass-wrap">
              <input
                type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={form.password}
                onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
                className={errors.password ? 'auth-input error' : 'auth-input'}
                style={{ paddingRight: '45px' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="eye-btn">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="auth-error">{errors.password}</span>}
          </div>
          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up Free</Link>
        </p>
      </div>
    </div>
  );
}
