import { Link } from 'react-router-dom';
import { IndianRupee, BookOpen, Clock } from 'lucide-react';
import { getMediaUrl } from '../api/axios';

export default function CourseCard({ course, enrolled }) {
  return (
    <div className="course-card">
      <div className="course-card-img">
        <img src={getMediaUrl(course.thumbnail)} alt={course.title} />
        <span className="course-badge">{course.category}</span>
        {enrolled && <span className="course-enrolled-badge">✓ Enrolled</span>}
      </div>
      <div className="course-card-body">
        <h3>{course.title}</h3>
        <p>{course.description.slice(0, 100)}...</p>
        <div className="course-card-meta">
          <span><BookOpen size={14} /> {course.lessons?.length || 0} Lessons</span>
          <span><Clock size={14} /> Self-paced</span>
        </div>
        <div className="course-card-footer">
          <span className="course-price"><IndianRupee size={16} />{course.price.toLocaleString('en-IN')}</span>
          <Link to={`/courses/${course._id}`} className="course-card-btn">
            {enrolled ? 'Continue' : 'View Course'}
          </Link>
        </div>
      </div>
    </div>
  );
}
