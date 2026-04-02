import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import { GraduationCap, Star, Users, BookOpen, ChevronRight, Award, TrendingUp } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data.slice(0, 3)));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>🏆 India's #1 Online Coaching Platform</div>
          <h1 style={styles.heroTitle}>
            Learn from the Best,<br />
            <span style={styles.heroHighlight}>Achieve Your Dreams</span>
          </h1>
          <p style={styles.heroSub}>
            Expert-led courses for Class 10, 11, 12 & Competitive Exams.<br />
            Join 10,000+ students already learning with Priyanka Coaching.
          </p>
          <div style={styles.heroBtns}>
            <Link to="/courses" style={styles.btnPrimary}>
              Explore Courses <ChevronRight size={18} />
            </Link>
            <Link to="/register" style={styles.btnSecondary}>Start Free Today</Link>
          </div>
          <div style={styles.heroStats}>
            <div style={styles.stat}><strong>10K+</strong><span>Students</span></div>
            <div style={styles.statDivider} />
            <div style={styles.stat}><strong>50+</strong><span>Courses</span></div>
            <div style={styles.statDivider} />
            <div style={styles.stat}><strong>4.9★</strong><span>Rating</span></div>
          </div>
        </div>
        <div style={styles.heroImage}>
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600"
            alt="Students learning"
            style={styles.heroImg}
          />
        </div>
      </section>

      {/* Features */}
      <section style={styles.features}>
        {[
          { icon: <Award size={28} color="#6c63ff" />, title: 'Expert Faculty', desc: 'Learn from experienced teachers with proven track records' },
          { icon: <TrendingUp size={28} color="#6c63ff" />, title: 'Track Progress', desc: 'Monitor your learning journey with detailed analytics' },
          { icon: <BookOpen size={28} color="#6c63ff" />, title: 'Rich Content', desc: 'Video lectures, notes, and practice questions included' },
          { icon: <Users size={28} color="#6c63ff" />, title: 'Community', desc: 'Join a community of motivated learners like you' },
        ].map((f, i) => (
          <div key={i} style={styles.featureCard}>
            <div style={styles.featureIcon}>{f.icon}</div>
            <h3 style={styles.featureTitle}>{f.title}</h3>
            <p style={styles.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Popular Courses */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Popular Courses</h2>
          <Link to="/courses" style={styles.seeAll}>See All Courses →</Link>
        </div>
        <div style={styles.grid}>
          {courses.map(c => <CourseCard key={c._id} course={c} />)}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Start Your Journey?</h2>
        <p style={styles.ctaSub}>Join thousands of students who are already achieving their goals</p>
        <Link to="/register" style={styles.ctaBtn}>Get Started for Free</Link>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerBrand}>
            <GraduationCap size={24} color="#6c63ff" />
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Priyanka Coaching</span>
          </div>
          <p style={styles.footerText}>© 2024 Priyanka Coaching. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  hero: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '5rem 4rem', background: 'linear-gradient(135deg, #f8f7ff 0%, #ede9fe 100%)',
    minHeight: '85vh', gap: '3rem'
  },
  heroContent: { flex: 1, maxWidth: '560px' },
  heroBadge: {
    display: 'inline-block', background: 'rgba(108,99,255,0.1)',
    color: '#6c63ff', padding: '6px 16px', borderRadius: '20px',
    fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem'
  },
  heroTitle: { fontSize: '3rem', fontWeight: 800, color: '#1a1a2e', lineHeight: 1.2, marginBottom: '1rem' },
  heroHighlight: { color: '#6c63ff' },
  heroSub: { fontSize: '1.1rem', color: '#555', lineHeight: 1.7, marginBottom: '2rem' },
  heroBtns: { display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' },
  btnPrimary: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'linear-gradient(135deg, #6c63ff, #5a52d5)',
    color: '#fff', textDecoration: 'none', padding: '14px 28px',
    borderRadius: '30px', fontWeight: 700, fontSize: '1rem',
    boxShadow: '0 4px 15px rgba(108,99,255,0.4)'
  },
  btnSecondary: {
    background: '#fff', color: '#6c63ff', textDecoration: 'none',
    padding: '14px 28px', borderRadius: '30px', fontWeight: 700,
    fontSize: '1rem', border: '2px solid #6c63ff'
  },
  heroStats: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statDivider: { width: '1px', height: '40px', background: '#ccc' },
  heroImage: { flex: 1, maxWidth: '500px' },
  heroImg: { width: '100%', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  features: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem', padding: '4rem', background: '#fff'
  },
  featureCard: {
    padding: '2rem', borderRadius: '16px', background: '#f8f7ff',
    textAlign: 'center', transition: 'transform 0.2s'
  },
  featureIcon: { marginBottom: '1rem' },
  featureTitle: { fontWeight: 700, color: '#1a1a2e', marginBottom: '0.5rem' },
  featureDesc: { color: '#666', fontSize: '0.9rem', lineHeight: 1.6 },
  section: { padding: '4rem', background: '#f8f9fa' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  sectionTitle: { fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e' },
  seeAll: { color: '#6c63ff', textDecoration: 'none', fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' },
  cta: {
    padding: '5rem 4rem', textAlign: 'center',
    background: 'linear-gradient(135deg, #6c63ff, #5a52d5)'
  },
  ctaTitle: { fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' },
  ctaSub: { color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: '2rem' },
  ctaBtn: {
    background: '#fff', color: '#6c63ff', textDecoration: 'none',
    padding: '14px 36px', borderRadius: '30px', fontWeight: 700, fontSize: '1rem'
  },
  footer: { background: '#1a1a2e', padding: '2rem 4rem' },
  footerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerBrand: { display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' },
  footerText: { color: '#888', fontSize: '0.9rem' }
};
