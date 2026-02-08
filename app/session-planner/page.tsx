"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const steps = [
    { id: 1, title: "Session Overview", icon: "📋" },
    { id: 2, title: "Story Beats", icon: "📜" },
    { id: 3, title: "NPCs & Encounters", icon: "⚔️" },
    { id: 4, title: "Locations & Maps", icon: "🗺️" },
    { id: 5, title: "Prep Checklist", icon: "✅" },
];

export default function SessionPlannerPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [plan, setPlan] = useState({
        sessionNumber: "",
        summary: "",
        goal: "",
        openingScene: "",
        storyBeats: ["", "", ""],
        plotTwist: "",
        cliffhanger: "",
        npcs: [""],
        encounters: [""],
        socialChallenges: [""],
        locations: [""],
        mapNotes: "",
        musicMood: "",
        propsHandouts: "",
        rulesReview: "",
        notes: "",
    });

    const updateField = (field: string, value: string) => {
        setPlan((prev) => ({ ...prev, [field]: value }));
    };

    const updateArrayField = (field: string, index: number, value: string) => {
        setPlan((prev) => {
            const arr = [...(prev[field as keyof typeof prev] as string[])];
            arr[index] = value;
            return { ...prev, [field]: arr };
        });
    };

    const addArrayItem = (field: string) => {
        setPlan((prev) => ({
            ...prev,
            [field]: [...(prev[field as keyof typeof prev] as string[]), ""],
        }));
    };

    const goNext = () => setCurrentStep((s) => Math.min(s + 1, steps.length));
    const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 1));

    const exportPlan = () => {
        const lines = [
            `# Session ${plan.sessionNumber || "?"} Plan`,
            "",
            `## Overview`,
            `**Summary:** ${plan.summary}`,
            `**Goal:** ${plan.goal}`,
            "",
            `## Opening Scene`,
            plan.openingScene,
            "",
            `## Story Beats`,
            ...plan.storyBeats.filter(Boolean).map((b, i) => `${i + 1}. ${b}`),
            "",
            plan.plotTwist ? `**Plot Twist:** ${plan.plotTwist}` : "",
            plan.cliffhanger ? `**Cliffhanger:** ${plan.cliffhanger}` : "",
            "",
            `## NPCs`,
            ...plan.npcs.filter(Boolean).map((n) => `- ${n}`),
            "",
            `## Encounters`,
            ...plan.encounters.filter(Boolean).map((e) => `- ${e}`),
            "",
            `## Locations`,
            ...plan.locations.filter(Boolean).map((l) => `- ${l}`),
            "",
            plan.mapNotes ? `**Map Notes:** ${plan.mapNotes}` : "",
            plan.musicMood ? `**Music/Mood:** ${plan.musicMood}` : "",
            plan.propsHandouts ? `**Props/Handouts:** ${plan.propsHandouts}` : "",
            plan.rulesReview ? `**Rules to Review:** ${plan.rulesReview}` : "",
            plan.notes ? `\n## Additional Notes\n${plan.notes}` : "",
        ].filter(Boolean);

        const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `session-${plan.sessionNumber || "plan"}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="page-content">
            <div className="container">
                <div className="page-header">
                    <h1>📜 Session Planner</h1>
                    <p className="subtitle">
                        Plan your next game step by step. Fill in what you need, skip what
                        you don&apos;t. Export when you&apos;re ready.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className={styles.progress}>
                    {steps.map((step) => (
                        <button
                            key={step.id}
                            className={`${styles.progressStep} ${currentStep === step.id ? styles.active : ""} ${currentStep > step.id ? styles.completed : ""}`}
                            onClick={() => setCurrentStep(step.id)}
                        >
                            <span className={styles.progressIcon}>
                                {currentStep > step.id ? "✓" : step.icon}
                            </span>
                            <span className={styles.progressLabel}>{step.title}</span>
                        </button>
                    ))}
                </div>

                <div className={styles.wizardContent}>
                    {/* Step 1: Overview */}
                    {currentStep === 1 && (
                        <div className={styles.step}>
                            <h2>📋 Session Overview</h2>
                            <p className={styles.stepDesc}>Start with the basics. What number session is this, and what&apos;s the overall goal?</p>

                            <label className={styles.label}>
                                Session Number
                                <input type="text" className="input" placeholder="e.g., 1, 2, 15..." value={plan.sessionNumber} onChange={(e) => updateField("sessionNumber", e.target.value)} />
                            </label>

                            <label className={styles.label}>
                                One-Line Summary
                                <input type="text" className="input" placeholder="e.g., The party enters the haunted forest to find the missing ranger" value={plan.summary} onChange={(e) => updateField("summary", e.target.value)} />
                            </label>

                            <label className={styles.label}>
                                Session Goal
                                <textarea className="input" rows={3} placeholder="What should happen by the end? e.g., The party should reach the temple entrance and have their first encounter with the cult" value={plan.goal} onChange={(e) => updateField("goal", e.target.value)} />
                            </label>

                            <label className={styles.label}>
                                Opening Scene (Read Aloud)
                                <textarea className="input" rows={4} placeholder="Describe the opening scene for your players. Set the mood!" value={plan.openingScene} onChange={(e) => updateField("openingScene", e.target.value)} />
                            </label>
                        </div>
                    )}

                    {/* Step 2: Story Beats */}
                    {currentStep === 2 && (
                        <div className={styles.step}>
                            <h2>📜 Story Beats</h2>
                            <p className={styles.stepDesc}>What are the key moments in this session? Think of these as waypoints — not every detail, just the pivotal moments.</p>

                            {plan.storyBeats.map((beat, i) => (
                                <label key={i} className={styles.label}>
                                    Beat {i + 1}
                                    <input type="text" className="input" placeholder={`What happens at beat ${i + 1}?`} value={beat} onChange={(e) => updateArrayField("storyBeats", i, e.target.value)} />
                                </label>
                            ))}
                            <button className="btn btn-secondary" onClick={() => addArrayItem("storyBeats")} style={{ marginBottom: "var(--space-lg)" }}>
                                + Add Beat
                            </button>

                            <label className={styles.label}>
                                Plot Twist (optional)
                                <input type="text" className="input" placeholder="Any surprises planned?" value={plan.plotTwist} onChange={(e) => updateField("plotTwist", e.target.value)} />
                            </label>

                            <label className={styles.label}>
                                Cliffhanger / Session End (optional)
                                <input type="text" className="input" placeholder="How will you end the session to keep players hooked?" value={plan.cliffhanger} onChange={(e) => updateField("cliffhanger", e.target.value)} />
                            </label>
                        </div>
                    )}

                    {/* Step 3: NPCs & Encounters */}
                    {currentStep === 3 && (
                        <div className={styles.step}>
                            <h2>⚔️ NPCs &amp; Encounters</h2>
                            <p className={styles.stepDesc}>
                                Who will the party meet and what will they fight? Browse the <Link href="/npcs" target="_blank">NPC Library</Link> and <Link href="/bestiary" target="_blank">Bestiary</Link> for inspiration.
                            </p>

                            <h4 className={styles.subhead}>NPCs This Session</h4>
                            {plan.npcs.map((npc, i) => (
                                <input key={i} type="text" className="input" placeholder="NPC name & role" value={npc} onChange={(e) => updateArrayField("npcs", i, e.target.value)} style={{ marginBottom: "var(--space-sm)" }} />
                            ))}
                            <button className="btn btn-secondary" onClick={() => addArrayItem("npcs")} style={{ marginBottom: "var(--space-xl)" }}>
                                + Add NPC
                            </button>

                            <h4 className={styles.subhead}>Combat Encounters</h4>
                            {plan.encounters.map((enc, i) => (
                                <input key={i} type="text" className="input" placeholder="e.g., 4 Goblins (CR 1/4) in the cave entrance" value={enc} onChange={(e) => updateArrayField("encounters", i, e.target.value)} style={{ marginBottom: "var(--space-sm)" }} />
                            ))}
                            <button className="btn btn-secondary" onClick={() => addArrayItem("encounters")} style={{ marginBottom: "var(--space-xl)" }}>
                                + Add Encounter
                            </button>

                            <h4 className={styles.subhead}>Social Challenges (optional)</h4>
                            {plan.socialChallenges.map((sc, i) => (
                                <input key={i} type="text" className="input" placeholder="e.g., Convince the guard captain to let you investigate" value={sc} onChange={(e) => updateArrayField("socialChallenges", i, e.target.value)} style={{ marginBottom: "var(--space-sm)" }} />
                            ))}
                            <button className="btn btn-secondary" onClick={() => addArrayItem("socialChallenges")}>
                                + Add Challenge
                            </button>
                        </div>
                    )}

                    {/* Step 4: Locations & Maps */}
                    {currentStep === 4 && (
                        <div className={styles.step}>
                            <h2>🗺️ Locations &amp; Maps</h2>
                            <p className={styles.stepDesc}>
                                Where does the action take place? Check the <Link href="/maps" target="_blank">Map Gallery</Link> for appropriate maps.
                            </p>

                            <h4 className={styles.subhead}>Locations</h4>
                            {plan.locations.map((loc, i) => (
                                <input key={i} type="text" className="input" placeholder="Location name & brief description" value={loc} onChange={(e) => updateArrayField("locations", i, e.target.value)} style={{ marginBottom: "var(--space-sm)" }} />
                            ))}
                            <button className="btn btn-secondary" onClick={() => addArrayItem("locations")} style={{ marginBottom: "var(--space-xl)" }}>
                                + Add Location
                            </button>

                            <label className={styles.label}>
                                Map Notes
                                <textarea className="input" rows={3} placeholder="Any specific map setup notes? Grid adjustments, fog of war, tokens needed..." value={plan.mapNotes} onChange={(e) => updateField("mapNotes", e.target.value)} />
                            </label>

                            <label className={styles.label}>
                                Music / Mood Setting
                                <input type="text" className="input" placeholder="e.g., Ambient forest sounds, epic battle playlist, tavern music" value={plan.musicMood} onChange={(e) => updateField("musicMood", e.target.value)} />
                            </label>
                        </div>
                    )}

                    {/* Step 5: Prep Checklist */}
                    {currentStep === 5 && (
                        <div className={styles.step}>
                            <h2>✅ Prep Checklist</h2>
                            <p className={styles.stepDesc}>Final prep before game night. Make sure you have everything you need!</p>

                            <label className={styles.label}>
                                Props / Handouts
                                <input type="text" className="input" placeholder="e.g., Letter from the king (printed), treasure map, puzzle handout" value={plan.propsHandouts} onChange={(e) => updateField("propsHandouts", e.target.value)} />
                            </label>

                            <label className={styles.label}>
                                Rules to Review
                                <textarea className="input" rows={2} placeholder="Any rules you need to brush up on? e.g., Grappling, underwater combat, chase rules" value={plan.rulesReview} onChange={(e) => updateField("rulesReview", e.target.value)} />
                            </label>

                            <label className={styles.label}>
                                Additional Notes
                                <textarea className="input" rows={4} placeholder="Anything else you want to remember..." value={plan.notes} onChange={(e) => updateField("notes", e.target.value)} />
                            </label>

                            {/* Export */}
                            <div className={styles.exportSection}>
                                <h3>📥 Export Your Plan</h3>
                                <p>Download your session plan as a Markdown file you can reference during the game.</p>
                                <button className="btn btn-primary" onClick={exportPlan}>
                                    Download Session Plan
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className={styles.nav}>
                        <button className="btn btn-secondary" onClick={goPrev} disabled={currentStep === 1}>
                            ← Previous
                        </button>
                        <span className={styles.stepIndicator}>Step {currentStep} of {steps.length}</span>
                        <button className="btn btn-primary" onClick={goNext} disabled={currentStep === steps.length}>
                            Next →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
