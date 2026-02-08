"use client";

import { useState } from "react";
import storiesData from "@/data/story-templates.json";
import styles from "./page.module.css";

const tierColors: Record<string, string> = {
    Beginner: "badge-green",
    Intermediate: "badge-gold",
    "Intermediate to Advanced": "badge-gold",
    Advanced: "badge-red",
};

export default function StoryArcsPage() {
    const [selectedStory, setSelectedStory] = useState<string | null>(null);
    const [expandedSession, setExpandedSession] = useState<number | null>(null);
    const [showTwists, setShowTwists] = useState(false);

    const active = storiesData.find((s) => s.id === selectedStory);

    const toggleSession = (num: number) => {
        setExpandedSession(expandedSession === num ? null : num);
    };

    return (
        <div className="page-content">
            <div className="container">
                <div className="page-header">
                    <h1>⚔️ Story Arc Templates</h1>
                    <p className="subtitle">
                        {storiesData.length} complete campaign templates with session-by-session
                        breakdowns, plot twists, and multiple endings.
                    </p>
                </div>

                {!active ? (
                    /* Story Selection */
                    <div className={styles.storyGrid}>
                        {storiesData.map((story) => (
                            <button
                                key={story.id}
                                className={styles.storyCard}
                                onClick={() => {
                                    setSelectedStory(story.id);
                                    setExpandedSession(null);
                                    setShowTwists(false);
                                }}
                            >
                                <div className={styles.storyCardHeader}>
                                    <span className={`badge ${tierColors[story.tier] || "badge-gold"}`}>
                                        {story.tier}
                                    </span>
                                    <span className={styles.sessionCount}>{story.sessions} sessions</span>
                                </div>
                                <h3>{story.name}</h3>
                                <p className={styles.tagline}>{story.tagline}</p>
                                <p className={styles.storyOverview}>{story.overview.slice(0, 180)}...</p>
                                <div className={styles.storyMeta}>
                                    <span>📊 Level {story.partyLevel}</span>
                                    <span>🎭 {story.themes.join(", ")}</span>
                                </div>
                                <span className={styles.viewBtn}>View Campaign →</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    /* Story Detail */
                    <div className={styles.storyDetail}>
                        <button className={styles.backBtn} onClick={() => setSelectedStory(null)}>
                            ← Back to All Stories
                        </button>

                        <div className={styles.storyHeader}>
                            <div>
                                <span className={`badge ${tierColors[active.tier] || "badge-gold"}`}>
                                    {active.tier}
                                </span>
                                <h2>{active.name}</h2>
                                <p className={styles.tagline}>{active.tagline}</p>
                            </div>
                            <div className={styles.storyStats}>
                                <div className={styles.stat}>
                                    <span className={styles.statValue}>{active.sessions}</span>
                                    <span className={styles.statLabel}>Sessions</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statValue}>{active.partyLevel}</span>
                                    <span className={styles.statLabel}>Level</span>
                                </div>
                            </div>
                        </div>

                        <p className={styles.overview}>{active.overview}</p>

                        <div className={styles.themes}>
                            {active.themes.map((t) => (
                                <span key={t} className="badge badge-purple">{t}</span>
                            ))}
                        </div>

                        {/* Session Timeline */}
                        <h3 className={styles.sectionTitle}>📅 Session Breakdown</h3>
                        <div className={styles.timeline}>
                            {active.sessions_detail.map((session) => (
                                <div key={session.number} className={styles.timelineItem}>
                                    <button
                                        className={`${styles.timelineTrigger} ${expandedSession === session.number ? styles.expanded : ""}`}
                                        onClick={() => toggleSession(session.number)}
                                    >
                                        <div className={styles.timelineDot}>{session.number}</div>
                                        <div className={styles.timelineInfo}>
                                            <h4>{session.title}</h4>
                                            <p>{session.summary}</p>
                                        </div>
                                        <span className={styles.chevron}>{expandedSession === session.number ? "▲" : "▼"}</span>
                                    </button>

                                    {expandedSession === session.number && (
                                        <div className={styles.sessionContent}>
                                            <div className={styles.sessionSection}>
                                                <h5>🎬 Scenes</h5>
                                                <ol>
                                                    {session.scenes.map((scene, i) => (
                                                        <li key={i}>{scene}</li>
                                                    ))}
                                                </ol>
                                            </div>

                                            <div className={styles.sessionSection}>
                                                <h5>🧙 Key NPCs</h5>
                                                <div className={styles.npcTags}>
                                                    {session.keyNPCs.map((npc) => (
                                                        <span key={npc} className={styles.npcTag}>{npc}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className={styles.sessionSection}>
                                                <h5>⚔️ Encounters</h5>
                                                <ul>
                                                    {session.encounters.map((enc, i) => (
                                                        <li key={i}>{enc}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className={styles.sessionSection}>
                                                <h5>💡 DM Tips</h5>
                                                <p className={styles.dmTip}>{session.dmTips}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Plot Twists */}
                        <div className={styles.twistsSection}>
                            <button
                                className={styles.twistsToggle}
                                onClick={() => setShowTwists(!showTwists)}
                            >
                                🤫 {showTwists ? "Hide" : "Reveal"} Plot Twists
                            </button>
                            {showTwists && (
                                <div className={styles.twistsList}>
                                    {active.plotTwists.map((twist, i) => (
                                        <div key={i} className={styles.twist}>
                                            <span className={styles.twistNumber}>{i + 1}</span>
                                            <p>{twist}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Possible Endings */}
                        <h3 className={styles.sectionTitle}>🎭 Possible Endings</h3>
                        <div className={styles.endings}>
                            {active.possibleEndings.map((ending, i) => (
                                <div key={i} className={styles.endingCard}>
                                    <p>{ending}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
