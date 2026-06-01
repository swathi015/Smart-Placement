import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Calendar, 
  Bell, 
  User, 
  Users, 
  Building2, 
  CheckSquare, 
  ShieldCheck, 
  LogOut,
  Sparkles
} from 'lucide-react';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine current page title based on path
  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.includes('/eligible-jobs')) return 'Eligible Placements';
    if (path.includes('/jobs')) return 'Placement Drive Board';
    if (path.includes('/applications')) return 'Applications Hub';
    if (path.includes('/interviews')) return 'Interview Schedules';
    if (path.includes('/attendance')) return 'Attendance Logs';
    if (path.includes('/profile')) return 'My Profile & Details';
    if (path.includes('/notifications')) return 'In-app Notifications';
    if (path.includes('/pending-approvals')) return 'Pending Registrations';
    return 'Portal Overview';
  };

  // Render navigation links dynamically by user role
  const renderNavLinks = () => {
    switch (user?.role) {
      case 'student':
        return (
          <>
            <li>
              <NavLink to="/student" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={20} /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/student/eligible-jobs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Sparkles size={20} /> Eligible Jobs
              </NavLink>
            </li>
            <li>
              <NavLink to="/student/jobs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Briefcase size={20} /> All Jobs
              </NavLink>
            </li>
            <li>
              <NavLink to="/student/applications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <FileText size={20} /> My Applications
              </NavLink>
            </li>
            <li>
              <NavLink to="/student/interviews" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Calendar size={20} /> My Interviews
              </NavLink>
            </li>
          </>
        );
      case 'company':
        return (
          <>
            <li>
              <NavLink to="/company" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={20} /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/company/jobs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Briefcase size={20} /> Manage Jobs
              </NavLink>
            </li>
            <li>
              <NavLink to="/company/applications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <FileText size={20} /> Applicant Tracking
              </NavLink>
            </li>
            <li>
              <NavLink to="/company/interviews" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Calendar size={20} /> Scheduled Interviews
              </NavLink>
            </li>
          </>
        );
      case 'coordinator':
        return (
          <>
            <li>
              <NavLink to="/coordinator" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={20} /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/coordinator/students" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Users size={20} /> Student Profiles
              </NavLink>
            </li>
            <li>
              <NavLink to="/coordinator/companies" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Building2 size={20} /> Corporate Partners
              </NavLink>
            </li>
            <li>
              <NavLink to="/coordinator/jobs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Briefcase size={20} /> Placement Drives
              </NavLink>
            </li>
            <li>
              <NavLink to="/coordinator/attendance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <CheckSquare size={20} /> Event Attendance
              </NavLink>
            </li>
          </>
        );
      case 'admin':
        return (
          <>
            <li>
              <NavLink to="/admin" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={20} /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/pending-approvals" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <ShieldCheck size={20} /> User Approvals
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/students" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Users size={20} /> Student Database
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/companies" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Building2 size={20} /> Recruiters List
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/attendance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <CheckSquare size={20} /> Event Attendance
              </NavLink>
            </li>
          </>
        );
      default:
        return null;
    }
  };

  const getProfilePath = () => {
    if (user?.role === 'student') return '/student/profile';
    if (user?.role === 'company') return '/company/profile';
    return `/${user?.role}/profile`;
  };

  const getNotificationPath = () => {
    return `/${user?.role}/notifications`;
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Section */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: '800'
          }}>S</div>
          <span className="logo-text">SmartPlacement</span>
        </div>
        
        <nav style={{ flexGrow: 1 }}>
          <ul className="sidebar-menu">
            {renderNavLinks()}
            <li>
              <NavLink to={getProfilePath()} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <User size={20} /> My Profile
              </NavLink>
            </li>
            <li>
              <NavLink to={getNotificationPath()} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Bell size={20} /> Notifications
              </NavLink>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-snippet">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Panel Wrapper */}
      <div className="main-wrapper">
        <header className="header">
          <h2 className="header-title">{getHeaderTitle()}</h2>
          <div className="header-actions">
            <NavLink to={getNotificationPath()} className="notification-bell">
              <Bell size={20} />
              <div className="notification-badge" />
            </NavLink>
          </div>
        </header>

        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
