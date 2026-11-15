import type {
  ActivityLog,
  AdminUserSummary,
  ClaimRecord,
  ClaimStatus,
  DashboardStats,
  ItemStatus,
  LostFoundItem,
  PortalNotification,
  User,
  UserRole,
  UserStatus,
} from '../types';

const TOKEN_STORAGE_KEY = 'lf_portal_token_v1';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (data as { error?: string }).error || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}

export const portalApi = {
  login(payload: { email: string; password: string; portalRole?: UserRole }) {
    return apiFetch<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  register(payload: {
    name: string;
    email: string;
    studentId: string;
    department: string;
    phone: string;
    residence: string;
    password: string;
  }) {
    return apiFetch<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  forgotPassword(payload: { email: string; newPassword?: string }) {
    return apiFetch<{ verified?: boolean; resetComplete?: boolean; message: string }>(
      '/api/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },
  getMe() {
    return apiFetch<{ user: User }>('/api/auth/me');
  },
  updateProfile(payload: {
    name: string;
    department: string;
    phone: string;
    residence: string;
  }) {
    return apiFetch<{ user: User }>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  getStats() {
    return apiFetch<DashboardStats>('/api/stats');
  },
  getItems(params?: Record<string, string>) {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return apiFetch<{ items: LostFoundItem[] }>(`/api/items${qs ? `?${qs}` : ''}`);
  },
  getItemById(id: string) {
    return apiFetch<{ item: LostFoundItem }>(`/api/items/${encodeURIComponent(id)}`);
  },
  createItem(payload: {
    type: 'lost' | 'found';
    title: string;
    category: string;
    description: string;
    location: string;
    specificSpot: string;
    date: string;
    imageUrl?: string;
    identifyingDetails: string;
    confidentialDetails: string;
    dropoffLocation?: string;
  }) {
    return apiFetch<{ item: LostFoundItem }>('/api/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateItem(
    id: string,
    payload: Partial<{
      status: ItemStatus;
      title: string;
      description: string;
      location: string;
      specificSpot: string;
      identifyingDetails: string;
      dropoffLocation: string;
    }>
  ) {
    return apiFetch<{ item: LostFoundItem }>(`/api/items/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  deleteItem(id: string) {
    return apiFetch<{ deleted: boolean }>(`/api/items/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
  getClaims() {
    return apiFetch<{ claims: ClaimRecord[] }>('/api/claims');
  },
  submitClaim(payload: {
    itemId: string;
    ownershipProof: string;
    distinguishingMarks: string;
    contactPhone: string;
    preferredPickup: string;
  }) {
    return apiFetch<{ claim: ClaimRecord }>('/api/claims', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  reviewClaim(
    id: string,
    payload: {
      status: ClaimStatus;
      reviewerNotes?: string;
      pickupInstructions?: string;
    }
  ) {
    return apiFetch<{ claim: ClaimRecord }>(`/api/claims/${encodeURIComponent(id)}/review`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  getNotifications() {
    return apiFetch<{ notifications: PortalNotification[] }>('/api/notifications');
  },
  markNotificationRead(id: string) {
    return apiFetch<{ notification: PortalNotification }>(
      `/api/notifications/${encodeURIComponent(id)}/read`,
      { method: 'PATCH' }
    );
  },
  markAllNotificationsRead() {
    return apiFetch<{ ok: boolean }>('/api/notifications/read-all', {
      method: 'PATCH',
    });
  },
  getAdminOverview() {
    return apiFetch<{ users: AdminUserSummary[]; activities: ActivityLog[] }>(
      '/api/admin/overview'
    );
  },
  updateAdminUser(id: string, payload: { status?: UserStatus; role?: UserRole }) {
    return apiFetch<{ user: User }>(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '—';
  const parsed = dateStr.includes('T') ? new Date(dateStr) : new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortTimestamp(isoStr: string): string {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}
