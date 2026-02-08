/**
 * Renders a dungeon map to a data-URL image for PDF embedding.
 * Replicates the same seeded-random generation logic from DungeonMap.tsx
 * so that maps are 100 % deterministic — same seed  →  same image.
 */

/* ──── Cell constants ──── */
const WALL = 0, FLOOR = 1, CORRIDOR = 2, DOOR = 3, SECRET_DOOR = 4;
const TRAP = 5, CHEST = 6, MONSTER = 7, PILLAR = 8, WATER = 9;
const STAIRS_UP = 10, STAIRS_DOWN = 11, ALTAR = 12, TABLE = 13;
const BOOKSHELF = 14, THRONE = 15, PIT = 16, RUBBLE = 17, BARREL = 18;
const STATUE = 19, TREE = 20, ROCK = 21, GRASS = 22, PATH = 23;
const CAMPFIRE = 24, STANDING_STONE = 25, WELL = 26, STALL = 27;
const BUILDING_WALL = 28, STREET = 29, MAGMA = 30, OBSIDIAN = 31;
type CellType = number;

interface GridRoom {
    id: number; gx: number; gy: number; gw: number; gh: number;
    type: "entrance" | "combat" | "treasure" | "trap" | "boss" | "empty" | "puzzle";
    label: string;
}

interface CellStyle { fill: string; label: string; labelColor: string; fontSize?: number; }

const roomColors: Record<string, string> = {
    entrance: "#4a9eff", combat: "#ff4a4a", treasure: "#ffd700",
    trap: "#ff8c00", boss: "#9b59b6", empty: "#6b7280", puzzle: "#2ecc71",
};

/* ──── Seeded random (same hash as component) ──── */
function seededRandom(seed: string) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) { h = Math.imul(31, h) + seed.charCodeAt(i) | 0; }
    let s = h >>> 0;
    return () => { s = (s ^ (s << 13)) >>> 0; s = (s ^ (s >> 17)) >>> 0; s = (s ^ (s << 5)) >>> 0; return (s >>> 0) / 4294967296; };
}

/* ──── Cell styling ──── */
function getCellStyle(cell: CellType): CellStyle {
    switch (cell) {
        case WALL: return { fill: "#1a1d23", label: "", labelColor: "" };
        case FLOOR: return { fill: "#2a2d35", label: "", labelColor: "" };
        case CORRIDOR: return { fill: "#252830", label: "", labelColor: "" };
        case DOOR: return { fill: "#8B4513", label: "D", labelColor: "#fff" };
        case SECRET_DOOR: return { fill: "#2a2d35", label: "S", labelColor: "#ff8c00", fontSize: 7 };
        case TRAP: return { fill: "#2a2d35", label: "!", labelColor: "#ff8c00", fontSize: 8 };
        case CHEST: return { fill: "#2a2d35", label: "*", labelColor: "#ffd700", fontSize: 9 };
        case MONSTER: return { fill: "#2a2d35", label: "M", labelColor: "#ff4a4a", fontSize: 8 };
        case PILLAR: return { fill: "#555860", label: "", labelColor: "" };
        case WATER: return { fill: "#1a3a5c", label: "~", labelColor: "#4a9eff", fontSize: 9 };
        case STAIRS_UP: return { fill: "#2a2d35", label: "^", labelColor: "#aaa", fontSize: 8 };
        case STAIRS_DOWN: return { fill: "#2a2d35", label: "v", labelColor: "#aaa", fontSize: 8 };
        case ALTAR: return { fill: "#2a2d35", label: "+", labelColor: "#9b59b6", fontSize: 9 };
        case TABLE: return { fill: "#3d3020", label: "", labelColor: "" };
        case BOOKSHELF: return { fill: "#4a3520", label: "=", labelColor: "#c4a06a", fontSize: 8 };
        case THRONE: return { fill: "#3d2050", label: "T", labelColor: "#ffd700", fontSize: 8 };
        case PIT: return { fill: "#0d0d0d", label: "X", labelColor: "#555", fontSize: 7 };
        case RUBBLE: return { fill: "#333639", label: ".", labelColor: "#777", fontSize: 10 };
        case BARREL: return { fill: "#5a4020", label: "o", labelColor: "#8a7040", fontSize: 7 };
        case STATUE: return { fill: "#2a2d35", label: "i", labelColor: "#aaa", fontSize: 8 };
        case TREE: return { fill: "#1a3a1a", label: "T", labelColor: "#2d8a2d", fontSize: 9 };
        case ROCK: return { fill: "#3a3a3a", label: ".", labelColor: "#777", fontSize: 8 };
        case GRASS: return { fill: "#1e3820", label: "", labelColor: "" };
        case PATH: return { fill: "#3a3525", label: "", labelColor: "" };
        case CAMPFIRE: return { fill: "#3a2010", label: "f", labelColor: "#ff6a00", fontSize: 8 };
        case STANDING_STONE: return { fill: "#3a3c40", label: "O", labelColor: "#9b9b9b", fontSize: 8 };
        case WELL: return { fill: "#1a2a3a", label: "W", labelColor: "#6aafff", fontSize: 8 };
        case STALL: return { fill: "#4a3a20", label: "#", labelColor: "#c4a06a", fontSize: 7 };
        case BUILDING_WALL: return { fill: "#2a2520", label: "", labelColor: "" };
        case STREET: return { fill: "#353530", label: "", labelColor: "" };
        case MAGMA: return { fill: "#8a2000", label: "~", labelColor: "#ff6a00", fontSize: 9 };
        case OBSIDIAN: return { fill: "#101018", label: ".", labelColor: "#4a4a5a", fontSize: 7 };
        default: return { fill: "#2a2d35", label: "", labelColor: "" };
    }
}

/* ──── Room labels per environment ──── */
const roomLabelsByEnv: Record<string, Record<string, string[]>> = {
    Dungeon: {
        entrance: ["Entrance Hall", "Gateway", "Vestibule"],
        combat: ["Guard Room", "Arena", "Barracks"],
        treasure: ["Vault", "Treasury", "Hoard Room"],
        trap: ["Trapped Hall", "Gauntlet", "Dead End"],
        boss: ["Throne Room", "Inner Sanctum", "Lair"],
        empty: ["Side Chamber", "Storeroom", "Alcove"],
        puzzle: ["Library", "Ritual Chamber", "Observatory"],
    },
    Wilderness: {
        entrance: ["Camp", "Clearing", "Trail Head"],
        combat: ["Ambush Point", "Den", "Hunting Ground"],
        treasure: ["Hidden Cache", "Ruins", "Shrine"],
        trap: ["Quicksand", "Snare Field", "Deadfall"],
        boss: ["Sacred Grove", "Hilltop", "Ancient Circle"],
        empty: ["Meadow", "Stream", "Thicket"],
        puzzle: ["Stone Circle", "Fairy Ring", "Old Well"],
    },
    Urban: {
        entrance: ["Main Door", "Lobby", "Foyer"],
        combat: ["Guard Post", "Tavern Brawl", "Back Alley"],
        treasure: ["Vault", "Safe Room", "Noble Chamber"],
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

/* ──── Legend items per environment ──── */
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
        { cell: STANDING_STONE, name: "Stone" }, { cell: WELL, name: "Well" },
        { cell: MONSTER, name: "Creature" }, { cell: TRAP, name: "Hazard" },
        { cell: CHEST, name: "Hidden Cache" },
    ],
    Urban: [
        { cell: STREET, name: "Street" }, { cell: BUILDING_WALL, name: "Wall" },
        { cell: DOOR, name: "Door" }, { cell: SECRET_DOOR, name: "Passage" },
        { cell: TABLE, name: "Furniture" }, { cell: STALL, name: "Counter" },
        { cell: BARREL, name: "Barrel" }, { cell: MONSTER, name: "NPC" },
        { cell: CHEST, name: "Valuables" }, { cell: STAIRS_DOWN, name: "Stairs" },
        { cell: BOOKSHELF, name: "Shelf" }, { cell: TRAP, name: "Trap" },
    ],
    Special: [
        { cell: OBSIDIAN, name: "Obsidian" }, { cell: FLOOR, name: "Stone" },
        { cell: MAGMA, name: "Magma" }, { cell: PILLAR, name: "Pillar" },
        { cell: CHEST, name: "Treasure" }, { cell: MONSTER, name: "Creature" },
        { cell: THRONE, name: "Throne" }, { cell: STAIRS_UP, name: "Ledge" },
        { cell: TRAP, name: "Gas Vent" },
    ],
};

/* ──── Floor parsing ──── */
function parseFloors(gridSize: string): number {
    const m = gridSize.match(/(\d+)\s*floors?/i);
    if (m) return parseInt(m[1]);
    const m2 = gridSize.match(/\((\d+)\s*floors?\)/i);
    if (m2) return parseInt(m2[1]);
    return 1;
}

/* ──── Dungeon generator (mirrors DungeonMap.tsx exactly) ──── */
function generateDungeon(seed: string, environment: string, difficulty: string, gridSize: string, floorIdx: number) {
    const rand = seededRandom(seed + environment + floorIdx);
    const gridW = 48, gridH = 36;
    const env = environment;

    const baseCell = env === "Wilderness" ? GRASS : env === "Special" ? OBSIDIAN : WALL;
    const floorCell = env === "Wilderness" ? GRASS : env === "Urban" ? STREET : env === "Special" ? FLOOR : FLOOR;
    const corridorCell = env === "Wilderness" ? PATH : env === "Urban" ? STREET : env === "Special" ? FLOOR : CORRIDOR;

    const grid: CellType[][] = [];
    for (let y = 0; y < gridH; y++) { grid[y] = []; for (let x = 0; x < gridW; x++) grid[y][x] = baseCell; }

    if (env === "Wilderness") {
        for (let y = 0; y < gridH; y++) for (let x = 0; x < gridW; x++) {
            const r = rand();
            if (r < 0.25) grid[y][x] = TREE;
            else if (r < 0.30) grid[y][x] = ROCK;
            else if (r < 0.34) grid[y][x] = WATER;
        }
    }

    if (env === "Special") {
        for (let river = 0; river < 3; river++) {
            let rx = Math.floor(rand() * gridW), ry = Math.floor(rand() * gridH);
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

    const diffRoomCount: Record<string, number> = {
        "Easy": 5, "Easy to Medium": 6, "Medium": 7,
        "Medium to Hard": 8, "Hard": 8, "Hard to Deadly": 9, "Varies": 7,
    };
    const totalFloors = parseFloors(gridSize);
    let roomCount = diffRoomCount[difficulty] || 7;
    if (totalFloors > 1) roomCount = Math.max(3, Math.ceil(roomCount / totalFloors) + 1);

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
    const rooms: GridRoom[] = [];
    const doesOverlap = (gx: number, gy: number, gw: number, gh: number) => {
        for (const r of rooms) {
            if (gx < r.gx + r.gw + 2 && gx + gw + 2 > r.gx && gy < r.gy + r.gh + 2 && gy + gh + 2 > r.gy) return true;
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
                rooms.push({ id: i, gx, gy, gw, gh, type, label: labels[Math.floor(rand() * labels.length)] });
                break;
            }
        }
    }

    // Carve rooms
    for (const room of rooms) {
        for (let y = room.gy; y < room.gy + room.gh; y++)
            for (let x = room.gx; x < room.gx + room.gw; x++)
                grid[y][x] = floorCell;
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

    // Corridors (MST)
    if (rooms.length > 1) {
        const connected = new Set<number>([0]);
        const links: [number, number][] = [];
        while (connected.size < rooms.length) {
            let bd = Infinity, bf = 0, bt = 0;
            for (const fi of connected) {
                for (let ti = 0; ti < rooms.length; ti++) {
                    if (connected.has(ti)) continue;
                    const dx = (rooms[fi].gx + rooms[fi].gw / 2) - (rooms[ti].gx + rooms[ti].gw / 2);
                    const dy = (rooms[fi].gy + rooms[fi].gh / 2) - (rooms[ti].gy + rooms[ti].gh / 2);
                    if (dx * dx + dy * dy < bd) { bd = dx * dx + dy * dy; bf = fi; bt = ti; }
                }
            }
            connected.add(bt); links.push([bf, bt]);
        }
        if (rooms.length > 3) {
            const a = Math.floor(rand() * rooms.length);
            let b = Math.floor(rand() * rooms.length);
            while (b === a && rooms.length > 1) b = Math.floor(rand() * rooms.length);
            links.push([a, b]);
        }
        for (const [fi, ti] of links) {
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

    // Doors
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

    if (env === "Urban") {
        for (let y = 0; y < gridH; y++) for (let x = 0; x < gridW; x++) if (grid[y][x] === WALL) grid[y][x] = STREET;
    }

    // Interior features
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
                if (env === "Wilderness") { placeIn(room, CAMPFIRE, 1); placeIn(room, ROCK, 2); if (rand() > 0.5) placeIn(room, BARREL, 1); }
                else if (env === "Urban") { placeIn(room, TABLE, 2); placeIn(room, BARREL, 1); }
                else if (env === "Special") { placeIn(room, PILLAR, 2); placeIn(room, STAIRS_DOWN, 1); }
                else { grid[room.gy + Math.floor(room.gh / 2)][room.gx + Math.floor(room.gw / 2)] = STAIRS_DOWN; placeIn(room, STATUE, Math.floor(rand() * 2)); if (rand() > 0.5) placeIn(room, PILLAR, 2); }
                break;
            case "combat":
                placeIn(room, MONSTER, 2 + Math.floor(rand() * 3));
                if (env === "Wilderness") { placeIn(room, ROCK, Math.floor(rand() * 3)); }
                else if (env === "Urban") { placeIn(room, TABLE, Math.floor(rand() * 2)); placeIn(room, BARREL, Math.floor(rand() * 2)); }
                else if (env === "Special") { placeIn(room, PILLAR, 2); if (rand() > 0.5) placeIn(room, MAGMA, 2); }
                else { placeIn(room, PILLAR, Math.floor(rand() * 3)); if (rand() > 0.5) placeIn(room, BARREL, 1 + Math.floor(rand() * 2)); }
                break;
            case "treasure":
                placeIn(room, CHEST, 2 + Math.floor(rand() * 2));
                if (env === "Wilderness") { placeIn(room, ROCK, 1); placeIn(room, STANDING_STONE, 1); }
                else if (env === "Urban") { placeIn(room, BOOKSHELF, 1); placeIn(room, TABLE, 1); }
                else if (env === "Special") { placeIn(room, PILLAR, 2); placeIn(room, STATUE, 1); }
                else { placeIn(room, ALTAR, 1); placeIn(room, PILLAR, Math.floor(rand() * 2)); }
                break;
            case "trap":
                placeIn(room, TRAP, 3 + Math.floor(rand() * 3));
                if (env === "Wilderness") { placeIn(room, PIT, 1); placeIn(room, WATER, 2); }
                else if (env === "Special") { placeIn(room, MAGMA, 3); placeIn(room, PIT, 1); }
                else {
                    placeIn(room, PIT, 1 + Math.floor(rand() * 2)); placeIn(room, RUBBLE, Math.floor(rand() * 2));
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
                if (env === "Wilderness") { placeIn(room, STANDING_STONE, 3); placeIn(room, MONSTER, 2); placeIn(room, CAMPFIRE, 1); }
                else if (env === "Special") { grid[room.gy + Math.floor(room.gh / 2)][room.gx + Math.floor(room.gw / 2)] = THRONE; placeIn(room, MONSTER, 3); placeIn(room, PILLAR, 3); placeIn(room, CHEST, 2); placeIn(room, MAGMA, 2); }
                else if (env === "Urban") { grid[room.gy + Math.floor(room.gh / 2)][room.gx + Math.floor(room.gw / 2)] = THRONE; placeIn(room, MONSTER, 2); placeIn(room, TABLE, 2); placeIn(room, BOOKSHELF, 1); }
                else { grid[room.gy + Math.floor(room.gh / 2)][room.gx + Math.floor(room.gw / 2)] = THRONE; placeIn(room, MONSTER, 2 + Math.floor(rand() * 2)); placeIn(room, PILLAR, 2 + Math.floor(rand() * 2)); if (rand() > 0.5) placeIn(room, CHEST, 1); const sx = room.gx + room.gw - 1, sy = room.gy + room.gh - 1; if (sy < gridH && sx < gridW) grid[sy][sx] = SECRET_DOOR; }
                break;
            case "empty":
                if (env === "Wilderness") { placeIn(room, ROCK, Math.floor(rand() * 3)); if (rand() > 0.5) placeIn(room, WATER, 2 + Math.floor(rand() * 3)); }
                else if (env === "Urban") { placeIn(room, BARREL, Math.floor(rand() * 3)); placeIn(room, TABLE, Math.floor(rand() * 2)); }
                else { placeIn(room, BARREL, Math.floor(rand() * 3)); placeIn(room, RUBBLE, Math.floor(rand() * 2)); if (rand() > 0.6) placeIn(room, WATER, 2 + Math.floor(rand() * 3)); }
                break;
            case "puzzle":
                if (env === "Wilderness") { placeIn(room, STANDING_STONE, 3 + Math.floor(rand() * 2)); placeIn(room, WELL, 1); }
                else if (env === "Urban") { placeIn(room, BOOKSHELF, 3); placeIn(room, TABLE, 2); placeIn(room, STATUE, 1); }
                else if (env === "Special") { placeIn(room, ALTAR, 1); placeIn(room, PILLAR, 3); placeIn(room, STANDING_STONE, 2); }
                else { placeIn(room, BOOKSHELF, 2 + Math.floor(rand() * 3)); placeIn(room, ALTAR, 1); placeIn(room, STATUE, Math.floor(rand() * 2)); const sx = room.gx, sy = room.gy + Math.floor(room.gh / 2); if (sy < gridH && sx < gridW) grid[sy][sx] = SECRET_DOOR; }
                break;
        }
    }

    if (totalFloors > 1) {
        if (floorIdx < totalFloors - 1 && rooms.length > 0) {
            const last = rooms[rooms.length - 1]; const sx = last.gx + last.gw - 2, sy = last.gy + 1;
            if (sy < gridH && sx < gridW) grid[sy][sx] = STAIRS_UP;
        }
        if (floorIdx > 0 && rooms.length > 0) {
            const first = rooms[0]; const sx = first.gx + 1, sy = first.gy + 1;
            if (sy < gridH && sx < gridW) grid[sy][sx] = STAIRS_DOWN;
        }
    }

    return { grid, rooms, gridW, gridH };
}

/* ════════════════════════════════════════════════════════
   PUBLIC API — render a map to a PNG data-URL
   ════════════════════════════════════════════════════════ */

export interface MapRenderInput {
    id: string;
    name: string;
    environment: string;
    gridSize: string;
    difficulty: string;
    keyFeatures: string[];
}

/**
 * Renders a dungeon map + legend + room key to a PNG data-URL.
 * Returns one data-URL per floor (most maps have 1 floor).
 */
export function renderMapToDataURLs(map: MapRenderInput): string[] {
    const totalFloors = parseFloors(map.gridSize);
    const CELL = 14;                    // px per cell
    const LEGEND_H = 110;              // legend area at bottom
    const ROOM_KEY_H = 160;            // room index area
    const TITLE_H = 50;               // title area at top
    const results: string[] = [];

    for (let floorIdx = 0; floorIdx < totalFloors; floorIdx++) {
        const { grid, rooms, gridW, gridH } = generateDungeon(
            map.id, map.environment, map.difficulty, map.gridSize, floorIdx
        );

        const mapW = gridW * CELL;
        const mapH = gridH * CELL;
        const canvasW = mapW + 40;       // margins
        const canvasH = TITLE_H + mapH + LEGEND_H + ROOM_KEY_H + 40;

        const canvas = document.createElement("canvas");
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext("2d")!;

        // Background
        ctx.fillStyle = "#13151a";
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Border
        ctx.strokeStyle = "#b48c50";
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 4, canvasW - 8, canvasH - 8);

        // Title
        const floorLabel = totalFloors > 1 ? ` — Floor ${floorIdx + 1}` : "";
        ctx.fillStyle = "#dcc078";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${map.name}${floorLabel}`, canvasW / 2, 30);
        ctx.fillStyle = "#8a8a8a";
        ctx.font = "12px sans-serif";
        ctx.fillText(`${map.environment}  |  ${map.gridSize}  |  ${map.difficulty}`, canvasW / 2, 46);

        // Map grid
        const offsetX = 20;
        const offsetY = TITLE_H;

        for (let y = 0; y < gridH; y++) {
            for (let x = 0; x < gridW; x++) {
                const cell = grid[y][x];
                const cs = getCellStyle(cell);
                const px = offsetX + x * CELL;
                const py = offsetY + y * CELL;

                // Fill cell
                ctx.fillStyle = cs.fill;
                ctx.fillRect(px, py, CELL, CELL);

                // Grid lines
                ctx.strokeStyle = "rgba(255,255,255,0.05)";
                ctx.lineWidth = 0.5;
                ctx.strokeRect(px, py, CELL, CELL);

                // Cell label
                if (cs.label) {
                    ctx.fillStyle = cs.labelColor;
                    ctx.font = `bold ${cs.fontSize || 8}px sans-serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(cs.label, px + CELL / 2, py + CELL / 2);
                }
            }
        }

        // Room outlines + numbered badges
        for (const room of rooms) {
            const rx = offsetX + room.gx * CELL;
            const ry = offsetY + room.gy * CELL;
            const rw = room.gw * CELL;
            const rh = room.gh * CELL;

            ctx.strokeStyle = roomColors[room.type] || "#888";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(rx, ry, rw, rh);

            // Number badge
            const badgeX = rx + 8;
            const badgeY = ry - 6;
            ctx.beginPath();
            ctx.arc(badgeX, badgeY, 7, 0, Math.PI * 2);
            ctx.fillStyle = roomColors[room.type] || "#888";
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 8px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(String(room.id + 1), badgeX, badgeY);

            // Room label
            ctx.fillStyle = roomColors[room.type] || "#888";
            ctx.font = "bold 7px sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(room.label, badgeX + 12, badgeY);
        }

        // Scale bar
        const scaleY2 = offsetY + mapH - 8;
        ctx.strokeStyle = "#aaa";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(offsetX + CELL, scaleY2); ctx.lineTo(offsetX + CELL * 6, scaleY2);
        ctx.moveTo(offsetX + CELL, scaleY2 - 4); ctx.lineTo(offsetX + CELL, scaleY2 + 4);
        ctx.moveTo(offsetX + CELL * 6, scaleY2 - 4); ctx.lineTo(offsetX + CELL * 6, scaleY2 + 4);
        ctx.stroke();
        ctx.fillStyle = "#aaa";
        ctx.font = "7px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("25 ft (5 squares)", offsetX + CELL * 3.5, scaleY2 + 4);

        // ── Legend ──
        const legendY = offsetY + mapH + 16;
        ctx.fillStyle = "#dcc078";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("MAP KEY (1 square = 5 ft)", offsetX, legendY);

        const legendItems = legendsByEnv[map.environment] || legendsByEnv.Dungeon;
        const cols = 4;
        const colW = (mapW) / cols;
        legendItems.forEach((item, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const lx = offsetX + col * colW;
            const ly = legendY + 18 + row * 18;

            // Swatch
            const cs = getCellStyle(item.cell);
            ctx.fillStyle = cs.fill;
            ctx.fillRect(lx, ly, 12, 12);
            ctx.strokeStyle = "rgba(255,255,255,0.15)";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(lx, ly, 12, 12);
            if (cs.label) {
                ctx.fillStyle = cs.labelColor;
                ctx.font = `bold ${cs.fontSize || 7}px sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(cs.label, lx + 6, ly + 6);
            }

            // Label text
            ctx.fillStyle = "#ccc";
            ctx.font = "10px sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(item.name, lx + 16, ly + 6);
        });

        // ── Room Index ──
        const roomIdx_Y = legendY + LEGEND_H;
        ctx.fillStyle = "#dcc078";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("ROOM INDEX", offsetX, roomIdx_Y);

        rooms.forEach((room, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const rx2 = offsetX + col * (mapW / 3);
            const ry2 = roomIdx_Y + 18 + row * 20;

            // Room badge
            ctx.beginPath();
            ctx.arc(rx2 + 7, ry2 + 6, 6, 0, Math.PI * 2);
            ctx.fillStyle = roomColors[room.type] || "#888";
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 7px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(String(room.id + 1), rx2 + 7, ry2 + 6);

            // Room name + type
            ctx.fillStyle = "#ccc";
            ctx.font = "10px sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(`${room.label} (${room.type})`, rx2 + 18, ry2 + 6);
        });

        results.push(canvas.toDataURL("image/png"));
    }

    return results;
}
