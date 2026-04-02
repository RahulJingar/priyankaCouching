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
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <GraduationCap size={40} color="#6c63ff" />
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.sub}>Join thousands of students learning with us</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
            { key: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input
                type={type} placeholder={placeholder} value={form[key]}
                onChange={e => set(key, e.target.value)}
                style={{ ...styles.input, ...(errors[key] ? styles.inputError : {}) }}
              />
              {errors[key] && <span style={styles.error}>{errors[key]}</span>}
            </div>
          ))}

          {['password', 'confirm'].map(key => (
            <div key={key} style={styles.field}>
              <label style={styles.label}>{key === 'password' ? 'Password' : 'Confirm Password'}</label>
              <div style={styles.passWrap}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={key === 'password' ? 'Min 6 characters' : 'Re-enter password'}
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  style={{ ...styles.input, paddingRight: '45px', ...(errors[key] ? styles.inputError : {}) }}
                />
                {key === 'password' && (
                  <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
              {errors[key] && <span style={styles.error}>{errors[key]}</span>}
            </div>
          ))}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #f8f7ff 0%, #ede9fe 100%)', padding: '2rem'
  },
  card: {
    background: '#fff', borderRadius: '20px', padding: '2.5rem',
    width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
  },
  header: { textAlign: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e', marginTop: '0.5rem' },
  sub: { color: '#666', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontWeight: 600, color: '#333', fontSize: '0.9rem' },
  input: {
    padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e0e0e0',
    fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box'
  },
  inputError: { borderColor: '#ef4444' },
  error: { color: '#ef4444', fontSize: '0.8rem' },
  passWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#888'
  },
  btn: {
    background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', color: '#fff',
    border: 'none', padding: '14px', borderRadius: '10px', fontSize: '1rem',
    fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem'
  },
  footer: { textAlign: 'center', marginTop: '1.5rem', color: '#666', fontSize: '0.9rem' },
  link: { color: '#6c63ff', fontWeight: 600, textDecoration: 'none' }
};
