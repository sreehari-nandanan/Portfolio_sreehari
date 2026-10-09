import React from 'react';
import { Rocket, Award, Briefcase, Wrench, GitBranch, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AdminTab } from '../../components/admin/AdminLayout';

interface OverviewTabProps {
  onNavigate: (tab: AdminTab) => void;
  stats: {
    projectsCount: number;
    featuredCount: number;
    skillsCount: number;
    toolsCount: number;
    experienceCount: number;
    achievementsCount: number;
  };
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigate, stats }) => {
  return (
    <div>
      {/* Hero Welcome Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 90, 0, 0.12) 0%, rgba(13, 13, 16, 0.8) 100%)',
        border: '1px solid rgba(255, 90, 0, 0.3)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(255, 90, 0, 0.2)', borderRadius: '20px', color: '#FF5A00', fontSize: '0.75rem', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <ShieldCheck size={14} /> Production Content Management
          </div>
          <h1 style={{ fontFamily: 'var(--ff-display, "Bebas Neue", sans-serif)', fontSize: '2.4rem', margin: '0 0 10px 0', letterSpacing: '1px', color: '#fff' }}>
            PORTFOLIO CONTROL CENTER
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 20px 0' }}>
            Manage your drone builds, achievements, bio, and engineering background. All updates are committed directly to your GitHub repository and automatically deployed to Vercel with zero downtime.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onNavigate('projects')}
              style={{
                padding: '10px 20px',
                background: '#FF5A00',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Manage Projects</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              style={{
                padding: '10px 18px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.88rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Edit Profile & Bio
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#121216', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Projects</span>
            <div style={{ background: 'rgba(255, 90, 0, 0.1)', padding: '6px', borderRadius: '6px', color: '#FF5A00' }}>
              <Rocket size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
            {stats.projectsCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#22c55e', marginTop: '6px' }}>
            {stats.featuredCount} featured on homepage
          </div>
        </div>

        <div style={{ background: '#121216', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Achievements</span>
            <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '6px', borderRadius: '6px', color: '#eab308' }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
            {stats.achievementsCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#a1a1aa', marginTop: '6px' }}>
            Milestones & nominations
          </div>
        </div>

        <div style={{ background: '#121216', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Experience</span>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '6px', borderRadius: '6px', color: '#3b82f6' }}>
              <Briefcase size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
            {stats.experienceCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#a1a1aa', marginTop: '6px' }}>
            Roles & organizations
          </div>
        </div>

        <div style={{ background: '#121216', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Skills & Tools</span>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '6px', borderRadius: '6px', color: '#a855f7' }}>
              <Wrench size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
            {stats.skillsCount + stats.toolsCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#a1a1aa', marginTop: '6px' }}>
            {stats.skillsCount} skills · {stats.toolsCount} software tools
          </div>
        </div>
      </div>

      {/* Deployment & Git sync info card */}
      <div style={{
        background: '#121216',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <GitBranch size={20} color="#FF5A00" />
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>
            How GitHub-Based Publishing Works
          </h3>
        </div>
        <p style={{ color: '#aaa', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 16px 0' }}>
          When you click <strong>"Save to GitHub"</strong> in any editor tab:
        </p>
        <ul style={{ color: '#d4d4d8', fontSize: '0.85rem', lineHeight: 1.8, margin: 0, paddingLeft: '20px' }}>
          <li>The backend validates the schema and verifies the current Git blob SHA to prevent conflicts.</li>
          <li>A direct commit is pushed to your configured GitHub repository branch via the GitHub Contents API.</li>
          <li>Vercel automatically detects the commit, initiates a production rebuild, and deploys the updated content globally within ~30–60 seconds.</li>
          <li>No external databases, Supabase, or SQL instances are used — your Git repository is your single source of truth.</li>
        </ul>
      </div>
    </div>
  );
};
