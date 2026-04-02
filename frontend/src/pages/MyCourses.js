import { useEffect, useState } from 'react';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/my-courses').then(r => {
      setCourses(r.data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Enrolled Courses</h1>
      <p style={styles.sub}>Continue your learning journey</p>

      {loading ? (
        <div style={styles.loading}>Loading your courses...</div>
      ) : courses.length === 0 ? (
        <div style={styles.empty}>
          <BookOpen size={60} color="#ccc" />
          <h3>No courses yet!</h3>
          <p>Explore our courses and start learning today.</p>
          <Link to="/courses" style={styles.btn}>Browse Courses</Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {courses.map(c => <CourseCard key={c._id} course={c} enrolled={true} />)}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '3rem 4rem', background: '#f8f9fa', minHeight: '100vh' },
  title: { fontSize: '2rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '0.5rem' },
  sub: { color: '#666', marginBottom: '2.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' },
  loading: { textAlign: 'center', padding: '4rem', color: '#888' },
  empty: {
    textAlign: 'center', padding: '5rem', color: '#888',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
  },
  btn: {
    background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', color: '#fff',
    textDecoration: 'none', padding: '12px 28px', borderRadius: '25px', fontWeight: 600
  }
};
