'use client';

import { useState, useEffect } from 'react';
import { heroRoster } from '../data/units';
import { SFX, resumeAudio } from '../utils/soundSystem';

const STORAGE_KEY = 'gotr_team_presets';
const MAX_PRESETS = 5;

function loadPresets() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePresets(presets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

function nextAutoName(presets) {
  for (let i = 1; i <= MAX_PRESETS + 1; i++) {
    const name = `Team ${i}`;
    if (!presets.some(p => p.name === name)) return name;
  }
  return `Team ${presets.length + 1}`;
}

export default function TeamPresets({ selectedIds, onLoadPreset }) {
  const [presets, setPresets] = useState([]);

  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  const handleSave = () => {
    if (selectedIds.length !== 4) return;
    if (presets.length >= MAX_PRESETS) return;
    resumeAudio();
    SFX.presetSave();
    const updated = [...presets, { name: nextAutoName(presets), ids: [...selectedIds] }];
    setPresets(updated);
    savePresets(updated);
  };

  const handleDelete = (index) => {
    const updated = presets.filter((_, i) => i !== index);
    setPresets(updated);
    savePresets(updated);
  };

  const heroName = (id) => heroRoster[id]?.name ?? id;

  return (
    <div style={{
      maxWidth: 900,
      margin: '0 auto 14px',
      padding: '10px 14px',
      backgroundColor: '#1a1a2e',
      borderRadius: 8,
      border: '1px solid #333',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 'bold', color: '#FFD700', letterSpacing: 1, textTransform: 'uppercase' }}>
          Team Presets
        </span>
        <button
          onClick={handleSave}
          disabled={selectedIds.length !== 4 || presets.length >= MAX_PRESETS}
          style={{
            padding: '4px 12px',
            fontSize: 11,
            fontWeight: 'bold',
            backgroundColor: selectedIds.length === 4 && presets.length < MAX_PRESETS ? '#FFD700' : '#333',
            color: selectedIds.length === 4 && presets.length < MAX_PRESETS ? '#000' : '#666',
            border: 'none',
            borderRadius: 4,
            cursor: selectedIds.length === 4 && presets.length < MAX_PRESETS ? 'pointer' : 'not-allowed',
          }}
        >
          Save Current
        </button>
      </div>

      {/* Presets list — horizontal scroll */}
      {presets.length === 0 ? (
        <p style={{ fontSize: 11, color: '#666', margin: 0 }}>
          No saved presets yet. Select 4 heroes and click Save Current.
        </p>
      ) : (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {presets.map((preset, idx) => (
            <div
              key={idx}
              style={{
                flex: '0 0 auto',
                padding: '6px 10px',
                backgroundColor: '#12121f',
                borderRadius: 6,
                border: '1px solid #333',
                minWidth: 150,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 'bold', color: '#FFD700', marginBottom: 4 }}>
                {preset.name}
              </div>
              <div style={{ fontSize: 10, color: '#ccc', marginBottom: 6, lineHeight: 1.4 }}>
                {preset.ids.map(heroName).join(', ')}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => { resumeAudio(); SFX.presetLoad(); onLoadPreset(preset.ids); }}
                  style={{
                    flex: 1,
                    padding: '3px 0',
                    fontSize: 10,
                    fontWeight: 'bold',
                    backgroundColor: '#FFD700',
                    color: '#000',
                    border: 'none',
                    borderRadius: 3,
                    cursor: 'pointer',
                  }}
                >
                  Load
                </button>
                <button
                  onClick={() => handleDelete(idx)}
                  style={{
                    flex: 1,
                    padding: '3px 0',
                    fontSize: 10,
                    fontWeight: 'bold',
                    backgroundColor: '#333',
                    color: '#eee',
                    border: 'none',
                    borderRadius: 3,
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
