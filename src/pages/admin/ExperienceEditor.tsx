import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, Save, RefreshCw, Briefcase } from 'lucide-react';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export interface ExperienceItem {
  id: string;
  org: string;
  tenure?: string;
  title: string;
  year: string;
  desc?: string;
  order?: number;
}

interface ExperienceEditorProps {
  experience: ExperienceItem[];
  sha: string | null;
  onSave: (updatedExperience: ExperienceItem[], commitMessage?: string) => Promise<void>;
  onReload: () => Promise<void>;
  saving: boolean;
}

export const ExperienceEditor: React.FC<ExperienceEditorProps> = ({
  experience,
  sha,
  onSave,
  onReload,
  saving,
}) => {
  const [items, setItems] = useState<ExperienceItem[]>(experience);
  const [isDirty, setIsDirty] = useState(false);
  const [editingItem, setEditingItem] = useState<ExperienceItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isDirty) {
      setItems(experience);
    }
  }, [experience, isDirty]);

  const handleStartAdd = () => {
    setEditingItem({
      id: `exp-${Date.now()}`,
      org: 'TinkerHub',
      tenure: '1 yr',
      title: '',
      year: '2025 - Present',
      desc: '',
      order: items.length + 1,
    });
    setIsNew(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.title.trim() || !editingItem.org.trim()) {
      alert('Role title and organization are required.');
      return;
    }

    if (isNew) {
      setItems([...items, editingItem]);
    } else {
      setItems(items.map((it) => (it.id === editingItem.id ? editingItem : it)));
    }

    setIsDirty(true);
    setEditingItem(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    setItems(items.filter((it) => it.id !== deleteTargetId));
    setIsDirty(true);
    setDeleteTargetId(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= items.length) return;
    const copy = [...items];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);
    setItems(copy.map((it, idx) => ({ ...it, order: idx + 1 })));
    setIsDirty(true);
  };

  const handleSaveToGitHub = async () => {
    await onSave(items, 'cms: update professional experience & journey');
    setIsDirty(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--ff-display, "Bebas Neue", sans-serif)', fontSize: '2rem', margin: 0, letterSpacing: '1px', color: '#fff' }}>
            PROFESSIONAL EXPERIENCE
          </h2>
          <p style={{ color: '#71717a', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Manage leadership roles, organizations, tenures, and career journey timeline.
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
            onClick={handleStartAdd}
            style={{
              padding: '9px 16px',
              background: 'rgba(255, 90, 0, 0.15)',
              border: '1px solid rgba(255, 90, 0, 0.35)',
              borderRadius: '8px',
              color: '#FF5A00',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={16} />
            <span>Add Role</span>
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

      {/* Experience list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {items.map((it, idx) => (
          <div
            key={it.id}
            style={{
              background: '#121216',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '240px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.12)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Briefcase size={20} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>
                    {it.title}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#FF5A00', fontWeight: 600 }}>
                    @{it.org}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#71717a', marginTop: '4px' }}>
                  {it.year} {it.tenure ? `· ${it.tenure}` : ''}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleMove(idx, 'up')}
                disabled={idx === 0}
                style={{
                  padding: '7px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: idx === 0 ? '#3f3f46' : '#d4d4d8',
                  cursor: idx === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleMove(idx, 'down')}
                disabled={idx === items.length - 1}
                style={{
                  padding: '7px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: idx === items.length - 1 ? '#3f3f46' : '#d4d4d8',
                  cursor: idx === items.length - 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ArrowDown size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingItem(it);
                  setIsNew(false);
                }}
                style={{
                  padding: '7px 12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Edit2 size={14} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setDeleteTargetId(it.id)}
                style={{
                  padding: '7px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '6px',
                  color: '#ef4444',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(6px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }} onClick={() => setEditingItem(null)}>
          <div
            style={{
              background: '#121216',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              color: '#fff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 600 }}>
              {isNew ? 'Add Experience Role' : 'Edit Experience Role'}
            </h3>

            <form onSubmit={handleSaveModal}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                  ROLE TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Learning Coordinator"
                  style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                    ORGANIZATION *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.org}
                    onChange={(e) => setEditingItem({ ...editingItem, org: e.target.value })}
                    placeholder="e.g. TinkerHub, IEEE"
                    style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                    DATE RANGE / PERIOD
                  </label>
                  <input
                    type="text"
                    value={editingItem.year}
                    onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                    placeholder="Aug 2025 - Present"
                    style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                  TENURE / TIME SPENT
                </label>
                <input
                  type="text"
                  value={editingItem.tenure || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, tenure: e.target.value })}
                  placeholder="Full-time · 1 yr 8 mos"
                  style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  style={{ padding: '10px 18px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#d4d4d8', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 24px', background: '#FF5A00', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isNew ? 'Add Role' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Role"
        message="Are you sure you want to delete this experience role entry?"
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
