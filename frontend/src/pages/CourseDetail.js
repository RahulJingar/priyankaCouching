import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { getMediaUrl } from '../api/axios';
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
  const src = isPreview
    ? (previewType === 'upload' ? getMediaUrl(previewVideoUrl) : null)
    : (lesson?.videoType === 'upload' ? getMediaUrl(lesson.videoUrl) : null);

  const youtubeId = isPreview
    ? (previewType === 'youtube' ? previewVideoId : null)
    : (lesson?.videoType === 'youtube' ? lesson.videoId : null);

  if (youtubeId) {
    return (
      <iframe width="100%" height="100%"
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
        title="Video" frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen style={{ borderRadius: '12px' }} />
    );
  }
  if (src) {
    return (
      <video src={src} controls autoPlay
        style={{ width: '100%', height: '100%', borderRadius: '12px', background: '#000' }}
        controlsList="nodownload" onContextMenu={e => e.preventDefault()} />
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
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway load nahi hua.'); setPaying(false); return; }

      const { data } = await api.post(`/payment/create-order/${id}`);
      const options = {
        key: data.keyId, amount: data.amount, currency: data.currency,
        name: 'Priyanka Coaching', description: data.courseName, order_id: data.orderId,
        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: id
            });
            toast.success('🎉 Payment successful! Course unlocked.');
            refreshUser({ ...user, enrolledCourses: [...(user.enrolledCourses || []), id] });
            fetchCourse();
          } catch { toast.error('Payment verification failed.'); }
          finally { setPaying(false); }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#6c63ff' },
        modal: { ondismiss: () => setPaying(false) }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { toast.error('Payment failed.'); setPaying(false); });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
      setPaying(false);
    }
  };

  if (loading) return <div className="page-loading">Loading course...</div>;
  if (!course) return null;

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <div className="course-hero">
        <div className="course-hero-content">
          <span className="course-detail-badge">{course.category}</span>
          <h1 className="course-detail-title">{course.title}</h1>
          <p className="course-detail-desc">{course.description}</p>
          <div className="course-detail-meta">
            <span><User size={15} /> {course.instructor}</span>
            <span><BookOpen size={15} /> {course.lessons?.length} Lessons</span>
            <span><Clock size={15} /> Self-paced</span>
          </div>
        </div>
        <div className="course-hero-card">
          <img src={getMediaUrl(course.thumbnail)} alt={course.title} className="course-hero-thumb" />
          <div className="course-price-box">
            <div className="course-price-tag"><IndianRupee size={20} />{course.price.toLocaleString('en-IN')}</div>
            {isPaid ? (
              <div className="course-enrolled-msg"><CheckCircle size={18} color="#10b981" /> You have full access</div>
            ) : (
              <>
                {user
                  ? <button onClick={handlePayment} disabled={paying} className="course-buy-btn">{paying ? 'Opening Payment...' : '💳 Buy Now & Enroll'}</button>
                  : <Link to="/login" className="course-buy-btn">Login to Enroll</Link>
                }
                <div className="course-secure"><ShieldCheck size={13} color="#10b981" /> Secure Payment via Razorpay</div>
                <p className="course-guarantee">✅ Lifetime access • ✅ Certificate</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="player-section">
        <h3 className="player-title">{activeLesson ? `▶ ${activeLesson.title}` : '🎬 Course Preview (Free)'}</h3>
        <div className="player-wrap">
          <VideoPlayer lesson={activeLesson} previewVideoId={course.previewVideoId}
            previewVideoUrl={course.previewVideoUrl} previewType={course.previewType} isPreview={!activeLesson} />
        </div>
      </div>

      <div className="lessons-section">
        <h2 className="lessons-title">Course Content ({course.lessons?.length} Lessons)</h2>
        <div className="lessons-list">
          {course.lessons?.map((lesson, i) => (
            <div key={lesson._id || i}
              className={`lesson-item${isPaid && (lesson.videoId || lesson.videoUrl) ? ' clickable' : ''}${activeLesson?._id === lesson._id ? ' active' : ''}`}
              onClick={() => isPaid && (lesson.videoId || lesson.videoUrl) && setActiveLesson(lesson)}>
              <div className="lesson-left">
                <span className="lesson-num">{i + 1}</span>
                {isPaid && (lesson.videoId || lesson.videoUrl) ? <Play size={15} color="#6c63ff" /> : <Lock size={15} color="#aaa" />}
                <div>
                  <div className="lesson-name">{lesson.title}</div>
                  {lesson.videoType === 'upload' && isPaid && <span className="lesson-uploaded">📁 Uploaded</span>}
                </div>
              </div>
              <span className="lesson-dur">{lesson.duration}</span>
            </div>
          ))}
        </div>
        {!isPaid && (
          <div className="lessons-lock-msg">
            <Lock size={18} color="#6c63ff" />
            <span>Buy this course to unlock all {course.lessons?.length} lessons</span>
          </div>
        )}
      </div>
    </div>
  );
}
