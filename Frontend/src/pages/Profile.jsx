import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { studentAPI, companyAPI } from '../services/api.js';
import Alert from '../components/Alert.jsx';
import Loader from '../components/Loader.jsx';
import { User, FileText, Upload, Save, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  
  // Profile forms state
  const [name, setName] = useState('');
  const [studentForm, setStudentForm] = useState({
    rollNumber: '',
    department: '',
    cgpa: 0,
    backlogs: 0,
    skills: '',
    graduationYear: new Date().getFullYear(),
    placementStatus: 'unplaced',
  });

  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    industry: '',
    website: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      if (user.role === 'student' && user.profile) {
        setStudentForm({
          rollNumber: user.profile.rollNumber || '',
          department: user.profile.department || '',
          cgpa: user.profile.cgpa || 0,
          backlogs: user.profile.backlogs || 0,
          skills: user.profile.skills ? user.profile.skills.join(', ') : '',
          graduationYear: user.profile.graduationYear || new Date().getFullYear(),
          placementStatus: user.profile.placementStatus || 'unplaced',
        });
      } else if (user.role === 'company' && user.profile) {
        setCompanyForm({
          companyName: user.profile.companyName || '',
          industry: user.profile.industry || '',
          website: user.profile.website || '',
          description: user.profile.description || '',
          contactEmail: user.profile.contactEmail || '',
          contactPhone: user.profile.contactPhone || '',
        });
      }
    }
  }, [user]);

  const handleStudentFormChange = (e) => {
    setStudentForm({ ...studentForm, [e.target.id]: e.target.value });
  };

  const handleCompanyFormChange = (e) => {
    setCompanyForm({ ...companyForm, [e.target.id]: e.target.value });
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (user.role === 'student') {
        const payload = {
          name,
          ...studentForm,
          cgpa: parseFloat(studentForm.cgpa),
          backlogs: parseInt(studentForm.backlogs),
          graduationYear: parseInt(studentForm.graduationYear),
          skills: studentForm.skills.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
        };
        await studentAPI.updateProfile(payload);
      } else if (user.role === 'company') {
        const payload = {
          name,
          ...companyForm
        };
        await companyAPI.updateProfile(payload);
      }
      
      setSuccess('Profile updated successfully!');
      await refreshProfile();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error updating profile. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setError('Please select a resume file first.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      await studentAPI.uploadResume(formData);
      setSuccess('Resume document uploaded successfully to Cloudinary!');
      setResumeFile(null);
      await refreshProfile();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload resume file.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Loader />;

  return (
    <div className="animate-fade-in" style={{
      display: 'grid',
      gridTemplateColumns: user.role === 'student' ? '1.2fr 0.8fr' : '1fr',
      gap: '32px'
    }}>
      {/* Edit Base/Details Card */}
      <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <User style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '20px', margin: 0 }}>Update Profile Details</h2>
        </div>

        {error && <Alert type="danger" message={error} />}
        {success && <Alert type="success" message={success} />}

        <form onSubmit={handleProfileUpdate}>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">User Account Name</label>
            <input
              id="profile-name"
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Student Fields */}
          {user.role === 'student' && (
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="rollNumber">Roll Number</label>
                <input
                  id="rollNumber"
                  type="text"
                  className="form-control"
                  value={studentForm.rollNumber}
                  onChange={handleStudentFormChange}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="department">Department</label>
                <input
                  id="department"
                  type="text"
                  className="form-control"
                  value={studentForm.department}
                  onChange={handleStudentFormChange}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cgpa">Current CGPA</label>
                <input
                  id="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="form-control"
                  value={studentForm.cgpa}
                  onChange={handleStudentFormChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="backlogs">Active Backlogs</label>
                <input
                  id="backlogs"
                  type="number"
                  min="0"
                  className="form-control"
                  value={studentForm.backlogs}
                  onChange={handleStudentFormChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="graduationYear">Graduation Year</label>
                <input
                  id="graduationYear"
                  type="number"
                  className="form-control"
                  value={studentForm.graduationYear}
                  onChange={handleStudentFormChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="placementStatus">Placement Status</label>
                <select
                  id="placementStatus"
                  className="form-control form-select"
                  value={studentForm.placementStatus}
                  onChange={handleStudentFormChange}
                  disabled={loading}
                >
                  <option value="unplaced">Unplaced</option>
                  <option value="placed">Placed</option>
                  <option value="eligible">Eligible</option>
                  <option value="ineligible">Ineligible</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" htmlFor="skills">Professional Skills (comma separated)</label>
                <input
                  id="skills"
                  type="text"
                  className="form-control"
                  value={studentForm.skills}
                  onChange={handleStudentFormChange}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Company Fields */}
          {user.role === 'company' && (
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="companyName">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  className="form-control"
                  value={companyForm.companyName}
                  onChange={handleCompanyFormChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="industry">Industry Type</label>
                <input
                  id="industry"
                  type="text"
                  className="form-control"
                  value={companyForm.industry}
                  onChange={handleCompanyFormChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="website">Company Website</label>
                <input
                  id="website"
                  type="url"
                  className="form-control"
                  value={companyForm.website}
                  onChange={handleCompanyFormChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contactPhone">Contact Phone</label>
                <input
                  id="contactPhone"
                  type="tel"
                  className="form-control"
                  value={companyForm.contactPhone}
                  onChange={handleCompanyFormChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" htmlFor="contactEmail">Recruiter Contact Email</label>
                <input
                  id="contactEmail"
                  type="email"
                  className="form-control"
                  value={companyForm.contactEmail}
                  onChange={handleCompanyFormChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" htmlFor="description">Company Description</label>
                <textarea
                  id="description"
                  className="form-control"
                  rows="4"
                  value={companyForm.description}
                  onChange={handleCompanyFormChange}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
            <Save size={16} /> Save Changes
          </button>
        </form>
      </section>

      {/* Student Resume Document Management */}
      {user.role === 'student' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Current Resume Preview Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText style={{ color: 'var(--secondary)' }} />
              <h2 style={{ fontSize: '18px', margin: 0 }}>Resume & Placement PDF</h2>
            </div>
            
            {user.profile.resumeUrl ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px',
                background: 'rgba(34, 197, 94, 0.05)',
                border: '1px solid rgba(34, 197, 94, 0.15)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', fontSize: '14px', fontWeight: '600' }}>
                  <CheckCircle size={16} /> Active Resume Synced
                </div>
                <a 
                  href={user.profile.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '13px', padding: '10px' }}
                >
                  View Active Resume
                </a>
              </div>
            ) : (
              <div style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px dashed var(--card-border)',
                borderRadius: '8px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '14px'
              }}>
                No resume uploaded. Please upload a PDF to apply for jobs.
              </div>
            )}

            {/* Upload form */}
            <form onSubmit={handleResumeUpload} style={{ marginTop: '8px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="resume-file">Choose PDF/Word File</label>
                <div style={{
                  position: 'relative',
                  border: '1px dashed var(--card-border)',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.01)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-speed) ease'
                }}>
                  <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                  <input
                    id="resume-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                    disabled={loading}
                  />
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                    {resumeFile ? `Selected: ${resumeFile.name}` : 'Drag & drop or browse resume'}
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PDF, DOC, DOCX up to 5MB</span>
                </div>
              </div>

              <button type="submit" className="btn btn-secondary" style={{ width: '100%', borderStyle: 'solid' }} disabled={loading || !resumeFile}>
                {loading ? 'Uploading File...' : 'Upload Document'}
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
};

export default Profile;
