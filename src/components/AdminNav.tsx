'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CSSProperties } from 'react';

export function AdminNav() {
  const pathname = usePathname();
  if (pathname === '/login' || pathname === '/') return null;

  return (
    <nav style={{ display: 'flex', gap: 8, marginLeft: 16 }} aria-label="Super Admin">
      <Link href="/users" style={linkStyle(pathname.startsWith('/users'))}>
        Utilisateurs
      </Link>
      <Link href="/tenants" style={linkStyle(pathname.startsWith('/tenants'))}>
        Sociétés
      </Link>
    </nav>
  );
}

function linkStyle(active: boolean): CSSProperties {
  return {
    color: active ? '#e7ecf1' : '#8b9aab',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: active ? 650 : 500,
    padding: '4px 10px',
    borderRadius: 6,
    background: active ? '#1a2330' : 'transparent',
    border: active ? '1px solid #2a3440' : '1px solid transparent',
  };
}
