import Link from 'next/link';
import type { CSSProperties } from 'react';

export default function HomePage() {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div>
        <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>Console Super Admin</h1>
        <p style={{ margin: 0, color: '#8b9aab', fontSize: 14, lineHeight: 1.5 }}>
          Console ops séparée du portail. Connecte-toi avec un compte listé dans{' '}
          <code>SUPER_ADMIN_EMAILS</code>, puis ouvre <strong>Utilisateurs</strong>.
        </p>
      </div>

      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <Link href="/login" style={linkBtn}>
          1. Login admin
        </Link>
        <Link href="/users" style={linkBtn}>
          2. Utilisateurs
        </Link>
      </nav>

      <ol style={{ margin: 0, paddingLeft: 18, color: '#b6c2ce', fontSize: 14, lineHeight: 1.7 }}>
        <li>Login admin (e-mail allowlist, ex. c.fontaine@2sn.fr)</li>
        <li>Page Utilisateurs → liste, créer un compte, révoquer</li>
        <li>« Voir en tant que » → ouvre le portail (page /impersonate à finaliser côté portail)</li>
      </ol>
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
