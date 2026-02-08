"use client";

import { useState } from "react";
import npcsData from "@/data/npcs.json";
import styles from "./page.module.css";

const roles = ["All", "Quest Giver", "Ally", "Neutral", "Antagonist"];
const races = ["All", ...Array.from(new Set(npcsData.map((n) => n.race)))];

export default function NPCsPage() {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [raceFilter, setRaceFilter] = useState("All");
    const [selectedNPC, setSelectedNPC] = useState<string | null>(null);

    const filtered = npcsData.filter((npc) => {
        const matchesSearch =
            npc.name.toLowerCase().includes(search.toLowerCase()) ||
            npc.personality.some((p) =>
                p.toLowerCase().includes(search.toLowerCase())
            );
        const matchesRole = roleFilter === "All" || npc.role === roleFilter;
        const matchesRace = raceFilter === "All" || npc.race === raceFilter;
        return matchesSearch && matchesRole && matchesRace;
    });

    const activeNPC = npcsData.find((n) => n.id === selectedNPC);

    const roleColors: Record<string, string> = {
        "Quest Giver": "badge-gold",
        Ally: "badge-green",
        Neutral: "badge-blue",
        Antagonist: "badge-red",
    };

    const randomNPC = () => {
        const random = npcsData[Math.floor(Math.random() * npcsData.length)];
        setSelectedNPC(random.id);
    };

    return (
        <div className="page-content">
            <div className="container">
                <div className="page-header">
                    <h1>🧙 NPC Library</h1>
                    <p className="subtitle">
                        {npcsData.length} characters with personalities, secrets, and
                        ready-to-read dialogue scripts.
                    </p>
                </div>

                {/* Filters */}
                <div className={styles.controls}>
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="input"
                            placeholder="Search NPCs by name or trait..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: "44px" }}
                        />
                    </div>
                    <div className={styles.filterRow}>
                        <div className="filter-pills">
                            {roles.map((role) => (
                                <button
                                    key={role}
                                    className={`filter-pill ${roleFilter === role ? "active" : ""}`}
                                    onClick={() => setRoleFilter(role)}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                        <select
                            className="select"
                            value={raceFilter}
                            onChange={(e) => setRaceFilter(e.target.value)}
                            style={{ maxWidth: "200px" }}
                        >
                            {races.map((r) => (
                                <option key={r} value={r}>
                                    {r === "All" ? "All Races" : r}
                                </option>
                            ))}
                        </select>
                        <button className="btn btn-secondary" onClick={randomNPC}>
                            🎲 Random NPC
                        </button>
                    </div>
                </div>

                <div className={styles.layout}>
                    {/* NPC Grid */}
                    <div className={styles.grid}>
                        {filtered.map((npc) => (
                            <button
                                key={npc.id}
                                className={`${styles.npcCard} ${selectedNPC === npc.id ? styles.selected : ""}`}
                                onClick={() => setSelectedNPC(npc.id)}
                            >
                                <div className={styles.npcHeader}>
                                    <h3>{npc.name}</h3>
                                    <span className={`badge ${roleColors[npc.role] || "badge-gold"}`}>
                                        {npc.role}
                                    </span>
                                </div>
                                <p className={styles.npcMeta}>
                                    {npc.race} · {npc.class}
                                </p>
                                <p className={styles.npcDesc}>{npc.appearance.slice(0, 100)}...</p>
                                <div className={styles.traits}>
                                    {npc.personality.map((t) => (
                                        <span key={t} className={styles.trait}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <div className={styles.empty}>
                                <p>No NPCs match your search. Try adjusting your filters.</p>
                            </div>
                        )}
                    </div>

                    {/* Detail Panel */}
                    {activeNPC && (
                        <div className={styles.detail}>
                            <div className={styles.detailInner}>
                                <div className={styles.detailHeader}>
                                    <h2>{activeNPC.name}</h2>
                                    <span className={`badge ${roleColors[activeNPC.role] || "badge-gold"}`}>
                                        {activeNPC.role}
                                    </span>
                                </div>
                                <p className={styles.detailMeta}>
                                    {activeNPC.race} · {activeNPC.class} · CR {activeNPC.cr}
                                </p>

                                <div className={styles.detailSection}>
                                    <h4>Appearance</h4>
                                    <p>{activeNPC.appearance}</p>
                                </div>

                                <div className={styles.detailSection}>
                                    <h4>Personality</h4>
                                    <div className={styles.traits}>
                                        {activeNPC.personality.map((t) => (
                                            <span key={t} className={styles.trait}>{t}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.detailSection}>
                                    <h4>Motivation</h4>
                                    <p>{activeNPC.motivation}</p>
                                </div>

                                <div className={styles.detailSection}>
                                    <h4>🤫 Secret</h4>
                                    <p className={styles.secret}>{activeNPC.secret}</p>
                                </div>

                                <div className={styles.dialogueSection}>
                                    <h4>📜 Dialogue Scripts</h4>
                                    <div className={styles.dialogueBlock}>
                                        <span className={styles.dialogueLabel}>Greeting</span>
                                        <blockquote className={styles.dialogue}>
                                            &ldquo;{activeNPC.dialogue.greeting}&rdquo;
                                        </blockquote>
                                    </div>
                                    <div className={styles.dialogueBlock}>
                                        <span className={styles.dialogueLabel}>Quest / Key Moment</span>
                                        <blockquote className={styles.dialogue}>
                                            &ldquo;{activeNPC.dialogue.quest}&rdquo;
                                        </blockquote>
                                    </div>
                                    <div className={styles.dialogueBlock}>
                                        <span className={styles.dialogueLabel}>Farewell</span>
                                        <blockquote className={styles.dialogue}>
                                            &ldquo;{activeNPC.dialogue.farewell}&rdquo;
                                        </blockquote>
                                    </div>
                                </div>

                                <button
                                    className={styles.closeBtn}
                                    onClick={() => setSelectedNPC(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
