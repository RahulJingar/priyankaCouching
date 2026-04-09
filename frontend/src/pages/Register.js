import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.confirm) e.confirm = 'Please confirm your password';
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/courses');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field, val) => { setForm({ ...form, [field]: val }); setErrors({ ...errors, [field]: '' }); };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <GraduationCap size={40} color="#6c63ff" />
          <h2>Create Account</h2>
          <p>Join thousands of students learning with us</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
            { key: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key} className="auth-field">
              <label>{label}</label>
              <input type={type} placeholder={placeholder} value={form[key]}
                onChange={e => set(key, e.target.value)}
                className={errors[key] ? 'auth-input error' : 'auth-input'} />
              {errors[key] && <span className="auth-error">{errors[key]}</span>}
            </div>
          ))}
          {['password', 'confirm'].map(key => (
            <div key={key} className="auth-field">
              <label>{key === 'password' ? 'Password' : 'Confirm Password'}</label>
              <div className="pass-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={key === 'password' ? 'Min 6 characters' : 'Re-enter password'}
                  value={form[key]} onChange={e => set(key, e.target.value)}
                  className={errors[key] ? 'auth-input error' : 'auth-input'}
                  style={{ paddingRight: '45px' }}
                />
                {key === 'password' && (
                  <button type="button" onClick={() => setShowPass(!showPass)} className="eye-btn">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
              {errors[key] && <span className="auth-error">{errors[key]}</span>}
            </div>
          ))}
          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
