import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { IndianRupee, Users, BookOpen, TrendingUp, Plus, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', thumbnail: '', category: 'Mathematics', previewVideoId: '', lessons: [] });
  const [lessonInput, setLessonInput] = useState({ title: '', videoId: '', duration: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = () => {
    api.get('/courses/teacher/dashboard').then(r => {
      setData(r.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const addLesson = () => {
    if (!lessonInput.title || !lessonInput.videoId) return toast.error('Lesson title and video ID required');
    setForm({ ...form, lessons: [...form.lessons, lessonInput] });
    setLessonInput({ title: '', videoId: '', duration: '' });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price || !form.thumbnail || !form.previewVideoId)
      return toast.error('Please fill all required fields');
    setSubmitting(true);
    try {
      await api.post('/courses', { ...form, price: Number(form.price) });
      toast.success('Course created successfully!');
      setShowForm(false);
      setForm({ title: '', description: '', price: '', thumbnail: '', category: 'Mathematics', previewVideoId: '', lessons: [] });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await api.delete(`/courses/${id}`);
    toast.success('Course deleted');
    fetchData();
  };

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  const { courses, totalRevenue, totalStudents } = data;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Teacher Dashboard</h1>
          <p style={styles.sub}>Welcome back, Priyanka! Here's your overview.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'Add New Course'}
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { icon: <IndianRupee size={24} color="#6c63ff" />, label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, bg: '#f0eeff' },
          { icon: <Users size={24} color="#10b981" />, label: 'Total Students', value: totalStudents, bg: '#ecfdf5' },
          { icon: <BookOpen size={24} color="#f59e0b" />, label: 'Total Courses', value: courses.length, bg: '#fffbeb' },
          { icon: <TrendingUp size={24} color="#ef4444" />, label: 'Avg Revenue/Course', value: `₹${courses.length ? Math.round(totalRevenue / courses.length).toLocaleString('en-IN') : 0}`, bg: '#fef2f2' },
        ].map((s, i) => (
          <div key={i} style={{ ...styles.statCard, background: s.bg }}>
            <div style={styles.statIcon}>{s.icon}</div>
            <div>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Course Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Create New Course</h2>
          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.formGrid}>
              {[
                { key: 'title', label: 'Course Title *', placeholder: 'e.g. Complete Math for Class 10' },
                { key: 'thumbnail', label: 'Thumbnail URL *', placeholder: 'https://...' },
                { key: 'price', label: 'Price (₹) *', placeholder: 'e.g. 1999', type: 'number' },
                { key: 'previewVideoId', label: 'Preview YouTube Video ID *', placeholder: 'e.g. dQw4w9WgXcQ' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key} style={styles.field}>
                  <label style={styles.label}>{label}</label>
                  <input
                    type={type || 'text'} placeholder={placeholder} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    style={styles.input}
                  />
                </div>
              ))}
              <div style={styles.field}>
                <label style={styles.label}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={styles.input}>
                  {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Description *</label>
              <textarea
                placeholder="Course description..." value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              />
            </div>

            {/* Lessons */}
            <div style={styles.lessonsSection}>
              <h3 style={styles.lessonsTitle}>Add Lessons</h3>
              <div style={styles.lessonInputRow}>
                <input placeholder="Lesson title" value={lessonInput.title}
                  onChange={e => setLessonInput({ ...lessonInput, title: e.target.value })}
                  style={{ ...styles.input, flex: 2 }} />
                <input placeholder="YouTube Video ID" value={lessonInput.videoId}
                  onChange={e => setLessonInput({ ...lessonInput, videoId: e.target.value })}
                  style={{ ...styles.input, flex: 2 }} />
                <input placeholder="Duration (e.g. 45 min)" value={lessonInput.duration}
                  onChange={e => setLessonInput({ ...lessonInput, duration: e.target.value })}
                  style={{ ...styles.input, flex: 1 }} />
                <button type="button" onClick={addLesson} style={styles.addLessonBtn}>+ Add</button>
              </div>
              {form.lessons.map((l, i) => (
                <div key={i} style={styles.lessonTag}>
                  <span>{i + 1}. {l.title}</span>
                  <span style={{ color: '#888', fontSize: '0.8rem' }}>{l.duration}</span>
                </div>
              ))}
            </div>

            <button type="submit" disabled={submitting} style={styles.submitBtn}>
              {submitting ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>
      )}

      {/* Courses Table */}
      <div style={styles.tableCard}>
        <h2 style={styles.tableTitle}>All Courses</h2>
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span style={{ flex: 3 }}>Course</span>
            <span style={{ flex: 1, textAlign: 'center' }}>Students</span>
            <span style={{ flex: 1, textAlign: 'center' }}>Revenue</span>
            <span style={{ flex: 1, textAlign: 'center' }}>Price</span>
            <span style={{ flex: 1, textAlign: 'center' }}>Actions</span>
          </div>
          {courses.map(course => (
            <div key={course._id} style={styles.tableRow}>
              <div style={{ flex: 3, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={course.thumbnail} alt="" style={styles.rowThumb} />
                <div>
                  <div style={styles.rowTitle}>{course.title}</div>
                  <div style={styles.rowCat}>{course.category}</div>
                </div>
              </div>
              <span style={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>
                {course.enrolledStudents?.length || 0}
              </span>
              <span style={{ flex: 1, textAlign: 'center', color: '#10b981', fontWeight: 700 }}>
                ₹{course.totalRevenue?.toLocaleString('en-IN')}
              </span>
              <span style={{ flex: 1, textAlign: 'center', color: '#6c63ff', fontWeight: 600 }}>
                ₹{course.price?.toLocaleString('en-IN')}
              </span>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <Link to={`/courses/${course._id}`} style={styles.viewBtn}><Eye size={16} /></Link>
                <button onClick={() => handleDelete(course._id)} style={styles.deleteBtn}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Students per course */}
      <div style={styles.tableCard}>
        <h2 style={styles.tableTitle}>Enrolled Students by Course</h2>
        {courses.map(course => (
          course.enrolledStudents?.length > 0 && (
            <div key={course._id} style={styles.studentSection}>
              <h3 style={styles.studentCourseTitle}>{course.title} ({course.enrolledStudents.length} students)</h3>
              <div style={styles.studentGrid}>
                {course.enrolledStudents.map(s => (
                  <div key={s._id} style={styles.studentCard}>
                    <div style={styles.studentAvatar}>{s.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div style={styles.studentName}>{s.name}</div>
                      <div style={styles.studentEmail}>{s.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '2.5rem 4rem', background: '#f8f9fa', minHeight: '100vh' },
  loading: { textAlign: 'center', padding: '5rem', color: '#888' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '2rem', fontWeight: 800, color: '#1a1a2e' },
  sub: { color: '#666', marginTop: '4px' },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', color: '#fff',
    border: 'none', padding: '12px 24px', borderRadius: '25px', cursor: 'pointer', fontWeight: 600
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' },
  statCard: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '1.5rem', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
  },
  statIcon: { padding: '12px', borderRadius: '12px', background: '#fff' },
  statValue: { fontSize: '1.6rem', fontWeight: 800, color: '#1a1a2e' },
  statLabel: { color: '#666', fontSize: '0.85rem', marginTop: '2px' },
  formCard: { background: '#fff', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  formTitle: { fontSize: '1.3rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontWeight: 600, color: '#333', fontSize: '0.85rem' },
  input: {
    padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0',
    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', width: '100%'
  },
  lessonsSection: { background: '#f8f9fa', borderRadius: '12px', padding: '1.5rem' },
  lessonsTitle: { fontWeight: 700, color: '#1a1a2e', marginBottom: '1rem' },
  lessonInputRow: { display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' },
  addLessonBtn: {
    background: '#6c63ff', color: '#fff', border: 'none', padding: '10px 16px',
    borderRadius: '8px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap'
  },
  lessonTag: {
    display: 'flex', justifyContent: 'space-between', padding: '8px 12px',
    background: '#fff', borderRadius: '8px', marginBottom: '6px', fontSize: '0.9rem'
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', color: '#fff',
    border: 'none', padding: '14px', borderRadius: '10px', fontSize: '1rem',
    fontWeight: 700, cursor: 'pointer'
  },
  tableCard: { background: '#fff', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  tableTitle: { fontSize: '1.3rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1.5rem' },
  table: { display: 'flex', flexDirection: 'column' },
  tableHeader: {
    display: 'flex', padding: '0.75rem 1rem', background: '#f8f9fa',
    borderRadius: '8px', fontWeight: 700, color: '#555', fontSize: '0.85rem', marginBottom: '0.5rem'
  },
  tableRow: {
    display: 'flex', alignItems: 'center', padding: '1rem',
    borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s'
  },
  rowThumb: { width: '50px', height: '35px', borderRadius: '6px', objectFit: 'cover' },
  rowTitle: { fontWeight: 600, color: '#1a1a2e', fontSize: '0.9rem' },
  rowCat: { color: '#888', fontSize: '0.8rem' },
  viewBtn: {
    display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '6px',
    background: '#f0eeff', color: '#6c63ff', textDecoration: 'none'
  },
  deleteBtn: {
    display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '6px',
    background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer'
  },
  studentSection: { marginBottom: '1.5rem' },
  studentCourseTitle: { fontWeight: 700, color: '#1a1a2e', marginBottom: '1rem', fontSize: '1rem' },
  studentGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  studentCard: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px', background: '#f8f9fa', borderRadius: '10px'
  },
  studentAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #5a52d5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0
  },
  studentName: { fontWeight: 600, color: '#1a1a2e', fontSize: '0.85rem' },
  studentEmail: { color: '#888', fontSize: '0.75rem' }
};
