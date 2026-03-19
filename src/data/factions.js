// Faction definitions for Gods Of The Realms — War of Worlds
// Each faction has a distinct gameplay identity and mythology source.

const factions = {
  olympus: {
    id: 'olympus',
    name: 'Olympus',
    title: 'Gods of Civilization',
    mythology: 'Greek',
    color: '#FFD700',
    description: 'The gods of Mount Olympus wield devastating power. Their champions excel at burst damage, critical strikes, and overwhelming force.',
    playstyle: 'Burst damage, crits, aggressive',
  },
  asgard: {
    id: 'asgard',
    name: 'Asgard',
    title: 'Warriors of Fate',
    mythology: 'Norse',
    color: '#4FC3F7',
    description: 'The warriors of Asgard endure what others cannot. They shield their allies, absorb punishment, and outlast their foes through sheer resilience.',
    playstyle: 'Tanky, shields, counterplay',
  },
  kemet: {
    id: 'kemet',
    name: 'Kemet',
    title: 'Guardians of Eternity',
    mythology: 'Egyptian',
    color: '#CE93D8',
    description: 'The gods of Kemet command death itself. They weaken enemies over time with debuffs, draining life and blocking healing until nothing remains.',
    playstyle: 'Debuffs, sustain, attrition',
  },
  avalon: {
    id: 'avalon',
    name: 'Avalon',
    title: 'Spirits of the Veil',
    mythology: 'Celtic / Arthurian',
    color: '#81C784',
    description: 'The mystical spirits of Avalon weave enchantments that strengthen allies and mend wounds. Their power grows when the team fights as one.',
    playstyle: 'Healing, buffs, team synergy',
  },
  tengoku: {
    id: 'tengoku',
    name: 'Tengoku',
    title: 'Masters of Balance',
    mythology: 'Japanese',
    color: '#FF8A65',
    description: 'The divine masters of Tengoku strike with precision and discipline. They act first, hit hard, and control the tempo of battle.',
    playstyle: 'Speed, precision, tempo control',
  },
};

export function getFaction(factionId) {
  return factions[factionId] || null;
}

export default factions;
