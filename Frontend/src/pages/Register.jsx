import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';
import { Shield, ArrowRight, User, Building2 } from 'lucide-react';
import './Login.css';

const Register = () => {
  const [role, setRole] = useState('student'); // 'student' or 'company'
  const [baseData, setBaseData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Student specific profile data state
  const [studentData, setStudentData] = useState({
    rollNumber: '',
    department: '',
    cgpa: '',
    backlogs: '0',
    skills: '',
    graduationYear: new Date().getFullYear().toString(),
  });

  // Company specific profile data state
  const [companyData, setCompanyData] = useState({
    companyName: '',
    industry: '',
    website: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleBaseChange = (e) => {
    setBaseData({ ...baseData, [e.target.id]: e.target.value });
  };

  const handleStudentChange = (e) => {
    setStudentData({ ...studentData, [e.target.id]: e.target.value });
  };

  const handleCompanyChange = (e) => {
    setCompanyData({ ...companyData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations matching backend schemas
    if (!baseData.name || !baseData.email || !baseData.password) {
      setError('Please provide all primary fields.');
      return;
    }

    if (baseData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    let payload = {
      ...baseData,
      role,
    };

    if (role === 'student') {
      const gpa = parseFloat(studentData.cgpa);
      const back = parseInt(studentData.backlogs);
      
      if (isNaN(gpa) || gpa < 0 || gpa > 10) {
        setError('CGPA must be a valid number between 0 and 10.');
        return;
      }

      if (isNaN(back) || back < 0) {
        setError('Backlogs cannot be a negative value.');
        return;
      }

      payload = {
        ...payload,
        rollNumber: studentData.rollNumber,
        department: studentData.department,
        cgpa: gpa,
        backlogs: back,
        skills: studentData.skills.split(',').map((s) => s.trim()).filter((s) => s.length > 0),
        graduationYear: parseInt(studentData.graduationYear) || new Date().getFullYear(),
      };
    } else if (role === 'company') {
      payload = {
        ...payload,
        companyName: companyData.companyName,
        industry: companyData.industry,
        website: companyData.website,
        description: companyData.description,
        contactEmail: companyData.contactEmail || baseData.email,
        contactPhone: companyData.contactPhone,
      };
    }

    setLoading(true);
    try {
      const registeredUser = await register(payload);
      navigate(`/${registeredUser.role}`);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Registration failed. Please check your inputs or try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-blur-violet" />
      <div className="auth-blur-cyan" />

      <div className="auth-card auth-card-large glass-card">
        <div className="auth-header">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            background: 'var(--primary-glow)',
            borderRadius: '12px',
            color: 'var(--primary)',
            marginBottom: '16px',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <Shield size={24} />
          </div>
          <h1>Join Smart Placement Tracker</h1>
          <p>Select your user profile type to get started</p>
        </div>

        {error && <Alert type="danger" message={error} />}

        <div className="role-tabs">
          <button 
            type="button" 
            className={`role-tab ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
            disabled={loading}
          >
            <User size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Student
          </button>
          <button 
            type="button" 
            className={`role-tab ${role === 'company' ? 'active' : ''}`}
            onClick={() => setRole('company')}
            disabled={loading}
          >
            <Building2 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Recruiter
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Base Credentials Section */}
          <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
            Base User Credentials
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="form-control"
                placeholder="John Doe / Company Contact Name"
                value={baseData.name}
                onChange={handleBaseChange}
                disabled={loading}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={baseData.email}
                onChange={handleBaseChange}
                disabled={loading}
                required
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="Must be at least 6 characters"
                value={baseData.password}
                onChange={handleBaseChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Student Profile Input Fields */}
          {role === 'student' && (
            <>
              <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px', marginBottom: '16px', marginTop: '16px', color: 'var(--text-secondary)' }}>
                Academic Profile Details
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="rollNumber">Roll Number</label>
                  <input
                    id="rollNumber"
                    type="text"
                    className="form-control"
                    placeholder="e.g. 21BCE0123"
                    value={studentData.rollNumber}
                    onChange={handleStudentChange}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="department">Department</label>
                  <select
                    id="department"
                    className="form-control form-select"
                    value={studentData.department}
                    onChange={handleStudentChange}
                    disabled={loading}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">ECE</option>
                    <option value="Electrical">EEE</option>
                    <option value="Mechanical">Mechanical</option>
                  </select>
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
                    placeholder="e.g. 8.50"
                    value={studentData.cgpa}
                    onChange={handleStudentChange}
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
                    placeholder="0"
                    value={studentData.backlogs}
                    onChange={handleStudentChange}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="skills">Professional Skills (comma separated)</label>
                  <input
                    id="skills"
                    type="text"
                    className="form-control"
                    placeholder="e.g. React, Node.js, Python, SQL"
                    value={studentData.skills}
                    onChange={handleStudentChange}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="graduationYear">Graduation Year</label>
                  <input
                    id="graduationYear"
                    type="number"
                    className="form-control"
                    placeholder="e.g. 2026"
                    value={studentData.graduationYear}
                    onChange={handleStudentChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Company Profile Input Fields */}
          {role === 'company' && (
            <>
              <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px', marginBottom: '16px', marginTop: '16px', color: 'var(--text-secondary)' }}>
                Recruiter Profile Details
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="companyName">Company Name</label>
                  <input
                    id="companyName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Google, Stripe"
                    value={companyData.companyName}
                    onChange={handleCompanyChange}
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
                    placeholder="e.g. FinTech, SaaS, Healthcare"
                    value={companyData.industry}
                    onChange={handleCompanyChange}
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
                    placeholder="https://example.com"
                    value={companyData.website}
                    onChange={handleCompanyChange}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contactPhone">Contact Phone Number</label>
                  <input
                    id="contactPhone"
                    type="tel"
                    className="form-control"
                    placeholder="+1 (555) 019-2834"
                    value={companyData.contactPhone}
                    onChange={handleCompanyChange}
                    disabled={loading}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="contactEmail">Recruiter Contact Email</label>
                  <input
                    id="contactEmail"
                    type="email"
                    className="form-control"
                    placeholder="recruiter@company.com"
                    value={companyData.contactEmail}
                    onChange={handleCompanyChange}
                    disabled={loading}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="description">Company Brief Description</label>
                  <textarea
                    id="description"
                    className="form-control"
                    rows="3"
                    placeholder="Tell us about your organization..."
                    value={companyData.description}
                    onChange={handleCompanyChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '16px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Register'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
