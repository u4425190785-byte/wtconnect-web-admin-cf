'use client';

import { useEffect, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  AdminApiNotReadyError,
  AdminTenant,
  AdminTenantMember,
  listTenantMembers,
  listTenants,
  startImpersonation,
} from '@/lib/api-client';

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<AdminTenant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [membersByTenant, setMembersByTenant] = useState<Record<string, AdminTenantMember[]>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      try {
        const items = await listTenants();
        if (!cancelled) setTenants(items);
      } catch (err) {
        if (err instanceof AdminApiNotReadyError) {
          router.replace('/login');
          return;
        }
        const msg = err instanceof Error ? err.message : 'Erreur chargement';
        if (/Authentification|401|Session|Super Admin/i.test(msg)) {
          router.replace('/login');
          return;
        }
        if (!cancelled) setError(msg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function toggleTenant(t: AdminTenant) {
    if (openId === t.id) {
      setOpenId(null);
      return;
    }
    setOpenId(t.id);
    if (membersByTenant[t.id]) return;
    setLoadingId(t.id);
    setError(null);
    try {
      const result = await listTenantMembers(t.id);
      setMembersByTenant((prev) => ({ ...prev, [t.id]: result.items }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement des utilisateurs impossible');
      setOpenId(null);
    } finally {
      setLoadingId(null);
    }
  }

  async function onImpersonate(userId: string) {
    setBusy(true);
    setError(null);
    try {
      const { exchange_url } = await startImpersonation(userId);
      window.open(exchange_url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impersonation impossible');
    } finally {
      setBusy(false);
    }
  }

  function onRowKey(e: KeyboardEvent<HTMLTableRowElement>, t: AdminTenant) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      void toggleTenant(t);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20 }}>Sociétés</h1>
        <p style={{ margin: '8px 0 0', color: '#8b9aab', fontSize: 13 }}>
          Plus ancienne en premier. Cliquez une ligne pour voir les utilisateurs rattachés.
        </p>
      </div>

      {error && (
        <p style={{ margin: 0, padding: 12, background: '#3a1f1f', color: '#f5c2c2', borderRadius: 6, fontSize: 13 }}>
          {error}
        </p>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #2a3440' }}>
              <th style={th}>Société</th>
              <th style={th}>SIREN</th>
              <th style={th}>Créée le</th>
              <th style={th}>Utilisateurs</th>
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 12, color: '#8b9aab' }}>
                  Aucune société.
                </td>
              </tr>
            ) : (
              tenants.map((t) => {
                const open = openId === t.id;
                const members = membersByTenant[t.id];
                const title = t.legal_name || t.name;
                const subtitle = t.legal_name && t.legal_name !== t.name ? t.name : t.code;
                return (
                  <TenantRows
                    key={t.id}
                    tenant={t}
                    title={title}
                    subtitle={subtitle}
                    open={open}
                    loading={loadingId === t.id}
                    members={members}
                    busy={busy}
                    onToggle={() => void toggleTenant(t)}
                    onRowKey={(e) => onRowKey(e, t)}
                    onImpersonate={(id) => void onImpersonate(id)}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TenantRows({
  tenant,
  title,
  subtitle,
  open,
  loading,
  members,
  busy,
  onToggle,
  onRowKey,
  onImpersonate,
}: {
  tenant: AdminTenant;
  title: string;
  subtitle: string | null;
  open: boolean;
  loading: boolean;
  members?: AdminTenantMember[];
  busy: boolean;
  onToggle: () => void;
  onRowKey: (e: KeyboardEvent<HTMLTableRowElement>) => void;
  onImpersonate: (userId: string) => void;
}) {
  return (
    <>
      <tr
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={onRowKey}
        style={{
          borderBottom: open ? 'none' : '1px solid #1e2630',
          cursor: 'pointer',
          background: tenant.first_created ? '#16231c' : open ? '#151c24' : 'transparent',
        }}
      >
        <td style={td}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <strong>{title}</strong>
            {tenant.first_created && <span style={badge}>1re société créée</span>}
          </div>
          {subtitle ? <div style={{ color: '#8b9aab', marginTop: 4 }}>{subtitle}</div> : null}
        </td>
        <td style={{ ...td, fontFamily: 'monospace' }}>{tenant.siren || '—'}</td>
        <td style={td}>{formatDate(tenant.created_at)}</td>
        <td style={td}>{tenant.user_count}</td>
      </tr>
      {open && (
        <tr>
          <td colSpan={4} style={{ padding: '0 10px 12px', borderBottom: '1px solid #1e2630', background: '#151c24' }}>
            {loading && !members ? (
              <p style={{ margin: 0, padding: '8px 0', color: '#8b9aab' }}>Chargement des utilisateurs…</p>
            ) : !members?.length ? (
              <p style={{ margin: 0, padding: '8px 0', color: '#8b9aab' }}>Aucun utilisateur rattaché.</p>
            ) : (
              <div style={{ display: 'grid', gap: 6, paddingTop: 4 }}>
                <p style={{ margin: 0, color: '#8b9aab', fontSize: 12 }}>
                  {members.length} utilisateur{members.length > 1 ? 's' : ''} rattaché
                  {members.length > 1 ? 's' : ''}
                </p>
                {members.map((m) => (
                  <div
                    key={m.user_id}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      background: '#1a2330',
                      borderRadius: 6,
                    }}
                  >
                    <span>{m.email || m.user_id}</span>
                    <span style={{ color: '#8b9aab' }}>{m.role || '—'}</span>
                    {m.banned && <span style={{ color: '#f5c2c2' }}>révoqué</span>}
                    {m.email && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={(e) => {
                          e.stopPropagation();
                          onImpersonate(m.user_id);
                        }}
                        style={btnGhost}
                      >
                        Voir en tant que
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('fr-FR');
}

const th: CSSProperties = { padding: '8px 10px', color: '#8b9aab', fontWeight: 600 };
const td: CSSProperties = { padding: '10px' };

const badge: CSSProperties = {
  fontSize: 11,
  fontWeight: 650,
  color: '#b7e4c7',
  background: '#1b4332',
  borderRadius: 999,
  padding: '2px 8px',
};

const btnGhost: CSSProperties = {
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid #3d4f63',
  background: 'transparent',
  color: '#e7ecf1',
  fontWeight: 500,
  cursor: 'pointer',
};
