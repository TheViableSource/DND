"use client";

import { useState } from "react";
import mapsData from "@/data/maps.json";
import styles from "./page.module.css";

const environments = ["All", ...Array.from(new Set(mapsData.map((m) => m.environment)))];

const envEmojis: Record<string, string> = {
    Dungeon: "🏰",
    Wilderness: "🌲",
    Urban: "🏘️",
    Special: "⭐",
};

export default function MapsPage() {
    const [envFilter, setEnvFilter] = useState("All");
    const [selectedMap, setSelectedMap] = useState<string | null>(null);

    const filtered = mapsData.filter(
        (m) => envFilter === "All" || m.environment === envFilter
    );

    const active = mapsData.find((m) => m.id === selectedMap);

    return (
        <div className="page-content">
            <div className="container">
                <div className="page-header">
                    <h1>🗺️ Map Gallery</h1>
                    <p className="subtitle">
                        {mapsData.length} maps organized by environment with tactical notes,
                        encounter suggestions, and read-aloud descriptions.
                    </p>
                </div>

                {/* Filters */}
                <div className="filter-pills" style={{ marginBottom: "var(--space-xl)" }}>
                    {environments.map((env) => (
                        <button
                            key={env}
                            className={`filter-pill ${envFilter === env ? "active" : ""}`}
                            onClick={() => setEnvFilter(env)}
                        >
                            {env !== "All" && envEmojis[env]} {env}
                        </button>
                    ))}
                </div>

                {/* Map Grid */}
                <div className={styles.grid}>
                    {filtered.map((map) => (
                        <button
                            key={map.id}
                            className={`${styles.mapCard} ${selectedMap === map.id ? styles.selected : ""}`}
                            onClick={() => setSelectedMap(map.id)}
                        >
                            <div className={styles.mapVisual}>
                                <span className={styles.mapEmoji}>{envEmojis[map.environment] || "🗺️"}</span>
                            </div>
                            <div className={styles.mapInfo}>
                                <div className={styles.mapHeader}>
                                    <h3>{map.name}</h3>
                                    <span className="badge badge-gold">{map.environment}</span>
                                </div>
                                <p className={styles.mapDesc}>{map.description.slice(0, 120)}...</p>
                                <div className={styles.mapMeta}>
                                    <span>📐 {map.gridSize}</span>
                                    <span>⚔️ {map.difficulty}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Map Detail Modal */}
                {active && (
                    <div className={styles.modal} onClick={() => setSelectedMap(null)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <div>
                                    <h2>{active.name}</h2>
                                    <p className={styles.modalMeta}>
                                        {active.environment} · Grid: {active.gridSize} · Difficulty: {active.difficulty}
                                    </p>
                                </div>
                                <button className={styles.modalClose} onClick={() => setSelectedMap(null)}>✕</button>
                            </div>

                            <p className={styles.modalDesc}>{active.description}</p>

                            {/* Read Aloud */}
                            <div className={styles.readAloud}>
                                <h4>📖 Read Aloud to Players</h4>
                                <blockquote>{active.readAloudText}</blockquote>
                            </div>

                            {/* Key Features */}
                            <div className={styles.section}>
                                <h4>🔑 Key Features</h4>
                                <ul>
                                    {active.keyFeatures.map((f, i) => (
                                        <li key={i}>{f}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Suggested Encounters */}
                            <div className={styles.section}>
                                <h4>⚔️ Suggested Encounters</h4>
                                <ul>
                                    {active.suggestedEncounters.map((e, i) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Tactical Notes */}
                            <div className={styles.section}>
                                <h4>🎯 Tactical Notes</h4>
                                <p>{active.tacticalNotes}</p>
                            </div>

                            {/* Loot */}
                            <div className={styles.section}>
                                <h4>💰 Loot Suggestions</h4>
                                <ul>
                                    {active.lootSuggestions.map((l, i) => (
                                        <li key={i}>{l}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
