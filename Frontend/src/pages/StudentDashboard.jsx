import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { studentAPI, applicationAPI, interviewAPI } from '../services/api.js';
import Alert from '../components/Alert.jsx';
import Loader from '../components/Loader.jsx';
import { 
  Sparkles, 
  FileText, 
  Calendar, 
  Award, 
  GraduationCap, 
  ClipboardList 
} from 'lucide-react';

const StudentDashboard = () => {
  const [eligibleJobs, setEligibleJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myInterviews, setMyInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobs, apps, interviews] = await Promise.all([
          studentAPI.getEligibleJobs(),
          applicationAPI.getMyApplications(),
          interviewAPI.getMyInterviews()
        ]);
        
        setEligibleJobs(jobs.slice(0, 3)); // Limit recommended to top 3
        setMyApplications(apps);
        setMyInterviews(interviews);
      } catch (err) {
        console.error('Failed to load student dashboard:', err.message);
        setError('Error fetching dashboard records. Please reload.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loader message="Analyzing placement opportunities..." />;

  // Quick stats extraction
  const totalApplied = myApplications.length;
  const activeInterviews = myInterviews.filter((i) => i.status === 'scheduled').length;
  const offersCount = myApplications.filter((a) => a.status === 'offered').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {error && <Alert type="danger" message={error} />}

      {/* Statistics Cards Wrapper */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px'
      }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', marginBottom: '4px' }}>Jobs Applied</h4>
            <span style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>{totalApplied}</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3b82f6'
          }}>
            <Calendar size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', marginBottom: '4px' }}>Scheduled Interviews</h4>
            <span style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>{activeInterviews}</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--success)'
          }}>
            <Award size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', marginBottom: '4px' }}>Offers Secured</h4>
            <span style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>{offersCount}</span>
          </div>
        </div>
      </section>

      {/* Split grid for Eligible jobs & applications list */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: '32px'
      }}>
        {/* Recommended Eligible Jobs */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', margin: 0 }}>Recommended For You</h3>
            <NavLink to="/student/eligible-jobs" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              View All Eligible
            </NavLink>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {eligibleJobs.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                <Sparkles size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <p>No eligible job matches found for your current CGPA/backlogs profile.</p>
              </div>
            ) : (
              eligibleJobs.map((job) => (
                <div key={job._id} className="glass-card" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{job.title}</h4>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{(job.company?.companyName || 'Unknown Company')} • {job.location}</span>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <span className="badge badge-info" style={{ fontSize: '10px' }}>{job.jobType}</span>
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>{job.package} LPA</span>
                    </div>
                  </div>
                  <NavLink to={`/student/jobs?id=${job._id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    Apply
                  </NavLink>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Upcoming Interviews Round Panel */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', margin: 0 }}>Upcoming Interviews</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {myInterviews.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                <Calendar size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <p>No scheduled interviews at this time.</p>
              </div>
            ) : (
              myInterviews.map((interview) => (
                <div key={interview._id} className="glass-card" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-warning" style={{ fontSize: '10px' }}>{interview.roundName}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(interview.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px' }}>{interview.job?.title || 'Unknown Job'}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{interview.job?.company?.companyName || 'Unknown Company'}</span>
                  </div>
                  <div style={{
                    fontSize: '13px',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '6px',
                    border: '1px solid var(--card-border)'
                  }}>
                    <strong>{interview.mode === 'online' ? 'Link:' : 'Venue:'}</strong>{' '}
                    {interview.mode === 'online' ? (
                      <a href={interview.linkOrVenue} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'none' }}>
                        Join Online Meeting
                      </a>
                    ) : interview.linkOrVenue}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Applications Table Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '18px', margin: 0 }}>My Application History</h3>
        {myApplications.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
            <FileText size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p>You haven't submitted any job applications yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {myApplications.map((app) => (
                  <tr key={app._id}>
                    <td><strong>{app.job?.title || 'Unknown Job'}</strong></td>
                    <td>{app.job?.company?.companyName || 'Unknown Company'}</td>
                    <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${
                        app.status === 'offered' ? 'success' : 
                        app.status === 'rejected' ? 'danger' : 
                        app.status === 'applied' ? 'info' : 'warning'
                      }`}>{app.status}</span>
                    </td>
                    <td style={{ color: app.feedback ? 'var(--text-secondary)' : 'var(--text-muted)', fontSize: '13px' }}>
                      {app.feedback || 'Pending review'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentDashboard;
