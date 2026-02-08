"use client";

import { useState, useMemo } from "react";
import monstersData from "@/data/monsters.json";
import styles from "./page.module.css";

const types = ["All", ...Array.from(new Set(monstersData.map((m) => m.type)))];
const environments = [
    "All",
    ...Array.from(
        new Set(monstersData.flatMap((m) => m.environment))
    ),
];

function crLabel(cr: number) {
    if (cr === 0.125) return "1/8";
    if (cr === 0.25) return "1/4";
    if (cr === 0.5) return "1/2";
    return cr.toString();
}

function calcModifier(score: number) {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

function calcEncounterDifficulty(partySize: number, partyLevel: number) {
    const xpThresholds: Record<string, number[]> = {
        easy: [0, 25, 50, 75, 125, 250, 300, 350, 450, 550, 600, 800, 1000, 1100, 1250, 1400, 1600, 2000, 2100, 2400, 2800],
        medium: [0, 50, 100, 150, 250, 500, 600, 750, 900, 1100, 1200, 1600, 2000, 2200, 2500, 2800, 3200, 3900, 4200, 4900, 5700],
        hard: [0, 75, 150, 225, 375, 750, 900, 1100, 1400, 1600, 1900, 2400, 3000, 3400, 3800, 4300, 4800, 5900, 6300, 7300, 8500],
        deadly: [0, 100, 200, 400, 500, 1100, 1400, 1700, 2100, 2400, 2800, 3600, 4500, 5100, 5700, 6400, 7200, 8800, 9500, 10900, 12700],
    };
    const level = Math.min(Math.max(partyLevel, 1), 20);
    return {
        easy: xpThresholds.easy[level] * partySize,
        medium: xpThresholds.medium[level] * partySize,
        hard: xpThresholds.hard[level] * partySize,
        deadly: xpThresholds.deadly[level] * partySize,
    };
}

export default function BestiaryPage() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [envFilter, setEnvFilter] = useState("All");
    const [selectedMonster, setSelectedMonster] = useState<string | null>(null);
    const [showEncounter, setShowEncounter] = useState(false);
    const [partySize, setPartySize] = useState(4);
    const [partyLevel, setPartyLevel] = useState(3);
    const [encounterMonsters, setEncounterMonsters] = useState<string[]>([]);

    const filtered = monstersData.filter((m) => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.type.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "All" || m.type === typeFilter;
        const matchEnv = envFilter === "All" || m.environment.includes(envFilter);
        return matchSearch && matchType && matchEnv;
    });

    const active = monstersData.find((m) => m.id === selectedMonster);

    const thresholds = useMemo(() => calcEncounterDifficulty(partySize, partyLevel), [partySize, partyLevel]);

    const encounterXP = useMemo(() => {
        let total = 0;
        for (const id of encounterMonsters) {
            const mon = monstersData.find((m) => m.id === id);
            if (mon) total += mon.xp;
        }
        const count = encounterMonsters.length;
        const multipliers = [1, 1, 1.5, 2, 2, 2, 2, 2.5, 2.5, 2.5, 2.5, 3, 3, 3, 3, 4];
        const mult = count === 0 ? 1 : multipliers[Math.min(count - 1, multipliers.length - 1)];
        return { raw: total, adjusted: Math.floor(total * mult), count, multiplier: mult };
    }, [encounterMonsters]);

    const encounterDifficulty = useMemo(() => {
        const adj = encounterXP.adjusted;
        if (adj >= thresholds.deadly) return "Deadly";
        if (adj >= thresholds.hard) return "Hard";
        if (adj >= thresholds.medium) return "Medium";
        if (adj >= thresholds.easy) return "Easy";
        return "Trivial";
    }, [encounterXP, thresholds]);

    const addToEncounter = (id: string) => {
        setEncounterMonsters((prev) => [...prev, id]);
    };

    const removeFromEncounter = (index: number) => {
        setEncounterMonsters((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="page-content">
            <div className="container">
                <div className="page-header">
                    <h1>🐉 Bestiary</h1>
                    <p className="subtitle">
                        {monstersData.length} monsters with full stat blocks, tactics, and DM
                        tips.
                    </p>
                </div>

                {/* Encounter Builder Toggle */}
                <div className={styles.encounterToggle}>
                    <button
                        className={`btn ${showEncounter ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setShowEncounter(!showEncounter)}
                    >
                        ⚔️ {showEncounter ? "Hide" : "Show"} Encounter Builder
                    </button>
                </div>

                {/* Encounter Builder */}
                {showEncounter && (
                    <div className={styles.encounterBuilder}>
                        <h3>Encounter Builder</h3>
                        <div className={styles.partyConfig}>
                            <label>
                                Party Size:
                                <input
                                    type="number"
                                    className="input"
                                    value={partySize}
                                    min={1}
                                    max={8}
                                    onChange={(e) => setPartySize(Number(e.target.value))}
                                    style={{ width: "80px", marginLeft: "8px" }}
                                />
                            </label>
                            <label>
                                Average Level:
                                <input
                                    type="number"
                                    className="input"
                                    value={partyLevel}
                                    min={1}
                                    max={20}
                                    onChange={(e) => setPartyLevel(Number(e.target.value))}
                                    style={{ width: "80px", marginLeft: "8px" }}
                                />
                            </label>
                        </div>
                        <div className={styles.thresholds}>
                            <span className="difficulty-easy">Easy: {thresholds.easy} XP</span>
                            <span className="difficulty-medium">Medium: {thresholds.medium} XP</span>
                            <span className="difficulty-hard">Hard: {thresholds.hard} XP</span>
                            <span className="difficulty-deadly">Deadly: {thresholds.deadly} XP</span>
                        </div>
                        <div className={styles.encounterList}>
                            <h4>Current Encounter ({encounterXP.count} creatures)</h4>
                            {encounterMonsters.length === 0 ? (
                                <p className={styles.encounterEmpty}>Click &quot;Add to Encounter&quot; on any monster below</p>
                            ) : (
                                <>
                                    <ul className={styles.encounterItems}>
                                        {encounterMonsters.map((id, i) => {
                                            const mon = monstersData.find((m) => m.id === id);
                                            return (
                                                <li key={i}>
                                                    <span>{mon?.name} (CR {mon ? crLabel(mon.cr) : "?"})</span>
                                                    <button onClick={() => removeFromEncounter(i)} className={styles.removeBtn}>✕</button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    <div className={styles.encounterSummary}>
                                        <span>Raw XP: {encounterXP.raw}</span>
                                        <span>Multiplier: ×{encounterXP.multiplier}</span>
                                        <span>Adjusted XP: {encounterXP.adjusted}</span>
                                        <span className={`${styles.difficultyResult} difficulty-${encounterDifficulty.toLowerCase()}`}>
                                            {encounterDifficulty}
                                        </span>
                                    </div>
                                    <button className="btn btn-secondary" onClick={() => setEncounterMonsters([])}>
                                        Clear Encounter
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className={styles.controls}>
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="input"
                            placeholder="Search monsters..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: "44px" }}
                        />
                    </div>
                    <div className={styles.filterRow}>
                        <select className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ maxWidth: "200px" }}>
                            {types.map((t) => (
                                <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>
                            ))}
                        </select>
                        <select className="select" value={envFilter} onChange={(e) => setEnvFilter(e.target.value)} style={{ maxWidth: "200px" }}>
                            {environments.map((e) => (
                                <option key={e} value={e}>{e === "All" ? "All Environments" : e}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.layout}>
                    {/* Monster Grid */}
                    <div className={styles.grid}>
                        {filtered.map((mon) => (
                            <div key={mon.id} className={`${styles.monsterCard} ${selectedMonster === mon.id ? styles.selected : ""}`}>
                                <button className={styles.monsterBtn} onClick={() => setSelectedMonster(mon.id)}>
                                    <div className={styles.monsterHeader}>
                                        <h3>{mon.name}</h3>
                                        <span className="badge badge-gold">CR {crLabel(mon.cr)}</span>
                                    </div>
                                    <p className={styles.monsterMeta}>{mon.size} {mon.type} · {mon.alignment}</p>
                                    <div className={styles.monsterQuickStats}>
                                        <span>AC {mon.ac}</span>
                                        <span>HP {mon.hp}</span>
                                        <span>{mon.xp} XP</span>
                                    </div>
                                </button>
                                {showEncounter && (
                                    <button className={styles.addEncounterBtn} onClick={() => addToEncounter(mon.id)}>
                                        + Add to Encounter
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Stat Block Detail */}
                    {active && (
                        <div className={styles.detail}>
                            <div className="stat-block">
                                <h3>{active.name}</h3>
                                <p className="creature-type">{active.size} {active.type}, {active.alignment}</p>
                                <hr className="stat-divider" />
                                <p className="stat-line"><strong>Armor Class</strong> {active.ac} {active.acType ? `(${active.acType})` : ""}</p>
                                <p className="stat-line"><strong>Hit Points</strong> {active.hp} ({active.hitDice})</p>
                                <p className="stat-line"><strong>Speed</strong> {active.speed}</p>
                                <hr className="stat-divider" />
                                <div className="ability-scores">
                                    {Object.entries(active.abilities).map(([key, val]) => (
                                        <div key={key} className="ability">
                                            <span className="ability-label">{key}</span>
                                            <span className="ability-value">{val} ({calcModifier(val)})</span>
                                        </div>
                                    ))}
                                </div>
                                <hr className="stat-divider" />
                                {active.savingThrows && <p className="stat-line"><strong>Saving Throws</strong> {active.savingThrows}</p>}
                                {active.skills && <p className="stat-line"><strong>Skills</strong> {active.skills}</p>}
                                {active.vulnerabilities && <p className="stat-line"><strong>Damage Vulnerabilities</strong> {active.vulnerabilities}</p>}
                                {active.resistances && <p className="stat-line"><strong>Damage Resistances</strong> {active.resistances}</p>}
                                {active.immunities && <p className="stat-line"><strong>Damage Immunities</strong> {active.immunities}</p>}
                                {active.conditionImmunities && <p className="stat-line"><strong>Condition Immunities</strong> {active.conditionImmunities}</p>}
                                <p className="stat-line"><strong>Senses</strong> {active.senses}</p>
                                <p className="stat-line"><strong>Languages</strong> {active.languages}</p>
                                <p className="stat-line"><strong>Challenge</strong> {crLabel(active.cr)} ({active.xp} XP)</p>
                                <hr className="stat-divider" />

                                {active.traits && active.traits.length > 0 && (
                                    <>
                                        {active.traits.map((t) => (
                                            <p key={t.name} className="stat-line"><span className="action-name">{t.name}.</span> {t.desc}</p>
                                        ))}
                                        <hr className="stat-divider" />
                                    </>
                                )}

                                <h4 style={{ color: "#7a200d", fontFamily: "var(--font-heading)", marginBottom: "8px" }}>Actions</h4>
                                {active.actions.map((a) => (
                                    <p key={a.name} className="stat-line"><span className="action-name">{a.name}.</span> {a.desc}</p>
                                ))}

                                {active.legendaryActions && active.legendaryActions.length > 0 && (
                                    <>
                                        <hr className="stat-divider" />
                                        <h4 style={{ color: "#7a200d", fontFamily: "var(--font-heading)", marginBottom: "8px" }}>Legendary Actions</h4>
                                        {active.legendaryActions.map((la) => (
                                            <p key={la.name} className="stat-line"><span className="action-name">{la.name}.</span> {la.desc}</p>
                                        ))}
                                    </>
                                )}
                            </div>

                            {/* DM Tips */}
                            <div className={styles.dmSection}>
                                <h4>⚔️ Tactics</h4>
                                <p>{active.tactics}</p>
                            </div>
                            <div className={styles.dmSection}>
                                <h4>💡 DM Tips</h4>
                                <p>{active.dmTips}</p>
                            </div>

                            <button className={styles.closeBtn} onClick={() => setSelectedMonster(null)}>
                                Close Stat Block
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
