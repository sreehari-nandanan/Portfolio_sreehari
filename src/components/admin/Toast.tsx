import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '420px',
      width: '100%',
      pointerEvents: 'none',
    }}>
      {toasts.map((t) => {
        let borderCol = 'rgba(255, 90, 0, 0.4)';
        let bgCol = 'rgba(20, 20, 24, 0.95)';
        let IconComp = CheckCircle2;
        let iconCol = '#FF5A00';

        if (t.type === 'error') {
          borderCol = 'rgba(239, 68, 68, 0.4)';
          iconCol = '#ef4444';
          IconComp = AlertCircle;
        } else if (t.type === 'warning') {
          borderCol = 'rgba(245, 158, 11, 0.4)';
          iconCol = '#f59e0b';
          IconComp = AlertTriangle;
        }

        return (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              background: bgCol,
              backdropFilter: 'blur(12px)',
              border: `1px solid ${borderCol}`,
              borderRadius: '10px',
              padding: '14px 18px',
              color: '#fff',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <IconComp size={20} style={{ color: iconCol, marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {t.title && (
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px', color: '#fff' }}>
                  {t.title}
                </div>
              )}
              <div style={{ fontSize: '0.82rem', color: '#ccc', lineHeight: 1.4, wordBreak: 'break-word' }}>
                {t.message}
              </div>
              {t.action && (
                <button
                  type="button"
                  onClick={t.action.onClick}
                  style={{
                    marginTop: '8px',
                    padding: '4px 10px',
                    background: '#FF5A00',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
