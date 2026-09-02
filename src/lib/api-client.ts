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
  if (res.status === 401 || res.status === 403) {
    throw new Error('Authentification requise');
  }
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

export async function addUserToSameTenants(
  sourceUserId: string,
  email: string,
  password?: string
): Promise<{
  item: AdminUser & { password?: string };
  created: boolean;
  memberships: { tenant_id: string; tenant_name: string | null; role: string }[];
}> {
  const res = await adminFetch(`/admin/users/${encodeURIComponent(sourceUserId)}/add-user`, {
    method: 'POST',
    body: JSON.stringify({
      email,
      ...(password ? { password } : {}),
      role: 'admin',
    }),
  });
  assertAdminReady(res);
  const body = (await res.json().catch(() => null)) as {
    item?: AdminUser & { password?: string };
    created?: boolean;
    memberships?: { tenant_id: string; tenant_name: string | null; role: string }[];
    error?: string;
  } | null;
  if (!res.ok || !body?.item) throw new Error(body?.error || 'Ajout utilisateur impossible');
  return {
    item: body.item,
    created: !!body.created,
    memberships: body.memberships || [],
  };
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

export type AdminTenant = {
  id: string;
  name: string;
  legal_name: string | null;
  code: string | null;
  siren: string | null;
  created_at: string | null;
  user_count: number;
  first_created: boolean;
};

export type AdminTenantMember = {
  user_id: string;
  email: string;
  role: string;
  created_at?: string | null;
  banned?: boolean;
};

export async function listTenants(): Promise<AdminTenant[]> {
  const res = await adminFetch('/admin/tenants');
  assertAdminReady(res);
  if (res.status === 401 || res.status === 403) {
    throw new Error('Authentification requise');
  }
  const body = (await res.json().catch(() => null)) as { items?: AdminTenant[]; error?: string } | null;
  if (!res.ok) throw new Error(body?.error || 'Liste sociétés impossible');
  return body?.items || [];
}

export type AdminTenantGroupSociety = {
  id: string;
  name: string;
  legal_name: string | null;
  code: string | null;
  siren: string | null;
  created_at: string | null;
  user_count: number;
};

export type AdminTenantGroup = {
  id: string;
  owner_user_id: string | null;
  owner_email: string;
  name: string;
  legal_name: string | null;
  code: string | null;
  siren: string | null;
  created_at: string | null;
  user_count: number;
  society_count: number;
  first_created: boolean;
  societies: AdminTenantGroupSociety[];
};

export async function listTenantGroups(): Promise<AdminTenantGroup[]> {
  const res = await adminFetch('/admin/tenant-groups');
  assertAdminReady(res);
  if (res.status === 401 || res.status === 403) {
    throw new Error('Authentification requise');
  }
  const body = (await res.json().catch(() => null)) as { items?: AdminTenantGroup[]; error?: string } | null;
  if (!res.ok) throw new Error(body?.error || 'Liste des comptes société impossible');
  return body?.items || [];
}

export async function listTenantMembers(tenantId: string): Promise<{
  tenant: { id: string; name: string };
  items: AdminTenantMember[];
  user_count: number;
}> {
  const res = await adminFetch(`/admin/tenants/${encodeURIComponent(tenantId)}/members`);
  assertAdminReady(res);
  if (res.status === 401 || res.status === 403) {
    throw new Error('Authentification requise');
  }
  const body = (await res.json().catch(() => null)) as {
    tenant?: { id: string; name: string };
    items?: AdminTenantMember[];
    user_count?: number;
    error?: string;
  } | null;
  if (!res.ok || !body?.tenant) throw new Error(body?.error || 'Membres société impossibles');
  return {
    tenant: body.tenant,
    items: body.items || [],
    user_count: typeof body.user_count === 'number' ? body.user_count : (body.items || []).length,
  };
}
