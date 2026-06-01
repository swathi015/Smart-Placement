import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { companyAPI, applicationAPI } from '../services/api.js';
import Alert from '../components/Alert.jsx';
import Loader from '../components/Loader.jsx';
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  Briefcase, 
  FileText, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  UserCheck, 
  Award,
  BookOpen,
  Mail,
  GraduationCap,
  ExternalLink
} from 'lucide-react';

const Applications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobIdFromQuery = searchParams.get('job');

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [sortBy, setSortBy] = useState('appliedDateDesc'); // cgpaDesc, cgpaAsc, appliedDateDesc, appliedDateAsc

  // Modal Views State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeApp, setActiveApp] = useState(null);
  const [statusForm, setStatusForm] = useState({
    status: '',
    feedback: ''
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileViewStudent, setProfileViewStudent] = useState(null);

  // Fetch all recruiter-posted jobs
  const fetchJobs = async () => {
    try {
      const postedJobs = await companyAPI.getPostedJobs();
      setJobs(postedJobs);
      
      if (postedJobs.length > 0) {
        // If there's a valid job ID in the URL query, use it; otherwise, select the first job
        const initialJobId = jobIdFromQuery && postedJobs.some((j) => j._id === jobIdFromQuery)
          ? jobIdFromQuery
          : postedJobs[0]._id;
          
        setSelectedJobId(initialJobId);
        setSelectedJob(postedJobs.find((j) => j._id === initialJobId));
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching company jobs:', err.message);
      setError('Failed to fetch job postings. Please reload.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Fetch applications whenever the selected job ID changes
  useEffect(() => {
    const fetchApplications = async () => {
      if (!selectedJobId) return;
      
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const apps = await applicationAPI.getForJob(selectedJobId);
        setApplications(apps);
        setSelectedJob(jobs.find((j) => j._id === selectedJobId));
        
        // Keep the URL query param in sync
        setSearchParams({ job: selectedJobId });
      } catch (err) {
        console.error('Error fetching applications:', err.message);
        setError('Failed to fetch applicant data from database.');
      } finally {
        setLoading(false);
      }
    };

    if (selectedJobId) {
      fetchApplications();
    }
  }, [selectedJobId]);

  // Handle status update submission
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      const updated = await applicationAPI.updateStatus(activeApp._id, statusForm);
      setSuccess(`Application status successfully updated to "${statusForm.status.toUpperCase()}"!`);
      
      // Update applications state locally
      setApplications(applications.map((app) => 
        app._id === activeApp._id ? { ...app, status: updated.status, feedback: updated.feedback } : app
      ));
      
      setShowStatusModal(false);
      setActiveApp(null);
      
      // Reload stats if necessary (by fetching jobs again to refresh stats, or updating locally)
      const refreshedJobs = await companyAPI.getPostedJobs();
      setJobs(refreshedJobs);
    } catch (err) {
      console.error('Error updating application status:', err.message);
      setError('Failed to update applicant status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Setup status review modal helper
  const openStatusModal = (app) => {
    setActiveApp(app);
    setStatusForm({
      status: app.status,
      feedback: app.feedback || ''
    });
    setShowStatusModal(true);
  };

  // Open profile view helper
  const openProfileModal = (student) => {
    setProfileViewStudent(student);
    setShowProfileModal(true);
  };

  if (loading && jobs.length === 0) return <Loader message="Accessing candidate rosters..." />;

  // Group applications for quick stats
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'applied').length,
    screening: applications.filter((a) => a.status === 'screening' || a.status === 'test').length,
    interview: applications.filter((a) => a.status === 'interview').length,
    offered: applications.filter((a) => a.status === 'offered').length,
    rejected: applications.filter((a) => a.status === 'rejected').length
  };

  // Extract unique departments for filtering
  const departments = [...new Set(applications.map((app) => app.student?.department).filter(Boolean))];

  // Perform search, filtering, and sorting client-side
  const filteredApplications = applications
    .filter((app) => {
      const name = app.student?.user?.name || '';
      const roll = app.student?.rollNumber || '';
      const searchMatch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          roll.toLowerCase().includes(searchTerm.toLowerCase());
      
      const statusMatch = !statusFilter || app.status === statusFilter;
      const deptMatch = !deptFilter || app.student?.department === deptFilter;
      
      return searchMatch && statusMatch && deptMatch;
    })
    .sort((a, b) => {
      const cgpaA = a.student?.cgpa || 0;
      const cgpaB = b.student?.cgpa || 0;
      const dateA = new Date(a.appliedAt || a.createdAt);
      const dateB = new Date(b.appliedAt || b.createdAt);

      switch (sortBy) {
        case 'cgpaDesc':
          return cgpaB - cgpaA;
        case 'cgpaAsc':
          return cgpaA - cgpaB;
        case 'appliedDateDesc':
          return dateB - dateA;
        case 'appliedDateAsc':
          return dateA - dateB;
        default:
          return 0;
      }
    });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {error && <Alert type="danger" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Recruiter Job Listings Filter Bar */}
      <section className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Briefcase style={{ color: 'var(--primary)' }} />
          <span className="form-label" style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Select Job Placement Drive:</span>
          {jobs.length === 0 ? (
            <span style={{ color: 'var(--text-muted)' }}>No placement drives posted yet</span>
          ) : (
            <select
              className="form-control form-select"
              style={{ width: '280px' }}
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>{j.title} ({j.status})</option>
              ))}
            </select>
          )}
        </div>

        {selectedJob && (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong>Criteria:</strong> Min CGPA: {selectedJob.minCGPA} | Max Backlogs: {selectedJob.maxBacklogs}
          </div>
        )}
      </section>

      {jobs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <Briefcase size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h4>No job drives found</h4>
          <p>Please post a placement drive from your dashboard first to receive and track applications.</p>
        </div>
      ) : (
        <>
          {/* Applications Stats Summary Cards */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px'
          }}>
            <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '500' }}>Total Applicants</span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{stats.total}</span>
            </div>
            <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '3px solid var(--secondary)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '500' }}>New Applied</span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--secondary)' }}>{stats.applied}</span>
            </div>
            <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '3px solid var(--warning)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '500' }}>Screening / Test</span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--warning)' }}>{stats.screening}</span>
            </div>
            <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '3px solid #ab47bc' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '500' }}>In Interview</span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#ab47bc' }}>{stats.interview}</span>
            </div>
            <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '3px solid var(--success)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '500' }}>Offered / Placed</span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>{stats.offered}</span>
            </div>
          </section>

          {/* Core Applicant Filter and List Section */}
          <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Filters panel */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--card-border)', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SlidersHorizontal size={18} style={{ color: 'var(--text-muted)' }} />
                <h3 style={{ fontSize: '16px', margin: 0 }}>Applicants Filters</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {/* Search query input */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Search name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status filter dropdown */}
              <div>
                <select
                  className="form-control form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="applied">Applied (New)</option>
                  <option value="screening">Screening</option>
                  <option value="test">Technical Test</option>
                  <option value="interview">Interview Rounds</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Department filter dropdown */}
              <div>
                <select
                  className="form-control form-select"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Sort by selector */}
              <div>
                <select
                  className="form-control form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="appliedDateDesc">Applied: Latest First</option>
                  <option value="appliedDateAsc">Applied: Oldest First</option>
                  <option value="cgpaDesc">CGPA: Highest First</option>
                  <option value="cgpaAsc">CGPA: Lowest First</option>
                </select>
              </div>
            </div>

            {/* Applicants List Grid/Table */}
            {filteredApplications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <FileText size={32} style={{ marginBottom: '12px' }} />
                <p>No applicants found matching the filters.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table" style={{ verticalAlign: 'middle' }}>
                  <thead>
                    <tr>
                      <th>Candidate Details</th>
                      <th>Department & Year</th>
                      <th>CGPA & Backlogs</th>
                      <th>Skills</th>
                      <th>Applied On</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app) => (
                      <tr key={app._id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <strong 
                              style={{ color: '#fff', cursor: 'pointer', textDecoration: 'underline' }} 
                              onClick={() => openProfileModal(app.student)}
                              title="Click to view full profile"
                            >
                              {app.student?.user?.name || 'Syncing Account'}
                            </strong>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Roll: {app.student?.rollNumber}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span>{app.student?.department}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Class of {app.student?.graduationYear}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span><strong>{app.student?.cgpa.toFixed(2)}</strong> CGPA</span>
                            <span style={{ 
                              fontSize: '11px', 
                              color: app.student?.backlogs > 0 ? 'var(--danger)' : 'var(--text-muted)' 
                            }}>
                              {app.student?.backlogs} backlog(s)
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
                            {app.student?.skills?.slice(0, 3).map((s, idx) => (
                              <span key={idx} className="badge badge-info" style={{ fontSize: '9px', padding: '2px 6px' }}>{s}</span>
                            ))}
                            {app.student?.skills?.length > 3 && (
                              <span className="badge badge-secondary" style={{ fontSize: '9px', padding: '2px 6px', background: 'rgba(255,255,255,0.05)' }}>
                                +{app.student.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ fontSize: '13px' }}>
                          {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <span className={`badge badge-${
                            app.status === 'offered' ? 'success' : 
                            app.status === 'rejected' ? 'danger' : 
                            app.status === 'applied' ? 'info' : 'warning'
                          }`}>{app.status}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            {/* View resume PDF */}
                            <a 
                              href={app.resumeUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="btn btn-secondary" 
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                              title="View resume in new tab"
                            >
                              Resume <ExternalLink size={12} />
                            </a>

                            {/* Schedule Interview shortcut */}
                            {(app.status === 'screening' || app.status === 'test' || app.status === 'applied' || app.status === 'interview') && (
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '6px 10px', fontSize: '12px', borderColor: 'rgba(139, 92, 246, 0.3)' }}
                                onClick={() => navigate(`/company/interviews`)}
                              >
                                Schedule
                              </button>
                            )}

                            {/* Review status outcome */}
                            <button
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => openStatusModal(app)}
                            >
                              Review
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* Review Status Dialog Modal */}
      {showStatusModal && activeApp && (
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
              <h2 style={{ fontSize: '18px', margin: 0 }}>Review Application Outcome</h2>
              <button 
                onClick={() => { setShowStatusModal(false); setActiveApp(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px' }}
              >
                &times;
              </button>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Candidate: <strong>{activeApp.student?.user?.name}</strong> ({activeApp.student?.rollNumber})
            </p>

            <form onSubmit={handleStatusSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="status">Application Stage</label>
                <select
                  id="status"
                  className="form-control form-select"
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  required
                >
                  <option value="applied">Applied (New Screening)</option>
                  <option value="screening">Screening</option>
                  <option value="test">Technical Written Test</option>
                  <option value="interview">Move to Interviews</option>
                  <option value="offered">Select / Job Offered</option>
                  <option value="rejected">Reject Candidate</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="feedback">Recruiter Evaluation Feedback</label>
                <textarea
                  id="feedback"
                  className="form-control"
                  rows="4"
                  placeholder="Provide concise notes or selection comments for the student profile..."
                  value={statusForm.feedback}
                  onChange={(e) => setStatusForm({ ...statusForm, feedback: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => { setShowStatusModal(false); setActiveApp(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Updating...' : 'Log Evaluation Outcome'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Details Dialog Modal */}
      {showProfileModal && profileViewStudent && (
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
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '16px'
                }}>
                  {profileViewStudent.user?.name ? profileViewStudent.user.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', margin: 0 }}>{profileViewStudent.user?.name}</h2>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Roll: {profileViewStudent.rollNumber}</span>
                </div>
              </div>
              <button 
                onClick={() => { setShowProfileModal(false); setProfileViewStudent(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)', padding: '16px 0', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} style={{ color: 'var(--text-muted)' }} /> <strong>Email Address:</strong> {profileViewStudent.user?.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={14} style={{ color: 'var(--text-muted)' }} /> <strong>Department / Batch:</strong> {profileViewStudent.department} (Class of {profileViewStudent.graduationYear})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={14} style={{ color: 'var(--text-muted)' }} /> <strong>Academic CGPA:</strong> {profileViewStudent.cgpa.toFixed(2)} / 10.00
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle size={14} style={{ color: 'var(--text-muted)' }} /> <strong>Active Backlogs:</strong> {profileViewStudent.backlogs}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={14} style={{ color: 'var(--text-muted)' }} /> <strong>Placement Status:</strong> 
                <span className={`badge badge-${
                  profileViewStudent.placementStatus === 'placed' ? 'success' : 'warning'
                }`} style={{ fontSize: '9px', marginLeft: '6px' }}>{profileViewStudent.placementStatus}</span>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Professional Skillsets</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {profileViewStudent.skills?.map((s, idx) => (
                  <span key={idx} className="badge badge-info" style={{ fontSize: '10px' }}>{s}</span>
                ))}
                {profileViewStudent.skills?.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No skills declared</span>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn btn-secondary" onClick={() => { setShowProfileModal(false); setProfileViewStudent(null); }}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
