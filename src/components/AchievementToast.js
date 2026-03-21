'use client';

import { useState, useEffect } from 'react';
import achievements from '../data/achievements';

export default function AchievementToast({ achievementId, onDone }) {
  const [visible, setVisible] = useState(false);
  const achievement = achievements.find(a => a.id === achievementId);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDone?.(), 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [achievementId, onDone]);

  if (!achievement) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 2000,
      backgroundColor: '#1a1a2e',
      border: '2px solid #FFD700',
      borderRadius: 10,
      padding: '12px 20px',
      boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
      transform: visible ? 'translateX(0)' : 'translateX(120%)',
      transition: 'transform 0.3s ease-out',
      maxWidth: 300,
    }}>
      <div style={{ fontSize: 10, color: '#FFD700', fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 }}>
        ACHIEVEMENT UNLOCKED
      </div>
      <div style={{ fontSize: 14, fontWeight: 'bold', color: '#eee', marginBottom: 2 }}>
        {achievement.name}
      </div>
      <div style={{ fontSize: 11, color: '#888' }}>
        {achievement.desc}
      </div>
    </div>
  );
}
