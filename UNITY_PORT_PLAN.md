# Gods Of The Realms — Unity Port Plan

## Overview

**Current state:** Fully playable web prototype (Next.js 16 / React 19) with 51 units, 110+ skills, 10 game modes, seeded RNG, deterministic battle simulator, and structured combat logs.

**Target:** Unity 2022 LTS, C#, mobile-first (iOS/Android) with web export option.

**Strategy:** Port in layers. Do not rewrite — translate. The JS engine is already framework-agnostic by design.

---

## Layer 1: Pure Engine Logic (Port First)

The engine layer has zero UI dependencies. Direct 1:1 translation to C#.

| JS File | C# Class | Key Methods |
|---|---|---|
| `engine/battleEngine.js` | `BattleEngine.cs` | `InitUnits()`, `AdvanceTurnMeters()`, `ExecuteTurn()`, `IsTeamDefeated()`, `GetTurnOrder()` |
| `engine/damageSystem.js` | `DamageCalculator.cs` | `CalculateDamage()`, `CalculateHeal()`, `GetEffectiveAttack()`, `GetEffectiveDefense()` |
| `engine/effectSystem.js` | `EffectSystem.cs` | `TryApplyEffect()`, `ApplyBuff()`, `TickEffects()`, `IsStunned()`, `HasHealBlock()`, `GetEffectiveSpeed()` |
| `engine/aiSystem.js` | `AIDecisionEngine.cs` | `DecideAction()`, `ScoreTarget()` |
| `engine/elementSystem.js` | `ElementSystem.cs` | `GetElementMultiplier()` |
| `engine/battleSimulator.js` | `BattleSimulator.cs` | `SimulateBattle()`, `BatchSimulate()` |
| `utils/random.js` | `SeededRNG.cs` | `Random()`, `SetSeed()`, `GetState()` — use Mulberry32 or System.Random |

### Combat Timing Law (immutable)

```
1. RESET TURN METER
2. TICK EFFECTS (durations -1, expired removed)
3. REDUCE COOLDOWNS
4. PROCESS PASSIVES
5. STUN CHECK
6. EXECUTE SKILL
```

This order MUST match between JS and C# engines. Validate with seeded battle comparison.

### Damage Formula

```
damage = ATK × multiplier × (1000 / (1000 + DEF × 3)) × elementMod × critMod × variance
```

- Variance: 0.95 - 1.05
- Crit check: `random() < critRate`
- Effect resist: `max(0.15, hitChance - resistance)`

---

## Layer 2: Data Schema

Map JS objects to Unity ScriptableObjects for editor-friendly data management.

### UnitTemplate.cs

```csharp
[CreateAssetMenu(fileName = "NewUnit", menuName = "GOTR/Unit Template")]
public class UnitTemplate : ScriptableObject
{
    public string id;
    public string unitName;
    public Faction faction;
    public Element element;
    public Role role;

    [Header("Base Stats")]
    public int maxHP = 10000;
    public int attack = 800;
    public int defense = 500;
    public int speed = 100;
    public float critRate = 0.15f;
    public float critDamage = 1.5f;
    public float accuracy = 0.85f;
    public float resistance = 0.15f;

    [Header("Progression")]
    public int level = 1;
    public int stars = 4;
    public bool awakened = false;

    [Header("Skills")]
    public SkillDefinition[] skills;
    public RelicSet relicSet;
    public PassiveAbility passive;
}
```

### SkillDefinition.cs

```csharp
[CreateAssetMenu(fileName = "NewSkill", menuName = "GOTR/Skill Definition")]
public class SkillDefinition : ScriptableObject
{
    public string id;
    public string skillName;
    public SkillType type;
    public SkillTarget target;
    public float multiplier;
    public int cooldown;
    public int hits = 1;

    [Header("Effect")]
    public float effectChance;
    public EffectType effectType;
    public int effectDuration;

    [Header("Special")]
    public int cleanseCount;
    public int stripCount;
    public Condition condition;

    [TextArea] public string description;
}
```

### Other ScriptableObjects

| JS Data | ScriptableObject | Fields |
|---|---|---|
| `effects.js` | `EffectDefinition.cs` | type, isBuff, stat, multiplier, description |
| `factions.js` | `FactionData.cs` | id, name, title, mythology, color, description, playstyle |
| `relics.js` | `RelicSet.cs` | id, name, color, twoPieceBonus, fourPieceBonus |
| `enums.js` | `Enums.cs` | Direct C# enums (Element, Faction, Role, SkillType, etc.) |
| `battleConstants.js` | `BattleConfig.cs` | ScriptableObject with all tuning values |
| `lore.js` | `HeroLore.cs` | title, lore, quote — link to UnitTemplate |

---

## Layer 3: Battle Event Bus

Replace React setState with a decoupled event system. UI, VFX, and Audio subscribe independently.

### BattleEventBus.cs

```csharp
public static class BattleEventBus
{
    // Damage
    public static event Action<DamageEvent> OnDamageDealt;
    public static event Action<HealEvent> OnHealApplied;

    // Effects
    public static event Action<EffectEvent> OnEffectApplied;
    public static event Action<EffectEvent> OnEffectExpired;
    public static event Action<EffectEvent> OnEffectResisted;

    // Unit state
    public static event Action<UnitEvent> OnUnitDeath;
    public static event Action<UnitEvent> OnUnitRevive;
    public static event Action<UnitEvent> OnTurnStart;
    public static event Action<UnitEvent> OnStunned;

    // Battle flow
    public static event Action<BattleEndEvent> OnBattleEnd;
    public static event Action<int> OnTurnCountChanged;

    // Fire methods
    public static void FireDamage(DamageEvent e) => OnDamageDealt?.Invoke(e);
    // ... etc
}

public struct DamageEvent
{
    public string attackerId;
    public string targetId;
    public string skillName;
    public int damage;
    public int preHP;
    public int postHP;
    public bool isCrit;
    public string elementAdvantage;
    public int turn;
}
```

### Subscription Pattern

```csharp
// In CombatAnimator.cs
void OnEnable()
{
    BattleEventBus.OnDamageDealt += HandleDamage;
    BattleEventBus.OnUnitDeath += HandleDeath;
}

void HandleDamage(DamageEvent e)
{
    var card = GetUnitCard(e.targetId);
    card.PlayDamageAnimation();
    card.ShowDamageNumber(e.damage, e.isCrit);
    if (e.isCrit) CameraShake.Trigger(0.3f);
}
```

---

## Layer 4: UI Rendering

| React Component | Unity Equivalent | Implementation |
|---|---|---|
| `BattleUI.js` | `BattleUIManager.cs` | Canvas controller, manages all battle UI |
| `UnitCard.js` | `UnitCardUI.cs` | Prefab with Image, Sliders, TextMeshPro |
| `SkillButtons.js` | `SkillButtonPanel.cs` | Horizontal layout group with Button prefabs |
| `CombatLog.js` | `CombatLogUI.cs` | ScrollRect with TextMeshPro entries |
| `BattleResults.js` | `BattleResultsOverlay.cs` | Full-screen Canvas overlay |
| `HeroPortrait.js` | 2D Sprites / Spine | Replace SVG with actual 2D character art |
| `NavBar.js` | N/A | Unity handles scene management differently |

### UI Layout (Canvas)

```
BattleCanvas (Screen Space - Overlay)
├── Header (title, turn count, auto/speed buttons)
├── TurnOrderBar (horizontal scroll)
├── BattleArea
│   ├── TeamAPanel (vertical layout, 4x UnitCard prefabs)
│   ├── CenterPanel (SkillButtons + CombatLog)
│   └── TeamBPanel (vertical layout, 4x UnitCard prefabs)
├── SkillEffectOverlay (full-screen particle layer)
├── DamageNumberPool (object pool for floating numbers)
└── BattleResultsOverlay (hidden until battle end)
```

---

## Layer 5: Animation Hooks

| CSS Animation | Unity Equivalent |
|---|---|
| `anim-attack` (shake) | DOTween `transform.DOShakePosition(0.4f, 6f)` |
| `anim-damage` (red flash) | SpriteRenderer color flash via DOTween `DOColor(red, 0.1f)` |
| `anim-crit` (big shake + scale) | DOTween sequence: scale punch + shake + camera shake |
| `anim-heal` (green glow) | Particle system (green sparkles rising) |
| `anim-death` (fade + shrink) | DOTween `DOFade(0.3f, 0.6f)` + `DOScale(0.95f, 0.6f)` |
| `anim-buff` (gold shimmer) | Material property animation (emission pulse) |
| `anim-revive` (burst) | Particle burst + DOTween `DOScale` from 0.8 to 1 |
| `screen-shake` | Cinemachine impulse or DOTween camera shake |
| `impact-flash` | Full-screen white Image, `DOFade(0.6f → 0f, 0.1f)` |
| Floating damage numbers | TextMeshPro + DOTween `DOLocalMoveY` + `DOFade` |
| Skill VFX | Unity VFX Graph or Particle Systems per element |

### Hit-Stop Implementation

```csharp
IEnumerator HitStop(float duration = 0.05f)
{
    Time.timeScale = 0f;
    yield return new WaitForSecondsRealtime(duration);
    Time.timeScale = 1f;
}
```

---

## Layer 6: VFX / Audio

### VFX by Element

| Element | Particle System |
|---|---|
| Storm | Lightning bolts (line renderer + glow), purple sparks |
| Ocean | Water splash (sphere particles), blue mist |
| Underworld | Dark wisps (smoke), red embers |
| Sun | Solar flare (radial burst), orange sparks |
| Moon | Crescent trails (mesh particles), purple motes |

### Audio

| Event | AudioClip |
|---|---|
| Attack | sword_slash.wav (replace Web Audio tones) |
| Crit | heavy_impact.wav + glass_shatter.wav |
| Heal | magic_chime.wav |
| Buff | power_up.wav |
| Debuff | dark_curse.wav |
| Death | death_cry.wav |
| Victory | fanfare.wav |
| BGM | epic_battle_loop.wav (per-stage variants) |

Use AudioMixer with groups: Master, SFX, Music, UI.

---

## Migration Order

| Phase | Task | Est. Days |
|---|---|---|
| 1 | Unity project setup, folder structure, packages (DOTween, TextMeshPro) | 1 |
| 2 | Port enums + constants + BattleConfig ScriptableObject | 1 |
| 3 | Port data schema (UnitTemplate, SkillDefinition, etc.) + create 5 test assets | 2 |
| 4 | Port engine (BattleEngine, DamageCalculator, EffectSystem) | 3-5 |
| 5 | Port AI system | 1 |
| 6 | Build BattleEventBus | 1 |
| 7 | Port seeded RNG + BattleSimulator, validate against JS output | 1-2 |
| 8 | Build basic UI (Canvas, UnitCard prefab, skill buttons) | 3-5 |
| 9 | Wire animations (DOTween, damage numbers, screen shake) | 3-5 |
| 10 | Wire VFX (particle systems per element) | 2-3 |
| 11 | Wire audio (AudioManager, SFX, BGM) | 1 |
| 12 | Import all 51 unit assets + 110 skill assets | 2-3 |
| 13 | Integration testing with seeded battle comparison | 2 |
| **Total** | | **~22-30 days** |

---

## Validation Strategy

1. Run seeded battle (seed=12345) with Zeus/Poseidon/Hades/Apollo vs Thor/Anubis/Bastet/Amaterasu in BOTH JS and C#
2. Compare log output entry-by-entry:
   - Turn order must match exactly
   - Damage values must match exactly
   - Effect rolls must match exactly
   - Battle outcome must match
3. Run `batchSimulate(100)` in both — win rates must be within 1% tolerance
4. If any mismatch: diff the logs, find the first divergence, fix

---

## Key Decisions

| Decision | Recommendation | Reason |
|---|---|---|
| Engine architecture | Pure C# (not MonoBehaviour) | Testable, no Unity dependency, can run headless |
| UI framework | Unity UI (Canvas) | More mature for game UI than UI Toolkit |
| Tweening | DOTween Pro | Industry standard, battle-tested |
| Camera | Cinemachine | Built-in shake, follow, transitions |
| Data management | ScriptableObjects | Editor-friendly, serializable, inspector support |
| Networking (later) | Mirror or Netcode for GameObjects | For real multiplayer arena |
| Art style | 2D Spine or Live2D | Animated portraits > static sprites |

---

## Risk Factors

1. **RNG parity** — Mulberry32 implementation must be byte-identical between JS and C#. Test extensively.
2. **Float precision** — JS uses 64-bit doubles, C# uses 32-bit floats by default. Use `double` in C# engine or accept ±1 damage variance.
3. **Turn meter ties** — Current JS breaks ties by speed. C# sort must use identical tiebreaker.
4. **Effect timing** — The Combat Timing Law must be replicated exactly. One step out of order breaks everything.
5. **Art pipeline** — SVG portraits won't port. Need actual 2D character art (commission or AI-generate).
