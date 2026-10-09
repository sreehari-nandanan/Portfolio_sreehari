import React, { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';

export interface SiteSettingsData {
  siteTitle: string;
  metaDescription: string;
  themeDefault?: string;
  showHireBox?: boolean;
  openToOpportunities?: boolean;
  contactEmail?: string;
  footerNote?: string;
}

interface SettingsEditorProps {
  settings: SiteSettingsData;
  sha: string | null;
  onSave: (updatedSettings: SiteSettingsData, commitMessage?: string) => Promise<void>;
  onReload: () => Promise<void>;
  saving: boolean;
}

export const SettingsEditor: React.FC<SettingsEditorProps> = ({
  settings,
  sha,
  onSave,
  onReload,
  saving,
}) => {
  const [data, setData] = useState<SiteSettingsData>(settings);
  const [isDirty, setIsDirty] = useState(false);

  React.useEffect(() => {
    if (!isDirty) setData(settings);
  }, [settings, isDirty]);

  const updateField = (field: keyof SiteSettingsData, val: any) => {
    setData((prev) => ({ ...prev, [field]: val }));
    setIsDirty(true);
  };

  const handleSaveToGitHub = async () => {
    await onSave(data, 'cms: update site settings & metadata');
    setIsDirty(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--ff-display, "Bebas Neue", sans-serif)', fontSize: '2rem', margin: 0, letterSpacing: '1px', color: '#fff' }}>
            SITE SETTINGS & SEO
          </h2>
          <p style={{ color: '#71717a', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Configure global website meta title, search engine description, and interaction widgets.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onReload}
            disabled={saving}
            style={{ padding: '9px 14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#d4d4d8', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={15} />
            <span>Reload</span>
          </button>
          <button
            type="button"
            onClick={handleSaveToGitHub}
            disabled={saving || !isDirty}
            style={{ padding: '9px 20px', background: isDirty ? '#FF5A00' : '#27272a', border: 'none', borderRadius: '8px', color: isDirty ? '#fff' : '#71717a', fontSize: '0.85rem', fontWeight: 600, cursor: isDirty && !saving ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: isDirty ? '0 4px 14px rgba(255, 90, 0, 0.35)' : 'none' }}
          >
            <Save size={16} />
            <span>{saving ? 'Committing...' : isDirty ? 'Save to GitHub' : 'Up to Date'}</span>
          </button>
        </div>
      </div>

      <div style={{ background: '#121216', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
            WEBSITE TITLE (BROWSER TAB / SEO)
          </label>
          <input
            type="text"
            value={data.siteTitle || ''}
            onChange={(e) => updateField('siteTitle', e.target.value)}
            style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
            SEARCH ENGINE META DESCRIPTION
          </label>
          <textarea
            rows={3}
            value={data.metaDescription || ''}
            onChange={(e) => updateField('metaDescription', e.target.value)}
            style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', lineHeight: 1.5 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
              DEFAULT THEME
            </label>
            <select
              value={data.themeDefault || 'light'}
              onChange={(e) => updateField('themeDefault', e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
              FOOTER NOTE / SLOGAN
            </label>
            <input
              type="text"
              value={data.footerNote || ''}
              onChange={(e) => updateField('footerNote', e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={data.openToOpportunities !== false}
              onChange={(e) => updateField('openToOpportunities', e.target.checked)}
            />
            <span>Open to Opportunities & Consulting Inquiries</span>
          </label>
        </div>
      </div>
    </div>
  );
};
