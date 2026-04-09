import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import { GraduationCap, Users, BookOpen, ChevronRight, Award, TrendingUp } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState([]);
  useEffect(() => { api.get('/courses').then(r => setCourses(r.data.slice(0, 3))); }, []);

  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🏆 India's #1 Online Coaching Platform</div>
          <h1 className="hero-title">
            Learn from the Best,<br />
            <span className="hero-highlight">Achieve Your Dreams</span>
          </h1>
          <p className="hero-sub">
            Expert-led courses for Class 10, 11, 12 & Competitive Exams.<br />
            Join 10,000+ students already learning with Priyanka Coaching.
          </p>
          <div className="hero-btns">
            <Link to="/courses" className="btn-primary">Explore Courses <ChevronRight size={18} /></Link>
            <Link to="/register" className="btn-secondary">Start Free Today</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><strong>10K+</strong><span>Students</span></div>
            <div className="stat-divider" />
            <div className="hero-stat"><strong>50+</strong><span>Courses</span></div>
            <div className="stat-divider" />
            <div className="hero-stat"><strong>4.9★</strong><span>Rating</span></div>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600" alt="Students learning" />
        </div>
      </section>

      <section className="features-grid">
        {[
          { icon: <Award size={28} color="#6c63ff" />, title: 'Expert Faculty', desc: 'Learn from experienced teachers with proven track records' },
          { icon: <TrendingUp size={28} color="#6c63ff" />, title: 'Track Progress', desc: 'Monitor your learning journey with detailed analytics' },
          { icon: <BookOpen size={28} color="#6c63ff" />, title: 'Rich Content', desc: 'Video lectures, notes, and practice questions included' },
          { icon: <Users size={28} color="#6c63ff" />, title: 'Community', desc: 'Join a community of motivated learners like you' },
        ].map((f, i) => (
          <div key={i} className="feature-card">
            {f.icon}
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">Popular Courses</h2>
          <Link to="/courses" className="see-all">See All →</Link>
        </div>
        <div className="courses-grid">
          {courses.map(c => <CourseCard key={c._id} course={c} />)}
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Start Your Journey?</h2>
        <p>Join thousands of students who are already achieving their goals</p>
        <Link to="/register" className="cta-btn">Get Started for Free</Link>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <GraduationCap size={24} color="#6c63ff" />
            <span>Priyanka Coaching</span>
          </div>
          <p className="footer-text">© 2024 Priyanka Coaching. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
