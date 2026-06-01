import React, { useState, useEffect } from 'react';
import { companyAPI, analyticsAPI } from '../services/api.js';
import Alert from '../components/Alert.jsx';
import Loader from '../components/Loader.jsx';
import { 
  Plus, 
  Briefcase, 
  Users, 
  Award, 
  X, 
  MapPin, 
  Clock, 
  DollarSign, 
  BookOpen 
} from 'lucide-react';

const CompanyDashboard = () => {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Job Post Modal controls
  const [showPostModal, setShowPostModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    skillsRequired: '',
    minCGPA: '0',
    maxBacklogs: '0',
    package: '',
    location: '',
    jobType: 'Full-time',
    deadline: '',
  });

  const fetchDashboardData = async () => {
    try {
      const [recruiterStats, postedJobs] = await Promise.all([
        analyticsAPI.getCompanyStats(),
        companyAPI.getPostedJobs()
      ]);
      setStats(recruiterStats);
      setJobs(postedJobs);
    } catch (err) {
      console.error('Recruiter dashboard error:', err.message);
      setError('Failed to fetch stats and posted jobs. Please reload.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleInputChange = (e) => {
    setJobForm({ ...jobForm, [e.target.id]: e.target.value });
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations matching backend models
    const parsedGPA = parseFloat(jobForm.minCGPA);
    const parsedBack = parseInt(jobForm.maxBacklogs);
    const parsedPkg = parseFloat(jobForm.package);

    if (isNaN(parsedGPA) || parsedGPA < 0 || parsedGPA > 10) {
      setError('Minimum CGPA must be between 0 and 10.');
      return;
    }
    if (isNaN(parsedBack) || parsedBack < 0) {
      setError('Maximum backlogs cannot be negative.');
      return;
    }
    if (isNaN(parsedPkg) || parsedPkg <= 0) {
      setError('Package must be a positive LPA number.');
      return;
    }

    const payload = {
      ...jobForm,
      minCGPA: parsedGPA,
      maxBacklogs: parsedBack,
      package: parsedPkg,
      skillsRequired: jobForm.skillsRequired.split(',').map((s) => s.trim()).filter((s) => s.length > 0),
    };

    setLoading(true);
    try {
      await companyAPI.postJob(payload);
      setSuccess('Job posting created successfully!');
      setJobForm({
        title: '',
        description: '',
        requirements: '',
        skillsRequired: '',
        minCGPA: '0',
        maxBacklogs: '0',
        package: '',
        location: '',
        jobType: 'Full-time',
        deadline: '',
      });
      setShowPostModal(false);
      // Reload dashboard data
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error posting job criteria. Please verify inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) return <Loader message="Accessing corporate credentials..." />;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {error && <Alert type="danger" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Recruiter Metrics Overview */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
            <Briefcase size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', marginBottom: '4px' }}>Jobs Posted</h4>
            <span style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>{stats?.totalJobsPosted || 0}</span>
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
            <Users size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', marginBottom: '4px' }}>Total Applicants</h4>
            <span style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>{stats?.totalApplicationsReceived || 0}</span>
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
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', marginBottom: '4px' }}>Selected Offers</h4>
            <span style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>{stats?.selectionsCount || 0}</span>
          </div>
        </div>
      </section>

      {/* Main drive controls */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', margin: 0 }}>Active Job Postings</h3>
          <button className="btn btn-primary" onClick={() => setShowPostModal(true)}>
            <Plus size={16} /> Post a New Job
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
            <Briefcase size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h4>No placement drives posted yet</h4>
            <p style={{ marginBottom: '20px' }}>Create your first job listing to receive applications from eligible students.</p>
            <button className="btn btn-primary" onClick={() => setShowPostModal(true)}>
              Post a Job Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {jobs.map((job) => (
              <div key={job._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{job.title}</h4>
                    <span className={`badge badge-${job.status === 'open' ? 'success' : 'danger'}`}>
                      {job.status}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} style={{ color: 'var(--text-muted)' }} /> {job.location} ({job.jobType})
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DollarSign size={14} style={{ color: 'var(--text-muted)' }} /> {job.package} LPA Package
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={14} style={{ color: 'var(--text-muted)' }} /> Min CGPA: {job.minCGPA} | Max Backlogs: {job.maxBacklogs}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} style={{ color: 'var(--text-muted)' }} /> Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--card-border)',
                  paddingTop: '12px',
                  marginTop: '4px'
                }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <strong>{job.applicantsCount}</strong> applicant(s)
                  </span>
                  <a href={`/company/applications?job=${job._id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    Track Applicants
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Post a Job Modal Sheet */}
      {showPostModal && (
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
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowPostModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Create a Placement Drive Criteria</h2>

            <form onSubmit={handlePostJob}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="title">Job Title</label>
                  <input
                    id="title"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Software Engineer Intern"
                    value={jobForm.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="jobType">Job Type</label>
                  <select
                    id="jobType"
                    className="form-control form-select"
                    value={jobForm.jobType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Co-op">Co-op</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="package">Annual Package Offer (LPA)</label>
                  <input
                    id="package"
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder="e.g. 12.5"
                    value={jobForm.package}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="location">Job Location</label>
                  <input
                    id="location"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bangalore, Remote"
                    value={jobForm.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="deadline">Application Deadline</label>
                  <input
                    id="deadline"
                    type="date"
                    className="form-control"
                    value={jobForm.deadline}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="minCGPA">Minimum CGPA Required</label>
                  <input
                    id="minCGPA"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="form-control"
                    value={jobForm.minCGPA}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="maxBacklogs">Maximum Allowed Backlogs</label>
                  <input
                    id="maxBacklogs"
                    type="number"
                    min="0"
                    className="form-control"
                    value={jobForm.maxBacklogs}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="skillsRequired">Skills Required (comma separated)</label>
                  <input
                    id="skillsRequired"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Java, Spring Boot, React, Git"
                    value={jobForm.skillsRequired}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="description">Job Description</label>
                  <textarea
                    id="description"
                    className="form-control"
                    rows="3"
                    placeholder="Describe role responsibilities..."
                    value={jobForm.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="requirements">Technical Requirements</label>
                  <textarea
                    id="requirements"
                    className="form-control"
                    rows="3"
                    placeholder="Describe mandatory qualifications..."
                    value={jobForm.requirements}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '16px'
              }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPostModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Posting...' : 'Publish Posting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
