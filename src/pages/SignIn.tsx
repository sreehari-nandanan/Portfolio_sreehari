import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export const SignIn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const errorParam = searchParams.get('error');
  const userParam = searchParams.get('user');

  // If already logged in as admin, redirect directly to /admin
  useEffect(() => {
    let isMounted = true;
    async function checkExisting() {
      try {
        const res = await api.checkAuth();
        if (isMounted && res.authenticated && res.user) {
          navigate('/admin', { replace: true });
          return;
        }
      } catch {
        // Not authenticated, stay on sign-in page
      } finally {
        if (isMounted) setCheckingAuth(false);
      }
    }
    checkExisting();
    return () => { isMounted = false; };
  }, [navigate]);

  let errorMessage = '';
  if (errorParam === 'unauthorized_account') {
    errorMessage = `Access Denied: The GitHub account "${userParam || 'provided'}" is not authorized. Only the verified repository owner can access this dashboard.`;
  } else if (errorParam === 'invalid_oauth_state') {
    errorMessage = 'Security validation failed (OAuth state mismatch). Please try again.';
  } else if (errorParam === 'token_exchange_failed') {
    errorMessage = 'Failed to exchange authorization code with GitHub. Please check OAuth credentials.';
  } else if (errorParam === 'missing_oauth_parameters') {
    errorMessage = 'Invalid response from GitHub. Required OAuth parameters were missing.';
  } else if (errorParam) {
    errorMessage = `Authentication error: ${errorParam}`;
  }

  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/login';
  };

  if (checkingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080808',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Loader2 size={32} color="#FF5A00" className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--ff-body, "Space Grotesk", sans-serif)',
      color: '#fff',
    }}>
      {/* Background decorations */}
      <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none' }} />
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(255, 90, 0, 0.15) 0%, transparent 70%)',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: 'rgba(15, 15, 18, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 90, 0, 0.25)',
        borderRadius: '20px',
        padding: '36px 32px',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(255, 90, 0, 0.08)',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Top Icon */}
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #FF5A00, #ff8c42)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(255, 90, 0, 0.35)',
        }}>
          <ShieldCheck size={28} color="#fff" />
        </div>

        <h1 style={{
          fontFamily: 'var(--ff-display, "Bebas Neue", sans-serif)',
          fontSize: '2.2rem',
          letterSpacing: '1px',
          margin: '0 0 8px 0',
          color: '#fff',
          lineHeight: 1.1,
        }}>
          ADMINISTRATOR ACCESS
        </h1>

        <p style={{
          color: '#a1a1aa',
          fontSize: '0.88rem',
          lineHeight: 1.5,
          margin: '0 0 24px 0',
        }}>
          Sign in using your verified GitHub account to manage portfolio projects, biography, milestones, and site configuration.
        </p>

        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            color: '#f87171',
            fontSize: '0.82rem',
            lineHeight: 1.4,
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMessage}</div>
          </div>
        )}

        <button
          type="button"
          onClick={handleGitHubLogin}
          style={{
            width: '100%',
            padding: '13px 20px',
            background: '#FF5A00',
            border: 'none',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '0.92rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s ease',
            boxShadow: '0 6px 20px rgba(255, 90, 0, 0.35)',
          }}
        >
          {/* GitHub SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          <span>Sign in with GitHub</span>
        </button>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#71717a',
              fontSize: '0.82rem',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
          >
            <ArrowLeft size={14} />
            <span>Return to Portfolio</span>
          </a>
        </div>
      </div>
    </div>
  );
};
