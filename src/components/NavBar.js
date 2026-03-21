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
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      padding: '8px 16px',
      backgroundColor: 'rgba(13, 13, 26, 0.85)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Game logo */}
      <span style={{
        color: '#FFD700',
        fontWeight: 900,
        fontSize: 16,
        letterSpacing: 3,
        marginRight: 12,
        textShadow: '0 0 8px rgba(255, 215, 0, 0.4)',
        fontFamily: 'serif',
        userSelect: 'none',
      }}>
        GOTR
      </span>

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
            transition: 'all 0.2s ease',
            borderBottom: isActive ? '2px solid rgba(255, 215, 0, 0.6)' : '2px solid transparent',
            textShadow: isActive ? '0 0 6px rgba(255, 215, 0, 0.3)' : 'none',
          }}
          onMouseEnter={e => {
            if (!isActive) {
              e.currentTarget.style.color = '#FFD700';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.textShadow = '0 0 8px rgba(255, 215, 0, 0.4)';
            }
          }}
          onMouseLeave={e => {
            if (!isActive) {
              e.currentTarget.style.color = '#888';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.textShadow = 'none';
            }
          }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
    {resources && (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        padding: '5px 16px',
        background: 'linear-gradient(180deg, rgba(10, 10, 21, 0.95) 0%, rgba(13, 13, 30, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 215, 0, 0.05)',
        fontSize: 11,
        position: 'sticky',
        top: 41,
        zIndex: 99,
      }}>
        <span style={{ color: '#FFD700' }}>{'\uD83E\uDE99'} {resources.gold?.toLocaleString()}</span>
        <span style={{ color: 'rgba(255, 215, 0, 0.15)', fontSize: 10, userSelect: 'none' }}>|</span>
        <span style={{ color: '#CE93D8' }}>{'\uD83D\uDC8E'} {resources.essences}</span>
        <span style={{ color: 'rgba(255, 215, 0, 0.15)', fontSize: 10, userSelect: 'none' }}>|</span>
        <span style={{ color: '#4FC3F7' }}>{'\uD83D\uDCA0'} {resources.awakenStones}</span>
      </div>
    )}
    </>
  );
}
