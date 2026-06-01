import React from 'react';

const Loader = ({ fullPage = false, message = 'Loading details...' }) => {
  const loaderEl = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '24px',
      height: fullPage ? '100vh' : 'auto'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid rgba(255, 255, 255, 0.05)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <span style={{
        fontSize: '14px',
        fontFamily: 'var(--font-heading)',
        color: 'var(--text-secondary)',
        fontWeight: '500'
      }}>{message}</span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'var(--bg-dark)',
        zIndex: 9999
      }}>
        {loaderEl}
      </div>
    );
  }

  return loaderEl;
};

export default Loader;
