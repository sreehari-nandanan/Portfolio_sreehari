import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, Save, RefreshCw, GraduationCap } from 'lucide-react';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  period: string;
  desc?: string;
  order?: number;
}

interface EducationEditorProps {
  education: EducationItem[];
  sha: string | null;
  onSave: (updatedEducation: EducationItem[], commitMessage?: string) => Promise<void>;
  onReload: () => Promise<void>;
  saving: boolean;
}

export const EducationEditor: React.FC<EducationEditorProps> = ({
  education,
  sha,
  onSave,
  onReload,
  saving,
}) => {
  const [items, setItems] = useState<EducationItem[]>(education);
  const [isDirty, setIsDirty] = useState(false);
  const [editingItem, setEditingItem] = useState<EducationItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isDirty) setItems(education);
  }, [education, isDirty]);

  const handleStartAdd = () => {
    setEditingItem({
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      field: '',
      period: '2022 - 2026',
      desc: '',
      order: items.length + 1,
    });
    setIsNew(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editingItem.institution.trim() || !editingItem.degree.trim()) {
      alert('Institution and degree are required');
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
    await onSave(items, 'cms: update academic background & education');
    setIsDirty(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--ff-display, "Bebas Neue", sans-serif)', fontSize: '2rem', margin: 0, letterSpacing: '1px', color: '#fff' }}>
            ACADEMIC EDUCATION
          </h2>
          <p style={{ color: '#71717a', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Manage university, degrees, engineering specialization, and research focus.
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
            <span>Add Education</span>
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
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <GraduationCap size={20} />
              </div>

              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>
                  {it.degree} {it.field ? `in ${it.field}` : ''}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#FF5A00', marginTop: '2px' }}>
                  {it.institution}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#71717a', marginTop: '4px' }}>
                  {it.period}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleMove(idx, 'up')}
                disabled={idx === 0}
                style={{ padding: '7px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: idx === 0 ? '#3f3f46' : '#d4d4d8', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleMove(idx, 'down')}
                disabled={idx === items.length - 1}
                style={{ padding: '7px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: idx === items.length - 1 ? '#3f3f46' : '#d4d4d8', cursor: idx === items.length - 1 ? 'not-allowed' : 'pointer' }}
              >
                <ArrowDown size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingItem(it);
                  setIsNew(false);
                }}
                style={{ padding: '7px 12px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Edit2 size={14} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setDeleteTargetId(it.id)}
                style={{ padding: '7px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(6px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setEditingItem(null)}>
          <div style={{ background: '#121216', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', maxWidth: '560px', width: '100%', padding: '28px', color: '#fff' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 600 }}>
              {isNew ? 'Add Education' : 'Edit Education'}
            </h3>
            <form onSubmit={handleSaveModal}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>INSTITUTION *</label>
                <input
                  type="text"
                  required
                  value={editingItem.institution}
                  onChange={(e) => setEditingItem({ ...editingItem, institution: e.target.value })}
                  placeholder="e.g. TOC H Institute of Science and Technology"
                  style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>DEGREE *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.degree}
                    onChange={(e) => setEditingItem({ ...editingItem, degree: e.target.value })}
                    placeholder="Bachelor of Technology"
                    style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>PERIOD</label>
                  <input
                    type="text"
                    value={editingItem.period}
                    onChange={(e) => setEditingItem({ ...editingItem, period: e.target.value })}
                    placeholder="2022 - 2026"
                    style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>FIELD OF STUDY</label>
                <input
                  type="text"
                  value={editingItem.field || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, field: e.target.value })}
                  placeholder="Electronics & Communication Engineering"
                  style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>RESEARCH / FOCUS DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={editingItem.desc || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, desc: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#0d0d0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setEditingItem(null)} style={{ padding: '10px 18px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#d4d4d8', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#FF5A00', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>{isNew ? 'Add' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Education Entry"
        message="Are you sure you want to delete this education entry?"
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
