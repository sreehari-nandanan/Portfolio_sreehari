export interface AdminUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  user: AdminUser | null;
  message?: string;
}

export interface ContentResponse<T = any> {
  file: string;
  content: T;
  sha: string | null;
  isLocalFallback?: boolean;
}

export interface SaveContentResponse {
  success: boolean;
  file: string;
  sha: string;
  commit: string;
  message: string;
  isLocalFallback?: boolean;
}

export interface UploadResponse {
  success: boolean;
  url: string;
  sha?: string;
  isLocalFallback?: boolean;
}

export const api = {
  async checkAuth(): Promise<AuthStatusResponse> {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      });
      if (res.status === 401) {
        return { authenticated: false, user: null };
      }
      if (!res.ok) {
        return { authenticated: false, user: null };
      }
      return await res.json();
    } catch {
      return { authenticated: false, user: null };
    }
  },

  async logout(): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getContent<T = any>(fileName: string): Promise<ContentResponse<T>> {
    const res = await fetch(`/api/content?file=${encodeURIComponent(fileName)}`, {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch ${fileName} (${res.status})`);
    }

    return await res.json();
  },

  async saveContent<T = any>(
    fileName: string,
    content: T,
    sha: string | null,
    message?: string
  ): Promise<SaveContentResponse> {
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        file: fileName,
        content,
        sha,
        message,
      }),
    });

    if (res.status === 409) {
      const err = await res.json().catch(() => ({}));
      const conflictError: any = new Error(
        err.error || 'Conflict: This file was updated on GitHub. Please reload to see latest version.'
      );
      conflictError.isConflict = true;
      throw conflictError;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to save ${fileName} (${res.status})`);
    }

    return await res.json();
  },

  async uploadImage(file: File): Promise<UploadResponse> {
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        filename: file.name,
        data: base64Data,
        mimeType: file.type,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Upload failed (${res.status})`);
    }

    return await res.json();
  },
};
