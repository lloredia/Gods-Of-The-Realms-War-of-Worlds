'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { loadSave } from '../utils/saveSystem';

const NAV_ITEMS = [
  { href: '/', label: 'HOME' },
  { href: '/battle', label: 'BATTLE' },
  { href: '/collection', label: 'COLLECTION' },
  { href: '/summon', label: 'SUMMON' },
  { href: '/campaign', label: 'CAMPAIGN' },
  { href: '/arena', label: 'ARENA' },
  { href: '/faction-wars', label: 'WARS' },
  { href: '/endless', label: 'ENDLESS' },
  { href: '/settings', label: '\u2699' },
];

export default function NavBar() {
  const pathname = usePathname();
  const [resources, setResources] = useState(null);

  useEffect(() => {
    setResources(loadSave().resources);
    // Poll for changes every 2 seconds
    const interval = setInterval(() => {
      setResources(loadSave().resources);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
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
    {resources && (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        padding: '4px 16px',
        backgroundColor: '#0a0a15',
        borderBottom: '1px solid #1a1a2e',
        fontSize: 10,
      }}>
        <span style={{ color: '#FFD700' }}>Gold: {resources.gold?.toLocaleString()}</span>
        <span style={{ color: '#CE93D8' }}>Essences: {resources.essences}</span>
        <span style={{ color: '#4FC3F7' }}>Stones: {resources.awakenStones}</span>
      </div>
    )}
    </>
  );
}
