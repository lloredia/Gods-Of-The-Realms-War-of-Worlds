'use client';

import { useState, useEffect } from 'react';
import { setEnabled, isEnabled, setVolume, getVolume, SFX } from '../../utils/soundSystem';
import { loadSave, resetSave } from '../../utils/saveSystem';

export default function SettingsPage() {
  const [soundOn, setSoundOn] = useState(true);
  const [vol, setVol] = useState(30);
  const [confirmReset, setConfirmReset] = useState(false);
  const [saveData, setSaveData] = useState(null);

  useEffect(() => {
    setSoundOn(isEnabled());
    setVol(Math.round(getVolume() * 100));
    setSaveData(loadSave());
  }, []);

  function handleSoundToggle() {
    const next = !soundOn;
    setSoundOn(next);
    setEnabled(next);
  }

  function handleVolumeChange(e) {
    const v = Number(e.target.value);
    setVol(v);
    setVolume(v / 100);
  }

  function handleTestSound() {
    SFX.click();
  }

  function handleResetSave() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetSave();
    setSaveData(loadSave());
    setConfirmReset(false);
  }

  function handleResetTutorial() {
    localStorage.removeItem('gotr_tutorial_done');
  }

  const stats = saveData?.stats || {};
  const resources = saveData?.resources || {};

  const sectionStyle = {
    border: '1px solid #222',
    borderRadius: 8,
    padding: '16px 20px',
    marginBottom: 16,
  };

  const headingStyle = {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  };

  const btnStyle = {
    padding: '8px 18px',
    fontSize: 12,
    fontWeight: 'bold',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    letterSpacing: 0.5,
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a1a',
      color: '#ccc',
      padding: '24px 16px',
      maxWidth: 520,
      margin: '0 auto',
    }}>
      <h1 style={{ color: '#FFD700', fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', letterSpacing: 2 }}>
        SETTINGS
      </h1>

      {/* Sound Section */}
      <div style={sectionStyle}>
        <div style={headingStyle}>Sound</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 13 }}>Sound Effects</span>
          <button
            onClick={handleSoundToggle}
            style={{
              ...btnStyle,
              backgroundColor: soundOn ? '#2a7a2a' : '#555',
              color: '#fff',
              minWidth: 60,
            }}
          >
            {soundOn ? 'ON' : 'OFF'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{ fontSize: 13, minWidth: 55 }}>Volume</span>
          <input
            type="range"
            min={0}
            max={100}
            value={vol}
            onChange={handleVolumeChange}
            style={{ flex: 1, accentColor: '#FFD700' }}
          />
          <span style={{ fontSize: 12, minWidth: 36, textAlign: 'right' }}>{vol}%</span>
        </div>

        <button
          onClick={handleTestSound}
          style={{ ...btnStyle, backgroundColor: '#1a1a3a', color: '#FFD700', border: '1px solid #333' }}
        >
          Test Sound
        </button>
      </div>

      {/* Game Stats Section */}
      <div style={sectionStyle}>
        <div style={headingStyle}>Game Stats</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <StatBox label="Battles Won" value={stats.battlesWon ?? 0} />
          <StatBox label="Battles Lost" value={stats.battlesLost ?? 0} />
          <StatBox label="Total Summons" value={stats.totalSummons ?? 0} />
        </div>
      </div>

      {/* Resource Overview Section */}
      <div style={sectionStyle}>
        <div style={headingStyle}>Resources</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <StatBox label="Gold" value={resources.gold ?? 0} color="#FFD700" />
          <StatBox label="Essences" value={resources.essences ?? 0} color="#a080ff" />
          <StatBox label="Awaken Stones" value={resources.awakenStones ?? 0} color="#44cccc" />
        </div>
      </div>

      {/* Data Management Section */}
      <div style={sectionStyle}>
        <div style={headingStyle}>Data Management</div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleResetSave}
            style={{
              ...btnStyle,
              backgroundColor: confirmReset ? '#cc2222' : '#3a1a1a',
              color: confirmReset ? '#fff' : '#cc4444',
              border: '1px solid #442222',
            }}
          >
            {confirmReset ? 'Confirm Reset?' : 'Reset Save Data'}
          </button>

          {confirmReset && (
            <button
              onClick={() => setConfirmReset(false)}
              style={{ ...btnStyle, backgroundColor: '#1a1a2a', color: '#888', border: '1px solid #333' }}
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleResetTutorial}
            style={{ ...btnStyle, backgroundColor: '#1a1a3a', color: '#8888cc', border: '1px solid #2a2a44' }}
          >
            Reset Tutorial
          </button>
        </div>
      </div>

      {/* Version */}
      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#444', letterSpacing: 1 }}>
        Gods Of The Realms v0.1.0
      </div>
    </div>
  );
}

function StatBox({ label, value, color = '#fff' }) {
  return (
    <div style={{
      backgroundColor: '#0d0d20',
      borderRadius: 6,
      padding: '10px 8px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 16, fontWeight: 'bold', color }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: 10, color: '#666', marginTop: 4, letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}
