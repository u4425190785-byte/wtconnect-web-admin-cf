'use client';

import { FormEvent, useEffect, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import {
  AdminApiNotReadyError,
  AdminUser,
  createUser,
  listUsers,
  revokeUser,
  startImpersonation,
} from '@/lib/api-client';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setError(null);
    try {
      setUsers(await listUsers());
      setNotice(null);
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
      setError(msg);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const item = await createUser(email, password);
      setNotice(`Créé : ${item.email} (${item.id})`);
      setEmail('');
      setPassword('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible');
    } finally {
      setBusy(false);
    }
  }

  async function onRevoke(id: string) {
    if (!confirm('Révoquer (ban) ce compte ?')) return;
    setBusy(true);
    setError(null);
    try {
      await revokeUser(id);
      setNotice(`Révoqué : ${id}`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Révocation impossible');
    } finally {
      setBusy(false);
    }
  }

  async function onImpersonate(id: string) {
    setBusy(true);
    setError(null);
    try {
      const { exchange_url } = await startImpersonation(id);
      window.open(exchange_url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impersonation impossible');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Utilisateurs</h1>
      </div>

      {notice && (
        <p style={{ margin: 0, padding: 12, background: '#1e2a1e', border: '1px solid #3d5c3d', borderRadius: 6, fontSize: 13 }}>
          {notice}
        </p>
      )}
      {error && (
        <p style={{ margin: 0, padding: 12, background: '#3a1f1f', color: '#f5c2c2', borderRadius: 6, fontSize: 13 }}>
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => void onCreate(e)}
        style={{
          display: 'grid',
          gap: 10,
          padding: 16,
          background: '#1a2330',
          border: '1px solid #2a3440',
          borderRadius: 8,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 15 }}>Créer un compte</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <input
            type="email"
            required
            placeholder="email@exemple.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            required
            placeholder="Mot de passe temporaire"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" disabled={busy} style={btnStyle}>
            Créer
          </button>
        </div>
      </form>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #2a3440' }}>
              <th style={th}>E-mail</th>
              <th style={th}>Id</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: 12, color: '#8b9aab' }}>
                  Aucun user chargé (normal en phase 0).
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #1e2630' }}>
                  <td style={td}>{u.email}</td>
                  <td style={{ ...td, fontFamily: 'monospace', fontSize: 12 }}>{u.id}</td>
                  <td style={{ ...td, display: 'flex', gap: 8 }}>
                    <button type="button" disabled={busy} onClick={() => void onImpersonate(u.id)} style={btnGhost}>
                      Voir en tant que
                    </button>
                    <button type="button" disabled={busy} onClick={() => void onRevoke(u.id)} style={btnDanger}>
                      Révoquer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: CSSProperties = { padding: '8px 10px', color: '#8b9aab', fontWeight: 600 };
const td: CSSProperties = { padding: '10px' };

const inputStyle: CSSProperties = {
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #3d4f63',
  background: '#0f1419',
  color: '#e7ecf1',
  minWidth: 180,
};

const btnStyle: CSSProperties = {
  padding: '8px 14px',
  borderRadius: 6,
  border: 'none',
  background: '#2d6a4f',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnGhost: CSSProperties = {
  ...btnStyle,
  background: 'transparent',
  border: '1px solid #3d4f63',
  color: '#e7ecf1',
  fontWeight: 500,
};

const btnDanger: CSSProperties = {
  ...btnStyle,
  background: '#6b2d2d',
};
