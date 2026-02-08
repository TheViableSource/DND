"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getSessionItems, addSessionItem, removeSessionItem, clearSessionItems, SessionItem } from "@/lib/sessionStorage";
import { exportSessionPDF } from "@/lib/pdfExport";
import {
    pickRandom,
    randomCliffhangers,
    randomMusicMoods,
    randomPropsHandouts,
    getRandomSummary,
    getRandomGoal,
    getRandomOpeningScene,
    getRandomStoryBeat,
    getRandomPlotTwist,
    getRandomEncounter,
    getRandomSocialChallenge,
    getRandomLocation,
} from "@/data/sessionRandomTables";
import { generateNPC, NPC_ROLES, GeneratedNPC } from "@/data/npcGenerator";
import mapsData from "@/data/maps.json";
import monstersData from "@/data/monsters.json";
import npcsData from "@/data/npcs.json";
import styles from "./page.module.css";

type MonsterEntry = (typeof monstersData)[number];

const CR_TIERS = [
    { label: "Any CR", min: 0, max: 999 },
    { label: "Easy (CR 0-1)", min: 0, max: 1 },
    { label: "Medium (CR 2-4)", min: 2, max: 4 },
    { label: "Hard (CR 5-10)", min: 5, max: 10 },
    { label: "Deadly (CR 11+)", min: 11, max: 999 },
];

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
        propsHandouts: [""],
        rulesReview: "",
        notes: "",
    });

    const [sessionItems, setSessionItems] = useState<SessionItem[]>([]);
    const [generatedNPCs, setGeneratedNPCs] = useState<GeneratedNPC[]>([]);
    const [npcRole, setNpcRole] = useState<string>("Ally");
    const [linkedMaps, setLinkedMaps] = useState<Record<number, typeof mapsData[number]>>({});
    const [crTier, setCrTier] = useState(0);
    const [generatedMonsters, setGeneratedMonsters] = useState<MonsterEntry[]>([]);
    const [savedGeneratedNPCData, setSavedGeneratedNPCData] = useState<Record<string, GeneratedNPC>>({});
    const [lightboxItem, setLightboxItem] = useState<{ type: "npc" | "monster" | "map" | "generated-npc" | "generated-monster"; id: string; index?: number } | null>(null);

    // Load session items from localStorage
    useEffect(() => {
        setSessionItems(getSessionItems());
        const handleUpdate = () => setSessionItems(getSessionItems());
        window.addEventListener("session-items-updated", handleUpdate);
        return () => window.removeEventListener("session-items-updated", handleUpdate);
    }, []);

    const handleRemoveSessionItem = useCallback((id: string, type: string) => {
        removeSessionItem(id, type);
    }, []);

    const handleClearSessionItems = useCallback(() => {
        clearSessionItems();
    }, []);

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

    const removeArrayItem = (field: string, index: number) => {
        setPlan((prev) => {
            const arr = [...(prev[field as keyof typeof prev] as string[])];
            if (arr.length <= 1) return prev;
            arr.splice(index, 1);
            return { ...prev, [field]: arr };
        });
        if (field === "locations") {
            setLinkedMaps((prev) => {
                const next = { ...prev };
                delete next[index];
                const shifted: Record<number, typeof mapsData[number]> = {};
                for (const [k, v] of Object.entries(next)) {
                    const ki = Number(k);
                    if (ki > index) shifted[ki - 1] = v;
                    else shifted[ki] = v;
                }
                return shifted;
            });
        }
    };

    /* ── Randomizer helpers (using procedural generators for more variety) ── */
    const randomizeField = (field: string, generator: () => string) => {
        updateField(field, generator());
    };

    const randomizeArrayItem = (field: string, index: number, generator: () => string) => {
        updateArrayField(field, index, generator());
    };

    const randomizeNextEmptyOrAdd = (field: string, generator: () => string) => {
        const arr = plan[field as keyof typeof plan] as string[];
        const emptyIdx = arr.findIndex((v) => !v.trim());
        if (emptyIdx !== -1) {
            updateArrayField(field, emptyIdx, generator());
        } else {
            setPlan((prev) => ({
                ...prev,
                [field]: [...(prev[field as keyof typeof prev] as string[]), generator()],
            }));
        }
    };

    /* ── Location generator with map linking ── */
    const generateLocationWithMap = (index?: number) => {
        const loc = getRandomLocation();
        const text = `${loc.name} — ${loc.description}`;

        const matchingMaps = mapsData.filter((m) => m.environment === loc.environment);
        const linkedMap = matchingMaps.length > 0 ? pickRandom(matchingMaps) : undefined;

        if (index !== undefined) {
            updateArrayField("locations", index, text);
            if (linkedMap) {
                setLinkedMaps((prev) => ({ ...prev, [index]: linkedMap }));
            }
        } else {
            const arr = plan.locations;
            const emptyIdx = arr.findIndex((v) => !v.trim());
            if (emptyIdx !== -1) {
                updateArrayField("locations", emptyIdx, text);
                if (linkedMap) {
                    setLinkedMaps((prev) => ({ ...prev, [emptyIdx]: linkedMap }));
                }
            } else {
                const newIdx = arr.length;
                setPlan((prev) => ({
                    ...prev,
                    locations: [...prev.locations, text],
                }));
                if (linkedMap) {
                    setLinkedMaps((prev) => ({ ...prev, [newIdx]: linkedMap }));
                }
            }
        }
    };

    /* ── NPC Generator ── */
    const handleGenerateNPC = () => {
        const npc = generateNPC(npcRole);
        setGeneratedNPCs((prev) => [...prev, npc]);
    };

    const removeGeneratedNPC = (index: number) => {
        setGeneratedNPCs((prev) => prev.filter((_, i) => i !== index));
    };

    /* ── Monster Generator ── */
    const handleGenerateMonster = () => {
        const tier = CR_TIERS[crTier];
        const eligible = (monstersData as MonsterEntry[]).filter(
            (m) => m.cr >= tier.min && m.cr <= tier.max
        );
        if (eligible.length === 0) return;
        const mon = eligible[Math.floor(Math.random() * eligible.length)];
        // Avoid duplicates
        if (!generatedMonsters.some((g) => g.id === mon.id)) {
            setGeneratedMonsters((prev) => [...prev, mon]);
        } else {
            // Try again with a different one
            const remaining = eligible.filter((m) => !generatedMonsters.some((g) => g.id === m.id));
            if (remaining.length > 0) {
                setGeneratedMonsters((prev) => [...prev, remaining[Math.floor(Math.random() * remaining.length)]]);
            }
        }
    };

    const removeGeneratedMonster = (index: number) => {
        setGeneratedMonsters((prev) => prev.filter((_, i) => i !== index));
    };

    const saveMonsterToSession = (mon: MonsterEntry) => {
        addSessionItem({
            id: mon.id,
            type: "monster",
            name: mon.name,
            detail: `CR ${mon.cr} ${mon.type}`,
        });
    };

    const saveNPCToSession = (npc: GeneratedNPC) => {
        const sessionId = `gen-${npc.name.replace(/\s/g, "-").toLowerCase()}-${Date.now()}`;
        setSavedGeneratedNPCData((prev) => ({ ...prev, [sessionId]: npc }));
        addSessionItem({
            id: sessionId,
            type: "npc",
            name: npc.name,
            detail: `${npc.race} ${npc.class} (${npc.role})`,
        });
    };

    const goNext = () => setCurrentStep((s) => Math.min(s + 1, steps.length));
    const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 1));

    const npcItems = sessionItems.filter((i) => i.type === "npc");
    const monsterItems = sessionItems.filter((i) => i.type === "monster");
    const mapItems = sessionItems.filter((i) => i.type === "map");

    const exportPlan = () => {
        exportSessionPDF(plan, sessionItems, generatedNPCs, linkedMaps);
    };

    /* ── Reusable components ── */
    const RandBtn = ({ onClick, label }: { onClick: () => void; label?: string }) => (
        <button type="button" className={styles.randBtn} onClick={onClick} title={label || "Generate random"}>
            {label || "🎲 Generate"}
        </button>
    );

    const DeleteBtn = ({ onClick }: { onClick: () => void }) => (
        <button type="button" className={styles.deleteItemBtn} onClick={onClick} title="Remove">
            ✕
        </button>
    );

    return (
        <div className="page-content">
            <div className="container">
                <div className="page-header">
                    <h1>📜 Session Planner</h1>
                    <p className="subtitle">
                        Plan your next game step by step. Fill in what you need, skip what
                        you don&apos;t. Stuck? Hit 🎲 to generate ideas.
                    </p>
                </div>

                {/* Saved Session Items Banner */}
                {sessionItems.length > 0 && (
                    <div className={styles.savedItemsBanner}>
                        <div className={styles.savedItemsHeader}>
                            <h3>📌 Saved Items ({sessionItems.length})</h3>
                            <button className={styles.clearAllBtn} onClick={handleClearSessionItems}>
                                Clear All
                            </button>
                        </div>
                        <p className={styles.savedItemsHint}>
                            Items added from NPCs, Bestiary, and Maps. They&apos;ll be included in your exported session plan.
                        </p>
                        <div className={styles.savedItemsGrid}>
                            {sessionItems.map((item) => (
                                <div key={`${item.type}-${item.id}`} className={styles.savedItem}>
                                    <div className={styles.savedItemInfo}>
                                        <span className={styles.savedItemType}>
                                            {item.type === "npc" ? "🧙" : item.type === "monster" ? "🐉" : "🗺️"}
                                        </span>
                                        <div>
                                            <strong>{item.name}</strong>
                                            <span className={styles.savedItemDetail}>{item.detail}</span>
                                        </div>
                                    </div>
                                    <button
                                        className={styles.savedItemRemove}
                                        onClick={() => handleRemoveSessionItem(item.id, item.type)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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

                            <div className={styles.fieldWithRand}>
                                <label className={styles.label}>
                                    One-Line Summary
                                    <input type="text" className="input" placeholder="e.g., The party enters the haunted forest to find the missing ranger" value={plan.summary} onChange={(e) => updateField("summary", e.target.value)} />
                                </label>
                                <RandBtn onClick={() => randomizeField("summary", getRandomSummary)} />
                            </div>

                            <div className={styles.fieldWithRand}>
                                <label className={styles.label}>
                                    Session Goal
                                    <textarea className="input" rows={3} placeholder="What should happen by the end? e.g., The party should reach the temple entrance and have their first encounter with the cult" value={plan.goal} onChange={(e) => updateField("goal", e.target.value)} />
                                </label>
                                <RandBtn onClick={() => randomizeField("goal", getRandomGoal)} />
                            </div>

                            <div className={styles.fieldWithRand}>
                                <label className={styles.label}>
                                    Opening Scene (Read Aloud)
                                    <textarea className="input" rows={4} placeholder="Describe the opening scene for your players. Set the mood!" value={plan.openingScene} onChange={(e) => updateField("openingScene", e.target.value)} />
                                </label>
                                <RandBtn onClick={() => randomizeField("openingScene", getRandomOpeningScene)} />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Story Beats */}
                    {currentStep === 2 && (
                        <div className={styles.step}>
                            <h2>📜 Story Beats</h2>
                            <p className={styles.stepDesc}>What are the key moments in this session? Think of these as waypoints — not every detail, just the pivotal moments.</p>

                            {plan.storyBeats.map((beat, i) => (
                                <div key={i} className={styles.fieldRow}>
                                    <label className={styles.label}>
                                        Beat {i + 1}
                                        <input type="text" className="input" placeholder={`What happens at beat ${i + 1}?`} value={beat} onChange={(e) => updateArrayField("storyBeats", i, e.target.value)} />
                                    </label>
                                    <RandBtn onClick={() => randomizeArrayItem("storyBeats", i, getRandomStoryBeat)} label="🎲" />
                                    <DeleteBtn onClick={() => removeArrayItem("storyBeats", i)} />
                                </div>
                            ))}
                            <div className={styles.btnRow}>
                                <button className="btn btn-secondary" onClick={() => addArrayItem("storyBeats")}>
                                    + Add Beat
                                </button>
                                <RandBtn onClick={() => randomizeNextEmptyOrAdd("storyBeats", getRandomStoryBeat)} label="🎲 Generate Beat" />
                            </div>

                            <div className={styles.fieldWithRand}>
                                <label className={styles.label}>
                                    Plot Twist (optional)
                                    <input type="text" className="input" placeholder="Any surprises planned?" value={plan.plotTwist} onChange={(e) => updateField("plotTwist", e.target.value)} />
                                </label>
                                <RandBtn onClick={() => randomizeField("plotTwist", getRandomPlotTwist)} />
                            </div>

                            <div className={styles.fieldWithRand}>
                                <label className={styles.label}>
                                    Cliffhanger / Session End (optional)
                                    <input type="text" className="input" placeholder="How will you end the session to keep players hooked?" value={plan.cliffhanger} onChange={(e) => updateField("cliffhanger", e.target.value)} />
                                </label>
                                <RandBtn onClick={() => randomizeField("cliffhanger", () => pickRandom(randomCliffhangers))} />
                            </div>
                        </div>
                    )}

                    {/* Step 3: NPCs & Encounters */}
                    {currentStep === 3 && (
                        <div className={styles.step}>
                            <h2>⚔️ NPCs &amp; Encounters</h2>
                            <p className={styles.stepDesc}>
                                Who will the party meet and what will they fight? Browse the <Link href="/npcs" target="_blank">NPC Library</Link> and <Link href="/bestiary" target="_blank">Bestiary</Link> for inspiration, or generate NPCs below.
                            </p>

                            {/* ── NPC Generator ── */}
                            <div className={styles.generatorPanel}>
                                <h4 className={styles.subhead}>🎲 NPC Generator</h4>
                                <p className={styles.generatorHint}>Choose a role and generate a fully-fleshed NPC to add to your session.</p>
                                <div className={styles.generatorControls}>
                                    <select
                                        className={styles.roleSelect}
                                        value={npcRole}
                                        onChange={(e) => setNpcRole(e.target.value)}
                                    >
                                        {NPC_ROLES.map((role) => (
                                            <option key={role} value={role}>
                                                {role === "Ally" ? "🤝 Ally" : role === "Antagonist" ? "💀 Antagonist" : role === "Quest Giver" ? "📜 Quest Giver" : "😐 Neutral"}
                                            </option>
                                        ))}
                                    </select>
                                    <button className={styles.generateNpcBtn} onClick={handleGenerateNPC}>
                                        🎲 Generate {npcRole}
                                    </button>
                                </div>

                                {/* Generated NPCs */}
                                {generatedNPCs.length > 0 && (
                                    <div className={styles.generatedNPCList}>
                                        {generatedNPCs.map((npc, i) => (
                                            <div key={i} className={styles.generatedNPC} onClick={() => setLightboxItem({ type: "generated-npc", id: npc.id, index: i })} style={{ cursor: "pointer" }}>
                                                <div className={styles.generatedNPCHeader}>
                                                    <div>
                                                        <strong className={styles.npcName}>{npc.name}</strong>
                                                        <span className={styles.npcMeta}>
                                                            {npc.race} · {npc.class} · <span className={`${styles.npcRole} ${styles[`role${npc.role.replace(/\s/g, "")}`]}`}>{npc.role}</span>
                                                        </span>
                                                    </div>
                                                    <div className={styles.npcActions}>
                                                        <button className={styles.saveToSessionBtn} onClick={(e) => { e.stopPropagation(); saveNPCToSession(npc); }} title="Save to Session">
                                                            Save to Session
                                                        </button>
                                                        <button className={styles.discardBtn} onClick={(e) => { e.stopPropagation(); removeGeneratedNPC(i); }} title="Remove NPC">✕</button>
                                                    </div>
                                                </div>

                                                <div className={styles.npcDetails}>
                                                    <div className={styles.npcDetailRow}>
                                                        <span className={styles.npcDetailLabel}>Personality</span>
                                                        <span>{npc.personality.join(", ")}</span>
                                                    </div>
                                                    <div className={styles.npcDetailRow}>
                                                        <span className={styles.npcDetailLabel}>Motivation</span>
                                                        <span>{npc.motivation}</span>
                                                    </div>
                                                    <div className={styles.npcDetailRow}>
                                                        <span className={styles.npcDetailLabel}>Secret</span>
                                                        <span className={styles.npcSecret}>{npc.secret}</span>
                                                    </div>
                                                    <div className={styles.npcDialogue}>
                                                        <span className={styles.npcDetailLabel}>Key Dialogue</span>
                                                        <div className={styles.dialogueLine}><em>&ldquo;{npc.dialogue.greeting}&rdquo;</em></div>
                                                        <div className={styles.dialogueLine}><em>&ldquo;{npc.dialogue.quest}&rdquo;</em></div>
                                                        <div className={styles.dialogueLine}><em>&ldquo;{npc.dialogue.farewell}&rdquo;</em></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Saved NPCs from library */}
                            {npcItems.length > 0 && (
                                <div className={styles.savedSection}>
                                    <h4 className={styles.subhead}>🧙 Saved NPCs</h4>
                                    <div className={styles.savedList}>
                                        {npcItems.map((item) => (
                                            <div key={item.id} className={styles.savedListItem}>
                                                <span className={styles.savedItemClickable} onClick={() => setLightboxItem({ type: "npc", id: item.id })}>
                                                    <strong>{item.name}</strong> — {item.detail}
                                                </span>
                                                <button className={styles.savedItemRemove} onClick={() => handleRemoveSessionItem(item.id, item.type)}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <h4 className={styles.subhead}>NPCs This Session</h4>
                            {plan.npcs.map((npc, i) => (
                                <div key={i} className={styles.fieldRow}>
                                    <input type="text" className="input" placeholder="NPC name & role" value={npc} onChange={(e) => updateArrayField("npcs", i, e.target.value)} />
                                    <DeleteBtn onClick={() => removeArrayItem("npcs", i)} />
                                </div>
                            ))}
                            <button className="btn btn-secondary" onClick={() => addArrayItem("npcs")} style={{ marginBottom: "var(--space-xl)" }}>
                                + Add NPC
                            </button>

                            {/* ── Monster Generator ── */}
                            <div className={styles.generatorPanel}>
                                <h4 className={styles.subhead}>🎲 Monster Generator</h4>
                                <p className={styles.generatorHint}>Pull a random monster from the bestiary by challenge rating. Save it to include its full stat block in your PDF.</p>
                                <div className={styles.generatorControls}>
                                    <select
                                        className={styles.roleSelect}
                                        value={crTier}
                                        onChange={(e) => setCrTier(Number(e.target.value))}
                                    >
                                        {CR_TIERS.map((tier, i) => (
                                            <option key={tier.label} value={i}>{tier.label}</option>
                                        ))}
                                    </select>
                                    <button className={styles.generateNpcBtn} onClick={handleGenerateMonster}>
                                        🎲 Pull Monster
                                    </button>
                                </div>

                                {generatedMonsters.length > 0 && (
                                    <div className={styles.generatedNPCList}>
                                        {generatedMonsters.map((mon, i) => (
                                            <div key={mon.id} className={styles.generatedNPC} onClick={() => setLightboxItem({ type: "generated-monster", id: mon.id, index: i })} style={{ cursor: "pointer" }}>
                                                <div className={styles.generatedNPCHeader}>
                                                    <div>
                                                        <strong className={styles.npcName}>{mon.name}</strong>
                                                        <span className={styles.npcMeta}>
                                                            {mon.size} {mon.type} · CR {mon.cr} · {mon.xp} XP
                                                        </span>
                                                    </div>
                                                    <div className={styles.npcActions}>
                                                        <button className={styles.saveToSessionBtn} onClick={(e) => { e.stopPropagation(); saveMonsterToSession(mon); }} title="Save to Session">
                                                            Save to Session
                                                        </button>
                                                        <button className={styles.discardBtn} onClick={(e) => { e.stopPropagation(); removeGeneratedMonster(i); }} title="Remove">✕</button>
                                                    </div>
                                                </div>
                                                <div className={styles.npcDetails}>
                                                    <div className={styles.statRow}>
                                                        <div className={styles.statBlock}><span className={styles.statLabel}>AC</span><span className={styles.statValue}>{mon.ac}</span>{mon.acType && <span className={styles.statNote}>{mon.acType}</span>}</div>
                                                        <div className={styles.statBlock}><span className={styles.statLabel}>HP</span><span className={styles.statValue}>{mon.hp}</span><span className={styles.statNote}>{mon.hitDice}</span></div>
                                                        <div className={styles.statBlock}><span className={styles.statLabel}>Speed</span><span className={styles.statValue}>{mon.speed}</span></div>
                                                    </div>
                                                    {mon.abilities && (
                                                        <div className={styles.statRow}>
                                                            <div className={styles.statBlock}><span className={styles.statLabel}>STR</span><span className={styles.statValue}>{mon.abilities.str}</span></div>
                                                            <div className={styles.statBlock}><span className={styles.statLabel}>DEX</span><span className={styles.statValue}>{mon.abilities.dex}</span></div>
                                                            <div className={styles.statBlock}><span className={styles.statLabel}>CON</span><span className={styles.statValue}>{mon.abilities.con}</span></div>
                                                            <div className={styles.statBlock}><span className={styles.statLabel}>INT</span><span className={styles.statValue}>{mon.abilities.int}</span></div>
                                                            <div className={styles.statBlock}><span className={styles.statLabel}>WIS</span><span className={styles.statValue}>{mon.abilities.wis}</span></div>
                                                            <div className={styles.statBlock}><span className={styles.statLabel}>CHA</span><span className={styles.statValue}>{mon.abilities.cha}</span></div>
                                                        </div>
                                                    )}
                                                    {mon.actions && mon.actions.length > 0 && (
                                                        <div className={styles.npcDialogue}>
                                                            <span className={styles.npcDetailLabel}>Actions</span>
                                                            {mon.actions.slice(0, 3).map((a: { name: string; desc: string }, ai: number) => (
                                                                <div key={ai} className={styles.dialogueLine}>
                                                                    <strong>{a.name}:</strong> {a.desc}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {mon.tactics && (
                                                        <div className={styles.npcDetailRow}>
                                                            <span className={styles.npcDetailLabel}>Tactics</span>
                                                            <span>{mon.tactics}</span>
                                                        </div>
                                                    )}
                                                    {mon.dmTips && (
                                                        <div className={styles.npcDetailRow}>
                                                            <span className={styles.npcDetailLabel}>DM Tips</span>
                                                            <span className={styles.npcSecret}>{mon.dmTips}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Saved Monsters from bestiary */}
                            {monsterItems.length > 0 && (
                                <div className={styles.savedSection}>
                                    <h4 className={styles.subhead}>🐉 Saved Monsters</h4>
                                    <div className={styles.savedList}>
                                        {monsterItems.map((item) => (
                                            <div key={item.id} className={styles.savedListItem}>
                                                <span className={styles.savedItemClickable} onClick={() => setLightboxItem({ type: "monster", id: item.id })}>
                                                    <strong>{item.name}</strong> — {item.detail}
                                                </span>
                                                <button className={styles.savedItemRemove} onClick={() => handleRemoveSessionItem(item.id, item.type)}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={styles.fieldWithRand}>
                                <h4 className={styles.subhead}>Combat Encounters</h4>
                                <RandBtn onClick={() => randomizeNextEmptyOrAdd("encounters", getRandomEncounter)} label="🎲 Generate" />
                            </div>
                            {plan.encounters.map((enc, i) => (
                                <div key={i} className={styles.fieldRow}>
                                    <input type="text" className="input" placeholder="e.g., 4 Goblins (CR 1/4) in the cave entrance" value={enc} onChange={(e) => updateArrayField("encounters", i, e.target.value)} />
                                    <RandBtn onClick={() => randomizeArrayItem("encounters", i, getRandomEncounter)} label="🎲" />
                                    <DeleteBtn onClick={() => removeArrayItem("encounters", i)} />
                                </div>
                            ))}
                            <button className="btn btn-secondary" onClick={() => addArrayItem("encounters")} style={{ marginBottom: "var(--space-xl)" }}>
                                + Add Encounter
                            </button>

                            <div className={styles.fieldWithRand}>
                                <h4 className={styles.subhead}>Social Challenges (optional)</h4>
                                <RandBtn onClick={() => randomizeNextEmptyOrAdd("socialChallenges", getRandomSocialChallenge)} label="🎲 Generate" />
                            </div>
                            {plan.socialChallenges.map((sc, i) => (
                                <div key={i} className={styles.fieldRow}>
                                    <input type="text" className="input" placeholder="e.g., Convince the guard captain to let you investigate" value={sc} onChange={(e) => updateArrayField("socialChallenges", i, e.target.value)} />
                                    <RandBtn onClick={() => randomizeArrayItem("socialChallenges", i, getRandomSocialChallenge)} label="🎲" />
                                    <DeleteBtn onClick={() => removeArrayItem("socialChallenges", i)} />
                                </div>
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
                                Where does the action take place? Hit 🎲 to generate a location with a matching map auto-linked for your PDF export.
                            </p>

                            {/* Saved Maps */}
                            {mapItems.length > 0 && (
                                <div className={styles.savedSection}>
                                    <h4 className={styles.subhead}>🗺️ Saved Maps</h4>
                                    <div className={styles.savedList}>
                                        {mapItems.map((item) => (
                                            <div key={item.id} className={styles.savedListItem}>
                                                <span className={styles.savedItemClickable} onClick={() => setLightboxItem({ type: "map", id: item.id })}>
                                                    <strong>{item.name}</strong> — {item.detail}
                                                </span>
                                                <button className={styles.savedItemRemove} onClick={() => handleRemoveSessionItem(item.id, item.type)}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={styles.fieldWithRand}>
                                <h4 className={styles.subhead}>Locations</h4>
                                <RandBtn onClick={() => generateLocationWithMap()} label="🎲 Generate Location + Map" />
                            </div>
                            {plan.locations.map((loc, i) => (
                                <div key={i}>
                                    <div className={styles.fieldRow}>
                                        <input type="text" className="input" placeholder="Location name & brief description" value={loc} onChange={(e) => updateArrayField("locations", i, e.target.value)} />
                                        <RandBtn onClick={() => generateLocationWithMap(i)} label="🎲" />
                                        <DeleteBtn onClick={() => removeArrayItem("locations", i)} />
                                    </div>
                                    {linkedMaps[i] && (
                                        <div className={styles.linkedMapTag}>
                                            🗺️ Linked map: <strong>{linkedMaps[i].name}</strong> ({linkedMaps[i].environment}) — will be included in PDF export
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button className="btn btn-secondary" onClick={() => addArrayItem("locations")} style={{ marginBottom: "var(--space-xl)" }}>
                                + Add Location
                            </button>

                            <label className={styles.label}>
                                Map Notes
                                <textarea className="input" rows={3} placeholder="Any specific map setup notes? Grid adjustments, fog of war, tokens needed..." value={plan.mapNotes} onChange={(e) => updateField("mapNotes", e.target.value)} />
                            </label>

                            <div className={styles.fieldWithRand}>
                                <label className={styles.label}>
                                    Music / Mood Setting
                                    <input type="text" className="input" placeholder="e.g., Ambient forest sounds, epic battle playlist, tavern music" value={plan.musicMood} onChange={(e) => updateField("musicMood", e.target.value)} />
                                </label>
                                <RandBtn onClick={() => randomizeField("musicMood", () => pickRandom(randomMusicMoods))} />
                            </div>
                        </div>
                    )}

                    {/* Step 5: Prep Checklist */}
                    {currentStep === 5 && (
                        <div className={styles.step}>
                            <h2>✅ Prep Checklist</h2>
                            <p className={styles.stepDesc}>Final prep before game night. Make sure you have everything you need!</p>

                            <div className={styles.fieldWithRand}>
                                <h4 className={styles.subhead}>Props / Handouts</h4>
                                <RandBtn onClick={() => randomizeNextEmptyOrAdd("propsHandouts", () => pickRandom(randomPropsHandouts))} label="🎲 Generate" />
                            </div>
                            {plan.propsHandouts.map((prop, i) => (
                                <div key={i} className={styles.fieldRow}>
                                    <input type="text" className="input" placeholder="e.g., Letter from the king (printed), treasure map, puzzle handout" value={prop} onChange={(e) => updateArrayField("propsHandouts", i, e.target.value)} />
                                    <RandBtn onClick={() => randomizeArrayItem("propsHandouts", i, () => pickRandom(randomPropsHandouts))} label="🎲" />
                                    <DeleteBtn onClick={() => removeArrayItem("propsHandouts", i)} />
                                </div>
                            ))}
                            <button className="btn btn-secondary" onClick={() => addArrayItem("propsHandouts")} style={{ marginBottom: "var(--space-xl)" }}>
                                + Add Prop
                            </button>

                            <label className={styles.label}>
                                Rules to Review
                                <textarea className="input" rows={2} placeholder="Any rules you need to brush up on? e.g., Grappling, underwater combat, chase rules" value={plan.rulesReview} onChange={(e) => updateField("rulesReview", e.target.value)} />
                            </label>

                            <label className={styles.label}>
                                Additional Notes
                                <textarea className="input" rows={4} placeholder="Anything else you want to remember..." value={plan.notes} onChange={(e) => updateField("notes", e.target.value)} />
                            </label>

                            {/* Summary of what will be exported */}
                            {(generatedNPCs.length > 0 || Object.keys(linkedMaps).length > 0 || sessionItems.length > 0) && (
                                <div className={styles.exportSummary}>
                                    <h4>📦 Export Includes</h4>
                                    {generatedNPCs.length > 0 && <p>🧙 {generatedNPCs.length} generated NPC{generatedNPCs.length > 1 ? "s" : ""} with full character sheets</p>}
                                    {Object.keys(linkedMaps).length > 0 && <p>🗺️ {Object.keys(linkedMaps).length} linked map{Object.keys(linkedMaps).length > 1 ? "s" : ""} with tactical details</p>}
                                    {sessionItems.length > 0 && <p>📌 {sessionItems.length} saved item{sessionItems.length > 1 ? "s" : ""} from your library</p>}
                                </div>
                            )}

                            {/* Export */}
                            <div className={styles.exportSection}>
                                <h3>📥 Export Your Plan</h3>
                                <p>Download your session plan as a PDF you can reference during the game.
                                    {sessionItems.length > 0 && ` Includes ${sessionItems.length} saved items from your library.`}
                                </p>
                                <button className="btn btn-primary" onClick={exportPlan}>
                                    📄 Download PDF Session Plan
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

            {/* ── Lightbox Modal ── */}
            {lightboxItem && (() => {
                type NpcEntry = (typeof npcsData)[number];
                const npc = lightboxItem.type === "npc" ? (npcsData as NpcEntry[]).find((n) => n.id === lightboxItem.id) : null;
                const mon = lightboxItem.type === "monster" ? (monstersData as MonsterEntry[]).find((m) => m.id === lightboxItem.id) : null;
                const map = lightboxItem.type === "map" ? mapsData.find((m) => m.id === lightboxItem.id) : null;
                const genNpc = lightboxItem.type === "generated-npc" && lightboxItem.index !== undefined ? generatedNPCs[lightboxItem.index] : null;
                const genMon = lightboxItem.type === "generated-monster" && lightboxItem.index !== undefined ? generatedMonsters[lightboxItem.index] : null;
                // If a saved NPC isn't found in the library, check if it's a saved generated NPC
                const savedGenNpc = !npc && lightboxItem.type === "npc" ? savedGeneratedNPCData[lightboxItem.id] : null;

                if (!npc && !mon && !map && !genNpc && !genMon && !savedGenNpc) { setLightboxItem(null); return null; }

                const calcMod = (score: number) => { const mod = Math.floor((score - 10) / 2); return mod >= 0 ? `+${mod}` : String(mod); };

                return (
                    <div className={styles.lightboxOverlay} onClick={() => setLightboxItem(null)}>
                        <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                            <button className={styles.lightboxClose} onClick={() => setLightboxItem(null)}>✕</button>

                            {/* ── NPC Lightbox ── */}
                            {npc && (
                                <div className={styles.lightboxBody}>
                                    <h2 className={styles.lightboxTitle}>{npc.name}</h2>
                                    <p className={styles.lightboxSubtitle}>{npc.race} · {npc.class} · {npc.role} · CR {npc.cr}</p>

                                    <div className={styles.lightboxSection}>
                                        <h4>Appearance</h4>
                                        <p>{npc.appearance}</p>
                                    </div>
                                    <div className={styles.lightboxSection}>
                                        <h4>Personality</h4>
                                        <p>{npc.personality.join(", ")}</p>
                                    </div>
                                    <div className={styles.lightboxSection}>
                                        <h4>Motivation</h4>
                                        <p>{npc.motivation}</p>
                                    </div>
                                    <div className={styles.lightboxSection}>
                                        <h4>Secret</h4>
                                        <p className={styles.npcSecret}>{npc.secret}</p>
                                    </div>
                                    <div className={styles.lightboxSection}>
                                        <h4>Dialogue</h4>
                                        <div className={styles.lightboxDialogue}>
                                            <div><strong>Greeting:</strong> <em>&ldquo;{npc.dialogue.greeting}&rdquo;</em></div>
                                            <div><strong>Quest:</strong> <em>&ldquo;{npc.dialogue.quest}&rdquo;</em></div>
                                            <div><strong>Farewell:</strong> <em>&ldquo;{npc.dialogue.farewell}&rdquo;</em></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Generated NPC Lightbox ── */}
                            {genNpc && (
                                <div className={styles.lightboxBody}>
                                    <h2 className={styles.lightboxTitle}>{genNpc.name}</h2>
                                    <p className={styles.lightboxSubtitle}>{genNpc.race} · {genNpc.class} · {genNpc.role}</p>

                                    <div className={styles.lightboxSection}>
                                        <h4>Appearance</h4>
                                        <p>{genNpc.appearance}</p>
                                    </div>
                                    <div className={styles.lightboxSection}>
                                        <h4>Personality</h4>
                                        <p>{genNpc.personality.join(", ")}</p>
                                    </div>
                                    <div className={styles.lightboxSection}>
                                        <h4>Motivation</h4>
                                        <p>{genNpc.motivation}</p>
                                    </div>
                                    <div className={styles.lightboxSection}>
                                        <h4>Secret</h4>
                                        <p className={styles.npcSecret}>{genNpc.secret}</p>
                                    </div>
                                    <div className={styles.lightboxSection}>
                                        <h4>Dialogue</h4>
                                        <div className={styles.lightboxDialogue}>
                                            <div><strong>Greeting:</strong> <em>&ldquo;{genNpc.dialogue.greeting}&rdquo;</em></div>
                                            <div><strong>Quest:</strong> <em>&ldquo;{genNpc.dialogue.quest}&rdquo;</em></div>
                                            <div><strong>Farewell:</strong> <em>&ldquo;{genNpc.dialogue.farewell}&rdquo;</em></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Saved Generated NPC Lightbox ── */}
                            {savedGenNpc && (
                                <div className={styles.lightboxBody}>
                                    <h2 className={styles.lightboxTitle}>{savedGenNpc.name}</h2>
                                    <p className={styles.lightboxSubtitle}>{savedGenNpc.race} · {savedGenNpc.class} · {savedGenNpc.role}</p>

                                    <div className={styles.lightboxSection}>
                                        <h4>Appearance</h4>
                                        <p>{savedGenNpc.appearance}</p>
                                    </div>
                                    <div className={styles.lightboxSection}>
                                        <h4>Personality</h4>
                                        <p>{savedGenNpc.personality.join(", ")}</p>
                                    </div>
                                    <div className={styles.lightboxSection}>
                                        <h4>Motivation</h4>
                                        <p>{savedGenNpc.motivation}</p>
                                    </div>
                                    <div className={styles.lightboxSection}>
                                        <h4>Secret</h4>
                                        <p className={styles.npcSecret}>{savedGenNpc.secret}</p>
                                    </div>
                                    <div className={styles.lightboxSection}>
                                        <h4>Dialogue</h4>
                                        <div className={styles.lightboxDialogue}>
                                            <div><strong>Greeting:</strong> <em>&ldquo;{savedGenNpc.dialogue.greeting}&rdquo;</em></div>
                                            <div><strong>Quest:</strong> <em>&ldquo;{savedGenNpc.dialogue.quest}&rdquo;</em></div>
                                            <div><strong>Farewell:</strong> <em>&ldquo;{savedGenNpc.dialogue.farewell}&rdquo;</em></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Monster Lightbox ── */}
                            {mon && (
                                <div className={styles.lightboxBody}>
                                    <h2 className={styles.lightboxTitle}>{mon.name}</h2>
                                    <p className={styles.lightboxSubtitle}>{mon.size} {mon.type}, {mon.alignment}</p>

                                    <div className={styles.lightboxStatRow}>
                                        <div><strong>AC</strong> {mon.ac}{mon.acType ? ` (${mon.acType})` : ""}</div>
                                        <div><strong>HP</strong> {mon.hp} ({mon.hitDice})</div>
                                        <div><strong>Speed</strong> {mon.speed}</div>
                                    </div>

                                    <div className={styles.lightboxAbilities}>
                                        {(["str", "dex", "con", "int", "wis", "cha"] as const).map((key) => {
                                            const val = (mon.abilities as Record<string, number>)[key];
                                            return (
                                                <div key={key} className={styles.abilityCell}>
                                                    <span className={styles.abilityLabel}>{key.toUpperCase()}</span>
                                                    <span>{val} ({calcMod(val)})</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {mon.savingThrows && <p className={styles.lightboxDetail}><strong>Saves:</strong> {mon.savingThrows}</p>}
                                    {mon.skills && <p className={styles.lightboxDetail}><strong>Skills:</strong> {mon.skills}</p>}
                                    <p className={styles.lightboxDetail}><strong>Senses:</strong> {mon.senses}</p>
                                    <p className={styles.lightboxDetail}><strong>Languages:</strong> {mon.languages}</p>
                                    <p className={styles.lightboxDetail}><strong>CR:</strong> {mon.cr} ({mon.xp} XP)</p>

                                    {mon.traits && mon.traits.length > 0 && (
                                        <div className={styles.lightboxSection}>
                                            <h4>Traits</h4>
                                            {mon.traits.map((t) => (
                                                <p key={t.name} className={styles.lightboxDetail}><strong><em>{t.name}.</em></strong> {t.desc}</p>
                                            ))}
                                        </div>
                                    )}

                                    <div className={styles.lightboxSection}>
                                        <h4>Actions</h4>
                                        {mon.actions.map((a) => (
                                            <p key={a.name} className={styles.lightboxDetail}><strong><em>{a.name}.</em></strong> {a.desc}</p>
                                        ))}
                                    </div>

                                    {mon.legendaryActions && mon.legendaryActions.length > 0 && (
                                        <div className={styles.lightboxSection}>
                                            <h4>Legendary Actions</h4>
                                            {mon.legendaryActions.map((la) => (
                                                <p key={la.name} className={styles.lightboxDetail}><strong><em>{la.name}.</em></strong> {la.desc}</p>
                                            ))}
                                        </div>
                                    )}

                                    {mon.tactics && (
                                        <div className={styles.lightboxSection}>
                                            <h4>Tactics</h4>
                                            <p>{mon.tactics}</p>
                                        </div>
                                    )}

                                    {mon.dmTips && (
                                        <div className={styles.lightboxSection}>
                                            <h4>DM Tips</h4>
                                            <p className={styles.npcSecret}>{mon.dmTips}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Generated Monster Lightbox ── */}
                            {genMon && (
                                <div className={styles.lightboxBody}>
                                    <h2 className={styles.lightboxTitle}>{genMon.name}</h2>
                                    <p className={styles.lightboxSubtitle}>{genMon.size} {genMon.type}, {genMon.alignment}</p>

                                    <div className={styles.lightboxStatRow}>
                                        <div><strong>AC</strong> {genMon.ac}{genMon.acType ? ` (${genMon.acType})` : ""}</div>
                                        <div><strong>HP</strong> {genMon.hp} ({genMon.hitDice})</div>
                                        <div><strong>Speed</strong> {genMon.speed}</div>
                                    </div>

                                    {genMon.abilities && (
                                        <div className={styles.lightboxAbilities}>
                                            {(["str", "dex", "con", "int", "wis", "cha"] as const).map((key) => {
                                                const val = (genMon.abilities as Record<string, number>)[key];
                                                return (
                                                    <div key={key} className={styles.abilityCell}>
                                                        <span className={styles.abilityLabel}>{key.toUpperCase()}</span>
                                                        <span>{val} ({calcMod(val)})</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {genMon.savingThrows && <p className={styles.lightboxDetail}><strong>Saves:</strong> {genMon.savingThrows}</p>}
                                    {genMon.skills && <p className={styles.lightboxDetail}><strong>Skills:</strong> {genMon.skills}</p>}
                                    <p className={styles.lightboxDetail}><strong>Senses:</strong> {genMon.senses}</p>
                                    <p className={styles.lightboxDetail}><strong>Languages:</strong> {genMon.languages}</p>
                                    <p className={styles.lightboxDetail}><strong>CR:</strong> {genMon.cr} ({genMon.xp} XP)</p>

                                    {genMon.traits && genMon.traits.length > 0 && (
                                        <div className={styles.lightboxSection}>
                                            <h4>Traits</h4>
                                            {genMon.traits.map((t) => (
                                                <p key={t.name} className={styles.lightboxDetail}><strong><em>{t.name}.</em></strong> {t.desc}</p>
                                            ))}
                                        </div>
                                    )}

                                    <div className={styles.lightboxSection}>
                                        <h4>Actions</h4>
                                        {genMon.actions.map((a) => (
                                            <p key={a.name} className={styles.lightboxDetail}><strong><em>{a.name}.</em></strong> {a.desc}</p>
                                        ))}
                                    </div>

                                    {genMon.legendaryActions && genMon.legendaryActions.length > 0 && (
                                        <div className={styles.lightboxSection}>
                                            <h4>Legendary Actions</h4>
                                            {genMon.legendaryActions.map((la) => (
                                                <p key={la.name} className={styles.lightboxDetail}><strong><em>{la.name}.</em></strong> {la.desc}</p>
                                            ))}
                                        </div>
                                    )}

                                    {genMon.tactics && (
                                        <div className={styles.lightboxSection}>
                                            <h4>Tactics</h4>
                                            <p>{genMon.tactics}</p>
                                        </div>
                                    )}

                                    {genMon.dmTips && (
                                        <div className={styles.lightboxSection}>
                                            <h4>DM Tips</h4>
                                            <p className={styles.npcSecret}>{genMon.dmTips}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Map Lightbox ── */}
                            {map && (
                                <div className={styles.lightboxBody}>
                                    <h2 className={styles.lightboxTitle}>{map.name}</h2>
                                    <p className={styles.lightboxSubtitle}>{map.environment} · Grid {map.gridSize} · {map.difficulty}</p>

                                    <div className={styles.lightboxSection}>
                                        <h4>Description</h4>
                                        <p>{map.description}</p>
                                    </div>

                                    {map.readAloudText && (
                                        <div className={styles.lightboxSection}>
                                            <h4>Read Aloud</h4>
                                            <blockquote className={styles.lightboxBlockquote}>{map.readAloudText}</blockquote>
                                        </div>
                                    )}

                                    <div className={styles.lightboxSection}>
                                        <h4>Key Features</h4>
                                        <ul>{map.keyFeatures.map((f, i) => <li key={i}>{f}</li>)}</ul>
                                    </div>

                                    <div className={styles.lightboxSection}>
                                        <h4>Suggested Encounters</h4>
                                        <ul>{map.suggestedEncounters.map((e, i) => <li key={i}>{e}</li>)}</ul>
                                    </div>

                                    {map.tacticalNotes && (
                                        <div className={styles.lightboxSection}>
                                            <h4>Tactical Notes</h4>
                                            <p>{map.tacticalNotes}</p>
                                        </div>
                                    )}

                                    <div className={styles.lightboxSection}>
                                        <h4>Loot Suggestions</h4>
                                        <ul>{map.lootSuggestions.map((l, i) => <li key={i}>{l}</li>)}</ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
