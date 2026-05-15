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
    <div className="courses-page">
      <div className="courses-header">
        <h1>All Courses</h1>
        <p>Explore our comprehensive collection of expert-led courses</p>
      </div>
      <div style={{marginBottom:'2rem'}}>
        <div className="search-wrap">
          <Search size={18} color="#888" className="search-icon" />
          <input className="search-input" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="cat-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={`cat-btn${category === cat ? ' cat-btn-active' : ''}`}>{cat}</button>
          ))}
        </div>
      </div>
      {loading ? <div style={{textAlign:'center',padding:'4rem',color:'#888'}}>Loading courses...</div>
        : filtered.length === 0 ? <div style={{textAlign:'center',padding:'4rem',color:'#888'}}>No courses found.</div>
        : <div className="courses-grid">{filtered.map(c => <CourseCard key={c._id} course={c} enrolled={isEnrolled(c._id)} />)}</div>
      }
    </div>
  );
}
