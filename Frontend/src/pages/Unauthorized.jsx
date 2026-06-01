import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg-dark)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div className="glass-card animate-fade-in" style={{
        maxWidth: '450px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--danger)'
        }}>
          <ShieldAlert size={32} />
        </div>
        
        <div>
          <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ fontSize: '14px' }}>
            You do not have administrative clearance or the matching user role to access this restricted route.
          </p>
        </div>

        <NavLink to="/login" className="btn btn-primary" style={{ width: '100%' }}>
          <ArrowLeft size={16} /> Return to Login
        </NavLink>
      </div>
    </div>
  );
};

export default Unauthorized;
