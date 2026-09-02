import type { ReactNode } from 'react';
import { AdminNav } from '@/components/AdminNav';

export const metadata = {
  title: 'WTConnect Super Admin',
  description: 'Console Super Admin WTConnect',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, Segoe UI, sans-serif',
          background: '#0f1419',
          color: '#e7ecf1',
          minHeight: '100vh',
        }}
      >
        <header
          style={{
            borderBottom: '1px solid #2a3440',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <strong style={{ letterSpacing: '0.02em' }}>WTConnect Super Admin</strong>
          <AdminNav />
        </header>
        <main style={{ maxWidth: 1080, margin: '0 auto', padding: '24px' }}>{children}</main>
      </body>
    </html>
  );
}
