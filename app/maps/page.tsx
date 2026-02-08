"use client";

import { useState, useCallback } from "react";
import mapsData from "@/data/maps.json";
import DungeonMap from "@/components/DungeonMap";
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
    const [mapSeeds, setMapSeeds] = useState<Record<string, number>>({});

    const filtered = mapsData.filter(
        (m) => envFilter === "All" || m.environment === envFilter
    );

    const active = mapsData.find((m) => m.id === selectedMap);

    const regenerateMap = useCallback((mapId: string) => {
        setMapSeeds((prev) => ({
            ...prev,
            [mapId]: (prev[mapId] || 0) + 1,
        }));
    }, []);

    const getSeed = (mapId: string) => {
        return `${mapId}-gen-${mapSeeds[mapId] || 0}`;
    };

    return (
        <div className="page-content">
            <div className="container">
                <div className="page-header">
                    <h1>🗺️ Map Gallery</h1>
                    <p className="subtitle">
                        {mapsData.length} maps with procedurally generated dungeon layouts,
                        encounter stat blocks, and read-aloud descriptions.
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
                            onClick={() => setSelectedMap(selectedMap === map.id ? null : map.id)}
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

                {/* Expanded Map Detail */}
                {active && (
                    <div className={styles.mapDetail} id="map-detail">
                        <div className={styles.detailHeader}>
                            <div>
                                <h2>{active.name}</h2>
                                <p className={styles.detailMeta}>
                                    {active.environment} · Grid: {active.gridSize} · Difficulty: {active.difficulty}
                                </p>
                            </div>
                            <div className={styles.detailActions}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => regenerateMap(active.id)}
                                >
                                    🎲 Regenerate Layout
                                </button>
                                <button
                                    className={styles.closeBtn}
                                    onClick={() => setSelectedMap(null)}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <p className={styles.detailDesc}>{active.description}</p>

                        {/* Generated Dungeon Map */}
                        <DungeonMap
                            seed={getSeed(active.id)}
                            environment={active.environment}
                            difficulty={active.difficulty}
                            gridSize={active.gridSize}
                            keyFeatures={active.keyFeatures}
                            suggestedEncounters={active.suggestedEncounters}
                        />

                        {/* Read Aloud */}
                        <div className={styles.readAloud}>
                            <h4>📖 Read Aloud to Players</h4>
                            <blockquote>{active.readAloudText}</blockquote>
                        </div>

                        <div className={styles.columns}>
                            {/* Key Features */}
                            <div className={styles.section}>
                                <h4>🔑 Key Features</h4>
                                <ul>
                                    {active.keyFeatures.map((f, i) => (
                                        <li key={i}>{f}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Tactical Notes */}
                            <div className={styles.section}>
                                <h4>🎯 Tactical Notes</h4>
                                <p>{active.tacticalNotes}</p>
                            </div>

                            {/* Encounters from data */}
                            <div className={styles.section}>
                                <h4>⚔️ Suggested Encounters</h4>
                                <ul>
                                    {active.suggestedEncounters.map((e, i) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                </ul>
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
