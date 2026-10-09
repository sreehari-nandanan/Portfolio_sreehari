import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Check, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Image',
  placeholder = '/port_pic/1.jpeg or https://...',
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);
    setUploading(true);

    try {
      const res = await api.uploadImage(file);
      onChange(res.url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#aaa', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </label>
      )}

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: '#0d0d0f',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.88rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '10px 16px',
            background: uploading ? '#333' : 'rgba(255, 90, 0, 0.15)',
            border: '1px solid rgba(255, 90, 0, 0.3)',
            borderRadius: '8px',
            color: '#FF5A00',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: uploading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload size={16} /> Upload Image
            </>
          )}
        </button>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.8rem', marginTop: '6px' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontSize: '0.8rem', marginTop: '6px' }}>
          <Check size={14} /> Uploaded and linked successfully!
        </div>
      )}

      {/* Image Preview thumbnail if available */}
      {value && (
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            overflow: 'hidden',
            background: '#050505',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img
              src={value}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <span style={{ fontSize: '0.75rem', color: '#777' }}>Preview</span>
        </div>
      )}
    </div>
  );
};
