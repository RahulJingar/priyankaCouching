import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { IndianRupee, Play, Lock, CheckCircle, BookOpen, Clock, User, ShieldCheck } from 'lucide-react';

const loadRazorpay = () =>
  new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function VideoPlayer({ lesson, previewVideoId, previewVideoUrl, previewType, isPreview }) {
  const videoRef = useRef(null);
  const src = isPreview
    ? (previewType === 'upload' ? `http://localhost:5000${previewVideoUrl}` : null)
    : (lesson?.videoType === 'upload' ? `http://localhost:5000${lesson.videoUrl}` : null);

  const youtubeId = isPreview
    ? (previewType === 'youtube' ? previewVideoId : null)
    : (lesson?.videoType === 'youtube' ? lesson.videoId : null);

  if (youtubeId) {
    return (
      <iframe
        width="100%" height="100%"
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
        title="Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ borderRadius: '12px' }}
      />
    );
  }

  if (src) {
    return (
      <video
        ref={videoRef}
        src={src}
        controls
        autoPlay
        style={{ width: '100%', height: '100%', borderRadius: '12px', background: '#000' }}
        controlsList="nodownload"
        onContextMenu={e => e.preventDefault()}
      />
    );
  }

  return <div style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>No video available</div>;
}

export default function CourseDetail() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);

  const fetchCourse = () =>
    api.get(`/courses/${id}`).then(r => { setCourse(r.data); setLoading(false); }).catch(() => navigate('/courses'));

  useEffect(() => { fetchCourse(); }, [id]);

  const isPaid = course?.isPaid || user?.role === 'teacher';

  const handlePayment = async () => {
    if (!user) return navigate('/login');
    setPaying(true);
    try {
      const { data } = await api.post(`/payment/create-order/${id}`);

      // Demo mode - Razorpay keys configure nahi hain
      if (data.demoMode) {
        await api.post('/payment/demo-enroll', { courseId: id });
        toast.success('🎉 Enrolled successfully! Course unlocked.');
        const updatedUser = { ...user, enrolledCourses: [...(user.enrolledCourses || []), id] };
        refreshUser(updatedUser);
        fetchCourse();
        setPaying(false);
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Payment gateway failed to load.');
        setPaying(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Priyanka Coaching',
        description: data.courseName,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: id
            });
            toast.success('🎉 Payment successful! Course unlocked.');
            const updatedUser = { ...user, enrolledCourses: [...(user.enrolledCourses || []), id] };
            refreshUser(updatedUser);
            fetchCourse();
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#6c63ff' },
        modal: { ondismiss: () => setPaying(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { toast.error('Payment failed. Please try again.'); setPaying(false); });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
      setPaying(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading course...</div>;
  if (!course) return null;

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.badge}>{course.category}</span>
          <h1 style={styles.title}>{course.title}</h1>
          <p style={styles.desc}>{course.description}</p>
          <div style={styles.meta}>
            <span style={styles.metaItem}><User size={16} /> {course.instructor}</span>
            <span style={styles.metaItem}><BookOpen size={16} /> {course.lessons?.length} Lessons</span>
            <span style={styles.metaItem}><Clock size={16} /> Self-paced</span>
          </div>
        </div>
        <div style={styles.heroCard}>
          <img src={course.thumbnail?.startsWith('/uploads') ? `http://localhost:5000${course.thumbnail}` : course.thumbnail} alt={course.title} style={styles.thumbnail} />
          <div style={styles.priceSection}>
            <div style={styles.price}><IndianRupee size={22} />{course.price.toLocaleString('en-IN')}</div>
            {isPaid ? (
              <div style={styles.enrolledMsg}><CheckCircle size={20} color="#10b981" /><span>You have full access</span></div>
            ) : (
              <>
                {user ? (
                  <button onClick={handlePayment} disabled={paying} style={styles.enrollBtn}>
                    {paying ? 'Opening Payment...' : '💳 Buy Now & Enroll'}
                  </button>
                ) : (
                  <Link to="/login" style={styles.enrollBtn}>Login to Enroll</Link>
                )}
                <div style={styles.secureTag}><ShieldCheck size={14} color="#10b981" /> Secure Payment via Razorpay</div>
                <p style={styles.guarantee}>✅ Lifetime access &nbsp;•&nbsp; ✅ Certificate</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div style={styles.playerSection}>
        <h3 style={styles.playerTitle}>
          {activeLesson ? `▶ ${activeLesson.title}` : '🎬 Course Preview (Free)'}
        </h3>
        <div style={styles.playerWrap}>
          <VideoPlayer
            lesson={activeLesson}
            previewVideoId={course.previewVideoId}
            previewVideoUrl={course.previewVideoUrl}
            previewType={course.previewType}
            isPreview={!activeLesson}
          />
        </div>
      </div>

      {/* Lessons */}
      <div style={styles.lessonsSection}>
        <h2 style={styles.lessonsTitle}>Course Content ({course.lessons?.length} Lessons)</h2>
        <div style={styles.lessonsList}>
          {course.lessons?.map((lesson, i) => (
            <div
              key={lesson._id || i}
              style={{
                ...styles.lessonItem,
                ...(isPaid && (lesson.videoId || lesson.videoUrl) ? styles.lessonClickable : {}),
                ...(activeLesson?._id === lesson._id ? styles.lessonActive : {})
              }}
              onClick={() => isPaid && (lesson.videoId || lesson.videoUrl) && setActiveLesson(lesson)}
            >
              <div style={styles.lessonLeft}>
                <span style={styles.lessonNum}>{i + 1}</span>
                {isPaid && (lesson.videoId || lesson.videoUrl)
                  ? <Play size={16} color="#6c63ff" />
                  : <Lock size={16} color="#aaa" />}
                <div>
                  <div style={styles.lessonTitle}>{lesson.title}</div>
                  {lesson.videoType === 'upload' && isPaid && <span style={styles.uploadedTag}>📁 Uploaded Video</span>}
                </div>
              </div>
              <span style={styles.lessonDuration}>{lesson.duration}</span>
            </div>
          ))}
        </div>
        {!isPaid && (
          <div style={styles.lockMsg}>
            <Lock size={20} color="#6c63ff" />
            <span>Buy this course to unlock all {course.lessons?.length} lessons</span>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { background: '#f8f9fa', minHeight: '100vh' },
  loading: { textAlign: 'center', padding: '5rem', fontSize: '1.1rem', color: '#888' },
  hero: { display: 'flex', gap: '3rem', padding: '3rem 4rem', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', alignItems: 'flex-start' },
  heroContent: { flex: 1 },
  badge: { display: 'inline-block', background: 'rgba(108,99,255,0.8)', color: '#fff', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' },
  title: { fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', lineHeight: 1.3 },
  desc: { color: '#ccc', lineHeight: 1.7, marginBottom: '1.5rem' },
  meta: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '6px', color: '#aaa', fontSize: '0.9rem' },
  heroCard: { width: '320px', background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', flexShrink: 0 },
  thumbnail: { width: '100%', height: '180px', objectFit: 'cover' },
  priceSection: { padding: '1.5rem' },
  price: { display: 'flex', alignItems: 'center', fontSize: '1.8rem', fontWeight: 800, color: '#6c63ff', marginBottom: '1rem' },
  enrollBtn: { display: 'block', width: '100%', background: 'linear-gradient(135deg, #6c63ff, #5a52d5)', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', marginBottom: '0.75rem' },
  enrolledMsg: { display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 600, padding: '10px 0' },
  secureTag: { display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.8rem', marginBottom: '0.5rem' },
  guarantee: { color: '#888', fontSize: '0.78rem', textAlign: 'center' },
  playerSection: { padding: '2rem 4rem', background: '#fff' },
  playerTitle: { fontSize: '1.2rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1rem' },
  playerWrap: { width: '100%', height: '480px', borderRadius: '12px', overflow: 'hidden', background: '#000' },
  lessonsSection: { padding: '2rem 4rem 4rem' },
  lessonsTitle: { fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '1.5rem' },
  lessonsList: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  lessonItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0' },
  lessonClickable: { cursor: 'pointer' },
  lessonActive: { background: '#f0eeff' },
  lessonLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  lessonNum: { width: '28px', height: '28px', borderRadius: '50%', background: '#f0eeff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#6c63ff' },
  lessonTitle: { fontWeight: 500, color: '#333', fontSize: '0.95rem' },
  uploadedTag: { fontSize: '0.75rem', color: '#6c63ff' },
  lessonDuration: { color: '#888', fontSize: '0.85rem' },
  lockMsg: { display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', padding: '1.5rem', color: '#6c63ff', fontWeight: 600, background: '#f0eeff', borderRadius: '0 0 12px 12px' }
};
