"use client";

import { useMemo } from "react";
import styles from "./DungeonMap.module.css";

/* ──────────────────────── Types ──────────────────────── */

interface Room {
    id: number;
    x: number;
    y: number;
    w: number;
    h: number;
    type: "entrance" | "combat" | "treasure" | "trap" | "boss" | "empty" | "puzzle";
    label: string;
    encounter?: EncounterInfo;
}

interface Corridor {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface EncounterInfo {
    name: string;
    creatures: string;
    ac: number;
    hp: number;
    cr: string;
    xp: number;
    tactics: string;
}

export interface DungeonMapProps {
    seed: string;
    environment: string;
    difficulty: string;
    gridSize: string;
    keyFeatures: string[];
    suggestedEncounters: string[];
}

/* ──────────────────── Seeded random ──────────────────── */

function seededRandom(seed: string) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
        h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
    }
    return function () {
        h = (h + 0x6d2b79f5) | 0;
        let t = Math.imul(h ^ (h >>> 15), 1 | h);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* ──────────────── Encounter database ──────────────── */

const encounterDb: Record<string, EncounterInfo[]> = {
    Dungeon: [
        { name: "Skeletons", creatures: "4-6 Skeletons", ac: 13, hp: 13, cr: "1/4", xp: 50, tactics: "Attack in groups. Focus weakest-looking PC. Immune to exhaustion, poison." },
        { name: "Zombies", creatures: "3-4 Zombies", ac: 8, hp: 22, cr: "1/4", xp: 50, tactics: "Slow but relentless. Undead Fortitude: DC 5+dmg Con save to stay at 1 HP." },
        { name: "Goblins", creatures: "5-8 Goblins", ac: 15, hp: 7, cr: "1/4", xp: 50, tactics: "Use Nimble Escape to Disengage/Hide as bonus action. Fight dirty, set traps." },
        { name: "Bugbear", creatures: "1-2 Bugbears", ac: 16, hp: 27, cr: "1", xp: 200, tactics: "Ambush predator. Surprise Attack: +2d6 damage on first hit. Uses stealth." },
        { name: "Mimic", creatures: "1 Mimic", ac: 12, hp: 58, cr: "2", xp: 450, tactics: "Disguises as a chest/door. Adhesive: grapples on hit. Bite deals 1d8+3 piercing." },
        { name: "Wraith", creatures: "1 Wraith", ac: 13, hp: 67, cr: "5", xp: 1800, tactics: "Incorporeal. Life Drain reduces max HP. Resistant to nonmagical attacks. Create specters from kills." },
        { name: "Gelatinous Cube", creatures: "1 Gelatinous Cube", ac: 6, hp: 84, cr: "2", xp: 450, tactics: "Nearly invisible (DC 15 Perception). Engulfs creatures on hit. 3d6 acid per turn inside." },
        { name: "Giant Spiders", creatures: "2-3 Giant Spiders", ac: 14, hp: 26, cr: "1", xp: 200, tactics: "Web attacks (restrained). Climb walls. Bite is venomous: 2d8 poison, DC 11 Con save." },
    ],
    Wilderness: [
        { name: "Wolves", creatures: "4-6 Wolves", ac: 13, hp: 11, cr: "1/4", xp: 50, tactics: "Pack Tactics: advantage when ally is adjacent. Bite can knock prone (DC 11 Str save)." },
        { name: "Owlbear", creatures: "1 Owlbear", ac: 13, hp: 59, cr: "3", xp: 700, tactics: "Charge and multiattack (beak + claws). Very territorial. Won't flee from its nest." },
        { name: "Dire Wolves", creatures: "2-3 Dire Wolves", ac: 14, hp: 37, cr: "1", xp: 200, tactics: "Pack Tactics. Knockdown bite (DC 13 Str save). Work with intelligent masters." },
        { name: "Twig Blights", creatures: "6-8 Twig Blights", ac: 13, hp: 4, cr: "1/8", xp: 25, tactics: "Ambush from undergrowth. Vulnerable to fire. Weakness: low HP, easily dispatched in groups." },
        { name: "Will-o'-Wisps", creatures: "1-2 Will-o'-Wisps", ac: 19, hp: 22, cr: "2", xp: 450, tactics: "Lure into hazards. Invisible at will. Immune to many conditions. Shock deals 2d8 lightning." },
        { name: "Green Hag", creatures: "1 Green Hag", ac: 17, hp: 82, cr: "3", xp: 700, tactics: "Illusory Appearance, Invisible Passage. Mimicry to lure. Claws deal 2d8+4 slashing." },
    ],
    Urban: [
        { name: "Bandits", creatures: "4-6 Bandits", ac: 12, hp: 11, cr: "1/8", xp: 25, tactics: "Fight with improvised weapons. Surrender at half HP. Have a leader (Bandit Captain)." },
        { name: "Bandit Captain", creatures: "1 Bandit Captain + 2 Bandits", ac: 15, hp: 65, cr: "2", xp: 450, tactics: "Multiattack (3 attacks). Parry reaction (+2 AC). Commands others to focus fire." },
        { name: "Thugs", creatures: "3-4 Thugs", ac: 11, hp: 32, cr: "1/2", xp: 100, tactics: "Pack Tactics. Multiattack. Use heavy crossbows from cover, then close to melee." },
        { name: "Guards", creatures: "4-6 Guards", ac: 16, hp: 11, cr: "1/8", xp: 25, tactics: "Fight in formation with shields. Call for reinforcements. Won't pursue beyond their post." },
        { name: "Animated Armor", creatures: "2 Animated Armor", ac: 18, hp: 33, cr: "1", xp: 200, tactics: "Immune to poison, psychic. Multiattack. Don't speak or flee. Activate on trigger." },
        { name: "Spy", creatures: "1 Spy", ac: 12, hp: 27, cr: "1", xp: 200, tactics: "Sneak Attack 2d6. Cunning Action. May prefer to flee and report rather than fight." },
    ],
    Special: [
        { name: "Fire Elementals", creatures: "1-2 Fire Elementals", ac: 13, hp: 102, cr: "5", xp: 1800, tactics: "Ignites flammables on touch. Water Susceptibility: 1 cold dmg per 5 ft water. Fire Form: pass through narrow spaces." },
        { name: "Young Red Dragon", creatures: "1 Young Red Dragon", ac: 18, hp: 178, cr: "10", xp: 5900, tactics: "Breath Weapon (12d6 fire, 30-ft cone, DC 17 Dex). Multiattack (bite + 2 claws). Flies." },
        { name: "Kobold Swarm", creatures: "8-12 Kobolds", ac: 12, hp: 5, cr: "1/8", xp: 25, tactics: "Pack Tactics with adjacent allies. Sling attacks from distance. Set traps. Sunlight Sensitivity." },
        { name: "Hell Hounds", creatures: "2-3 Hell Hounds", ac: 15, hp: 45, cr: "3", xp: 700, tactics: "Fire Breath (6d6, 15-ft cone, DC 12 Dex). Immune to fire. Pack Tactics." },
    ],
};

/* ──────────── Room type assignment based on features ──────────── */

const roomTypes: Array<Room["type"]> = ["entrance", "combat", "treasure", "trap", "boss", "empty", "puzzle"];

const roomLabels: Record<Room["type"], string[]> = {
    entrance: ["Entrance Hall", "Gateway", "Vestibule", "Antechamber"],
    combat: ["Guard Room", "Arena", "Barracks", "War Room", "Patrol Route"],
    treasure: ["Treasury", "Vault", "Hoard Room", "Cache", "Shrine"],
    trap: ["Trapped Hall", "Danger Room", "Gauntlet", "Dead End"],
    boss: ["Boss Chamber", "Throne Room", "Inner Sanctum", "Lair"],
    empty: ["Storage", "Abandoned Room", "Passage", "Alcove", "Empty Cell"],
    puzzle: ["Puzzle Room", "Ritual Chamber", "Library", "Observatory"],
};

const roomColors: Record<Room["type"], string> = {
    entrance: "#4a9eff",
    combat: "#ff4a4a",
    treasure: "#ffd700",
    trap: "#ff8c00",
    boss: "#9b59b6",
    empty: "#6b7280",
    puzzle: "#2ecc71",
};

const roomIcons: Record<Room["type"], string> = {
    entrance: "🚪",
    combat: "⚔️",
    treasure: "💰",
    trap: "⚠️",
    boss: "💀",
    empty: "◻️",
    puzzle: "🧩",
};

/* ──────────── Generator ──────────── */

function generateDungeon(props: DungeonMapProps): { rooms: Room[]; corridors: Corridor[]; width: number; height: number } {
    const rand = seededRandom(props.seed + props.environment);

    // Parse grid size
    const gridParts = props.gridSize.split("x").map((s) => parseInt(s));
    const baseW = gridParts[0] || 40;
    const baseH = gridParts[1] || 40;

    // Canvas size
    const width = 700;
    const height = 500;

    // Determine room count based on difficulty
    const difficultyRoomCount: Record<string, number> = {
        "Easy": 5,
        "Easy to Medium": 6,
        "Medium": 7,
        "Medium to Hard": 8,
        "Hard": 9,
        "Hard to Deadly": 10,
        "Varies": 7,
    };
    const roomCount = difficultyRoomCount[props.difficulty] || 7;

    // Generate rooms with collision avoidance
    const rooms: Room[] = [];
    const padding = 20;
    const minRoomW = 80;
    const maxRoomW = 140;
    const minRoomH = 60;
    const maxRoomH = 100;

    const doesOverlap = (r: { x: number; y: number; w: number; h: number }) => {
        for (const existing of rooms) {
            if (
                r.x < existing.x + existing.w + padding &&
                r.x + r.w + padding > existing.x &&
                r.y < existing.y + existing.h + padding &&
                r.y + r.h + padding > existing.y
            )
                return true;
        }
        return false;
    };

    // Type assignments
    const typeOrder: Room["type"][] = ["entrance"];
    // Add combat rooms proportional to room count
    const combatCount = Math.max(2, Math.floor(roomCount * 0.35));
    for (let i = 0; i < combatCount; i++) typeOrder.push("combat");
    typeOrder.push("treasure", "trap", "boss");
    while (typeOrder.length < roomCount) {
        const extras: Room["type"][] = ["empty", "puzzle", "combat"];
        typeOrder.push(extras[Math.floor(rand() * extras.length)]);
    }

    // Pick encounters for combat and boss rooms
    const envEncounters = encounterDb[props.environment] || encounterDb.Dungeon;

    for (let i = 0; i < roomCount; i++) {
        let attempts = 0;
        while (attempts < 100) {
            const rw = minRoomW + Math.floor(rand() * (maxRoomW - minRoomW));
            const rh = minRoomH + Math.floor(rand() * (maxRoomH - minRoomH));
            const rx = 20 + Math.floor(rand() * (width - rw - 40));
            const ry = 20 + Math.floor(rand() * (height - rh - 40));

            const candidate = { x: rx, y: ry, w: rw, h: rh };
            if (!doesOverlap(candidate)) {
                const type = typeOrder[i] || "empty";
                const labels = roomLabels[type];
                const encounter = (type === "combat" || type === "boss")
                    ? envEncounters[Math.floor(rand() * envEncounters.length)]
                    : undefined;

                rooms.push({
                    id: i,
                    ...candidate,
                    type,
                    label: labels[Math.floor(rand() * labels.length)],
                    encounter,
                });
                break;
            }
            attempts++;
        }
    }

    // Generate corridors between rooms (MST-style + some extras)
    const corridors: Corridor[] = [];
    const connected = new Set<number>([0]);

    while (connected.size < rooms.length) {
        let bestDist = Infinity;
        let bestFrom = 0;
        let bestTo = 0;
        for (const fromIdx of connected) {
            for (let toIdx = 0; toIdx < rooms.length; toIdx++) {
                if (connected.has(toIdx)) continue;
                const dx = (rooms[fromIdx].x + rooms[fromIdx].w / 2) - (rooms[toIdx].x + rooms[toIdx].w / 2);
                const dy = (rooms[fromIdx].y + rooms[fromIdx].h / 2) - (rooms[toIdx].y + rooms[toIdx].h / 2);
                const dist = dx * dx + dy * dy;
                if (dist < bestDist) {
                    bestDist = dist;
                    bestFrom = fromIdx;
                    bestTo = toIdx;
                }
            }
        }
        connected.add(bestTo);
        corridors.push({
            x1: rooms[bestFrom].x + rooms[bestFrom].w / 2,
            y1: rooms[bestFrom].y + rooms[bestFrom].h / 2,
            x2: rooms[bestTo].x + rooms[bestTo].w / 2,
            y2: rooms[bestTo].y + rooms[bestTo].h / 2,
        });
    }

    // Add 1-2 extra corridors for loops
    const extraCorridors = 1 + Math.floor(rand() * 2);
    for (let i = 0; i < extraCorridors && rooms.length > 3; i++) {
        const a = Math.floor(rand() * rooms.length);
        let b = Math.floor(rand() * rooms.length);
        if (a !== b) {
            corridors.push({
                x1: rooms[a].x + rooms[a].w / 2,
                y1: rooms[a].y + rooms[a].h / 2,
                x2: rooms[b].x + rooms[b].w / 2,
                y2: rooms[b].y + rooms[b].h / 2,
            });
        }
    }

    return { rooms, corridors, width, height };
}

/* ──────────── Component ──────────── */

export default function DungeonMap(props: DungeonMapProps) {
    const { rooms, corridors, width, height } = useMemo(() => generateDungeon(props), [props.seed, props.environment, props.difficulty, props.gridSize]);

    return (
        <div className={styles.dungeonWrapper}>
            {/* Legend */}
            <div className={styles.legend}>
                {roomTypes.map((type) => (
                    <span key={type} className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: roomColors[type] }} />
                        {roomIcons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                ))}
            </div>

            {/* SVG Map */}
            <div className={styles.mapContainer}>
                <svg viewBox={`0 0 ${width} ${height}`} className={styles.svg}>
                    <defs>
                        <filter id="roomGlow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                        </pattern>
                    </defs>

                    {/* Background grid */}
                    <rect width={width} height={height} fill="url(#grid)" />

                    {/* Corridors */}
                    {corridors.map((c, i) => {
                        // L-shaped corridors
                        const midX = c.x2;
                        const midY = c.y1;
                        return (
                            <g key={`c-${i}`}>
                                <polyline
                                    points={`${c.x1},${c.y1} ${midX},${midY} ${c.x2},${c.y2}`}
                                    fill="none"
                                    stroke="rgba(100,120,140,0.3)"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <polyline
                                    points={`${c.x1},${c.y1} ${midX},${midY} ${c.x2},${c.y2}`}
                                    fill="none"
                                    stroke="rgba(140,160,180,0.15)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </g>
                        );
                    })}

                    {/* Rooms */}
                    {rooms.map((room) => (
                        <g key={room.id} filter="url(#roomGlow)">
                            {/* Room body */}
                            <rect
                                x={room.x}
                                y={room.y}
                                width={room.w}
                                height={room.h}
                                rx={6}
                                fill={`${roomColors[room.type]}15`}
                                stroke={roomColors[room.type]}
                                strokeWidth={room.type === "boss" ? 2.5 : 1.5}
                                strokeDasharray={room.type === "trap" ? "6 3" : undefined}
                            />
                            {/* Room number circle */}
                            <circle
                                cx={room.x + 16}
                                cy={room.y + 16}
                                r={10}
                                fill={roomColors[room.type]}
                                opacity={0.9}
                            />
                            <text
                                x={room.x + 16}
                                y={room.y + 20}
                                textAnchor="middle"
                                fill="#fff"
                                fontSize="10"
                                fontWeight="bold"
                            >
                                {room.id + 1}
                            </text>
                            {/* Room label */}
                            <text
                                x={room.x + room.w / 2}
                                y={room.y + room.h / 2 - 4}
                                textAnchor="middle"
                                fill={roomColors[room.type]}
                                fontSize="11"
                                fontWeight="600"
                                opacity={0.9}
                            >
                                {roomIcons[room.type]} {room.label}
                            </text>
                            {/* Encounter name if any */}
                            {room.encounter && (
                                <text
                                    x={room.x + room.w / 2}
                                    y={room.y + room.h / 2 + 14}
                                    textAnchor="middle"
                                    fill="rgba(255,255,255,0.6)"
                                    fontSize="9"
                                >
                                    {room.encounter.creatures}
                                </text>
                            )}
                        </g>
                    ))}
                </svg>
            </div>

            {/* Encounter Stat Blocks */}
            <div className={styles.encounters}>
                <h4 className={styles.encounterTitle}>⚔️ Encounter Stat Blocks</h4>
                <div className={styles.statGrid}>
                    {rooms
                        .filter((r) => r.encounter)
                        .map((room) => (
                            <div key={room.id} className={styles.statBlock}>
                                <div className={styles.statHeader} style={{ borderColor: roomColors[room.type] }}>
                                    <span className={styles.roomNumber} style={{ background: roomColors[room.type] }}>
                                        {room.id + 1}
                                    </span>
                                    <div>
                                        <h5>{room.encounter!.name}</h5>
                                        <span className={styles.statCreatures}>{room.encounter!.creatures}</span>
                                    </div>
                                    <span className={styles.crBadge}>CR {room.encounter!.cr}</span>
                                </div>
                                <div className={styles.statRow}>
                                    <div className={styles.statCell}>
                                        <span className={styles.statLabel}>AC</span>
                                        <span className={styles.statValue}>{room.encounter!.ac}</span>
                                    </div>
                                    <div className={styles.statCell}>
                                        <span className={styles.statLabel}>HP</span>
                                        <span className={styles.statValue}>{room.encounter!.hp}</span>
                                    </div>
                                    <div className={styles.statCell}>
                                        <span className={styles.statLabel}>XP</span>
                                        <span className={styles.statValue}>{room.encounter!.xp.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className={styles.statTactics}>
                                    <span className={styles.tacticsLabel}>🎯 How to Run:</span> {room.encounter!.tactics}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
