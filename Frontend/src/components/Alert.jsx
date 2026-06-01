import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const Alert = ({ type = 'info', message, style }) => {
  if (!message) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'rgba(34, 197, 94, 0.12)',
          border: 'rgba(34, 197, 94, 0.3)',
          color: '#4ade80',
          icon: <CheckCircle size={18} />
        };
      case 'warning':
        return {
          bg: 'rgba(234, 179, 8, 0.12)',
          border: 'rgba(234, 179, 8, 0.3)',
          color: '#fde047',
          icon: <AlertTriangle size={18} />
        };
      case 'danger':
      case 'error':
        return {
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          icon: <XCircle size={18} />
        };
      default:
        return {
          bg: 'rgba(59, 130, 246, 0.12)',
          border: 'rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          icon: <Info size={18} />
        };
    }
  };

  const config = getConfig();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      background: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: '8px',
      color: config.color,
      fontFamily: 'var(--font-heading)',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '16px',
      animation: 'slideIn 0.3s ease forwards',
      ...style
    }}>
      {config.icon}
      <span>{message}</span>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Alert;
