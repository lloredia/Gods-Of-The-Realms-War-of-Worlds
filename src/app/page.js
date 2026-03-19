'use client';

import Link from 'next/link';

const MENU_ITEMS = [
  {
    href: '/battle',
    title: 'BATTLE',
    desc: 'Assemble your team and clash against rival gods in real-time combat.',
    gradient: 'linear-gradient(135deg, #1a0a0a 0%, #3d0c0c 100%)',
    border: '#8b0000',
    icon: '\u2694\uFE0F',
  },
  {
    href: '/collection',
    title: 'COLLECTION',
    desc: 'Browse your pantheon of heroes. Level up, awaken, and equip relics.',
    gradient: 'linear-gradient(135deg, #0a1a0a 0%, #0c3d1a 100%)',
    border: '#228B22',
    icon: '\uD83D\uDCDC',
  },
  {
    href: '/summon',
    title: 'SUMMON',
    desc: 'Call upon the divine gates to recruit legendary gods and warriors.',
    gradient: 'linear-gradient(135deg, #1a0a1a 0%, #3d0c3d 100%)',
    border: '#8b008b',
    icon: '\u2728',
  },
  {
    href: '/campaign',
    title: 'CAMPAIGN',
    desc: 'Conquer mythic stages across realms and earn powerful rewards.',
    gradient: 'linear-gradient(135deg, #0a0a1a 0%, #0c1a3d 100%)',
    border: '#1e3a8a',
    icon: '\uD83D\uDDFA\uFE0F',
  },
];

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#080810',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 20px 40px',
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h1 style={{
          fontSize: 42,
          fontWeight: 900,
          background: 'linear-gradient(180deg, #FFD700, #B8860B)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: 3,
          margin: 0,
          textTransform: 'uppercase',
          textShadow: '0 0 40px rgba(255, 215, 0, 0.3)',
        }}>
          Gods Of The Realms
        </h1>
        <p style={{
          fontSize: 14,
          color: '#aaa',
          letterSpacing: 6,
          margin: '6px 0 0',
          fontWeight: 300,
          textTransform: 'uppercase',
        }}>
          War of Worlds
        </p>
      </div>

      {/* Decorative divider */}
      <div style={{
        width: 120,
        height: 1,
        background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
        margin: '20px 0 40px',
      }} />

      {/* Menu Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 20,
        maxWidth: 640,
        width: '100%',
      }}>
        {MENU_ITEMS.map(item => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: item.gradient,
              border: `1px solid ${item.border}44`,
              borderRadius: 10,
              padding: '24px 20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minHeight: 110,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.border = `1px solid ${item.border}`;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${item.border}33`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = `1px solid ${item.border}44`;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#e0e0e0',
                  letterSpacing: 2,
                }}>
                  {item.title}
                </span>
              </div>
              <p style={{
                fontSize: 12,
                color: '#888',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer tag */}
      <p style={{
        marginTop: 50,
        fontSize: 10,
        color: '#333',
        letterSpacing: 2,
        textTransform: 'uppercase',
      }}>
        Choose your path, Summoner
      </p>
    </div>
  );
}
