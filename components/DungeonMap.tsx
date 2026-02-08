"use client";

import { useMemo, useState, useRef } from "react";
import styles from "./DungeonMap.module.css";

/* ──────────── Cell types ──────────── */
const WALL = 0; const FLOOR = 1; const CORRIDOR = 2; const DOOR = 3;
const SECRET_DOOR = 4; const TRAP = 5; const CHEST = 6; const MONSTER = 7;
const PILLAR = 8; const WATER = 9; const STAIRS_UP = 10; const STAIRS_DOWN = 11;
const ALTAR = 12; const TABLE = 13; const BOOKSHELF = 14; const THRONE = 15;
const PIT = 16; const RUBBLE = 17; const BARREL = 18; const STATUE = 19;
const TREE = 20; const ROCK = 21; const GRASS = 22; const PATH = 23;
const CAMPFIRE = 24; const STANDING_STONE = 25; const WELL = 26;
const STALL = 27; const BUILDING_WALL = 28; const STREET = 29;
const MAGMA = 30; const OBSIDIAN = 31;

type CellType = number;

interface GridRoom {
    id: number;
    gx: number; gy: number; gw: number; gh: number;
    type: "entrance" | "combat" | "treasure" | "trap" | "boss" | "empty" | "puzzle";
    label: string;
    encounter?: EncounterInfo;
}

export interface EncounterInfo {
    name: string; creatures: string; ac: number; hp: number;
    cr: string; xp: number; tactics: string;
}

export interface DungeonMapProps {
    seed: string; environment: string; difficulty: string;
    gridSize: string; keyFeatures: string[]; suggestedEncounters: string[];
}

/* ──────────── Seeded random ──────────── */
function seededRandom(seed: string) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
    return function () {
        h = (h + 0x6d2b79f5) | 0;
        let t = Math.imul(h ^ (h >>> 15), 1 | h);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* ──────────── Encounter DB ──────────── */
const encounterDb: Record<string, EncounterInfo[]> = {
    Dungeon: [
        { name: "Skeletons", creatures: "4-6 Skeletons", ac: 13, hp: 13, cr: "1/4", xp: 50, tactics: "Attack in groups. Focus weakest-looking PC. Immune to exhaustion, poison." },
        { name: "Zombies", creatures: "3-4 Zombies", ac: 8, hp: 22, cr: "1/4", xp: 50, tactics: "Slow but relentless. Undead Fortitude: DC 5+dmg Con save to stay at 1 HP." },
        { name: "Goblins", creatures: "5-8 Goblins", ac: 15, hp: 7, cr: "1/4", xp: 50, tactics: "Nimble Escape to Disengage/Hide as bonus action. Fight dirty, set traps." },
        { name: "Bugbear", creatures: "1-2 Bugbears", ac: 16, hp: 27, cr: "1", xp: 200, tactics: "Ambush predator. Surprise Attack: +2d6 damage on first hit. Uses stealth." },
        { name: "Mimic", creatures: "1 Mimic", ac: 12, hp: 58, cr: "2", xp: 450, tactics: "Disguises as chest/door. Adhesive: grapples on hit. Bite deals 1d8+3." },
        { name: "Wraith", creatures: "1 Wraith", ac: 13, hp: 67, cr: "5", xp: 1800, tactics: "Incorporeal. Life Drain reduces max HP. Resistant to nonmagical attacks." },
        { name: "Gelatinous Cube", creatures: "1 Gelatinous Cube", ac: 6, hp: 84, cr: "2", xp: 450, tactics: "Nearly invisible (DC 15). Engulfs on hit. 3d6 acid per turn inside." },
        { name: "Giant Spiders", creatures: "2-3 Giant Spiders", ac: 14, hp: 26, cr: "1", xp: 200, tactics: "Web attacks (restrained). Climb walls. Bite: 2d8 poison, DC 11 Con." },
    ],
    Wilderness: [
        { name: "Wolves", creatures: "4-6 Wolves", ac: 13, hp: 11, cr: "1/4", xp: 50, tactics: "Pack Tactics: advantage when ally adjacent. Bite can knock prone (DC 11 Str)." },
        { name: "Owlbear", creatures: "1 Owlbear", ac: 13, hp: 59, cr: "3", xp: 700, tactics: "Charge and multiattack (beak + claws). Very territorial." },
        { name: "Dire Wolves", creatures: "2-3 Dire Wolves", ac: 14, hp: 37, cr: "1", xp: 200, tactics: "Pack Tactics. Knockdown bite (DC 13 Str). Work with intelligent masters." },
        { name: "Twig Blights", creatures: "6-8 Twig Blights", ac: 13, hp: 4, cr: "1/8", xp: 25, tactics: "Ambush from undergrowth. Vulnerable to fire." },
        { name: "Will-o'-Wisps", creatures: "1-2 Will-o'-Wisps", ac: 19, hp: 22, cr: "2", xp: 450, tactics: "Lure into hazards. Invisible at will. Shock: 2d8 lightning." },
        { name: "Green Hag", creatures: "1 Green Hag", ac: 17, hp: 82, cr: "3", xp: 700, tactics: "Illusory Appearance, Invisible Passage. Claws: 2d8+4 slashing." },
    ],
    Urban: [
        { name: "Bandits", creatures: "4-6 Bandits", ac: 12, hp: 11, cr: "1/8", xp: 25, tactics: "Improvised weapons. Surrender at half HP. Have a Bandit Captain leader." },
        { name: "Bandit Captain", creatures: "1 Captain + 2 Bandits", ac: 15, hp: 65, cr: "2", xp: 450, tactics: "Multiattack (3). Parry reaction (+2 AC). Commands focus fire." },
        { name: "Thugs", creatures: "3-4 Thugs", ac: 11, hp: 32, cr: "1/2", xp: 100, tactics: "Pack Tactics. Heavy crossbows from cover, then close to melee." },
        { name: "Guards", creatures: "4-6 Guards", ac: 16, hp: 11, cr: "1/8", xp: 25, tactics: "Fight in formation. Call reinforcements. Won't pursue beyond post." },
        { name: "Animated Armor", creatures: "2 Animated Armor", ac: 18, hp: 33, cr: "1", xp: 200, tactics: "Immune to poison, psychic. Multiattack. Activate on trigger." },
        { name: "Spy", creatures: "1 Spy", ac: 12, hp: 27, cr: "1", xp: 200, tactics: "Sneak Attack 2d6. Cunning Action. May flee and report." },
    ],
    Special: [
        { name: "Fire Elementals", creatures: "1-2 Fire Elementals", ac: 13, hp: 102, cr: "5", xp: 1800, tactics: "Ignites flammables. Water Susceptibility. Fire Form: pass through spaces." },
        { name: "Young Red Dragon", creatures: "1 Young Red Dragon", ac: 18, hp: 178, cr: "10", xp: 5900, tactics: "Breath Weapon (12d6 fire, 30-ft cone, DC 17 Dex). Multiattack. Flies." },
        { name: "Kobold Swarm", creatures: "8-12 Kobolds", ac: 12, hp: 5, cr: "1/8", xp: 25, tactics: "Pack Tactics. Sling attacks from distance. Set traps." },
        { name: "Hell Hounds", creatures: "2-3 Hell Hounds", ac: 15, hp: 45, cr: "3", xp: 700, tactics: "Fire Breath (6d6, 15-ft cone, DC 12 Dex). Immune to fire. Pack Tactics." },
    ],
};

/* ──────────── Room labels per environment ──────────── */
const roomLabelsByEnv: Record<string, Record<GridRoom["type"], string[]>> = {
    Dungeon: {
        entrance: ["Entrance Hall", "Gateway", "Vestibule"],
        combat: ["Guard Room", "Arena", "Barracks"],
        treasure: ["Treasury", "Vault", "Hoard Room"],
        trap: ["Trapped Hall", "Danger Room", "Gauntlet"],
        boss: ["Boss Chamber", "Throne Room", "Inner Sanctum"],
        empty: ["Storage", "Abandoned Room", "Empty Cell"],
        puzzle: ["Ritual Chamber", "Library", "Observatory"],
    },
    Wilderness: {
        entrance: ["Trail Head", "Forest Edge", "Camp Site"],
        combat: ["Ambush Point", "Beast Den", "Hunting Ground"],
        treasure: ["Hidden Cache", "Druid's Grove", "Buried Stash"],
        trap: ["Quicksand", "Snare Field", "Briar Patch"],
        boss: ["Ancient Circle", "Sacred Grove", "Lair Entrance"],
        empty: ["Open Clearing", "Rocky Outcrop", "Thicket"],
        puzzle: ["Standing Stones", "Fairy Ring", "Ancient Well"],
    },
    Urban: {
        entrance: ["Main Entrance", "Front Door", "Foyer"],
        combat: ["Common Room", "Guard Post", "Back Alley"],
        treasure: ["Vault", "Wine Cellar", "Safe Room"],
        trap: ["Trapped Corridor", "Rigged Door", "Alarm Room"],
        boss: ["Master Suite", "War Room", "Grand Hall"],
        empty: ["Side Room", "Storage Closet", "Courtyard"],
        puzzle: ["Study", "Archive", "Gallery"],
    },
    Special: {
        entrance: ["Cavern Mouth", "Lava Tube", "Obsidian Gate"],
        combat: ["Magma Chamber", "Fire Pit", "Scorched Arena"],
        treasure: ["Treasure Hoard", "Crystal Vault", "Gold Mountain"],
        trap: ["Unstable Floor", "Gas Vent", "Lava Flow"],
        boss: ["Dragon's Perch", "Central Lair", "Throne of Flame"],
        empty: ["Cooling Chamber", "Obsidian Hall", "Ash Room"],
        puzzle: ["Rune Chamber", "Elemental Seal", "Ancient Forge"],
    },
};

const roomColors: Record<GridRoom["type"], string> = {
    entrance: "#4a9eff", combat: "#ff4a4a", treasure: "#ffd700",
    trap: "#ff8c00", boss: "#9b59b6", empty: "#6b7280", puzzle: "#2ecc71",
};

/* ──────────── Cell style ──────────── */
interface CellStyle { fill: string; label: string; labelColor: string; fontSize?: number; }

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
        case TREE: return { fill: "#1a3a1a", label: "♣", labelColor: "#2d8a2d", fontSize: 9 };
        case ROCK: return { fill: "#3a3a3a", label: "▪", labelColor: "#777", fontSize: 8 };
        case GRASS: return { fill: "#1e3820", label: "", labelColor: "" };
        case PATH: return { fill: "#3a3525", label: "", labelColor: "" };
        case CAMPFIRE: return { fill: "#3a2010", label: "🔥", labelColor: "", fontSize: 8 };
        case STANDING_STONE: return { fill: "#3a3c40", label: "⌘", labelColor: "#9b9b9b", fontSize: 8 };
        case WELL: return { fill: "#1a2a3a", label: "◎", labelColor: "#6aafff", fontSize: 8 };
        case STALL: return { fill: "#4a3a20", label: "▧", labelColor: "#c4a06a", fontSize: 7 };
        case BUILDING_WALL: return { fill: "#2a2520", label: "", labelColor: "" };
        case STREET: return { fill: "#353530", label: "", labelColor: "" };
        case MAGMA: return { fill: "#8a2000", label: "≈", labelColor: "#ff6a00", fontSize: 9 };
        case OBSIDIAN: return { fill: "#101018", label: "◈", labelColor: "#4a4a5a", fontSize: 7 };
        default: return { fill: "#2a2d35", label: "", labelColor: "" };
    }
}

/* ──────────── Legends per environment ──────────── */
const legendsByEnv: Record<string, { cell: CellType; name: string }[]> = {
    Dungeon: [
        { cell: FLOOR, name: "Floor" }, { cell: CORRIDOR, name: "Corridor" },
        { cell: DOOR, name: "Door" }, { cell: SECRET_DOOR, name: "Secret Door" },
        { cell: TRAP, name: "Trap" }, { cell: CHEST, name: "Treasure" },
        { cell: MONSTER, name: "Monster" }, { cell: PILLAR, name: "Pillar" },
        { cell: WATER, name: "Water" }, { cell: STAIRS_DOWN, name: "Stairs" },
        { cell: ALTAR, name: "Altar" }, { cell: BOOKSHELF, name: "Bookshelf" },
        { cell: THRONE, name: "Throne" }, { cell: PIT, name: "Pit" },
        { cell: BARREL, name: "Barrel" }, { cell: STATUE, name: "Statue" },
    ],
    Wilderness: [
        { cell: GRASS, name: "Open Ground" }, { cell: PATH, name: "Trail" },
        { cell: TREE, name: "Tree" }, { cell: ROCK, name: "Rock" },
        { cell: WATER, name: "Water" }, { cell: CAMPFIRE, name: "Campfire" },
        { cell: STANDING_STONE, name: "Standing Stone" }, { cell: WELL, name: "Well" },
        { cell: MONSTER, name: "Creature" }, { cell: TRAP, name: "Hazard" },
        { cell: CHEST, name: "Hidden Cache" },
    ],
    Urban: [
        { cell: STREET, name: "Street/Floor" }, { cell: BUILDING_WALL, name: "Wall" },
        { cell: DOOR, name: "Door" }, { cell: SECRET_DOOR, name: "Secret Passage" },
        { cell: TABLE, name: "Table/Furniture" }, { cell: STALL, name: "Stall/Counter" },
        { cell: BARREL, name: "Barrel/Crate" }, { cell: MONSTER, name: "NPC/Guard" },
        { cell: CHEST, name: "Valuables" }, { cell: STAIRS_DOWN, name: "Stairs" },
        { cell: BOOKSHELF, name: "Shelf" }, { cell: TRAP, name: "Trap" },
    ],
    Special: [
        { cell: OBSIDIAN, name: "Obsidian" }, { cell: FLOOR, name: "Stone Floor" },
        { cell: MAGMA, name: "Magma" }, { cell: PILLAR, name: "Pillar" },
        { cell: CHEST, name: "Treasure" }, { cell: MONSTER, name: "Creature" },
        { cell: THRONE, name: "Throne" }, { cell: STAIRS_UP, name: "Ledge" },
        { cell: TRAP, name: "Gas Vent" },
    ],
};

/* ──────────── Floor parsing ──────────── */
function parseFloors(gridSize: string): number {
    const m = gridSize.match(/(\d+)\s*floors?/i);
    if (m) return parseInt(m[1]);
    const m2 = gridSize.match(/\((\d+)\s*floors?\)/i);
    if (m2) return parseInt(m2[1]);
    return 1;
}

/* ──────────── Generator ──────────── */
interface DungeonResult {
    grid: CellType[][]; rooms: GridRoom[]; gridW: number; gridH: number;
}

function generateDungeon(props: DungeonMapProps, floorIdx: number): DungeonResult {
    const rand = seededRandom(props.seed + props.environment + floorIdx);
    const gridW = 48, gridH = 36;
    const env = props.environment;

    // Determine base terrain
    const baseCell = env === "Wilderness" ? GRASS : env === "Special" ? OBSIDIAN : WALL;
    const floorCell = env === "Wilderness" ? GRASS : env === "Urban" ? STREET : env === "Special" ? FLOOR : FLOOR;
    const corridorCell = env === "Wilderness" ? PATH : env === "Urban" ? STREET : env === "Special" ? FLOOR : CORRIDOR;
    const wallCell = env === "Urban" ? BUILDING_WALL : env === "Special" ? OBSIDIAN : WALL;

    // Initialize grid
    const grid: CellType[][] = [];
    for (let y = 0; y < gridH; y++) {
        grid[y] = [];
        for (let x = 0; x < gridW; x++) grid[y][x] = baseCell;
    }

    // For wilderness, scatter trees and rocks on base terrain
    if (env === "Wilderness") {
        for (let y = 0; y < gridH; y++) {
            for (let x = 0; x < gridW; x++) {
                const r = rand();
                if (r < 0.25) grid[y][x] = TREE;
                else if (r < 0.30) grid[y][x] = ROCK;
                else if (r < 0.34) grid[y][x] = WATER;
            }
        }
    }

    // For special (volcanic), scatter magma rivers
    if (env === "Special") {
        // Magma rivers
        for (let river = 0; river < 3; river++) {
            let rx = Math.floor(rand() * gridW);
            let ry = Math.floor(rand() * gridH);
            for (let step = 0; step < 30; step++) {
                if (ry >= 0 && ry < gridH && rx >= 0 && rx < gridW) {
                    grid[ry][rx] = MAGMA;
                    if (rx + 1 < gridW) grid[ry][rx + 1] = MAGMA;
                }
                rx += Math.floor(rand() * 3) - 1;
                ry += Math.floor(rand() * 3) - 1;
            }
        }
    }

    // Room count
    const diffRoomCount: Record<string, number> = {
        "Easy": 5, "Easy to Medium": 6, "Medium": 7,
        "Medium to Hard": 8, "Hard": 8, "Hard to Deadly": 9, "Varies": 7,
    };
    const totalFloors = parseFloors(props.gridSize);
    let roomCount = diffRoomCount[props.difficulty] || 7;
    if (totalFloors > 1) roomCount = Math.max(3, Math.ceil(roomCount / totalFloors) + 1);

    // Room types
    const typeOrder: GridRoom["type"][] = floorIdx === 0 ? ["entrance"] : ["combat"];
    const combatCount = Math.max(1, Math.floor(roomCount * 0.3));
    for (let i = 0; i < combatCount; i++) typeOrder.push("combat");
    if (floorIdx === totalFloors - 1) typeOrder.push("boss");
    typeOrder.push("treasure");
    if (typeOrder.length < roomCount) typeOrder.push("trap");
    while (typeOrder.length < roomCount) {
        const extras: GridRoom["type"][] = ["empty", "puzzle", "combat"];
        typeOrder.push(extras[Math.floor(rand() * extras.length)]);
    }

    const envLabels = roomLabelsByEnv[env] || roomLabelsByEnv.Dungeon;
    const envEncounters = encounterDb[env] || encounterDb.Dungeon;
    const rooms: GridRoom[] = [];

    const doesOverlap = (gx: number, gy: number, gw: number, gh: number) => {
        for (const r of rooms) {
            if (gx < r.gx + r.gw + 2 && gx + gw + 2 > r.gx &&
                gy < r.gy + r.gh + 2 && gy + gh + 2 > r.gy) return true;
        }
        return false;
    };

    for (let i = 0; i < roomCount; i++) {
        for (let attempt = 0; attempt < 200; attempt++) {
            const gw = 5 + Math.floor(rand() * 6);
            const gh = 4 + Math.floor(rand() * 5);
            const gx = 1 + Math.floor(rand() * (gridW - gw - 2));
            const gy = 1 + Math.floor(rand() * (gridH - gh - 2));
            if (!doesOverlap(gx, gy, gw, gh)) {
                const type = typeOrder[i] || "empty";
                const labels = envLabels[type];
                const encounter = (type === "combat" || type === "boss")
                    ? envEncounters[Math.floor(rand() * envEncounters.length)] : undefined;
                rooms.push({
                    id: i, gx, gy, gw, gh, type,
                    label: labels[Math.floor(rand() * labels.length)], encounter
                });
                break;
            }
        }
    }

    // Carve rooms
    for (const room of rooms) {
        for (let y = room.gy; y < room.gy + room.gh; y++)
            for (let x = room.gx; x < room.gx + room.gw; x++)
                grid[y][x] = floorCell;
        // For dungeon/urban, place walls around rooms
        if (env === "Dungeon" || env === "Urban") {
            // Walls already handle dungeon; for urban add building walls around interior rooms
            if (env === "Urban") {
                for (let x = room.gx - 1; x <= room.gx + room.gw; x++) {
                    if (x >= 0 && x < gridW) {
                        if (room.gy - 1 >= 0) grid[room.gy - 1][x] = BUILDING_WALL;
                        if (room.gy + room.gh < gridH) grid[room.gy + room.gh][x] = BUILDING_WALL;
                    }
                }
                for (let y = room.gy; y < room.gy + room.gh; y++) {
                    if (room.gx - 1 >= 0) grid[y][room.gx - 1] = BUILDING_WALL;
                    if (room.gx + room.gw < gridW) grid[y][room.gx + room.gw] = BUILDING_WALL;
                }
            }
        }
    }

    // Corridors (MST)
    if (rooms.length > 1) {
        const connected = new Set<number>([0]);
        const corridorLinks: [number, number][] = [];
        while (connected.size < rooms.length) {
            let bestDist = Infinity, bestFrom = 0, bestTo = 0;
            for (const fi of connected) {
                for (let ti = 0; ti < rooms.length; ti++) {
                    if (connected.has(ti)) continue;
                    const dx = (rooms[fi].gx + rooms[fi].gw / 2) - (rooms[ti].gx + rooms[ti].gw / 2);
                    const dy = (rooms[fi].gy + rooms[fi].gh / 2) - (rooms[ti].gy + rooms[ti].gh / 2);
                    const d = dx * dx + dy * dy;
                    if (d < bestDist) { bestDist = d; bestFrom = fi; bestTo = ti; }
                }
            }
            connected.add(bestTo);
            corridorLinks.push([bestFrom, bestTo]);
        }
        if (rooms.length > 3) {
            const a = Math.floor(rand() * rooms.length);
            let b = Math.floor(rand() * rooms.length);
            while (b === a && rooms.length > 1) b = Math.floor(rand() * rooms.length);
            corridorLinks.push([a, b]);
        }

        // Carve corridors
        for (const [fi, ti] of corridorLinks) {
            const from = rooms[fi], to = rooms[ti];
            let cx = from.gx + Math.floor(from.gw / 2);
            let cy = from.gy + Math.floor(from.gh / 2);
            const tx = to.gx + Math.floor(to.gw / 2);
            const ty = to.gy + Math.floor(to.gh / 2);
            while (cx !== tx) {
                if (cy >= 0 && cy < gridH && cx >= 0 && cx < gridW) {
                    if (grid[cy][cx] === baseCell || grid[cy][cx] === TREE || grid[cy][cx] === ROCK) grid[cy][cx] = corridorCell;
                    if (cy + 1 < gridH && (grid[cy + 1][cx] === baseCell || grid[cy + 1][cx] === TREE || grid[cy + 1][cx] === ROCK)) grid[cy + 1][cx] = corridorCell;
                }
                cx += cx < tx ? 1 : -1;
            }
            while (cy !== ty) {
                if (cy >= 0 && cy < gridH && cx >= 0 && cx < gridW) {
                    if (grid[cy][cx] === baseCell || grid[cy][cx] === TREE || grid[cy][cx] === ROCK) grid[cy][cx] = corridorCell;
                    if (cx + 1 < gridW && (grid[cy][cx + 1] === baseCell || grid[cy][cx + 1] === TREE || grid[cy][cx + 1] === ROCK)) grid[cy][cx + 1] = corridorCell;
                }
                cy += cy < ty ? 1 : -1;
            }
        }
    }

    // Place doors (dungeon/urban only)
    if (env === "Dungeon" || env === "Urban") {
        for (const room of rooms) {
            for (let x = room.gx; x < room.gx + room.gw; x++) {
                if (room.gy > 0 && (grid[room.gy - 1][x] === CORRIDOR || grid[room.gy - 1][x] === STREET)) grid[room.gy][x] = DOOR;
                if (room.gy + room.gh < gridH && (grid[room.gy + room.gh][x] === CORRIDOR || grid[room.gy + room.gh][x] === STREET)) grid[room.gy + room.gh - 1][x] = DOOR;
            }
            for (let y = room.gy; y < room.gy + room.gh; y++) {
                if (room.gx > 0 && (grid[y][room.gx - 1] === CORRIDOR || grid[y][room.gx - 1] === STREET)) grid[y][room.gx] = DOOR;
                if (room.gx + room.gw < gridW && (grid[y][room.gx + room.gw] === CORRIDOR || grid[y][room.gx + room.gw] === STREET)) grid[y][room.gx + room.gw - 1] = DOOR;
            }
        }
    }

    // For urban, fill non-room-non-corridor with street
    if (env === "Urban") {
        for (let y = 0; y < gridH; y++)
            for (let x = 0; x < gridW; x++)
                if (grid[y][x] === WALL) grid[y][x] = STREET;
    }

    // Place interior features
    const placeIn = (room: GridRoom, cell: CellType, count: number) => {
        let placed = 0;
        for (let a = 0; a < count * 20 && placed < count; a++) {
            const px = room.gx + 1 + Math.floor(rand() * Math.max(1, room.gw - 2));
            const py = room.gy + 1 + Math.floor(rand() * Math.max(1, room.gh - 2));
            if (py < gridH && px < gridW && grid[py][px] === floorCell) { grid[py][px] = cell; placed++; }
        }
    };

    for (const room of rooms) {
        switch (room.type) {
            case "entrance":
                if (env === "Wilderness") {
                    placeIn(room, CAMPFIRE, 1); placeIn(room, ROCK, 2);
                    if (rand() > 0.5) placeIn(room, BARREL, 1);
                } else if (env === "Urban") {
                    placeIn(room, TABLE, 2); placeIn(room, BARREL, 1);
                } else if (env === "Special") {
                    placeIn(room, PILLAR, 2); placeIn(room, STAIRS_DOWN, 1);
                } else {
                    grid[room.gy + Math.floor(room.gh / 2)][room.gx + Math.floor(room.gw / 2)] = STAIRS_DOWN;
                    placeIn(room, STATUE, Math.floor(rand() * 2));
                    if (rand() > 0.5) placeIn(room, PILLAR, 2);
                }
                break;
            case "combat":
                placeIn(room, MONSTER, 2 + Math.floor(rand() * 3));
                if (env === "Wilderness") {
                    placeIn(room, ROCK, Math.floor(rand() * 3));
                } else if (env === "Urban") {
                    placeIn(room, TABLE, Math.floor(rand() * 2)); placeIn(room, BARREL, Math.floor(rand() * 2));
                } else if (env === "Special") {
                    placeIn(room, PILLAR, 2); if (rand() > 0.5) placeIn(room, MAGMA, 2);
                } else {
                    placeIn(room, PILLAR, Math.floor(rand() * 3));
                    if (rand() > 0.5) placeIn(room, BARREL, 1 + Math.floor(rand() * 2));
                }
                break;
            case "treasure":
                placeIn(room, CHEST, 2 + Math.floor(rand() * 2));
                if (env === "Wilderness") {
                    placeIn(room, ROCK, 1); placeIn(room, STANDING_STONE, 1);
                } else if (env === "Urban") {
                    placeIn(room, BOOKSHELF, 1); placeIn(room, TABLE, 1);
                } else if (env === "Special") {
                    placeIn(room, PILLAR, 2); placeIn(room, STATUE, 1);
                } else {
                    placeIn(room, ALTAR, 1); placeIn(room, PILLAR, Math.floor(rand() * 2));
                }
                break;
            case "trap":
                placeIn(room, TRAP, 3 + Math.floor(rand() * 3));
                if (env === "Wilderness") {
                    placeIn(room, PIT, 1); placeIn(room, WATER, 2);
                } else if (env === "Special") {
                    placeIn(room, MAGMA, 3); placeIn(room, PIT, 1);
                } else {
                    placeIn(room, PIT, 1 + Math.floor(rand() * 2));
                    placeIn(room, RUBBLE, Math.floor(rand() * 2));
                    const side = Math.floor(rand() * 4);
                    let sx: number, sy: number;
                    if (side === 0) { sx = room.gx + Math.floor(room.gw / 2); sy = room.gy; }
                    else if (side === 1) { sx = room.gx + Math.floor(room.gw / 2); sy = room.gy + room.gh - 1; }
                    else if (side === 2) { sx = room.gx; sy = room.gy + Math.floor(room.gh / 2); }
                    else { sx = room.gx + room.gw - 1; sy = room.gy + Math.floor(room.gh / 2); }
                    if (sy < gridH && sx < gridW) grid[sy][sx] = SECRET_DOOR;
                }
                break;
            case "boss":
                if (env === "Wilderness") {
                    placeIn(room, STANDING_STONE, 3); placeIn(room, MONSTER, 2);
                    placeIn(room, CAMPFIRE, 1);
                } else if (env === "Special") {
                    grid[room.gy + Math.floor(room.gh / 2)][room.gx + Math.floor(room.gw / 2)] = THRONE;
                    placeIn(room, MONSTER, 3); placeIn(room, PILLAR, 3);
                    placeIn(room, CHEST, 2); placeIn(room, MAGMA, 2);
                } else if (env === "Urban") {
                    grid[room.gy + Math.floor(room.gh / 2)][room.gx + Math.floor(room.gw / 2)] = THRONE;
                    placeIn(room, MONSTER, 2); placeIn(room, TABLE, 2);
                    placeIn(room, BOOKSHELF, 1);
                } else {
                    grid[room.gy + Math.floor(room.gh / 2)][room.gx + Math.floor(room.gw / 2)] = THRONE;
                    placeIn(room, MONSTER, 2 + Math.floor(rand() * 2));
                    placeIn(room, PILLAR, 2 + Math.floor(rand() * 2));
                    if (rand() > 0.5) placeIn(room, CHEST, 1);
                    const sx = room.gx + room.gw - 1, sy = room.gy + room.gh - 1;
                    if (sy < gridH && sx < gridW) grid[sy][sx] = SECRET_DOOR;
                }
                break;
            case "empty":
                if (env === "Wilderness") {
                    placeIn(room, ROCK, Math.floor(rand() * 3));
                    if (rand() > 0.5) placeIn(room, WATER, 2 + Math.floor(rand() * 3));
                } else if (env === "Urban") {
                    placeIn(room, BARREL, Math.floor(rand() * 3));
                    placeIn(room, TABLE, Math.floor(rand() * 2));
                } else {
                    placeIn(room, BARREL, Math.floor(rand() * 3));
                    placeIn(room, RUBBLE, Math.floor(rand() * 2));
                    if (rand() > 0.6) placeIn(room, WATER, 2 + Math.floor(rand() * 3));
                }
                break;
            case "puzzle":
                if (env === "Wilderness") {
                    placeIn(room, STANDING_STONE, 3 + Math.floor(rand() * 2));
                    placeIn(room, WELL, 1);
                } else if (env === "Urban") {
                    placeIn(room, BOOKSHELF, 3); placeIn(room, TABLE, 2);
                    placeIn(room, STATUE, 1);
                } else if (env === "Special") {
                    placeIn(room, ALTAR, 1); placeIn(room, PILLAR, 3);
                    placeIn(room, STANDING_STONE, 2);
                } else {
                    placeIn(room, BOOKSHELF, 2 + Math.floor(rand() * 3));
                    placeIn(room, ALTAR, 1); placeIn(room, STATUE, Math.floor(rand() * 2));
                    const sx = room.gx, sy = room.gy + Math.floor(room.gh / 2);
                    if (sy < gridH && sx < gridW) grid[sy][sx] = SECRET_DOOR;
                }
                break;
        }
    }

    // Add stairs between floors
    if (totalFloors > 1) {
        if (floorIdx < totalFloors - 1 && rooms.length > 0) {
            const last = rooms[rooms.length - 1];
            const sx = last.gx + last.gw - 2, sy = last.gy + 1;
            if (sy < gridH && sx < gridW) grid[sy][sx] = STAIRS_UP;
        }
        if (floorIdx > 0 && rooms.length > 0) {
            const first = rooms[0];
            const sx = first.gx + 1, sy = first.gy + 1;
            if (sy < gridH && sx < gridW) grid[sy][sx] = STAIRS_DOWN;
        }
    }

    return { grid, rooms, gridW, gridH };
}

/* ──────────── Constants ──────────── */
const CELL = 16;
type ViewMode = "battlemat" | "overview";

const roomIcons: Record<GridRoom["type"], string> = {
    entrance: "🚪", combat: "⚔️", treasure: "💰", trap: "⚠️",
    boss: "💀", empty: "◻️", puzzle: "🧩",
};

/* ──────────── Component ──────────── */
export default function DungeonMap(props: DungeonMapProps) {
    const totalFloors = useMemo(() => parseFloors(props.gridSize), [props.gridSize]);
    const [currentFloor, setCurrentFloor] = useState(0);
    const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("battlemat");
    const mapRef = useRef<HTMLDivElement>(null);

    const dungeon = useMemo(
        () => generateDungeon(props, currentFloor),
        [props.seed, props.environment, props.difficulty, props.gridSize, currentFloor]
    );
    const { grid, rooms, gridW, gridH } = dungeon;

    const svgW = gridW * CELL;
    const svgH = gridH * CELL;
    const overviewW = 700, overviewH = 500;
    const scaleX = overviewW / gridW, scaleY = overviewH / gridH;

    const cellRoomMap = useMemo(() => {
        const map: (number | null)[][] = [];
        for (let y = 0; y < gridH; y++) {
            map[y] = [];
            for (let x = 0; x < gridW; x++) map[y][x] = null;
        }
        for (const room of rooms) {
            for (let y = room.gy; y < room.gy + room.gh; y++)
                for (let x = room.gx; x < room.gx + room.gw; x++)
                    if (y < gridH && x < gridW) map[y][x] = room.id;
        }
        return map;
    }, [rooms, gridH, gridW]);

    const legendItems = legendsByEnv[props.environment] || legendsByEnv.Dungeon;

    const handlePrint = () => {
        const el = mapRef.current;
        if (!el) return;
        const w = window.open("", "_blank");
        if (!w) return;
        w.document.write(`<!DOCTYPE html><html><head><title>Map - Floor ${currentFloor + 1}</title>
            <style>body{background:#1a1d23;margin:20px;color:#ccc;font-family:sans-serif}
            svg{width:100%;max-width:1200px;display:block;margin:0 auto}
            @media print{body{background:#fff}}</style></head><body>`);
        const svg = el.querySelector("svg");
        if (svg) w.document.write(svg.outerHTML);
        w.document.write("</body></html>");
        w.document.close();
        w.print();
    };

    const floorLabel = (idx: number) => {
        if (totalFloors <= 1) return "";
        return `Floor ${idx + 1}`;
    };

    return (
        <div className={styles.dungeonWrapper}>
            {/* Controls row */}
            <div className={styles.controlsRow}>
                {/* View Toggle */}
                <div className={styles.viewToggle}>
                    <button className={`${styles.toggleBtn} ${viewMode === "overview" ? styles.toggleActive : ""}`}
                        onClick={() => setViewMode("overview")}>🗺️ Overview</button>
                    <button className={`${styles.toggleBtn} ${viewMode === "battlemat" ? styles.toggleActive : ""}`}
                        onClick={() => setViewMode("battlemat")}>📐 Battle Mat</button>
                </div>

                {/* Floor Switcher */}
                {totalFloors > 1 && (
                    <div className={styles.viewToggle}>
                        {Array.from({ length: totalFloors }, (_, i) => (
                            <button key={i}
                                className={`${styles.toggleBtn} ${currentFloor === i ? styles.toggleActive : ""}`}
                                onClick={() => setCurrentFloor(i)}>
                                {floorLabel(i)}
                            </button>
                        ))}
                    </div>
                )}

                {/* Print */}
                <button className={styles.printBtn} onClick={handlePrint} title="Print map">
                    🖨️ Print
                </button>
            </div>

            {/* Legend */}
            {viewMode === "battlemat" && (
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
            )}
            {viewMode === "overview" && (
                <div className={styles.legend}>
                    <div className={styles.legendGrid}>
                        {(Object.keys(roomColors) as GridRoom["type"][]).map((type) => (
                            <span key={type} className={styles.legendItem}>
                                <span className={styles.legendDot} style={{ background: roomColors[type] }} />
                                {roomIcons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ OVERVIEW ═══ */}
            {viewMode === "overview" && (
                <div className={styles.mapContainer} ref={viewMode === "overview" ? mapRef : undefined}>
                    <svg viewBox={`0 0 ${overviewW} ${overviewH}`} className={styles.svg}>
                        <defs>
                            <filter id="roomGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
                            <pattern id="overviewGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width={overviewW} height={overviewH} fill="url(#overviewGrid)" />
                        {/* Corridors */}
                        {rooms.length > 1 && (() => {
                            const links: [number, number][] = [];
                            const conn = new Set<number>([0]);
                            while (conn.size < rooms.length) {
                                let bd = Infinity, bf = 0, bt = 0;
                                for (const fi of conn) {
                                    for (let ti = 0; ti < rooms.length; ti++) {
                                        if (conn.has(ti)) continue;
                                        const dx = (rooms[fi].gx + rooms[fi].gw / 2) - (rooms[ti].gx + rooms[ti].gw / 2);
                                        const dy = (rooms[fi].gy + rooms[fi].gh / 2) - (rooms[ti].gy + rooms[ti].gh / 2);
                                        if (dx * dx + dy * dy < bd) { bd = dx * dx + dy * dy; bf = fi; bt = ti; }
                                    }
                                }
                                conn.add(bt); links.push([bf, bt]);
                            }
                            return links.map(([fi, ti], i) => {
                                const fr = rooms[fi], tr = rooms[ti];
                                const x1 = (fr.gx + fr.gw / 2) * scaleX, y1 = (fr.gy + fr.gh / 2) * scaleY;
                                const x2 = (tr.gx + tr.gw / 2) * scaleX, y2 = (tr.gy + tr.gh / 2) * scaleY;
                                return (<g key={`oc-${i}`}>
                                    <polyline points={`${x1},${y1} ${x2},${y1} ${x2},${y2}`} fill="none" stroke="rgba(100,120,140,0.3)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                                </g>);
                            });
                        })()}
                        {/* Rooms */}
                        {rooms.map((room) => {
                            const rx = room.gx * scaleX, ry = room.gy * scaleY;
                            const rw = room.gw * scaleX, rh = room.gh * scaleY;
                            return (<g key={`or-${room.id}`} filter="url(#roomGlow)">
                                <rect x={rx} y={ry} width={rw} height={rh} rx={6}
                                    fill={`${roomColors[room.type]}15`} stroke={roomColors[room.type]}
                                    strokeWidth={room.type === "boss" ? 2.5 : 1.5}
                                    strokeDasharray={room.type === "trap" ? "6 3" : undefined} />
                                <circle cx={rx + 16} cy={ry + 16} r={10} fill={roomColors[room.type]} opacity={0.9} />
                                <text x={rx + 16} y={ry + 20} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">{room.id + 1}</text>
                                <text x={rx + rw / 2} y={ry + rh / 2 - 4} textAnchor="middle" fill={roomColors[room.type]} fontSize="11" fontWeight="600" opacity={0.9}>
                                    {roomIcons[room.type]} {room.label}
                                </text>
                                {room.encounter && <text x={rx + rw / 2} y={ry + rh / 2 + 14} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9">{room.encounter.creatures}</text>}
                            </g>);
                        })}
                    </svg>
                </div>
            )}

            {/* ═══ BATTLE MAT ═══ */}
            {viewMode === "battlemat" && (
                <div className={styles.mapContainer} ref={viewMode === "battlemat" ? mapRef : undefined}>
                    <svg viewBox={`0 0 ${svgW} ${svgH}`} className={styles.svg}>
                        {grid.map((row, y) =>
                            row.map((cell, x) => {
                                const cs = getCellStyle(cell);
                                const roomId = cellRoomMap[y][x];
                                const isHovered = roomId !== null && roomId === hoveredRoom;
                                const room = isHovered ? rooms.find(r => r.id === roomId) : null;
                                return (<g key={`${x}-${y}`}>
                                    <rect x={x * CELL} y={y * CELL} width={CELL} height={CELL}
                                        fill={isHovered && cell !== WALL && cell !== BUILDING_WALL ? `${roomColors[room!.type]}30` : cs.fill}
                                        stroke={cell === WALL || cell === BUILDING_WALL || cell === OBSIDIAN
                                            ? "rgba(255,255,255,0.02)"
                                            : roomId !== null ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)"}
                                        strokeWidth={0.5}
                                        onMouseEnter={() => roomId !== null && setHoveredRoom(roomId)}
                                        onMouseLeave={() => setHoveredRoom(null)} />
                                    {cell === SECRET_DOOR && <rect x={x * CELL + 1} y={y * CELL + 1} width={CELL - 2} height={CELL - 2}
                                        fill="none" stroke="#ff8c00" strokeWidth={1} strokeDasharray="2 2" />}
                                    {cs.label && <text x={x * CELL + CELL / 2} y={y * CELL + CELL / 2 + (cs.fontSize ? cs.fontSize * 0.35 : 3)}
                                        textAnchor="middle" fill={cs.labelColor} fontSize={cs.fontSize || 8} fontWeight="bold"
                                        style={{ pointerEvents: "none" }}>{cs.label}</text>}
                                </g>);
                            })
                        )}
                        {/* Room labels */}
                        {rooms.map((room) => (<g key={`label-${room.id}`}>
                            <circle cx={room.gx * CELL + 8} cy={room.gy * CELL - 6} r={7} fill={roomColors[room.type]} />
                            <text x={room.gx * CELL + 8} y={room.gy * CELL - 3} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">{room.id + 1}</text>
                            <text x={room.gx * CELL + 20} y={room.gy * CELL - 3} fill={roomColors[room.type]} fontSize="7" fontWeight="600">{room.label}</text>
                            <rect x={room.gx * CELL} y={room.gy * CELL} width={room.gw * CELL} height={room.gh * CELL}
                                fill="none" stroke={roomColors[room.type]}
                                strokeWidth={hoveredRoom === room.id ? 2 : 1} strokeOpacity={hoveredRoom === room.id ? 0.8 : 0.3} rx={1} />
                        </g>))}
                        {/* Scale */}
                        <g>
                            <line x1={CELL} y1={svgH - 8} x2={CELL * 6} y2={svgH - 8} stroke="#aaa" strokeWidth={1} />
                            <line x1={CELL} y1={svgH - 12} x2={CELL} y2={svgH - 4} stroke="#aaa" strokeWidth={1} />
                            <line x1={CELL * 6} y1={svgH - 12} x2={CELL * 6} y2={svgH - 4} stroke="#aaa" strokeWidth={1} />
                            <text x={CELL * 3.5} y={svgH - 2} textAnchor="middle" fill="#aaa" fontSize="7">25 ft (5 squares)</text>
                        </g>
                    </svg>
                </div>
            )}

            {/* Room Index (battle mat only) */}
            {viewMode === "battlemat" && (
                <div className={styles.roomIndex}>
                    <h4 className={styles.roomIndexTitle}>📋 Room Index</h4>
                    <div className={styles.roomCards}>
                        {rooms.map((room) => (
                            <div key={room.id}
                                className={`${styles.roomCard} ${hoveredRoom === room.id ? styles.roomCardHovered : ""}`}
                                onMouseEnter={() => setHoveredRoom(room.id)} onMouseLeave={() => setHoveredRoom(null)}
                                style={{ borderLeftColor: roomColors[room.type] }}>
                                <div className={styles.roomCardHeader}>
                                    <span className={styles.roomBadge} style={{ background: roomColors[room.type] }}>{room.id + 1}</span>
                                    <strong>{room.label}</strong>
                                    <span className={styles.roomType}>{room.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Encounter Stat Blocks */}
            <div className={styles.encounters}>
                <h4 className={styles.encounterTitle}>⚔️ Encounter Stat Blocks</h4>
                <div className={styles.statGrid}>
                    {rooms.filter((r) => r.encounter).map((room) => (
                        <div key={room.id} className={styles.statBlock}>
                            <div className={styles.statHeader} style={{ borderColor: roomColors[room.type] }}>
                                <span className={styles.roomNumber} style={{ background: roomColors[room.type] }}>{room.id + 1}</span>
                                <div><h5>{room.encounter!.name}</h5><span className={styles.statCreatures}>{room.encounter!.creatures}</span></div>
                                <span className={styles.crBadge}>CR {room.encounter!.cr}</span>
                            </div>
                            <div className={styles.statRow}>
                                <div className={styles.statCell}><span className={styles.statLabel}>AC</span><span className={styles.statValue}>{room.encounter!.ac}</span></div>
                                <div className={styles.statCell}><span className={styles.statLabel}>HP</span><span className={styles.statValue}>{room.encounter!.hp}</span></div>
                                <div className={styles.statCell}><span className={styles.statLabel}>XP</span><span className={styles.statValue}>{room.encounter!.xp.toLocaleString()}</span></div>
                            </div>
                            <div className={styles.statTactics}><span className={styles.tacticsLabel}>🎯 How to Run:</span> {room.encounter!.tactics}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
