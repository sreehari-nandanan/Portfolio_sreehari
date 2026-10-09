import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Save,
  Rocket,
  Video,
  Bot,
  Plane,
  Satellite,
  Zap,
  Globe,
  Award,
  Eye,
  EyeOff,
  Star,
  Check,
  RefreshCw,
} from 'lucide-react';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export interface ProjectItem {
  id: string;
  number?: string;
  title: string;
  span?: string;
  tags?: string[];
  specs?: string[];
  icon?: string;
  desc: string;
  githubUrl?: string;
  liveUrl?: string;
  image?: string;
  featured?: boolean;
  published?: boolean;
  order?: number;
  category?: string;
  date?: string;
}

interface ProjectsEditorProps {
  projects: ProjectItem[];
  sha: string | null;
  onSave: (updatedProjects: ProjectItem[], commitMessage?: string) => Promise<void>;
  onReload: () => Promise<void>;
  saving: boolean;
}

const AVAILABLE_ICONS = ['Rocket', 'Video', 'Bot', 'Plane', 'Satellite', 'Zap', 'Globe', 'Award'];

export const ProjectsEditor: React.FC<ProjectsEditorProps> = ({
  projects,
  sha,
  onSave,
  onReload,
  saving,
}) => {
  const [items, setItems] = useState<ProjectItem[]>(projects);
  const [isDirty, setIsDirty] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [customCommitMsg, setCustomCommitMsg] = useState('');

  // Keep local items in sync if parent projects change and not dirty
  React.useEffect(() => {
    if (!isDirty) {
      setItems(projects);
    }
  }, [projects, isDirty]);

  const handleStartAdd = () => {
    const nextNum = (items.length + 1).toString().padStart(2, '0');
    setEditingItem({
      id: `project-${Date.now()}`,
      number: nextNum,
      title: '',
      span: 'bento-wide',
      tags: ['Drone Engineering'],
      specs: ['Custom ESC', 'Product Design'],
      icon: 'Rocket',
      desc: '',
      githubUrl: 'https://github.com/sreehari-nandanan',
      liveUrl: '',
      image: '',
      featured: true,
      published: true,
      order: items.length + 1,
      category: 'Drone Build',
      date: new Date().getFullYear().toString(),
    });
    setIsNew(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.title.trim()) {
      alert('Project title is required.');
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
    // update order numbers
    const reordered = copy.map((it, idx) => ({
      ...it,
      number: (idx + 1).toString().padStart(2, '0'),
      order: idx + 1,
    }));
    setItems(reordered);
    setIsDirty(true);
  };

  const handleToggleFeatured = (id: string) => {
    setItems(items.map((it) => (it.id === id ? { ...it, featured: !it.featured } : it)));
    setIsDirty(true);
  };

  const handleTogglePublished = (id: string) => {
    setItems(items.map((it) => (it.id === id ? { ...it, published: it.published === false ? true : false } : it)));
    setIsDirty(true);
  };

  const handleSaveToGitHub = async () => {
    await onSave(items, customCommitMsg || undefined);
    setIsDirty(false);
    setCustomCommitMsg('');
  };

  return (
    <div>
      {/* Top Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--ff-display, "Bebas Neue", sans-serif)', fontSize: '2rem', margin: 0, letterSpacing: '1px', color: '#fff' }}>
            PROJECTS & WORKS
          </h2>
          <p style={{ color: '#71717a', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Manage homepage bento grid projects, tags, specs, and URLs.
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
            title="Reload from GitHub"
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
            <span>Add Project</span>
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

      {isDirty && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(255, 90, 0, 0.1)',
          border: '1px solid rgba(255, 90, 0, 0.3)',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <span style={{ fontSize: '0.85rem', color: '#FF5A00', fontWeight: 500 }}>
            You have unsaved changes. Remember to click "Save to GitHub" to publish.
          </span>
          <input
            type="text"
            placeholder="Optional commit message (e.g. Add Cinelog build)"
            value={customCommitMsg}
            onChange={(e) => setCustomCommitMsg(e.target.value)}
            style={{
              padding: '6px 12px',
              background: '#0d0d0f',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.8rem',
              minWidth: '260px',
            }}
          />
        </div>
      )}

      {/* Projects List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {items.map((p, idx) => (
          <div
            key={p.id}
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
                fontFamily: 'var(--ff-display, "Bebas Neue", sans-serif)',
                fontSize: '1.4rem',
                color: '#52525b',
                width: '32px',
              }}>
                {p.number || (idx + 1).toString().padStart(2, '0')}
              </div>

              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                background: 'rgba(255, 90, 0, 0.12)',
                color: '#FF5A00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Rocket size={22} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>
                    {p.title}
                  </h3>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: p.span === 'bento-wide' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                    color: p.span === 'bento-wide' ? '#60a5fa' : '#c084fc',
                  }}>
                    {p.span || 'bento-wide'}
                  </span>
                  {p.featured && (
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={11} fill="#facc15" /> Featured
                    </span>
                  )}
                  {p.published === false && (
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                      Draft
                    </span>
                  )}
                </div>
                <p style={{ margin: '4px 0 0 0', color: '#a1a1aa', fontSize: '0.83rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.desc}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleToggleFeatured(p.id)}
                style={{
                  padding: '7px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: p.featured ? '#facc15' : '#71717a',
                  cursor: 'pointer',
                }}
                title={p.featured ? 'Unmark Featured' : 'Mark Featured'}
              >
                <Star size={16} fill={p.featured ? '#facc15' : 'none'} />
              </button>

              <button
                type="button"
                onClick={() => handleTogglePublished(p.id)}
                style={{
                  padding: '7px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: p.published !== false ? '#22c55e' : '#71717a',
                  cursor: 'pointer',
                }}
                title={p.published !== false ? 'Published (Click to hide)' : 'Draft (Click to publish)'}
              >
                {p.published !== false ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>

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
                title="Move Up"
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
                title="Move Down"
              >
                <ArrowDown size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingItem(p);
                  setIsNew(false);
                }}
                style={{
                  padding: '7px 12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 500,
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
                onClick={() => setDeleteTargetId(p.id)}
                style={{
                  padding: '7px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '6px',
                  color: '#ef4444',
                  cursor: 'pointer',
                }}
                title="Delete Project"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#71717a' }}>
            No projects found. Click "Add Project" above to create one.
          </div>
        )}
      </div>

      {/* EDIT / CREATE MODAL */}
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
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              color: '#fff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', fontWeight: 600 }}>
              {isNew ? 'Create New Project' : `Edit Project: ${editingItem.title}`}
            </h3>

            <form onSubmit={handleSaveModal}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                    PROJECT TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#0d0d0f',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                    LAYOUT SPAN
                  </label>
                  <select
                    value={editingItem.span || 'bento-wide'}
                    onChange={(e) => setEditingItem({ ...editingItem, span: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#0d0d0f',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="bento-wide">bento-wide (Double Column)</option>
                    <option value="bento-narrow">bento-narrow (Single Column)</option>
                  </select>
                </div>
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
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0d0d0f',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    boxSizing: 'border-box',
                    lineHeight: 1.5,
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
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
                    placeholder="Freestyle, Self Build"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#0d0d0f',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                    SPECS (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={(editingItem.specs || []).join(', ')}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      specs: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })}
                    placeholder="Product Design, 0→200 km/h, Custom ESC"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#0d0d0f',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                    GITHUB REPOSITORY URL
                  </label>
                  <input
                    type="url"
                    value={editingItem.githubUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#0d0d0f',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '6px', fontWeight: 600 }}>
                    LIVE DEMO URL
                  </label>
                  <input
                    type="url"
                    value={editingItem.liveUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, liveUrl: e.target.value })}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#0d0d0f',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Image Upload/URL */}
              <ImageUploader
                label="PROJECT IMAGE (Optional)"
                value={editingItem.image || ''}
                onChange={(url) => setEditingItem({ ...editingItem, image: url })}
                placeholder="/port_pic/1.jpeg or https://..."
              />

              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={editingItem.featured || false}
                    onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                  />
                  <span>Featured on Homepage</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={editingItem.published !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                  />
                  <span>Published (Visible to Visitors)</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  style={{
                    padding: '10px 18px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#d4d4d8',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    background: '#FF5A00',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isNew ? 'Add to List' : 'Apply Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Project"
        message="Are you sure you want to delete this project? You will need to click 'Save to GitHub' to commit the deletion."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
