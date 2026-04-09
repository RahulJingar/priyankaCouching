import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getMediaUrl } from '../api/axios';
import { IndianRupee, Users, BookOpen, TrendingUp, Plus, Trash2, Eye, Upload, Video, ChevronDown, ChevronUp, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];

function UploadProgress({ progress }) {
  if (progress === 0 || progress === 100) return null;
  return (
    <div style={styles.progressWrap}>
      <div style={{ ...styles.progressBar, width: `${progress}%` }} />
      <span style={styles.progressText}>{progress}%</span>
    </div>
  );
}

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState(null);

  // Course form
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'Mathematics', thumbnailUrl: '', thumbnailFile: null, previewVideoId: '', previewType: 'youtube', previewFile: null });
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Lesson form per course
  const [lessonForms, setLessonForms] = useState({});

  const fetchData = () => {
    api.get('/courses/teacher/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price || !form.category)
      return toast.error('Fill all required fields');
    if (!form.thumbnailUrl && !form.thumbnailFile)
      return toast.error('Thumbnail is required');

    setSubmitting(true);
    setUploadProgress(0);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('category', form.category);
      fd.append('previewType', form.previewType);
      if (form.previewType === 'youtube') fd.append('previewVideoId', form.previewVideoId);
      if (form.thumbnailFile) fd.append('thumbnailFile', form.thumbnailFile);
      else fd.append('thumbnailUrl', form.thumbnailUrl);

      const { data: course } = await api.post('/courses', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setUploadProgress(Math.round(e.loaded * 100 / e.total))
      });

      // Upload preview video if selected
      if (form.previewType === 'upload' && form.previewFile) {
        const vfd = new FormData();
        vfd.append('video', form.previewFile);
        await api.post(`/courses/${course._id}/preview-video`, vfd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: e => setUploadProgress(Math.round(e.loaded * 100 / e.total))
        });
      }

      toast.success('Course created!');
      setShowForm(false);
      setForm({ title: '', description: '', price: '', category: 'Mathematics', thumbnailUrl: '', thumbnailFile: null, previewVideoId: '', previewType: 'youtube', previewFile: null });
      setUploadProgress(0);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLesson = async (courseId) => {
    const lf = lessonForms[courseId] || {};
    if (!lf.title) return toast.error('Lesson title required');
    if (lf.videoType === 'youtube' && !lf.videoId) return toast.error('YouTube Video ID required');
    if (lf.videoType === 'upload' && !lf.videoFile) return toast.error('Please select a video file');

    const fd = new FormData();
    fd.append('title', lf.title);
    fd.append('duration', lf.duration || '');
    fd.append('videoType', lf.videoType || 'youtube');
    if (lf.videoType === 'youtube') fd.append('videoId', lf.videoId);
    if (lf.videoType === 'upload') fd.append('video', lf.videoFile);

    try {
      await api.post(`/courses/${courseId}/lessons`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setUploadProgress(Math.round(e.loaded * 100 / e.total))
      });
      toast.success('Lesson added!');
      setLessonForms({ ...lessonForms, [courseId]: { title: '', duration: '', videoType: 'youtube', videoId: '', videoFile: null } });
      setUploadProgress(0);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add lesson');
    }
  };

  const handleDeleteLesson = async (courseId, lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    await api.delete(`/courses/${courseId}/lessons/${lessonId}`);
    toast.success('Lesson deleted');
    fetchData();
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    await api.delete(`/courses/${id}`);
    toast.success('Course deleted');
    fetchData();
  };

  const setLF = (courseId, field, value) =>
    setLessonForms(prev => ({ ...prev, [courseId]: { ...(prev[courseId] || {}), [field]: value } }));

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;
  const { courses = [], totalRevenue = 0, totalStudents = 0 } = data || {};

  return (
    <div className="dashboard-page">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Teacher Dashboard</h1>
          <p style={styles.sub}>Welcome back, Priyanka!</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'Add New Course'}
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
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

      {/* Create Course Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Create New Course</h2>
          <form onSubmit={handleCreateCourse} style={styles.form}>
            <div className="form-grid-2">
              <div style={styles.field}>
                <label style={styles.label}>Course Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Complete Math for Class 10" style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Price (₹) *</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 1999" style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Category *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={styles.input}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Thumbnail</label>
                <div style={styles.fileOrUrl}>
                  <input placeholder="Paste image URL" value={form.thumbnailUrl} onChange={e => setForm({ ...form, thumbnailUrl: e.target.value, thumbnailFile: null })} style={{ ...styles.input, flex: 1 }} />
                  <span style={styles.orText}>OR</span>
                  <label style={styles.fileBtn}>
                    <Upload size={14} /> Upload
                    <input type="file" accept="image/*" hidden onChange={e => setForm({ ...form, thumbnailFile: e.target.files[0], thumbnailUrl: '' })} />
                  </label>
                </div>
                {form.thumbnailFile && <span style={styles.fileName}>📎 {form.thumbnailFile.name}</span>}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description *</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Course description..." style={{ ...styles.input, height: '80px', resize: 'vertical' }} />
            </div>

            {/* Preview Video */}
            <div style={styles.field}>
              <label style={styles.label}>Preview Video (Free for all)</label>
              <div style={styles.videoTypeTabs}>
                <button type="button" onClick={() => setForm({ ...form, previewType: 'youtube' })} style={{ ...styles.tab, ...(form.previewType === 'youtube' ? styles.tabActive : {}) }}>
                  <Video size={14} /> YouTube URL
                </button>
                <button type="button" onClick={() => setForm({ ...form, previewType: 'upload' })} style={{ ...styles.tab, ...(form.previewType === 'upload' ? styles.tabActive : {}) }}>
                  <Upload size={14} /> Upload Video
                </button>
              </div>
              {form.previewType === 'youtube' ? (
                <input value={form.previewVideoId} onChange={e => setForm({ ...form, previewVideoId: e.target.value })} placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)" style={styles.input} />
              ) : (
                <label style={styles.videoUploadArea}>
                  <Upload size={24} color="#6c63ff" />
                  <span>{form.previewFile ? form.previewFile.name : 'Click to select preview video (MP4, max 500MB)'}</span>
                  <input type="file" accept="video/*" hidden onChange={e => setForm({ ...form, previewFile: e.target.files[0] })} />
                </label>
              )}
            </div>

            <UploadProgress progress={uploadProgress} />
            <button type="submit" disabled={submitting} style={styles.submitBtn}>
              {submitting ? `Creating... ${uploadProgress > 0 ? uploadProgress + '%' : ''}` : 'Create Course'}
            </button>
          </form>
        </div>
      )}

      {/* Courses List */}
      <div style={styles.tableCard}>
        <h2 style={styles.tableTitle}>All Courses ({courses.length})</h2>

        {courses.map(course => {
          const lf = lessonForms[course._id] || { title: '', duration: '', videoType: 'youtube', videoId: '', videoFile: null };
          const isExpanded = expandedCourse === course._id;

          return (
            <div key={course._id} style={styles.courseBlock}>
              {/* Course Row */}
              <div className="course-row">
                <img src={getMediaUrl(course.thumbnail)} alt="" style={styles.rowThumb} />
                <div style={{ flex: 3 }}>
                  <div style={styles.rowTitle}>{course.title}</div>
                  <div style={styles.rowMeta}>{course.category} • {course.lessons?.length || 0} lessons • {course.enrolledStudents?.length || 0} students</div>
                </div>
                <div style={styles.rowStats}>
                  <span style={styles.revenueTag}>₹{course.totalRevenue?.toLocaleString('en-IN')}</span>
                  <span style={styles.priceTag}>₹{course.price?.toLocaleString('en-IN')}</span>
                </div>
                <div style={styles.rowActions}>
                  <Link to={`/courses/${course._id}`} style={styles.iconBtn}><Eye size={16} /></Link>
                  <button onClick={() => setExpandedCourse(isExpanded ? null : course._id)} style={{ ...styles.iconBtn, background: '#fffbeb', color: '#f59e0b' }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button onClick={() => handleDeleteCourse(course._id)} style={{ ...styles.iconBtn, background: '#fef2f2', color: '#ef4444' }}><Trash2 size={16} /></button>
                </div>
              </div>

              {/* Expanded: Lessons + Add Lesson */}
              {isExpanded && (
                <div style={styles.expandedSection}>
                  {/* Existing Lessons */}
                  <h4 style={styles.lessonsHeading}>Lessons</h4>
                  {course.lessons?.length === 0 && <p style={styles.noLessons}>No lessons yet. Add below.</p>}
                  {course.lessons?.map((lesson, i) => (
                    <div key={lesson._id} style={styles.lessonRow}>
                      <span style={styles.lessonNum}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <span style={styles.lessonName}>{lesson.title}</span>
                        <span style={styles.lessonType}>{lesson.videoType === 'upload' ? '📁 Uploaded' : '▶ YouTube'}</span>
                      </div>
                      <span style={styles.lessonDur}>{lesson.duration}</span>
                      <button onClick={() => handleDeleteLesson(course._id, lesson._id)} style={styles.delLessonBtn}><X size={14} /></button>
                    </div>
                  ))}

                  {/* Add Lesson Form */}
                  <div style={styles.addLessonForm}>
                    <h4 style={styles.lessonsHeading}>Add New Lesson</h4>
                    <div className="lesson-input-grid">
                      <input placeholder="Lesson title *" value={lf.title || ''} onChange={e => setLF(course._id, 'title', e.target.value)} style={styles.input} />
                      <input placeholder="Duration (e.g. 45 min)" value={lf.duration || ''} onChange={e => setLF(course._id, 'duration', e.target.value)} style={styles.input} />
                    </div>

                    <div style={styles.videoTypeTabs}>
                      <button type="button" onClick={() => setLF(course._id, 'videoType', 'youtube')} style={{ ...styles.tab, ...((lf.videoType || 'youtube') === 'youtube' ? styles.tabActive : {}) }}>
                        <Video size={14} /> YouTube
                      </button>
                      <button type="button" onClick={() => setLF(course._id, 'videoType', 'upload')} style={{ ...styles.tab, ...(lf.videoType === 'upload' ? styles.tabActive : {}) }}>
                        <Upload size={14} /> Upload from Phone/PC
                      </button>
                    </div>

                    {(lf.videoType || 'youtube') === 'youtube' ? (
                      <input placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)" value={lf.videoId || ''} onChange={e => setLF(course._id, 'videoId', e.target.value)} style={styles.input} />
                    ) : (
                      <label style={styles.videoUploadArea}>
                        <Upload size={22} color="#6c63ff" />
                        <span>{lf.videoFile ? lf.videoFile.name : 'Click to select video from Phone/PC (MP4, max 500MB)'}</span>
                        <input type="file" accept="video/*" hidden onChange={e => setLF(course._id, 'videoFile', e.target.files[0])} />
                      </label>
                    )}

                    <UploadProgress progress={uploadProgress} />
                    <button type="button" onClick={() => handleAddLesson(course._id)} style={styles.addLessonBtn}>
                      <Plus size={16} /> Add Lesson
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Students Section */}
      <div style={styles.tableCard}>
        <h2 style={styles.tableTitle}>Enrolled Students by Course</h2>
        {courses.every(c => !c.enrolledStudents?.length) && <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>No students enrolled yet.</p>}
        {courses.map(course => course.enrolledStudents?.length > 0 && (
          <div key={course._id} style={styles.studentSection}>
            <h3 style={styles.studentCourseTitle}>{course.title} <span style={styles.studentCount}>({course.enrolledStudents.length} students)</span></h3>
            <div className="student-grid">
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
  addBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '25px', cursor: 'pointer', fontWeight: 600 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' },
  statCard: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  statIcon: { padding: '12px', borderRadius: '12px', background: '#fff' },
  statValue: { fontSize: '1.6rem', fontWeight: 800, color: '#1a1a2e' },
  statLabel: { color: '#666', fontSize: '0.85rem', marginTop: '2px' },
  formCard: { background: '#fff', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  formTitle: { fontSize: '1.3rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontWeight: 600, color: '#333', fontSize: '0.85rem' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', width: '100%' },
  fileOrUrl: { display: 'flex', alignItems: 'center', gap: '8px' },
  orText: { color: '#888', fontSize: '0.85rem', whiteSpace: 'nowrap' },
  fileBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#f0eeff', color: '#6c63ff', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' },
  fileName: { fontSize: '0.8rem', color: '#6c63ff', marginTop: '4px' },
  videoTypeTabs: { display: 'flex', gap: '8px', marginBottom: '8px' },
  tab: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '20px', border: '1.5px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 },
  tabActive: { background: '#6c63ff', color: '#fff', border: '1.5px solid #6c63ff' },
  videoUploadArea: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '2rem', border: '2px dashed #6c63ff', borderRadius: '12px', cursor: 'pointer', color: '#6c63ff', fontSize: '0.9rem', textAlign: 'center' },
  progressWrap: { background: '#f0f0f0', borderRadius: '8px', height: '8px', overflow: 'hidden', position: 'relative' },
  progressBar: { height: '100%', background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', transition: 'width 0.3s' },
  progressText: { position: 'absolute', right: '8px', top: '-18px', fontSize: '0.75rem', color: '#6c63ff' },
  submitBtn: { background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' },
  tableCard: { background: '#fff', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  tableTitle: { fontSize: '1.3rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1.5rem' },
  courseBlock: { border: '1px solid #f0f0f0', borderRadius: '12px', marginBottom: '1rem', overflow: 'hidden' },
  courseRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem' },
  rowThumb: { width: '60px', height: '42px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 },
  rowTitle: { fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' },
  rowMeta: { color: '#888', fontSize: '0.8rem', marginTop: '2px' },
  rowStats: { display: 'flex', gap: '8px', alignItems: 'center' },
  revenueTag: { background: '#ecfdf5', color: '#10b981', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 },
  priceTag: { background: '#f0eeff', color: '#6c63ff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 },
  rowActions: { display: 'flex', gap: '8px' },
  iconBtn: { display: 'flex', alignItems: 'center', padding: '7px', borderRadius: '8px', background: '#f0eeff', color: '#6c63ff', border: 'none', cursor: 'pointer', textDecoration: 'none' },
  expandedSection: { padding: '1.5rem', background: '#f8f9fa', borderTop: '1px solid #f0f0f0' },
  lessonsHeading: { fontWeight: 700, color: '#1a1a2e', marginBottom: '0.75rem', fontSize: '0.95rem' },
  noLessons: { color: '#aaa', fontSize: '0.85rem', marginBottom: '1rem' },
  lessonRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#fff', borderRadius: '8px', marginBottom: '6px' },
  lessonNum: { width: '24px', height: '24px', borderRadius: '50%', background: '#f0eeff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#6c63ff', flexShrink: 0 },
  lessonName: { fontWeight: 500, color: '#333', fontSize: '0.9rem' },
  lessonType: { marginLeft: '8px', fontSize: '0.75rem', color: '#888' },
  lessonDur: { color: '#888', fontSize: '0.8rem' },
  delLessonBtn: { background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  addLessonForm: { marginTop: '1.5rem', padding: '1.5rem', background: '#fff', borderRadius: '12px' },
  lessonInputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  addLessonBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, marginTop: '1rem' },
  studentSection: { marginBottom: '1.5rem' },
  studentCourseTitle: { fontWeight: 700, color: '#1a1a2e', marginBottom: '1rem', fontSize: '1rem' },
  studentCount: { color: '#6c63ff', fontWeight: 600 },
  studentGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  studentCard: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f8f9fa', borderRadius: '10px' },
  studentAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0 },
  studentName: { fontWeight: 600, color: '#1a1a2e', fontSize: '0.85rem' },
  studentEmail: { color: '#888', fontSize: '0.75rem' }
};
