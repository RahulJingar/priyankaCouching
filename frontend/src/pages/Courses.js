import { useEffect, useState } from 'react';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import { Search, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/courses').then(r => {
      setCourses(r.data);
      setFiltered(r.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = courses;
    if (category !== 'All') result = result.filter(c => c.category === category);
    if (search) result = result.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, category, courses]);

  const isEnrolled = (courseId) =>
    user?.enrolledCourses?.some(id => id === courseId || id?._id === courseId);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>All Courses</h1>
        <p style={styles.sub}>Explore our comprehensive collection of expert-led courses</p>
      </div>

      <div style={styles.filters}>
        <div style={styles.searchWrap}>
          <Search size={18} color="#888" style={styles.searchIcon} />
          <input
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.catWrap}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{ ...styles.catBtn, ...(category === cat ? styles.catBtnActive : {}) }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading courses...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>No courses found. Try a different search.</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(c => (
            <CourseCard key={c._id} course={c} enrolled={isEnrolled(c._id)} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '3rem 4rem', background: '#f8f9fa', minHeight: '100vh' },
  header: { textAlign: 'center', marginBottom: '2.5rem' },
  title: { fontSize: '2.2rem', fontWeight: 800, color: '#1a1a2e' },
  sub: { color: '#666', fontSize: '1rem', marginTop: '0.5rem' },
  filters: { marginBottom: '2rem' },
  searchWrap: {
    position: 'relative', maxWidth: '500px', margin: '0 auto 1.5rem'
  },
  searchIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' },
  searchInput: {
    width: '100%', padding: '12px 16px 12px 44px', borderRadius: '30px',
    border: '1.5px solid #e0e0e0', fontSize: '0.95rem', outline: 'none',
    background: '#fff', boxSizing: 'border-box'
  },
  catWrap: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' },
  catBtn: {
    padding: '8px 20px', borderRadius: '20px', border: '1.5px solid #e0e0e0',
    background: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', color: '#555'
  },
  catBtnActive: {
    background: 'linear-gradient(135deg, #6c63ff, #5a52d5)',
    color: '#fff', border: '1.5px solid transparent'
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' },
  loading: { textAlign: 'center', padding: '4rem', color: '#888', fontSize: '1.1rem' },
  empty: { textAlign: 'center', padding: '4rem', color: '#888', fontSize: '1.1rem' }
};
