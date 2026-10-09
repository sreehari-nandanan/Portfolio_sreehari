import React, { useState } from 'react';
import {
  LayoutDashboard,
  Rocket,
  User,
  Wrench,
  Briefcase,
  Award,
  GraduationCap,
  ScrollText,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { AdminUser } from '../../services/api';

export type AdminTab =
  | 'overview'
  | 'projects'
  | 'profile'
  | 'skills'
  | 'experience'
  | 'achievements'
  | 'education'
  | 'certifications'
  | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  user: AdminUser | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: AdminTab; label: string; icon: React.ComponentType<{ size: number }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: Rocket },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'skills', label: 'Skills & Tools', icon: Wrench },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'certifications', label: 'Certifications', icon: ScrollText },
  { id: 'settings', label: 'Site Settings', icon: Settings },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#09090b',
      color: '#f4f4f5',
      fontFamily: 'var(--ff-body, "Space Grotesk", sans-serif)',
    }}>
      {/* SIDEBAR (Desktop) */}
      <aside style={{
        width: '260px',
        background: '#0d0d10',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 50,
      }} className="hidden md:flex">
        {/* Brand Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #FF5A00, #ff8c42)',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255, 90, 0, 0.35)',
          }}>
            <ShieldCheck size={22} color="#fff" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--ff-display, "Bebas Neue", sans-serif)',
              fontSize: '1.4rem',
              letterSpacing: '1px',
              lineHeight: 1,
              color: '#fff',
            }}>
              SREEH<span style={{ color: '#FF5A00' }}>A</span>RI <span style={{ fontSize: '0.9rem', color: '#888' }}>CMS</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              GitHub Content Store
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#52525b', padding: '0 12px 10px 12px', fontWeight: 600 }}>
            Content Sections
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  marginBottom: '4px',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(255, 90, 0, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 90, 0, 0.3)' : '1px solid transparent',
                  color: isActive ? '#FF5A00' : '#a1a1aa',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Admin Info */}
        {user && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={user.avatar_url}
                alt={user.login}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255, 90, 0, 0.4)' }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name || user.login}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#71717a' }}>
                  @{user.login}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 999,
        }} onClick={() => setMobileMenuOpen(false)}>
          <div style={{
            width: '260px',
            height: '100%',
            background: '#0d0d10',
            padding: '20px 12px',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 8px' }}>
              <span style={{ fontWeight: 700, color: '#fff' }}>Dashboard Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#fff' }}>
                <X size={20} />
              </button>
            </div>
            {NAV_ITEMS.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    marginBottom: '6px',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(255, 90, 0, 0.15)' : 'transparent',
                    color: isActive ? '#FF5A00' : '#a1a1aa',
                    border: 'none',
                    textAlign: 'left',
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{
          height: '64px',
          background: 'rgba(13, 13, 16, 0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              className="md:hidden"
            >
              <Menu size={22} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#71717a', fontSize: '0.85rem' }}>Admin /</span>
              <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem', textTransform: 'capitalize' }}>
                {currentTab}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#d4d4d8',
                fontSize: '0.8rem',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              <span>View Live Portfolio</span>
              <ExternalLink size={13} />
            </a>

            <button
              type="button"
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '6px',
                color: '#ef4444',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, padding: '28px 24px 60px 24px', maxWidth: '1280px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
