import React, { useState } from 'react';
import { Save, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { ImageUploader } from '../../components/admin/ImageUploader';

export interface SoftwareTool {
  name: string;
  icon: string;
}

export interface SkillsData {
  skills: string[];
  softwareTools: SoftwareTool[];
  marqueeItems?: string[];
}

interface SkillsEditorProps {
  skillsData: SkillsData;
  sha: string | null;
  onSave: (updatedSkills: SkillsData, commitMessage?: string) => Promise<void>;
  onReload: () => Promise<void>;
  saving: boolean;
}

export const SkillsEditor: React.FC<SkillsEditorProps> = ({
  skillsData,
  sha,
  onSave,
  onReload,
  saving,
}) => {
  const [data, setData] = useState<SkillsData>(skillsData);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newMarqueeInput, setNewMarqueeInput] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  React.useEffect(() => {
    if (!isDirty) {
      setData(skillsData);
    }
  }, [skillsData, isDirty]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    setData({ ...data, skills: [...(data.skills || []), newSkillInput.trim()] });
    setNewSkillInput('');
    setIsDirty(true);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setData({
      ...data,
      skills: (data.skills || []).filter((s) => s !== skillToRemove),
    });
    setIsDirty(true);
  };

  const handleToolChange = (index: number, field: keyof SoftwareTool, val: string) => {
    const nextTools = [...(data.softwareTools || [])];
    nextTools[index] = { ...nextTools[index], [field]: val };
    setData({ ...data, softwareTools: nextTools });
    setIsDirty(true);
  };

  const handleAddTool = () => {
    setData({
      ...data,
      softwareTools: [...(data.softwareTools || []), { name: 'New Tool', icon: '/vscode.png' }],
    });
    setIsDirty(true);
  };

  const handleRemoveTool = (idx: number) => {
    setData({
      ...data,
      softwareTools: (data.softwareTools || []).filter((_, i) => i !== idx),
    });
    setIsDirty(true);
  };

  const handleAddMarquee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarqueeInput.trim()) return;
    setData({
      ...data,
      marqueeItems: [...(data.marqueeItems || []), newMarqueeInput.trim()],
    });
    setNewMarqueeInput('');
    setIsDirty(true);
  };

  const handleRemoveMarquee = (idx: number) => {
    setData({
      ...data,
      marqueeItems: (data.marqueeItems || []).filter((_, i) => i !== idx),
    });
    setIsDirty(true);
  };

  const handleSaveToGitHub = async () => {
    await onSave(data, 'cms: update skills, software tools, and marquee ticker');
    setIsDirty(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--ff-display, "Bebas Neue", sans-serif)', fontSize: '2rem', margin: 0, letterSpacing: '1px', color: '#fff' }}>
            SKILLS & SOFTWARE TOOLS
          </h2>
          <p style={{ color: '#71717a', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Manage core engineering competencies, software icons, and homepage marquee ticker.
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
        {/* Core Skills Badges */}
        <div style={{ background: '#121216', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 16px 0', color: '#fff' }}>
            Core Skills & Technical Competencies
          </h3>

          <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            <input
              type="text"
              placeholder="Add skill (e.g. ArduPilot, Drone CAD)"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff' }}
            />
            <button
              type="submit"
              style={{ padding: '10px 18px', background: '#FF5A00', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              Add Skill
            </button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {(data.skills || []).map((skill) => (
              <span
                key={skill}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  background: 'rgba(255, 90, 0, 0.12)',
                  border: '1px solid rgba(255, 90, 0, 0.25)',
                  borderRadius: '20px',
                  color: '#FF5A00',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  style={{ background: 'none', border: 'none', color: '#FF5A00', cursor: 'pointer', padding: 0, display: 'flex' }}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Software Tools */}
        <div style={{ background: '#121216', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, color: '#fff' }}>
              Software & Engineering Tools
            </h3>
            <button
              type="button"
              onClick={handleAddTool}
              style={{ padding: '6px 14px', background: 'rgba(255, 90, 0, 0.15)', border: '1px solid rgba(255, 90, 0, 0.3)', borderRadius: '6px', color: '#FF5A00', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
            >
              + Add Tool
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {(data.softwareTools || []).map((tool, idx) => (
              <div
                key={idx}
                style={{
                  background: '#0d0d0f',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  background: '#1a1a1f',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}>
                  <img
                    src={tool.icon}
                    alt={tool.name}
                    style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={tool.name}
                    onChange={(e) => handleToolChange(idx, 'name', e.target.value)}
                    placeholder="Tool Name"
                    style={{ width: '100%', padding: '6px 10px', background: '#17171c', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.85rem', marginBottom: '6px', boxSizing: 'border-box' }}
                  />
                  <input
                    type="text"
                    value={tool.icon}
                    onChange={(e) => handleToolChange(idx, 'icon', e.target.value)}
                    placeholder="Icon Path (/fusion360.png)"
                    style={{ width: '100%', padding: '4px 10px', background: '#17171c', border: '1px solid #27272a', borderRadius: '4px', color: '#888', fontSize: '0.75rem', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveTool(idx)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Ticker */}
        <div style={{ background: '#121216', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 16px 0', color: '#fff' }}>
            Marquee Ticker Banner Items
          </h3>

          <form onSubmit={handleAddMarquee} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Add banner badge (e.g. AI Systems)"
              value={newMarqueeInput}
              onChange={(e) => setNewMarqueeInput(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff' }}
            />
            <button
              type="submit"
              style={{ padding: '10px 18px', background: '#FF5A00', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              Add Item
            </button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {(data.marqueeItems || []).map((item, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  background: '#18181b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  color: '#d4d4d8',
                  fontSize: '0.85rem',
                }}
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMarquee(idx)}
                  style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 0 }}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
