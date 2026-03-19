// Faction definitions for Gods Of The Realms — War of Worlds
// Each faction has a distinct gameplay identity and mythology source.

const factions = {
  thePantheon: {
    id: 'thePantheon',
    name: 'The Pantheon',
    title: 'Gods of Civilization',
    mythology: 'Greek',
    color: '#FFD700',
    description: 'The gods of the divine council wield devastating power. Their champions excel at burst damage, critical strikes, and overwhelming force.',
    playstyle: 'Burst damage, crits, aggressive',
  },
  theAllfathersHall: {
    id: 'theAllfathersHall',
    name: "The Allfather's Hall",
    title: 'Warriors of Fate',
    mythology: 'Norse',
    color: '#4FC3F7',
    description: "The warriors of the Allfather's Hall endure what others cannot. They shield their allies, absorb punishment, and outlast their foes through sheer resilience.",
    playstyle: 'Tanky, shields, counterplay',
  },
  theEternalSands: {
    id: 'theEternalSands',
    name: 'The Eternal Sands',
    title: 'Guardians of Eternity',
    mythology: 'Egyptian',
    color: '#CE93D8',
    description: 'The gods of the Eternal Sands command death itself. They weaken enemies over time with debuffs, draining life and blocking healing until nothing remains.',
    playstyle: 'Debuffs, sustain, attrition',
  },
  theMistRealm: {
    id: 'theMistRealm',
    name: 'The Mist Realm',
    title: 'Spirits of the Veil',
    mythology: 'Celtic / Arthurian',
    color: '#81C784',
    description: 'The mystical spirits of the Mist Realm weave enchantments that strengthen allies and mend wounds. Their power grows when the team fights as one.',
    playstyle: 'Healing, buffs, team synergy',
  },
  theRisingSun: {
    id: 'theRisingSun',
    name: 'The Rising Sun',
    title: 'Masters of Balance',
    mythology: 'Japanese',
    color: '#FF8A65',
    description: 'The divine masters of the Rising Sun strike with precision and discipline. They act first, hit hard, and control the tempo of battle.',
    playstyle: 'Speed, precision, tempo control',
  },
};

export function getFaction(factionId) {
  return factions[factionId] || null;
}

export default factions;
