import React, { useState, useEffect } from 'react';
import { interviewAPI, companyAPI, applicationAPI } from '../services/api.js';
import Alert from '../components/Alert.jsx';
import Loader from '../components/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Calendar, 
  Video, 
  MapPin, 
  Plus, 
  Check, 
  X, 
  Info,
  Clock,
  Edit,
  Trash2,
  CheckCircle2
} from 'lucide-react';

const Interviews = () => {
  const { user } = useAuth();
  
  const [interviews, setInterviews] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobApplications, setJobApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Scheduler Form State
  const [showScheduler, setShowScheduler] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingInterviewId, setEditingInterviewId] = useState('');
  const [scheduleForm, setScheduleForm] = useState({
    applicationId: '',
    date: '',
    mode: 'online',
    linkOrVenue: '',
    roundName: 'Technical Interview',
  });

  // Feedback/Complete Outcome Form State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [activeInterviewId, setActiveInterviewId] = useState('');
  const [feedbackForm, setFeedbackForm] = useState({
    status: 'completed',
    feedback: '',
  });

  const fetchInterviewsData = async () => {
    try {
      if (user.role === 'student') {
        const studentInterviews = await interviewAPI.getMyInterviews();
        setInterviews(studentInterviews);
      } else {
        // Recruiters or Admins: load company's posted jobs first
        const postedJobs = await companyAPI.getPostedJobs();
        setActiveJobs(postedJobs);
        if (postedJobs.length > 0) {
          // Keep selection if already selected, otherwise default to first
          const currentSelection = selectedJobId && postedJobs.some((j) => j._id === selectedJobId)
            ? selectedJobId
            : postedJobs[0]._id;
          setSelectedJobId(currentSelection);
          
          const activeInterviews = await interviewAPI.getForJob(currentSelection);
          setInterviews(activeInterviews);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch interview schedules. Please reload.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInterviewsData();
    }
  }, [user]);

  // Load applications when recruiter selects a job to schedule interviews for
  useEffect(() => {
    const loadApplications = async () => {
      if (selectedJobId && (user.role === 'company' || user.role === 'coordinator' || user.role === 'admin')) {
        try {
          const apps = await applicationAPI.getForJob(selectedJobId);
          // Filter to apps that are screening/applied or ready for interview
          setJobApplications(apps.filter((a) => a.status !== 'rejected' && a.status !== 'offered'));
          
          // Refresh interview listings for selected job
          const jobInterviews = await interviewAPI.getForJob(selectedJobId);
          setInterviews(jobInterviews);
        } catch (err) {
          console.error(err);
        }
      }
    };
    loadApplications();
  }, [selectedJobId]);

  const handleSchedulerChange = (e) => {
    setScheduleForm({ ...scheduleForm, [e.target.id]: e.target.value });
  };

  // Reschedule or schedule new round
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!scheduleForm.date || !scheduleForm.linkOrVenue || !scheduleForm.roundName) {
      setError('Please provide date, round name, and link/venue details.');
      return;
    }

    setActionLoading(true);
    try {
      if (isEditing) {
        // Submit rescheduling/modification update
        await interviewAPI.update(editingInterviewId, {
          date: scheduleForm.date,
          mode: scheduleForm.mode,
          linkOrVenue: scheduleForm.linkOrVenue,
          roundName: scheduleForm.roundName
        });
        setSuccess('Interview details updated successfully! Notification dispatched to candidate.');
      } else {
        // Submit new schedule creation
        if (!scheduleForm.applicationId) {
          setError('Please select an applicant.');
          setActionLoading(false);
          return;
        }
        await interviewAPI.schedule(scheduleForm);
        setSuccess('Interview round scheduled successfully! Email alert sent to student.');
      }
      
      setShowScheduler(false);
      setIsEditing(false);
      setEditingInterviewId('');
      setScheduleForm({
        applicationId: '',
        date: '',
        mode: 'online',
        linkOrVenue: '',
        roundName: 'Technical Interview',
      });
      await fetchInterviewsData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit interview details.');
    } finally {
      setActionLoading(false);
    }
  };

  // Form submission for completing interview
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      await interviewAPI.update(activeInterviewId, feedbackForm);
      setSuccess('Interview round details updated successfully!');
      setShowFeedbackModal(false);
      setFeedbackForm({ status: 'completed', feedback: '' });
      await fetchInterviewsData();
    } catch (err) {
      console.error(err);
      setError('Error updating interview record.');
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger editing details modal
  const startEditInterview = (interview) => {
    setIsEditing(true);
    setEditingInterviewId(interview._id);
    
    // Format date value for input datetime-local field (YYYY-MM-DDThh:mm)
    const formattedDate = interview.date 
      ? new Date(interview.date).toISOString().slice(0, 16)
      : '';

    setScheduleForm({
      applicationId: interview.application?._id || '',
      date: formattedDate,
      mode: interview.mode || 'online',
      linkOrVenue: interview.linkOrVenue || '',
      roundName: interview.roundName || 'Technical Interview',
    });
    
    setShowScheduler(true);
  };

  // Cancel interview round directly
  const handleCancelInterview = async (interviewId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled interview?')) {
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await interviewAPI.update(interviewId, {
        status: 'cancelled',
        feedback: 'Interview was cancelled by recruiter.'
      });
      setSuccess('Interview round has been cancelled. Candidate notified.');
      await fetchInterviewsData();
    } catch (err) {
      console.error(err);
      setError('Failed to cancel interview round.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader message="Accessing calendar database..." />;

  const isRecruiter = user.role === 'company' || user.role === 'coordinator' || user.role === 'admin';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {error && <Alert type="danger" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Recruiter Selector Header */}
      {isRecruiter && (
        <section className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="form-label" style={{ margin: 0 }}>Select Job Listing:</span>
            <select
              className="form-control form-select"
              style={{ width: '250px' }}
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              {activeJobs.map((j) => (
                <option key={j._id} value={j._id}>{j.title}</option>
              ))}
            </select>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={() => {
              setIsEditing(false);
              setEditingInterviewId('');
              setScheduleForm({
                applicationId: '',
                date: '',
                mode: 'online',
                linkOrVenue: '',
                roundName: 'Technical Interview',
              });
              setShowScheduler(true);
            }}
          >
            <Plus size={16} /> Schedule Interview
          </button>
        </section>
      )}

      {/* Interviews display grid */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '18px', margin: 0 }}>Active Scheduled Rounds</h3>
        
        {interviews.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
            <Calendar size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h4>No scheduled interviews found</h4>
            <p>Interviews scheduled by recruiters for active jobs will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {interviews.map((interview) => (
              <div key={interview._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>{interview.roundName}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Applicant: <strong>{interview.student?.user?.name || 'Synced Profile'}</strong>
                    </span>
                    {interview.student?.rollNumber && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Roll: {interview.student.rollNumber}</div>
                    )}
                  </div>
                  <span className={`badge badge-${
                    interview.status === 'scheduled' ? 'warning' : 
                    interview.status === 'completed' ? 'success' : 'danger'
                  }`}>{interview.status}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} style={{ color: 'var(--text-muted)' }} />{' '}
                    {new Date(interview.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {interview.mode === 'online' ? (
                      <Video size={14} style={{ color: 'var(--text-muted)' }} />
                    ) : (
                      <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                    )}{' '}
                    {interview.mode === 'online' ? (
                      <a href={interview.linkOrVenue} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: '500' }}>
                        Join Video Call <ExternalLink size={11} style={{ verticalAlign: 'middle' }} />
                      </a>
                    ) : interview.linkOrVenue}
                  </div>
                </div>

                {interview.feedback && (
                  <div style={{
                    fontSize: '13px',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.01)',
                    borderRadius: '8px',
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-secondary)'
                  }}>
                    <strong>Recruiter Feedback:</strong> {interview.feedback}
                  </div>
                )}

                {isRecruiter && interview.status === 'scheduled' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--card-border)', paddingTop: '12px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ flex: 1, fontSize: '12px', padding: '6px' }}
                        onClick={() => startEditInterview(interview)}
                      >
                        <Edit size={12} /> Reschedule
                      </button>
                      
                      <button 
                        className="btn btn-danger" 
                        style={{ flex: 1, fontSize: '12px', padding: '6px' }}
                        onClick={() => handleCancelInterview(interview._id)}
                      >
                        <Trash2 size={12} /> Cancel
                      </button>
                    </div>
                    
                    <button 
                      className="btn btn-primary" 
                      style={{ fontSize: '13px', padding: '8px' }}
                      onClick={() => {
                        setActiveInterviewId(interview._id);
                        setFeedbackForm({ status: 'completed', feedback: '' });
                        setShowFeedbackModal(true);
                      }}
                    >
                      <CheckCircle2 size={13} /> Complete & Log Feedback
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Scheduler Dialog Modal (Dual state: Create / Edit) */}
      {showScheduler && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(5, 7, 12, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>
                {isEditing ? 'Reschedule Interview details' : 'Schedule Interview Round'}
              </h2>
              <button 
                onClick={() => setShowScheduler(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              {/* Select Applicant field - Only rendered when creating a new interview */}
              {!isEditing ? (
                <div className="form-group">
                  <label className="form-label" htmlFor="applicationId">Select Applicant</label>
                  <select
                    id="applicationId"
                    className="form-control form-select"
                    value={scheduleForm.applicationId}
                    onChange={handleSchedulerChange}
                    required
                  >
                    <option value="">Choose Applicant</option>
                    {jobApplications.map((app) => (
                      <option key={app._id} value={app._id}>
                        {app.student.user.name} ({app.student.rollNumber})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ paddingBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Recalibrating schedule coordinates for fixed candidate.
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="roundName">Round Name</label>
                <input
                  id="roundName"
                  type="text"
                  className="form-control"
                  value={scheduleForm.roundName}
                  onChange={handleSchedulerChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="date">Date & Time</label>
                <input
                  id="date"
                  type="datetime-local"
                  className="form-control"
                  value={scheduleForm.date}
                  onChange={handleSchedulerChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mode">Interview Mode</label>
                <select
                  id="mode"
                  className="form-control form-select"
                  value={scheduleForm.mode}
                  onChange={handleSchedulerChange}
                  required
                >
                  <option value="online">Online Video Call</option>
                  <option value="offline">Offline / In-person</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="linkOrVenue">
                  {scheduleForm.mode === 'online' ? 'Online Meet Link' : 'Office/Campus Venue'}
                </label>
                <input
                  id="linkOrVenue"
                  type="text"
                  className="form-control"
                  placeholder={scheduleForm.mode === 'online' ? 'https://meet.google.com/abc-defg-hij' : 'Placement Room A, Block 3'}
                  value={scheduleForm.linkOrVenue}
                  onChange={handleSchedulerChange}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowScheduler(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Confirm Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Outcome Update Modal */}
      {showFeedbackModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(5, 7, 12, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Update Interview Outcome</h2>
              <button 
                onClick={() => { setShowFeedbackModal(false); setActiveInterviewId(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleFeedbackSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="status">Round Status</label>
                <select
                  id="status"
                  className="form-control form-select"
                  value={feedbackForm.status}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, status: e.target.value })}
                  required
                >
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="feedback">Evaluation Feedback</label>
                <textarea
                  id="feedback"
                  className="form-control"
                  rows="4"
                  placeholder="Provide brief evaluation details for student..."
                  value={feedbackForm.feedback}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowFeedbackModal(false); setActiveInterviewId(''); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Updating...' : 'Log Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal utility helper to show an external link icon
const ExternalLink = ({ size = 12, style = {} }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ display: 'inline', marginLeft: '4px', ...style }}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export default Interviews;
