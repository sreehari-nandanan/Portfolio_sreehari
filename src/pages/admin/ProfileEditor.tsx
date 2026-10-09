import React, { useState } from 'react';
import { Save, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { ImageUploader } from '../../components/admin/ImageUploader';

export interface ProfileData {
  name: string;
  firstName?: string;
  lastName?: string;
  scriptGreeting?: string;
  title?: string;
  heroDesc: string;
  heroImage?: string;
  heroLabel?: string;
  heroSecondaryImage?: string;
  heroSecondaryLabel?: string;
  aboutLead?: string;
  aboutBody?: string;
  stats?: { num: string; label: string; isInfinity?: boolean }[];
  contactEmail: string;
  contactHeading?: string;
  contactSub?: string;
  resumeUrl?: string;
  socialLinks?: { label: string; title: string; href: string }[];
}

interface ProfileEditorProps {
  profile: ProfileData;
  sha: string | null;
  onSave: (updatedProfile: ProfileData, commitMessage?: string) => Promise<void>;
  onReload: () => Promise<void>;
  saving: boolean;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profile,
  sha,
  onSave,
  onReload,
  saving,
}) => {
  const [data, setData] = useState<ProfileData>(profile);
  const [isDirty, setIsDirty] = useState(false);

  React.useEffect(() => {
    if (!isDirty) {
      setData(profile);
    }
  }, [profile, isDirty]);

  const updateField = (field: keyof ProfileData, val: any) => {
    setData((prev) => ({ ...prev, [field]: val }));
    setIsDirty(true);
  };

  const handleStatChange = (idx: number, field: string, val: any) => {
    const nextStats = [...(data.stats || [])];
    nextStats[idx] = { ...nextStats[idx], [field]: val };
    updateField('stats', nextStats);
  };

  const handleAddStat = () => {
    const nextStats = [...(data.stats || []), { num: '0+', label: 'New Metric' }];
    updateField('stats', nextStats);
  };

  const handleRemoveStat = (idx: number) => {
    const nextStats = (data.stats || []).filter((_, i) => i !== idx);
    updateField('stats', nextStats);
  };

  const handleSocialChange = (idx: number, field: string, val: string) => {
    const nextSocial = [...(data.socialLinks || [])];
    nextSocial[idx] = { ...nextSocial[idx], [field]: val };
    updateField('socialLinks', nextSocial);
  };

  const handleSaveToGitHub = async () => {
    await onSave(data, 'cms: update profile and biographical details');
    setIsDirty(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--ff-display, "Bebas Neue", sans-serif)', fontSize: '2rem', margin: 0, letterSpacing: '1px', color: '#fff' }}>
            PERSONAL PROFILE & HERO
          </h2>
          <p style={{ color: '#71717a', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Manage hero headers, introductory biography, stats counters, and contact details.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onReload}
            disabled={saving}
            style={{
              padding: '9px 14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#d4d4d8',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={15} />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToGitHub}
            disabled={saving || !isDirty}
            style={{
              padding: '9px 20px',
              background: isDirty ? '#FF5A00' : '#27272a',
              border: 'none',
              borderRadius: '8px',
              color: isDirty ? '#fff' : '#71717a',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isDirty && !saving ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isDirty ? '0 4px 14px rgba(255, 90, 0, 0.35)' : 'none',
            }}
          >
            <Save size={16} />
            <span>{saving ? 'Committing...' : isDirty ? 'Save to GitHub' : 'Up to Date'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Hero Block Section */}
        <div style={{ background: '#121216', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 18px 0', color: '#fff' }}>
            Hero Header & Branding
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                FIRST NAME DISPLAY (SOLID)
              </label>
              <input
                type="text"
                value={data.firstName || ''}
                onChange={(e) => updateField('firstName', e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                LAST NAME DISPLAY (OUTLINE)
              </label>
              <input
                type="text"
                value={data.lastName || ''}
                onChange={(e) => updateField('lastName', e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                SCRIPT ACCENT GREETING
              </label>
              <input
                type="text"
                value={data.scriptGreeting || ''}
                onChange={(e) => updateField('scriptGreeting', e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
              HERO SUBTITLE / BIO STATEMENT
            </label>
            <textarea
              rows={3}
              value={data.heroDesc}
              onChange={(e) => updateField('heroDesc', e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', lineHeight: 1.5 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <ImageUploader
              label="PRIMARY HERO POLAROID IMAGE"
              value={data.heroImage || ''}
              onChange={(url) => updateField('heroImage', url)}
            />
            <ImageUploader
              label="SECONDARY HERO POLAROID IMAGE"
              value={data.heroSecondaryImage || ''}
              onChange={(url) => updateField('heroSecondaryImage', url)}
            />
          </div>
        </div>

        {/* About Bio Section */}
        <div style={{ background: '#121216', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 18px 0', color: '#fff' }}>
            About Section Story
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
              LEAD PARAGRAPH
            </label>
            <textarea
              rows={3}
              value={data.aboutLead || ''}
              onChange={(e) => updateField('aboutLead', e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', lineHeight: 1.5 }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
              TECHNICAL EXPERTISE PARAGRAPH
            </label>
            <textarea
              rows={3}
              value={data.aboutBody || ''}
              onChange={(e) => updateField('aboutBody', e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', lineHeight: 1.5 }}
            />
          </div>

          {/* Stats Rows */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#aaa' }}>STATS & COUNTERS</label>
              <button
                type="button"
                onClick={handleAddStat}
                style={{ padding: '4px 10px', background: 'rgba(255, 90, 0, 0.15)', border: '1px solid rgba(255, 90, 0, 0.3)', borderRadius: '4px', color: '#FF5A00', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                + Add Stat
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {(data.stats || []).map((st, idx) => (
                <div key={idx} style={{ background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={st.num}
                      onChange={(e) => handleStatChange(idx, 'num', e.target.value)}
                      placeholder="10+ or ∞"
                      style={{ width: '80px', padding: '6px', background: '#17171c', border: '1px solid #333', borderRadius: '4px', color: '#FF5A00', fontWeight: 700, fontSize: '0.9rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveStat(idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={st.label}
                    onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                    placeholder="Drone Builds"
                    style={{ width: '100%', padding: '6px', background: '#17171c', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact and Links */}
        <div style={{ background: '#121216', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 18px 0', color: '#fff' }}>
            Contact & Social Profiles
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                CONTACT EMAIL
              </label>
              <input
                type="email"
                value={data.contactEmail || ''}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                RESUME URL
              </label>
              <input
                type="url"
                value={data.resumeUrl || ''}
                onChange={(e) => updateField('resumeUrl', e.target.value)}
                placeholder="https://..."
                style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
              CONTACT HEADING
            </label>
            <input
              type="text"
              value={data.contactHeading || ''}
              onChange={(e) => updateField('contactHeading', e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
              CONTACT SUBTITLE
            </label>
            <textarea
              rows={2}
              value={data.contactSub || ''}
              onChange={(e) => updateField('contactSub', e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
            />
          </div>

          {/* Social Links List */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#aaa', marginBottom: '10px' }}>
              SOCIAL MEDIA LINKS
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(data.socialLinks || []).map((soc, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={soc.title}
                    onChange={(e) => handleSocialChange(idx, 'title', e.target.value)}
                    style={{ width: '120px', padding: '8px 12px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                  <input
                    type="text"
                    value={soc.href}
                    onChange={(e) => handleSocialChange(idx, 'href', e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
