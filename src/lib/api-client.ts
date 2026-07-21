/**
 * Client API Super Admin — stubs phase 0.
 * Les routes /admin/* ne sont pas encore déployées : les appels échoueront jusqu’à la phase 2.
 */
const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

export class AdminApiNotReadyError extends Error {
  constructor(message = 'API Super Admin non déployée ou non configurée (SUPER_ADMIN_EMAILS)') {
    super(message);
    this.name = 'AdminApiNotReadyError';
  }
}

async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL manquant');
  }
  return fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
}

function assertAdminReady(res: Response): void {
  if (res.status === 404 || res.status === 503) {
    throw new AdminApiNotReadyError();
  }
}

export async function adminLogin(email: string, password: string): Promise<{ email: string }> {
  const res = await adminFetch('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  assertAdminReady(res);
  const body = (await res.json().catch(() => null)) as { user?: { email?: string }; error?: string } | null;
  if (!res.ok || !body?.user?.email) {
    throw new Error(body?.error || 'Connexion admin impossible');
  }
  return { email: body.user.email };
}

export type AdminUser = {
  id: string;
  email: string;
  banned?: boolean;
  created_at?: string;
};

export async function listUsers(): Promise<AdminUser[]> {
  const res = await adminFetch('/admin/users?per_page=50');
  assertAdminReady(res);
  const body = (await res.json().catch(() => null)) as { items?: AdminUser[]; error?: string } | null;
  if (!res.ok) throw new Error(body?.error || 'Liste users impossible');
  return body?.items || [];
}

export async function createUser(email: string, password: string): Promise<AdminUser & { password?: string }> {
  const res = await adminFetch('/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  assertAdminReady(res);
  const body = (await res.json().catch(() => null)) as
    | { item?: AdminUser & { password?: string }; error?: string }
    | null;
  if (!res.ok || !body?.item) throw new Error(body?.error || 'Création impossible');
  return body.item;
}

export async function revokeUser(userId: string): Promise<void> {
  const res = await adminFetch(`/admin/users/${encodeURIComponent(userId)}/revoke`, {
    method: 'POST',
    body: JSON.stringify({ mode: 'ban', remove_memberships: false }),
  });
  assertAdminReady(res);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || 'Révocation impossible');
  }
}

export async function startImpersonation(userId: string): Promise<{ exchange_url: string }> {
  const res = await adminFetch('/admin/impersonate', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
  assertAdminReady(res);
  const body = (await res.json().catch(() => null)) as { exchange_url?: string; error?: string } | null;
  if (!res.ok || !body?.exchange_url) throw new Error(body?.error || 'Impersonation impossible');
  return { exchange_url: body.exchange_url };
}
