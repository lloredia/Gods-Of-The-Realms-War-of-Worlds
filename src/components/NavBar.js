'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'HOME' },
  { href: '/battle', label: 'BATTLE' },
  { href: '/collection', label: 'COLLECTION' },
  { href: '/summon', label: 'SUMMON' },
  { href: '/campaign', label: 'CAMPAIGN' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'center',
      gap: 4,
      padding: '8px 16px',
      backgroundColor: '#0d0d1a',
      borderBottom: '1px solid #222',
    }}>
      {NAV_ITEMS.map(item => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} style={{
            padding: '6px 14px',
            fontSize: 11,
            fontWeight: 'bold',
            color: isActive ? '#FFD700' : '#888',
            backgroundColor: isActive ? '#1a1a2e' : 'transparent',
            borderRadius: 4,
            textDecoration: 'none',
            letterSpacing: 1,
            transition: 'all 0.15s',
          }}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
