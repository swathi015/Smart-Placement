import React from 'react';
import { NavLink } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
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
          background: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)'
        }}>
          <HelpCircle size={32} />
        </div>
        
        <div>
          <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Page Not Found</h2>
          <p style={{ fontSize: '14px' }}>
            The endpoint you are trying to reach does not exist or has been shifted.
          </p>
        </div>

        <NavLink to="/login" className="btn btn-primary" style={{ width: '100%' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </NavLink>
      </div>
    </div>
  );
};

export default NotFound;
