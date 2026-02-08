"use client";

import { useMemo, useState } from "react";
import styles from "./DungeonMap.module.css";

/* ──────────────────────── Types ──────────────────────── */

// Cell types for the grid
const WALL = 0;
const FLOOR = 1;
const CORRIDOR = 2;
const DOOR = 3;
const SECRET_DOOR = 4;
const TRAP = 5;
const CHEST = 6;
const MONSTER = 7;
const PILLAR = 8;
const WATER = 9;
const STAIRS_UP = 10;
const STAIRS_DOWN = 11;
const ALTAR = 12;
const TABLE = 13;
const BOOKSHELF = 14;
const THRONE = 15;
const PIT = 16;
const RUBBLE = 17;
const BARREL = 18;
const STATUE = 19;

type CellType = number;

interface GridRoom {
    id: number;
    gx: number; gy: number; gw: number; gh: number; // grid coords
    type: "entrance" | "combat" | "treasure" | "trap" | "boss" | "empty" | "puzzle";
    label: string;
    encounter?: EncounterInfo;
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

/* ──────────── Room labels ──────────── */

const roomLabels: Record<GridRoom["type"], string[]> = {
    entrance: ["Entrance Hall", "Gateway", "Vestibule", "Antechamber"],
    combat: ["Guard Room", "Arena", "Barracks", "War Room"],
    treasure: ["Treasury", "Vault", "Hoard Room", "Shrine"],
    trap: ["Trapped Hall", "Danger Room", "Gauntlet"],
    boss: ["Boss Chamber", "Throne Room", "Inner Sanctum", "Lair"],
    empty: ["Storage", "Abandoned Room", "Cellar", "Empty Cell"],
    puzzle: ["Ritual Chamber", "Library", "Observatory"],
};

const roomColors: Record<GridRoom["type"], string> = {
    entrance: "#4a9eff",
    combat: "#ff4a4a",
    treasure: "#ffd700",
    trap: "#ff8c00",
    boss: "#9b59b6",
    empty: "#6b7280",
    puzzle: "#2ecc71",
};

/* ──────────── Cell rendering config ──────────── */

interface CellStyle {
    fill: string;
    label: string;
    labelColor: string;
    fontSize?: number;
}

function getCellStyle(cell: CellType): CellStyle {
    switch (cell) {
        case WALL: return { fill: "#1a1d23", label: "", labelColor: "" };
        case FLOOR: return { fill: "#2a2d35", label: "", labelColor: "" };
        case CORRIDOR: return { fill: "#252830", label: "", labelColor: "" };
        case DOOR: return { fill: "#8B4513", label: "D", labelColor: "#fff" };
        case SECRET_DOOR: return { fill: "#2a2d35", label: "S", labelColor: "#ff8c00", fontSize: 7 };
        case TRAP: return { fill: "#2a2d35", label: "⚠", labelColor: "#ff8c00", fontSize: 8 };
        case CHEST: return { fill: "#2a2d35", label: "◆", labelColor: "#ffd700", fontSize: 9 };
        case MONSTER: return { fill: "#2a2d35", label: "M", labelColor: "#ff4a4a", fontSize: 8 };
        case PILLAR: return { fill: "#555860", label: "", labelColor: "" };
        case WATER: return { fill: "#1a3a5c", label: "~", labelColor: "#4a9eff", fontSize: 9 };
        case STAIRS_UP: return { fill: "#2a2d35", label: "▲", labelColor: "#aaa", fontSize: 8 };
        case STAIRS_DOWN: return { fill: "#2a2d35", label: "▼", labelColor: "#aaa", fontSize: 8 };
        case ALTAR: return { fill: "#2a2d35", label: "✦", labelColor: "#9b59b6", fontSize: 9 };
        case TABLE: return { fill: "#3d3020", label: "", labelColor: "" };
        case BOOKSHELF: return { fill: "#4a3520", label: "≡", labelColor: "#c4a06a", fontSize: 8 };
        case THRONE: return { fill: "#3d2050", label: "♔", labelColor: "#ffd700", fontSize: 8 };
        case PIT: return { fill: "#0d0d0d", label: "X", labelColor: "#555", fontSize: 7 };
        case RUBBLE: return { fill: "#333639", label: "·", labelColor: "#777", fontSize: 10 };
        case BARREL: return { fill: "#5a4020", label: "○", labelColor: "#8a7040", fontSize: 7 };
        case STATUE: return { fill: "#2a2d35", label: "♟", labelColor: "#aaa", fontSize: 8 };
        default: return { fill: "#2a2d35", label: "", labelColor: "" };
    }
}

/* ──────────── Legend items ──────────── */
const legendItems: { cell: CellType; name: string }[] = [
    { cell: FLOOR, name: "Floor" },
    { cell: CORRIDOR, name: "Corridor" },
    { cell: DOOR, name: "Door" },
    { cell: SECRET_DOOR, name: "Secret Door" },
    { cell: TRAP, name: "Trap" },
    { cell: CHEST, name: "Treasure" },
    { cell: MONSTER, name: "Monster" },
    { cell: PILLAR, name: "Pillar" },
    { cell: WATER, name: "Water" },
    { cell: STAIRS_DOWN, name: "Stairs" },
    { cell: ALTAR, name: "Altar" },
    { cell: TABLE, name: "Table" },
    { cell: BOOKSHELF, name: "Bookshelf" },
    { cell: THRONE, name: "Throne" },
    { cell: PIT, name: "Pit/Hole" },
    { cell: RUBBLE, name: "Rubble" },
    { cell: BARREL, name: "Barrel" },
    { cell: STATUE, name: "Statue" },
];

/* ──────────── Dungeon Generator ──────────── */

interface DungeonResult {
    grid: CellType[][];
    rooms: GridRoom[];
    gridW: number;
    gridH: number;
}

function generateDungeon(props: DungeonMapProps): DungeonResult {
    const rand = seededRandom(props.seed + props.environment);

    // Grid dimensions (each cell = 5ft square)
    const gridW = 48;
    const gridH = 36;

    // Initialize all walls
    const grid: CellType[][] = [];
    for (let y = 0; y < gridH; y++) {
        grid[y] = [];
        for (let x = 0; x < gridW; x++) {
            grid[y][x] = WALL;
        }
    }

    // Determine room count
    const difficultyRoomCount: Record<string, number> = {
        "Easy": 5, "Easy to Medium": 6, "Medium": 7,
        "Medium to Hard": 8, "Hard": 8, "Hard to Deadly": 9, "Varies": 7,
    };
    const roomCount = difficultyRoomCount[props.difficulty] || 7;

    // Room type assignments
    const typeOrder: GridRoom["type"][] = ["entrance"];
    const combatCount = Math.max(2, Math.floor(roomCount * 0.3));
    for (let i = 0; i < combatCount; i++) typeOrder.push("combat");
    typeOrder.push("treasure", "trap", "boss");
    while (typeOrder.length < roomCount) {
        const extras: GridRoom["type"][] = ["empty", "puzzle", "combat"];
        typeOrder.push(extras[Math.floor(rand() * extras.length)]);
    }

    const envEncounters = encounterDb[props.environment] || encounterDb.Dungeon;
    const rooms: GridRoom[] = [];

    // Generate rooms on grid
    const doesOverlap = (gx: number, gy: number, gw: number, gh: number) => {
        for (const r of rooms) {
            if (gx < r.gx + r.gw + 2 && gx + gw + 2 > r.gx &&
                gy < r.gy + r.gh + 2 && gy + gh + 2 > r.gy) return true;
        }
        return false;
    };

    for (let i = 0; i < roomCount; i++) {
        let placed = false;
        for (let attempt = 0; attempt < 200; attempt++) {
            const gw = 5 + Math.floor(rand() * 6); // 5-10 squares wide
            const gh = 4 + Math.floor(rand() * 5); // 4-8 squares tall
            const gx = 1 + Math.floor(rand() * (gridW - gw - 2));
            const gy = 1 + Math.floor(rand() * (gridH - gh - 2));

            if (!doesOverlap(gx, gy, gw, gh)) {
                const type = typeOrder[i] || "empty";
                const labels = roomLabels[type];
                const encounter = (type === "combat" || type === "boss")
                    ? envEncounters[Math.floor(rand() * envEncounters.length)]
                    : undefined;

                rooms.push({
                    id: i, gx, gy, gw, gh, type,
                    label: labels[Math.floor(rand() * labels.length)],
                    encounter,
                });
                placed = true;
                break;
            }
        }
        if (!placed && rooms.length > 0) break; // Stop if can't fit more rooms
    }

    // Carve room floors
    for (const room of rooms) {
        for (let y = room.gy; y < room.gy + room.gh; y++) {
            for (let x = room.gx; x < room.gx + room.gw; x++) {
                grid[y][x] = FLOOR;
            }
        }
    }

    // Carve L-shaped corridors between rooms (MST)
    const connected = new Set<number>([0]);
    const corridorLinks: [number, number][] = [];

    while (connected.size < rooms.length) {
        let bestDist = Infinity;
        let bestFrom = 0;
        let bestTo = 0;
        for (const fromIdx of connected) {
            for (let toIdx = 0; toIdx < rooms.length; toIdx++) {
                if (connected.has(toIdx)) continue;
                const cx1 = rooms[fromIdx].gx + Math.floor(rooms[fromIdx].gw / 2);
                const cy1 = rooms[fromIdx].gy + Math.floor(rooms[fromIdx].gh / 2);
                const cx2 = rooms[toIdx].gx + Math.floor(rooms[toIdx].gw / 2);
                const cy2 = rooms[toIdx].gy + Math.floor(rooms[toIdx].gh / 2);
                const dist = Math.abs(cx1 - cx2) + Math.abs(cy1 - cy2);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestFrom = fromIdx;
                    bestTo = toIdx;
                }
            }
        }
        connected.add(bestTo);
        corridorLinks.push([bestFrom, bestTo]);
    }

    // Extra corridor for loops
    if (rooms.length > 3) {
        const a = Math.floor(rand() * rooms.length);
        let b = Math.floor(rand() * rooms.length);
        while (b === a && rooms.length > 1) b = Math.floor(rand() * rooms.length);
        corridorLinks.push([a, b]);
    }

    // Carve corridors as 2-wide paths
    for (const [fi, ti] of corridorLinks) {
        const from = rooms[fi];
        const to = rooms[ti];
        let cx = from.gx + Math.floor(from.gw / 2);
        let cy = from.gy + Math.floor(from.gh / 2);
        const tx = to.gx + Math.floor(to.gw / 2);
        const ty = to.gy + Math.floor(to.gh / 2);

        // Carve horizontal then vertical
        while (cx !== tx) {
            if (cy >= 0 && cy < gridH && cx >= 0 && cx < gridW) {
                if (grid[cy][cx] === WALL) grid[cy][cx] = CORRIDOR;
                if (cy + 1 < gridH && grid[cy + 1][cx] === WALL) grid[cy + 1][cx] = CORRIDOR;
            }
            cx += cx < tx ? 1 : -1;
        }
        while (cy !== ty) {
            if (cy >= 0 && cy < gridH && cx >= 0 && cx < gridW) {
                if (grid[cy][cx] === WALL) grid[cy][cx] = CORRIDOR;
                if (cx + 1 < gridW && grid[cy][cx + 1] === WALL) grid[cy][cx + 1] = CORRIDOR;
            }
            cy += cy < ty ? 1 : -1;
        }
    }

    // Place doors where corridors meet rooms
    for (const room of rooms) {
        // Check perimeter cells
        for (let x = room.gx; x < room.gx + room.gw; x++) {
            // Top edge
            if (room.gy > 0 && grid[room.gy - 1][x] === CORRIDOR) {
                grid[room.gy][x] = DOOR;
            }
            // Bottom edge
            if (room.gy + room.gh < gridH && grid[room.gy + room.gh][x] === CORRIDOR) {
                grid[room.gy + room.gh - 1][x] = DOOR;
            }
        }
        for (let y = room.gy; y < room.gy + room.gh; y++) {
            // Left edge
            if (room.gx > 0 && grid[y][room.gx - 1] === CORRIDOR) {
                grid[y][room.gx] = DOOR;
            }
            // Right edge
            if (room.gx + room.gw < gridW && grid[y][room.gx + room.gw] === CORRIDOR) {
                grid[y][room.gx + room.gw - 1] = DOOR;
            }
        }
    }

    // ──── Place room interior features ────
    const placeInRoom = (room: GridRoom, cell: CellType, count: number) => {
        let placed = 0;
        for (let attempt = 0; attempt < count * 20 && placed < count; attempt++) {
            const px = room.gx + 1 + Math.floor(rand() * Math.max(1, room.gw - 2));
            const py = room.gy + 1 + Math.floor(rand() * Math.max(1, room.gh - 2));
            if (py < gridH && px < gridW && grid[py][px] === FLOOR) {
                grid[py][px] = cell;
                placed++;
            }
        }
    };

    for (const room of rooms) {
        const area = room.gw * room.gh;

        switch (room.type) {
            case "entrance":
                // Stairs leading in, maybe a statue
                grid[room.gy + Math.floor(room.gh / 2)][room.gx + Math.floor(room.gw / 2)] = STAIRS_DOWN;
                if (area > 20) placeInRoom(room, STATUE, 1 + Math.floor(rand() * 2));
                if (rand() > 0.5) placeInRoom(room, PILLAR, 2);
                break;

            case "combat":
                // Monsters, pillars for cover, maybe some barrels
                placeInRoom(room, MONSTER, 2 + Math.floor(rand() * 3));
                placeInRoom(room, PILLAR, Math.floor(rand() * 3));
                if (rand() > 0.5) placeInRoom(room, BARREL, 1 + Math.floor(rand() * 2));
                if (rand() > 0.7) placeInRoom(room, RUBBLE, 1);
                break;

            case "treasure":
                // Chests, maybe an altar, pillar
                placeInRoom(room, CHEST, 2 + Math.floor(rand() * 2));
                if (rand() > 0.4) placeInRoom(room, ALTAR, 1);
                placeInRoom(room, PILLAR, Math.floor(rand() * 2));
                if (rand() > 0.5) placeInRoom(room, STATUE, 1);
                break;

            case "trap":
                // Traps, pits, rubble, a secret door
                placeInRoom(room, TRAP, 3 + Math.floor(rand() * 3));
                placeInRoom(room, PIT, 1 + Math.floor(rand() * 2));
                placeInRoom(room, RUBBLE, Math.floor(rand() * 2));
                // Place a secret door on one wall
                {
                    const side = Math.floor(rand() * 4);
                    let sx: number, sy: number;
                    if (side === 0) { sx = room.gx + Math.floor(room.gw / 2); sy = room.gy; }
                    else if (side === 1) { sx = room.gx + Math.floor(room.gw / 2); sy = room.gy + room.gh - 1; }
                    else if (side === 2) { sx = room.gx; sy = room.gy + Math.floor(room.gh / 2); }
                    else { sx = room.gx + room.gw - 1; sy = room.gy + Math.floor(room.gh / 2); }
                    if (sy < gridH && sx < gridW && (grid[sy][sx] === FLOOR || grid[sy][sx] === WALL)) {
                        grid[sy][sx] = SECRET_DOOR;
                    }
                }
                break;

            case "boss":
                // Throne, monsters, pillars, altar
                grid[room.gy + Math.floor(room.gh / 2)][room.gx + Math.floor(room.gw / 2)] = THRONE;
                placeInRoom(room, MONSTER, 2 + Math.floor(rand() * 2));
                placeInRoom(room, PILLAR, 2 + Math.floor(rand() * 2));
                if (rand() > 0.5) placeInRoom(room, CHEST, 1);
                if (rand() > 0.5) placeInRoom(room, STATUE, 2);
                // Secret escape
                {
                    const sx = room.gx + room.gw - 1;
                    const sy = room.gy + room.gh - 1;
                    if (sy < gridH && sx < gridW) grid[sy][sx] = SECRET_DOOR;
                }
                break;

            case "empty":
                // Barrels, rubble, maybe water
                placeInRoom(room, BARREL, Math.floor(rand() * 3));
                placeInRoom(room, RUBBLE, Math.floor(rand() * 2));
                if (rand() > 0.6) placeInRoom(room, WATER, 2 + Math.floor(rand() * 3));
                break;

            case "puzzle":
                // Bookshelves, altar, statues, maybe water
                placeInRoom(room, BOOKSHELF, 2 + Math.floor(rand() * 3));
                placeInRoom(room, ALTAR, 1);
                placeInRoom(room, STATUE, Math.floor(rand() * 2));
                if (rand() > 0.5) placeInRoom(room, PILLAR, 2);
                // Secret door for puzzle reward
                {
                    const sx = room.gx;
                    const sy = room.gy + Math.floor(room.gh / 2);
                    if (sy < gridH && sx < gridW) grid[sy][sx] = SECRET_DOOR;
                }
                break;
        }
    }

    return { grid, rooms, gridW, gridH };
}

/* ──────────── Cell size ──────────── */
const CELL = 16; // px per grid square

/* ──────────── Component ──────────── */

export default function DungeonMap(props: DungeonMapProps) {
    const dungeon = useMemo(
        () => generateDungeon(props),
        [props.seed, props.environment, props.difficulty, props.gridSize]
    );
    const { grid, rooms, gridW, gridH } = dungeon;
    const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);

    const svgW = gridW * CELL;
    const svgH = gridH * CELL;

    // Build a lookup: cell → roomId
    const cellRoomMap = useMemo(() => {
        const map: (number | null)[][] = [];
        for (let y = 0; y < gridH; y++) {
            map[y] = [];
            for (let x = 0; x < gridW; x++) {
                map[y][x] = null;
            }
        }
        for (const room of rooms) {
            for (let y = room.gy; y < room.gy + room.gh; y++) {
                for (let x = room.gx; x < room.gx + room.gw; x++) {
                    if (y < gridH && x < gridW) map[y][x] = room.id;
                }
            }
        }
        return map;
    }, [rooms, gridH, gridW]);

    return (
        <div className={styles.dungeonWrapper}>
            {/* Grid Legend */}
            <div className={styles.legend}>
                <span className={styles.legendTitle}>Map Key (1 square = 5 ft):</span>
                <div className={styles.legendGrid}>
                    {legendItems.map((item) => {
                        const cs = getCellStyle(item.cell);
                        return (
                            <span key={item.cell} className={styles.legendItem}>
                                <span className={styles.legendCell} style={{ background: cs.fill, color: cs.labelColor }}>
                                    {cs.label}
                                </span>
                                {item.name}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Battle Mat SVG */}
            <div className={styles.mapContainer}>
                <svg viewBox={`0 0 ${svgW} ${svgH}`} className={styles.svg}>
                    <defs>
                        <filter id="cellGlow">
                            <feGaussianBlur stdDeviation="1" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Render grid cells */}
                    {grid.map((row, y) =>
                        row.map((cell, x) => {
                            const cs = getCellStyle(cell);
                            const isRoomCell = cellRoomMap[y][x] !== null;
                            const roomId = cellRoomMap[y][x];
                            const isHovered = roomId !== null && roomId === hoveredRoom;
                            const room = isHovered ? rooms.find(r => r.id === roomId) : null;

                            return (
                                <g key={`${x}-${y}`}>
                                    <rect
                                        x={x * CELL}
                                        y={y * CELL}
                                        width={CELL}
                                        height={CELL}
                                        fill={isHovered && cell !== WALL ? `${roomColors[room!.type]}30` : cs.fill}
                                        stroke={cell === WALL
                                            ? "rgba(255,255,255,0.02)"
                                            : isRoomCell
                                                ? "rgba(255,255,255,0.08)"
                                                : "rgba(255,255,255,0.05)"}
                                        strokeWidth={0.5}
                                        onMouseEnter={() => roomId !== null && setHoveredRoom(roomId)}
                                        onMouseLeave={() => setHoveredRoom(null)}
                                    />
                                    {/* Secret door dashed border */}
                                    {cell === SECRET_DOOR && (
                                        <rect
                                            x={x * CELL + 1}
                                            y={y * CELL + 1}
                                            width={CELL - 2}
                                            height={CELL - 2}
                                            fill="none"
                                            stroke="#ff8c00"
                                            strokeWidth={1}
                                            strokeDasharray="2 2"
                                        />
                                    )}
                                    {/* Cell symbol */}
                                    {cs.label && (
                                        <text
                                            x={x * CELL + CELL / 2}
                                            y={y * CELL + CELL / 2 + (cs.fontSize ? cs.fontSize * 0.35 : 3)}
                                            textAnchor="middle"
                                            fill={cs.labelColor}
                                            fontSize={cs.fontSize || 8}
                                            fontWeight="bold"
                                            style={{ pointerEvents: "none" }}
                                        >
                                            {cs.label}
                                        </text>
                                    )}
                                </g>
                            );
                        })
                    )}

                    {/* Room labels */}
                    {rooms.map((room) => {
                        const cx = (room.gx + room.gw / 2) * CELL;
                        const cy = room.gy * CELL - 3;
                        return (
                            <g key={`label-${room.id}`}>
                                {/* Room number badge */}
                                <circle
                                    cx={room.gx * CELL + 8}
                                    cy={room.gy * CELL - 6}
                                    r={7}
                                    fill={roomColors[room.type]}
                                />
                                <text
                                    x={room.gx * CELL + 8}
                                    y={room.gy * CELL - 3}
                                    textAnchor="middle"
                                    fill="#fff"
                                    fontSize="8"
                                    fontWeight="bold"
                                >
                                    {room.id + 1}
                                </text>
                                {/* Room name */}
                                <text
                                    x={room.gx * CELL + 20}
                                    y={room.gy * CELL - 3}
                                    fill={roomColors[room.type]}
                                    fontSize="7"
                                    fontWeight="600"
                                >
                                    {room.label}
                                </text>
                                {/* Room border highlight */}
                                <rect
                                    x={room.gx * CELL}
                                    y={room.gy * CELL}
                                    width={room.gw * CELL}
                                    height={room.gh * CELL}
                                    fill="none"
                                    stroke={roomColors[room.type]}
                                    strokeWidth={hoveredRoom === room.id ? 2 : 1}
                                    strokeOpacity={hoveredRoom === room.id ? 0.8 : 0.3}
                                    rx={1}
                                />
                            </g>
                        );
                    })}

                    {/* Grid scale indicator */}
                    <g>
                        <line x1={CELL} y1={svgH - 8} x2={CELL * 6} y2={svgH - 8} stroke="#aaa" strokeWidth={1} />
                        <line x1={CELL} y1={svgH - 12} x2={CELL} y2={svgH - 4} stroke="#aaa" strokeWidth={1} />
                        <line x1={CELL * 6} y1={svgH - 12} x2={CELL * 6} y2={svgH - 4} stroke="#aaa" strokeWidth={1} />
                        <text x={CELL * 3.5} y={svgH - 2} textAnchor="middle" fill="#aaa" fontSize="7">25 ft (5 squares)</text>
                    </g>
                </svg>
            </div>

            {/* Room Detail Cards */}
            <div className={styles.roomIndex}>
                <h4 className={styles.roomIndexTitle}>📋 Room Index</h4>
                <div className={styles.roomCards}>
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className={`${styles.roomCard} ${hoveredRoom === room.id ? styles.roomCardHovered : ""}`}
                            onMouseEnter={() => setHoveredRoom(room.id)}
                            onMouseLeave={() => setHoveredRoom(null)}
                            style={{ borderLeftColor: roomColors[room.type] }}
                        >
                            <div className={styles.roomCardHeader}>
                                <span className={styles.roomBadge} style={{ background: roomColors[room.type] }}>{room.id + 1}</span>
                                <strong>{room.label}</strong>
                                <span className={styles.roomType}>{room.type}</span>
                            </div>
                            <div className={styles.roomCardIcons}>
                                {/* Show what's in this room */}
                                {room.type === "entrance" && <span title="Stairs">▼ Stairs</span>}
                                {room.type === "trap" && <span title="Traps">⚠ Traps · Pits · Secret Door</span>}
                                {room.type === "treasure" && <span title="Treasure">◆ Chests · Altar</span>}
                                {room.type === "boss" && <span title="Boss">♔ Throne · Monsters · Secret Exit</span>}
                                {room.type === "combat" && <span title="Combat">⚔ Monsters · Cover</span>}
                                {room.type === "puzzle" && <span title="Puzzle">≡ Bookshelves · Altar · Secret Door</span>}
                                {room.type === "empty" && <span title="Empty">○ Barrels · Rubble</span>}
                            </div>
                        </div>
                    ))}
                </div>
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
