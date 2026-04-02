import { Link } from 'react-router-dom';
import { IndianRupee, BookOpen, Clock } from 'lucide-react';

export default function CourseCard({ course, enrolled }) {
  return (
    <div style={styles.card}>
      <div style={styles.imgWrap}>
        <img src={course.thumbnail} alt={course.title} style={styles.img} />
        <span style={styles.badge}>{course.category}</span>
        {enrolled && <span style={styles.enrolledBadge}>✓ Enrolled</span>}
      </div>
      <div style={styles.body}>
        <h3 style={styles.title}>{course.title}</h3>
        <p style={styles.desc}>{course.description.slice(0, 100)}...</p>
        <div style={styles.meta}>
          <span style={styles.metaItem}><BookOpen size={14} /> {course.lessons?.length || 0} Lessons</span>
          <span style={styles.metaItem}><Clock size={14} /> Self-paced</span>
        </div>
        <div style={styles.footer}>
          <span style={styles.price}>
            <IndianRupee size={16} />
            {course.price.toLocaleString('en-IN')}
          </span>
          <Link to={`/courses/${course._id}`} style={styles.btn}>
            {enrolled ? 'Continue' : 'View Course'}
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff', borderRadius: '16px', overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  },
  imgWrap: { position: 'relative', height: '180px', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  badge: {
    position: 'absolute', top: '12px', left: '12px',
    background: 'rgba(108,99,255,0.9)', color: '#fff',
    padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600
  },
  enrolledBadge: {
    position: 'absolute', top: '12px', right: '12px',
    background: 'rgba(16,185,129,0.9)', color: '#fff',
    padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600
  },
  body: { padding: '1.2rem' },
  title: { fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px', lineHeight: 1.4 },
  desc: { fontSize: '0.85rem', color: '#666', marginBottom: '12px', lineHeight: 1.5 },
  meta: { display: 'flex', gap: '1rem', marginBottom: '12px' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#888' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: {
    display: 'flex', alignItems: 'center', fontWeight: 700,
    fontSize: '1.1rem', color: '#6c63ff'
  },
  btn: {
    background: 'linear-gradient(135deg, #6c63ff, #5a52d5)',
    color: '#fff', textDecoration: 'none', padding: '8px 18px',
    borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600
  }
};
