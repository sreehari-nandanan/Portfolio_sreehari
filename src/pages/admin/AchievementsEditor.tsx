import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, Save, RefreshCw, Award } from 'lucide-react';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export interface AchievementItem {
  id: string;
  title: string;
  desc: string;
  img: string;
  tags?: string[];
  order?: number;
}

interface AchievementsEditorProps {
  achievements: AchievementItem[];
  sha: string | null;
  onSave: (updatedAchievements: AchievementItem[], commitMessage?: string) => Promise<void>;
  onReload: () => Promise<void>;
  saving: boolean;
}

export const AchievementsEditor: React.FC<AchievementsEditorProps> = ({
  achievements,
  sha,
  onSave,
  onReload,
  saving,
}) => {
  const [items, setItems] = useState<AchievementItem[]>(achievements);
  const [isDirty, setIsDirty] = useState(false);
  const [editingItem, setEditingItem] = useState<AchievementItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isDirty) {
      setItems(achievements);
    }
  }, [achievements, isDirty]);

  const handleStartAdd = () => {
    setEditingItem({
      id: `ach-${Date.now()}`,
      title: '',
      desc: '',
      img: '/achievements/award.png',
      tags: ['Innovation'],
      order: items.length + 1,
    });
    setIsNew(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.title.trim()) {
      alert('Title is required');
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
    await onSave(items, 'cms: update achievements and milestones');
    setIsDirty(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--ff-display, "Bebas Neue", sans-serif)', fontSize: '2rem', margin: 0, letterSpacing: '1px', color: '#fff' }}>
            MAJOR ACHIEVEMENTS & MILESTONES
          </h2>
          <p style={{ color: '#71717a', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Manage competitions, NASA nominations, awards, and certifications milestones.
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
            <span>Add Achievement</span>
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

      {/* List */}
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
                width: '54px',
                height: '54px',
                borderRadius: '8px',
                background: '#0a0a0d',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                {it.img ? (
                  <img src={it.img} alt={it.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Award size={24} color="#eab308" />
                )}
              </div>

              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>
                  {it.title}
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#a1a1aa', fontSize: '0.82rem', lineHeight: 1.4 }}>
                  {it.desc}
                </p>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  {(it.tags || []).map((t) => (
                    <span key={t} style={{ fontSize: '0.7rem', padding: '1px 6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', color: '#888' }}>
                      {t}
                    </span>
                  ))}
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

      {/* Modal */}
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
              maxWidth: '600px',
              width: '100%',
              padding: '28px',
              color: '#fff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 600 }}>
              {isNew ? 'Add Milestone' : 'Edit Milestone'}
            </h3>

            <form onSubmit={handleSaveModal}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                  MILESTONE / AWARD TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                  DESCRIPTION *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.desc}
                  onChange={(e) => setEditingItem({ ...editingItem, desc: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', lineHeight: 1.5 }}
                />
              </div>

              <ImageUploader
                label="IMAGE / BADGE / CERTIFICATE PREVIEW"
                value={editingItem.img}
                onChange={(url) => setEditingItem({ ...editingItem, img: url })}
                placeholder="/achievements/nasa.jpg"
              />

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                  TAGS (Comma separated)
                </label>
                <input
                  type="text"
                  value={(editingItem.tags || []).join(', ')}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                  })}
                  placeholder="NASA, Aerospace, Robotics"
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
                  {isNew ? 'Add Milestone' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Achievement"
        message="Are you sure you want to delete this achievement?"
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
