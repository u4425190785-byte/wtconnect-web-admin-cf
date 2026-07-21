'use client';

import { FormEvent, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin, AdminApiNotReadyError } from '@/lib/api-client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminLogin(email, password);
      router.push('/users');
    } catch (err) {
      if (err instanceof AdminApiNotReadyError) {
        setError(
          'API Super Admin pas encore déployée (phase 0). Les écrans UI sont prêts ; brancher /admin/* plus tard sans toucher au portail.'
        );
      } else {
        setError(err instanceof Error ? err.message : 'Erreur');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      style={{
        maxWidth: 400,
        display: 'grid',
        gap: 12,
        padding: 20,
        background: '#1a2330',
        border: '1px solid #2a3440',
        borderRadius: 8,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 18 }}>Login Super Admin</h1>
      <p style={{ margin: 0, fontSize: 13, color: '#8b9aab' }}>
        Réservé aux opérateurs (allowlist). Pas le login portail utilisateur.
      </p>
      {error && (
        <p style={{ margin: 0, padding: 10, background: '#3a1f1f', color: '#f5c2c2', fontSize: 13 }}>
          {error}
        </p>
      )}
      <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
        E-mail
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
        Mot de passe
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
      </label>
      <button type="submit" disabled={busy} style={btnStyle}>
        {busy ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}

const inputStyle: CSSProperties = {
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #3d4f63',
  background: '#0f1419',
  color: '#e7ecf1',
};

const btnStyle: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 6,
  border: 'none',
  background: '#2d6a4f',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
};
