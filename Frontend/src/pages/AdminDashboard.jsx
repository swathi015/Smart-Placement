import React, { useState, useEffect } from 'react';
import { analyticsAPI, authAPI } from '../services/api.js';
import Alert from '../components/Alert.jsx';
import Loader from '../components/Loader.jsx';
import { 
  Building2, 
  Users, 
  Briefcase, 
  Award, 
  Check, 
  ClipboardCheck, 
  Sparkles,
  TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAdminData = async () => {
    try {
      const [adminStats, approvals] = await Promise.all([
        analyticsAPI.getAdminStats(),
        authAPI.getPendingApprovals()
      ]);
      setStats(adminStats);
      setPendingApprovals(approvals);
    } catch (err) {
      console.error('Failed to load admin stats:', err.message);
      setError('Error loading administrative statistics. Please reload.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (userId) => {
    setError('');
    setSuccess('');
    try {
      await authAPI.approveUser(userId);
      setSuccess('Account approved successfully!');
      // Reload administrative details
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      setError('Failed to approve account. Please try again.');
    }
  };

  if (loading && !stats) return <Loader message="Compiling administrative records..." />;

  const overview = stats?.overview || {};
  const departmentStats = stats?.departments || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {error && <Alert type="danger" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Global Placements Overview */}
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
            <Users size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', marginBottom: '4px' }}>Total Students</h4>
            <span style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>{overview.totalStudents || 0}</span>
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
            <Briefcase size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', marginBottom: '4px' }}>Active Job Drives</h4>
            <span style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>{overview.totalJobs || 0}</span>
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
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', marginBottom: '4px' }}>Placed Students</h4>
            <span style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
              {overview.totalPlaced || 0} ({overview.placementRate || 0}%)
            </span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(234, 179, 8, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--warning)'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', marginBottom: '4px' }}>Average Offer</h4>
            <span style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>{overview.averagePackage || 0} LPA</span>
          </div>
        </div>
      </section>

      {/* Grid: Pending Approvals & Department stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: pendingApprovals.length > 0 ? '1.1fr 0.9fr' : '1fr',
        gap: '32px'
      }}>
        {/* Recruiter Approvals Board */}
        {pendingApprovals.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', margin: 0 }}>Pending Recruiter Approvals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingApprovals.map((item) => (
                <div key={item.user._id} className="glass-card" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h4 style={{ margin: 0, fontSize: '15px' }}>{item.details.companyName || item.user.name}</h4>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Industry: {item.details.industry} • Contact: {item.details.contactEmail || item.user.email}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Role requested: {item.user.role}</span>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                    onClick={() => handleApprove(item.user._id)}
                  >
                    <Check size={16} /> Approve
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Academic Placement Metrics by Department */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', margin: 0 }}>Department-wise Placements</h3>
          {departmentStats.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <ClipboardCheck size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p>No department placement data available.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Students</th>
                    <th>Placed</th>
                    <th>Ratio</th>
                    <th>Avg Package</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentStats.map((dept) => (
                    <tr key={dept.department}>
                      <td><strong>{dept.department}</strong></td>
                      <td>{dept.totalStudents}</td>
                      <td>{dept.placedStudents}</td>
                      <td>
                        <span className="badge badge-success" style={{ fontSize: '10px' }}>
                          {dept.placementPercentage}%
                        </span>
                      </td>
                      <td><strong>{dept.averagePackage} LPA</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
