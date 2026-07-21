import Link from 'next/link';
import type { CSSProperties } from 'react';

export default function HomePage() {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div>
        <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>Console Super Admin</h1>
        <p style={{ margin: 0, color: '#8b9aab', fontSize: 14, lineHeight: 1.5 }}>
          Squelette prêt pour un repo GitHub + Cloudflare Pages dédiés. Aucune route{' '}
          <code>/admin/*</code> n’est encore déployée sur l’API — le portail et l’existant restent
          inchangés.
        </p>
      </div>

      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <Link href="/login" style={linkBtn}>
          Login admin
        </Link>
        <Link href="/users" style={linkBtn}>
          Utilisateurs
        </Link>
      </nav>

      <ul style={{ margin: 0, paddingLeft: 18, color: '#b6c2ce', fontSize: 14, lineHeight: 1.7 }}>
        <li>Créer un compte Auth (e-mail / MDP)</li>
        <li>Révoquer un compte</li>
        <li>« Se connecter en tant que » (impersonation — phase ultérieure)</li>
      </ul>

      <p style={{ margin: 0, fontSize: 13, color: '#6b7a8a' }}>
        Spec : <code>docs/ADR-SUPER-ADMIN.md</code> · Contrat :{' '}
        <code>wtconnect-admin/docs/API-CONTRACT.md</code>
      </p>
    </div>
  );
}

const linkBtn: CSSProperties = {
  display: 'inline-block',
  padding: '10px 14px',
  background: '#1a2330',
  border: '1px solid #3d4f63',
  borderRadius: 6,
  color: '#e7ecf1',
  textDecoration: 'none',
  fontSize: 14,
};
