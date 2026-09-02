'use client';

import { useEffect, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  AdminApiNotReadyError,
  AdminTenantGroup,
  AdminTenantGroupSociety,
  AdminTenantMember,
  listTenantGroups,
  listTenantMembers,
  startImpersonation,
} from '@/lib/api-client';

export default function TenantsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<AdminTenantGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [openSocietyId, setOpenSocietyId] = useState<string | null>(null);
  const [membersBySociety, setMembersBySociety] = useState<Record<string, AdminTenantMember[]>>({});
  const [loadingSocietyId, setLoadingSocietyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      try {
        const items = await listTenantGroups();
        if (!cancelled) setGroups(items);
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

  function toggleGroup(g: AdminTenantGroup) {
    if (openGroupId === g.id) {
      setOpenGroupId(null);
      setOpenSocietyId(null);
      return;
    }
    setOpenGroupId(g.id);
    setOpenSocietyId(null);
  }

  async function toggleSociety(e: MouseEvent, society: AdminTenantGroupSociety) {
    e.stopPropagation();
    if (openSocietyId === society.id) {
      setOpenSocietyId(null);
      return;
    }
    setOpenSocietyId(society.id);
    if (membersBySociety[society.id]) return;
    setLoadingSocietyId(society.id);
    setError(null);
    try {
      const result = await listTenantMembers(society.id);
      setMembersBySociety((prev) => ({ ...prev, [society.id]: result.items }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement des utilisateurs impossible');
      setOpenSocietyId(null);
    } finally {
      setLoadingSocietyId(null);
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

  function onGroupKey(e: KeyboardEvent<HTMLTableRowElement>, g: AdminTenantGroup) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleGroup(g);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20 }}>Sociétés</h1>
        <p style={{ margin: '8px 0 0', color: '#8b9aab', fontSize: 13 }}>
          Un compte = le titulaire et toutes ses sociétés (ex. INGER + LOGAFRET). Cliquez pour voir
          les sociétés, puis une société pour voir les utilisateurs.
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
              <th style={th}>1re société</th>
              <th style={th}>Titulaire</th>
              <th style={th}>Sociétés</th>
              <th style={th}>Utilisateurs</th>
              <th style={th}>Créé le</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 12, color: '#8b9aab' }}>
                  Aucun compte société.
                </td>
              </tr>
            ) : (
              groups.map((g) => (
                <GroupRows
                  key={g.id}
                  group={g}
                  open={openGroupId === g.id}
                  openSocietyId={openSocietyId}
                  membersBySociety={membersBySociety}
                  loadingSocietyId={loadingSocietyId}
                  busy={busy}
                  onToggle={() => toggleGroup(g)}
                  onRowKey={(e) => onGroupKey(e, g)}
                  onToggleSociety={toggleSociety}
                  onImpersonate={(id) => void onImpersonate(id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GroupRows({
  group,
  open,
  openSocietyId,
  membersBySociety,
  loadingSocietyId,
  busy,
  onToggle,
  onRowKey,
  onToggleSociety,
  onImpersonate,
}: {
  group: AdminTenantGroup;
  open: boolean;
  openSocietyId: string | null;
  membersBySociety: Record<string, AdminTenantMember[]>;
  loadingSocietyId: string | null;
  busy: boolean;
  onToggle: () => void;
  onRowKey: (e: KeyboardEvent<HTMLTableRowElement>) => void;
  onToggleSociety: (e: MouseEvent, society: AdminTenantGroupSociety) => void;
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
          background: group.first_created ? '#16231c' : open ? '#151c24' : 'transparent',
        }}
      >
        <td style={td}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <strong>{group.name}</strong>
            {group.first_created && <span style={badge}>1re société créée</span>}
          </div>
          {group.code && group.code !== group.name ? (
            <div style={{ color: '#8b9aab', marginTop: 4 }}>{group.code}</div>
          ) : null}
        </td>
        <td style={td}>{group.owner_email || '—'}</td>
        <td style={td}>{group.society_count}</td>
        <td style={td}>{group.user_count}</td>
        <td style={td}>{formatDate(group.created_at)}</td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} style={{ padding: '0 10px 12px', borderBottom: '1px solid #1e2630', background: '#151c24' }}>
            <p style={{ margin: '8px 0', color: '#8b9aab', fontSize: 12 }}>
              {group.society_count} société{group.society_count > 1 ? 's' : ''} · {group.user_count}{' '}
              utilisateur{group.user_count > 1 ? 's' : ''}
            </p>
            <div style={{ display: 'grid', gap: 8 }}>
              {group.societies.map((s) => {
                const title = s.legal_name || s.name;
                const societyOpen = openSocietyId === s.id;
                const members = membersBySociety[s.id];
                return (
                  <div
                    key={s.id}
                    style={{
                      background: '#1a2330',
                      borderRadius: 6,
                      border: '1px solid #2a3440',
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => onToggleSociety(e, s)}
                      style={societyBtn}
                    >
                      <span>
                        <strong>{title}</strong>
                        {s.legal_name && s.legal_name !== s.name ? (
                          <span style={{ color: '#8b9aab', marginLeft: 8 }}>{s.name}</span>
                        ) : s.code ? (
                          <span style={{ color: '#8b9aab', marginLeft: 8 }}>{s.code}</span>
                        ) : null}
                      </span>
                      <span style={{ color: '#8b9aab' }}>
                        {s.siren || '—'} · {s.user_count} utilisateur{s.user_count > 1 ? 's' : ''} ·{' '}
                        {formatDate(s.created_at)}
                      </span>
                    </button>
                    {societyOpen && (
                      <div style={{ padding: '0 10px 10px' }}>
                        {loadingSocietyId === s.id && !members ? (
                          <p style={{ margin: 0, color: '#8b9aab' }}>Chargement des utilisateurs…</p>
                        ) : !members?.length ? (
                          <p style={{ margin: 0, color: '#8b9aab' }}>Aucun utilisateur rattaché.</p>
                        ) : (
                          <div style={{ display: 'grid', gap: 6 }}>
                            {members.map((m) => (
                              <div key={m.user_id} style={memberRow}>
                                <span>{m.email || m.user_id}</span>
                                <span style={{ color: '#8b9aab' }}>{m.role || '—'}</span>
                                {m.banned && <span style={{ color: '#f5c2c2' }}>révoqué</span>}
                                {m.email && (
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => onImpersonate(m.user_id)}
                                    style={btnGhost}
                                  >
                                    Voir en tant que
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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

const societyBtn: CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 8,
  textAlign: 'left',
  padding: '10px',
  background: 'transparent',
  border: 'none',
  color: '#e7ecf1',
  cursor: 'pointer',
  fontSize: 13,
};

const memberRow: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 10,
  padding: '8px 10px',
  background: '#0f1419',
  borderRadius: 6,
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
