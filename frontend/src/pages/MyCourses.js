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
    <div className="my-courses-page">
      <h1 style={{fontSize:'2rem',fontWeight:800,color:'#1a1a2e',marginBottom:'0.5rem'}}>My Enrolled Courses</h1>
      <p style={{color:'#666',marginBottom:'2rem'}}>Continue your learning journey</p>
      {loading ? <div style={{textAlign:'center',padding:'4rem',color:'#888'}}>Loading...</div>
        : courses.length === 0 ? (
          <div style={{textAlign:'center',padding:'4rem',color:'#888',display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem'}}>
            <BookOpen size={60} color="#ccc" />
            <h3>No courses yet!</h3>
            <p>Explore our courses and start learning today.</p>
            <Link to="/courses" style={{background:'linear-gradient(135deg,#6c63ff,#5a52d5)',color:'#fff',padding:'12px 28px',borderRadius:'25px',fontWeight:600}}>Browse Courses</Link>
          </div>
        ) : <div className="courses-grid">{courses.map(c => <CourseCard key={c._id} course={c} enrolled={true} />)}</div>
      }
    </div>
  );
}
