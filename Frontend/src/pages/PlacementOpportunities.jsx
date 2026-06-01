import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobAPI, studentAPI, applicationAPI } from '../services/api.js';
import Alert from '../components/Alert.jsx';
import Loader from '../components/Loader.jsx';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  BookOpen, 
  Briefcase, 
  CheckCircle,
  HelpCircle,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const PlacementOpportunities = () => {
  const [searchParams] = useSearchParams();
  const jobIdFromQuery = searchParams.get('id');

  const { user, refreshProfile } = useAuth();
  
  const [jobs, setJobs] = useState([]);
  const [eligibleJobIds, setEligibleJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter controls
  const [searchTerm, setSearchTerm] = useState('');
  const [jobType, setJobType] = useState('');
  const [location, setLocation] = useState('');
  const [minPackage, setMinPackage] = useState('');

  // Detailed Modal view state
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobsData = async () => {
    try {
      const filters = {};
      if (searchTerm) filters.title = searchTerm;
      if (jobType) filters.jobType = jobType;
      if (location) filters.location = location;
      if (minPackage) filters.minPackage = minPackage;

      const allJobs = await jobAPI.getAll(filters);
      setJobs(allJobs);

      // If user is a student, fetch eligible jobs to cross-reference
      if (user?.role === 'student') {
        const eligible = await studentAPI.getEligibleJobs();
        const eligibleIds = new Set(eligible.map((j) => j._id));
        setEligibleJobIds(eligibleIds);
      }

      // If jobId query parameter is specified, open details modal directly
      if (jobIdFromQuery) {
        const activeJob = allJobs.find((j) => j._id === jobIdFromQuery);
        if (activeJob) setSelectedJob(activeJob);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err.message);
      setError('Failed to fetch job postings drives. Please reload.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsData();
  }, [searchTerm, jobType, location, minPackage]);

  const handleApply = async (jobId) => {
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      await applicationAPI.apply(jobId);
      setSuccess('Application submitted successfully! Recruiter notified.');
      setSelectedJob(null);
      // Refresh current profiles and lists to reflect application status
      await Promise.all([refreshProfile(), fetchJobsData()]);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Application submission failed. Ensure you meet requirements and have uploaded a resume.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && jobs.length === 0) return <Loader message="Accessing active placement drives..." />;

  // Checks if student has already applied to this job
  const hasApplied = (jobId) => {
    if (!user || !user.profile || !user.profile.appliedJobs) return false;
    return user.profile.appliedJobs.includes(jobId);
  };

  const getIneligibilityReasons = (job) => {
    if (!user || !user.profile) return [];
    const reasons = [];
    const student = user.profile;

    // Check CGPA
    if (typeof student.cgpa === 'number' && student.cgpa < job.minCGPA) {
      reasons.push(`Your CGPA is ${student.cgpa.toFixed(2)}, but minimum required is ${job.minCGPA}`);
    }

    // Check Backlogs
    if (typeof student.backlogs === 'number' && student.backlogs > job.maxBacklogs) {
      reasons.push(`You have ${student.backlogs} backlog(s), but maximum allowed is ${job.maxBacklogs}`);
    }

    // Check Skills
    if (job.skillsRequired && job.skillsRequired.length > 0) {
      const studentSkills = student.skills || [];
      const studentSkillsLower = studentSkills.map((s) => s.toLowerCase().trim());
      const missingSkills = job.skillsRequired.filter(
        (skill) => !studentSkillsLower.includes(skill.toLowerCase().trim())
      );
      if (missingSkills.length > 0) {
        reasons.push(`Missing required skills: ${missingSkills.join(', ')}`);
      }
    }

    return reasons;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {error && <Alert type="danger" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Filter Options Dashboard Card */}
      <section className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Search size={16} />
          </span>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ width: '150px' }}>
          <select
            className="form-control form-select"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        <div style={{ width: '150px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Remote, City"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div style={{ width: '150px' }}>
          <input
            type="number"
            className="form-control"
            placeholder="Min Package (LPA)"
            value={minPackage}
            onChange={(e) => setMinPackage(e.target.value)}
          />
        </div>
      </section>

      {/* Jobs drives lists grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {jobs.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: 'span 3', textAlign: 'center', padding: '60px' }}>
            <Briefcase size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p>No active placement drives match your filter criteria.</p>
          </div>
        ) : (
          jobs.map((job) => {
            const isEligible = eligibleJobIds.has(job._id);
            const applied = hasApplied(job._id);
            
            return (
              <div key={job._id} className="glass-card" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                border: applied ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--card-border)',
                background: applied ? 'rgba(34,197,94,0.02)' : 'var(--card-bg)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>{job.title}</h4>
                    {applied ? (
                      <span className="badge badge-success">Applied</span>
                    ) : user?.role === 'student' ? (
                      <span className={`badge badge-${isEligible ? 'success' : 'danger'}`}>
                        {isEligible ? 'Eligible' : 'Ineligible'}
                      </span>
                    ) : null}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{job.company?.companyName || 'Unknown Company'}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} style={{ color: 'var(--text-muted)' }} /> {job.location} ({job.jobType})
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DollarSign size={14} style={{ color: 'var(--text-muted)' }} /> {job.package} LPA Annual Offer
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={14} style={{ color: 'var(--text-muted)' }} /> Min CGPA: {job.minCGPA}
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
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {job.applicantsCount} student(s) applied
                  </span>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setSelectedJob(job)}>
                    Details & Requirements
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Expandable Details Modal Card */}
      {selectedJob && (
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
          <div className="glass-card animate-fade-in" style={{
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '20px', margin: 0 }}>{selectedJob.title}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{selectedJob.company?.companyName || 'Unknown Company'}</p>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
              <div><strong>Package:</strong> {selectedJob.package} LPA</div>
              <div><strong>Location:</strong> {selectedJob.location}</div>
              <div><strong>Type:</strong> {selectedJob.jobType}</div>
              <div><strong>Deadline:</strong> {new Date(selectedJob.deadline).toLocaleDateString()}</div>
              <div><strong>CGPA Criteria:</strong> {selectedJob.minCGPA}</div>
              <div><strong>Backlogs Max:</strong> {selectedJob.maxBacklogs}</div>
            </div>

            <div>
              <h4 style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Job Description</h4>
              <p style={{ fontSize: '14px', whiteSpace: 'pre-line' }}>{selectedJob.description}</p>
            </div>

            <div>
              <h4 style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Technical Requirements</h4>
              <p style={{ fontSize: '14px', whiteSpace: 'pre-line' }}>{selectedJob.requirements}</p>
            </div>

            {selectedJob.skillsRequired && selectedJob.skillsRequired.length > 0 && (
              <div>
                <h4 style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Required Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedJob.skillsRequired.map((skill, index) => (
                    <span key={index} className="badge badge-info" style={{ fontSize: '11px' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user?.role === 'student' && !eligibleJobIds.has(selectedJob._id) && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                background: 'rgba(239, 68, 68, 0.04)',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '14px', fontWeight: '600' }}>
                  <AlertTriangle size={16} /> Ineligibility Reasons
                </div>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {getIneligibilityReasons(selectedJob).map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              borderTop: '1px solid var(--card-border)',
              paddingTop: '16px',
              marginTop: '12px'
            }}>
              <button className="btn btn-secondary" onClick={() => setSelectedJob(null)}>
                Close
              </button>
              
              {user?.role === 'student' && (
                <>
                  {hasApplied(selectedJob._id) ? (
                    <button className="btn btn-secondary" disabled style={{ color: 'var(--success)', borderColor: 'rgba(34,197,94,0.3)' }}>
                      <CheckCircle size={16} /> Already Applied
                    </button>
                  ) : !eligibleJobIds.has(selectedJob._id) ? (
                    <button className="btn btn-secondary" disabled style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
                      <AlertTriangle size={16} /> Ineligible Profile
                    </button>
                  ) : !user.profile.resumeUrl ? (
                    <button className="btn btn-secondary" disabled style={{ color: '#fde047', borderColor: 'rgba(234,179,8,0.3)' }}>
                      <FileText size={16} /> Upload Resume First
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleApply(selectedJob._id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementOpportunities;
