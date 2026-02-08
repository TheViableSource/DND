"use client";

import { useState, useEffect, useCallback } from "react";
import npcsData from "@/data/npcs.json";
import { addSessionItem } from "@/lib/sessionStorage";
import styles from "./page.module.css";

/* ─── Types ─── */
interface NPC {
    id: string;
    name: string;
    race: string;
    role: string;
    class: string;
    appearance: string;
    personality: string[];
    motivation: string;
    secret: string;
    cr: number;
    dialogue: { greeting: string; quest: string; farewell: string };
    saved?: boolean;
}

/* ─── Constants ─── */
const roles = ["All", "Quest Giver", "Ally", "Neutral", "Antagonist"];
const ALL_RACES = [
    "Human", "Elf", "Half-Elf", "Dwarf", "Halfling", "Gnome",
    "Half-Orc", "Tiefling", "Dragonborn", "Aasimar", "Goblin"
];
const races = ["All", ...ALL_RACES];
const genders = ["Male", "Female", "Non-binary"];

const roleColors: Record<string, string> = {
    "Quest Giver": "badge-gold",
    Ally: "badge-green",
    Neutral: "badge-blue",
    Antagonist: "badge-red",
};

/* ─── Name Banks ─── */
const nameBank: Record<string, Record<string, string[]>> = {
    Human: {
        Male: ["Aldric", "Edmund", "Gareth", "Roland", "Cedric", "Harlan", "Jasper", "Owen", "Silas", "Theron", "Brennan", "Callum", "Dorian", "Elias", "Finn"],
        Female: ["Elena", "Mirabel", "Rowena", "Astrid", "Isolde", "Liora", "Vivienne", "Cordelia", "Freya", "Gwyneth", "Helena", "Iris", "Keira", "Lydia", "Nadia"],
        "Non-binary": ["Rowan", "Sage", "Quinn", "Morgan", "Avery", "Emery", "Rune", "Vesper", "Aspen", "Briar", "Haven", "Lark", "Phoenix", "River", "Wren"],
    },
    Elf: {
        Male: ["Aelindor", "Caelith", "Faenor", "Ithilion", "Lirael", "Naeris", "Thalion", "Vaeril", "Eryndor", "Galadrim", "Mirion", "Silvanas", "Arion", "Calen", "Elros"],
        Female: ["Aelindra", "Elowyn", "Seraphine", "Nimue", "Thessaly", "Arwen", "Galawen", "Ithilien", "Laeriel", "Morwen", "Naerys", "Sylene", "Tindra", "Vaelith", "Ysolde"],
        "Non-binary": ["Aelwen", "Cirdan", "Feywild", "Loriel", "Questari", "Starweave", "Thalwen", "Windmere", "Zephyris", "Calindra", "Elorin", "Isilme", "Nethys", "Rilindel", "Sylph"],
    },
    "Half-Elf": {
        Male: ["Caelum", "Fenwick", "Darian", "Kael", "Merrick", "Rennyn", "Thane", "Valen", "Zander", "Lucien", "Aiden", "Bryn", "Corwin", "Haldor", "Leander"],
        Female: ["Lyria", "Thessaly", "Arianna", "Elara", "Fiora", "Kira", "Maren", "Nia", "Sera", "Tavia", "Calista", "Dahlia", "Elodie", "Jessamine", "Rhiannon"],
        "Non-binary": ["Alder", "Cypress", "Indigo", "Kieran", "Lyric", "Moss", "Onyx", "Quill", "Sable", "Talon", "Wisteria", "Zinnia", "Cobalt", "Ember", "Frost"],
    },
    Dwarf: {
        Male: ["Durak", "Torgan", "Balin", "Dain", "Flint", "Grumbar", "Korin", "Muradin", "Thorin", "Vondal", "Bruenor", "Dolgrin", "Harbek", "Kildrak", "Orsik"],
        Female: ["Brunhild", "Helga", "Amber", "Dagny", "Greta", "Hilda", "Kathra", "Mardred", "Riswynn", "Torbera", "Audhild", "Bardryn", "Diesa", "Eldeth", "Falkrunn"],
        "Non-binary": ["Anvil", "Forge", "Granite", "Iron", "Onyx", "Ruby", "Slate", "Stone", "Topaz", "Bronze", "Cobalt", "Ember", "Flint", "Jasper", "Quartz"],
    },
    Halfling: {
        Male: ["Pip", "Jasper", "Corrin", "Eldon", "Garret", "Lyle", "Merric", "Osborn", "Roscoe", "Wendel", "Alton", "Beau", "Cade", "Finnan", "Milo"],
        Female: ["Rosalind", "Daisy", "Andry", "Bree", "Callie", "Kithri", "Lavinia", "Nedda", "Paela", "Shaena", "Vani", "Cora", "Euphemia", "Jillian", "Lidda"],
        "Non-binary": ["Bramble", "Clover", "Fern", "Hazel", "Juniper", "Maple", "Nutmeg", "Pepper", "Sorrel", "Tansy", "Basil", "Cricket", "Dill", "Holly", "Reed"],
    },
    Gnome: {
        Male: ["Fizzwick", "Nix", "Alston", "Dimble", "Fonkin", "Gimble", "Jebeddo", "Namfoodle", "Roondar", "Sindri", "Wrenn", "Boddynock", "Eldon", "Gerbo", "Orryn"],
        Female: ["Willow", "Sage", "Bimpnottin", "Caramip", "Duvamil", "Ellyjobell", "Lilli", "Nissa", "Roywyn", "Shamil", "Waywocket", "Zanna", "Breena", "Donella", "Ella"],
        "Non-binary": ["Quill", "Spark", "Tinker", "Widget", "Zippy", "Bolt", "Cog", "Gear", "Lock", "Pivot", "Rivet", "Spring", "Toggle", "Valve", "Weld"],
    },
    "Half-Orc": {
        Male: ["Thokk", "Dorn", "Marcus", "Gorn", "Henk", "Holg", "Krusk", "Murg", "Ront", "Shump", "Varg", "Dench", "Feng", "Imsh", "Keth"],
        Female: ["Grasha", "Vorka", "Baggi", "Emen", "Engong", "Kansif", "Myev", "Neega", "Ovak", "Shautha", "Sutha", "Vola", "Yevelda", "Brenna", "Griselda"],
        "Non-binary": ["Ash", "Crag", "Echo", "Flint", "Gale", "Iron", "Jade", "Kite", "Storm", "Thorn", "Vale", "Wolf", "Blaze", "Drift", "Frost"],
    },
    Tiefling: {
        Male: ["Lazarus", "Mordai", "Amnon", "Barakas", "Damakos", "Ekemon", "Iados", "Kairon", "Leucis", "Pelaios", "Skamos", "Therai", "Akmenos", "Belos", "Castiel"],
        Female: ["Ashara", "Crimson", "Mercy", "Akta", "Bryseis", "Damaia", "Ea", "Kallista", "Lerissa", "Nemeia", "Orianna", "Phelaia", "Rieta", "Brenna", "Lilith"],
        "Non-binary": ["Carrion", "Creed", "Malice", "Nowhere", "Open", "Poetry", "Quest", "Random", "Sorrow", "Torment", "Weary", "Ideal", "Mystery", "Revel", "Solace"],
    },
    Dragonborn: {
        Male: ["Kriv", "Bharash", "Ghesh", "Arjhan", "Balasar", "Donaar", "Heskan", "Medrash", "Nadarr", "Pandjed", "Rhogar", "Shamash", "Shedinn", "Torinn", "Tarhun"],
        Female: ["Farideh", "Sora", "Akra", "Biri", "Daar", "Harann", "Kava", "Korinn", "Mishann", "Nala", "Perra", "Raiann", "Sora", "Surina", "Thava"],
        "Non-binary": ["Blaze", "Cinder", "Drake", "Ember", "Flame", "Kindle", "Pyra", "Scale", "Shard", "Spark", "Talon", "Volt", "Wyrm", "Ash", "Fang"],
    },
    Aasimar: {
        Male: ["Auriel", "Cassius", "Jorin", "Azariel", "Castiel", "Ezrael", "Gabriel", "Ishmael", "Malachi", "Nathaniel", "Raphael", "Uriel", "Zachariel", "Kemuel", "Sariel"],
        Female: ["Elara", "Seraphina", "Aria", "Celeste", "Divina", "Evangeline", "Grace", "Halo", "Lumina", "Nova", "Radiance", "Sol", "Theia", "Vesta", "Zara"],
        "Non-binary": ["Angel", "Beacon", "Dawn", "Glory", "Light", "Mercy", "Nimbus", "Oracle", "Prism", "Ray", "Star", "Truth", "Virtue", "Zenith", "Aura"],
    },
    Goblin: {
        Male: ["Kregg", "Skrix", "Grix", "Blix", "Droop", "Nix", "Snig", "Splug", "Yik", "Zook", "Gnak", "Murt", "Rax", "Tik", "Vreek"],
        Female: ["Nettle", "Tikka", "Bree", "Drizzle", "Fizz", "Grubba", "Jinx", "Moss", "Pip", "Scuttle", "Twitch", "Wart", "Bramble", "Dust", "Flea"],
        "Non-binary": ["Click", "Dust", "Fizzle", "Glint", "Jink", "Nib", "Ratchet", "Snip", "Twig", "Whir", "Zap", "Bolt", "Chirp", "Knack", "Spark"],
    },
};

/* ─── Trait / Template Pools ─── */
const personalityTraits = [
    "Brave", "Cautious", "Curious", "Loyal", "Cynical", "Jovial", "Stoic",
    "Hot-tempered", "Gentle", "Cunning", "Honest", "Secretive", "Ambitious",
    "Laid-back", "Paranoid", "Generous", "Mischievous", "Scholarly", "Street-smart",
    "Melancholic", "Optimistic", "Sarcastic", "Noble-hearted", "Ruthless", "Empathetic",
];

const classesByRole: Record<string, string[]> = {
    "Quest Giver": ["Noble", "Mayor", "Scholar", "Captain", "Merchant Prince", "Temple Elder", "Guild Master", "Explorer", "Diplomat", "Sage"],
    Ally: ["Fighter", "Ranger", "Cleric", "Rogue", "Bard", "Paladin", "Monk", "Druid", "Barbarian", "Sorcerer"],
    Neutral: ["Innkeeper", "Blacksmith", "Alchemist", "Merchant", "Herbalist", "Artisan", "Diviner", "Bard", "Hermit", "Sailor"],
    Antagonist: ["Warlock", "Assassin", "Necromancer", "Crime Lord", "Warlord", "Dark Knight", "Cultist", "Spy", "Pirate Captain", "Corrupt Noble"],
};

const motivations: Record<string, string[]> = {
    "Quest Giver": [
        "Find a missing relic before it falls into the wrong hands",
        "Rally heroes to defend the realm against an emerging threat",
        "Uncover the truth behind a conspiracy that threatens the kingdom",
        "Locate a lost expedition before time runs out",
        "Broker peace between warring factions before all-out war erupts",
    ],
    Ally: [
        "Prove their worth to those who doubted them",
        "Protect the innocent at any cost",
        "Seek redemption for past mistakes through heroic deeds",
        "Find a cure for a loved one's mysterious affliction",
        "Master their craft and become legendary",
    ],
    Neutral: [
        "Run their business and stay out of trouble — trouble keeps finding them",
        "Collect rare ingredients for a masterwork creation",
        "Gather stories and secrets from every traveler who passes through",
        "Perfect their craft to honor a deceased mentor",
        "Maintain balance and neutrality despite increasing pressure to pick sides",
    ],
    Antagonist: [
        "Seize power by any means necessary to reshape the world",
        "Exact revenge on those who wronged them, collateral damage be damned",
        "Unlock forbidden knowledge regardless of the consequences",
        "Build an empire through manipulation and force",
        "Prove that the ends justify the means by achieving an impossible goal",
    ],
};

const secretTemplates = [
    "They are secretly working for a rival faction and feeding them information",
    "They carry a cursed item they cannot remove, slowly changing their nature",
    "They witnessed a terrible crime and have been running ever since",
    "They possess knowledge of an ancient prophecy they dare not share",
    "Their true identity would shock everyone who knows them",
    "They owe a life-debt to a dangerous entity",
    "They are the last survivor of a destroyed order and carry its final secret",
    "Their power comes from a source they cannot control",
];

const appearanceTemplates: Record<string, string[]> = {
    Human: [
        "A weathered figure with sharp eyes and calloused hands, carrying themselves with quiet confidence.",
        "Well-dressed with an easy smile, though a faded scar hints at a rougher past.",
        "Tall and broad-shouldered with sun-darkened skin and a practical traveling outfit.",
    ],
    Elf: [
        "Graceful with luminous eyes and flowing hair, moving with centuries of practiced elegance.",
        "Angular features with sharp cheekbones and piercing eyes that seem to look through you.",
        "Lithe and silent-footed, with hair adorned with natural elements and leather armor.",
    ],
    "Half-Elf": [
        "Features that blend human warmth with elven grace — pointed ears half-hidden by waves of hair.",
        "A striking figure who moves between worlds, neither fully elf nor fully human in bearing.",
        "Attractive with keen eyes that miss nothing, dressed to blend into any social setting.",
    ],
    Dwarf: [
        "Stocky and powerful with a magnificent braided beard and arms thick as tree trunks.",
        "Broad-shouldered with deep-set eyes, soot-stained hands, and practical workwear.",
        "A compact figure radiating stubborn determination, wearing well-maintained armor.",
    ],
    Halfling: [
        "Small and cheerful with rosy cheeks, bare feet, and an infectious grin.",
        "A tiny but surprisingly commanding presence with sharp eyes and nimble fingers.",
        "Plump and warm-looking with curly hair and pockets full of useful oddments.",
    ],
    Gnome: [
        "Tiny and energetic with wild hair and oversized goggles pushed up on their forehead.",
        "A diminutive figure with twinkling eyes and stained fingers from constant tinkering.",
        "Small even for a gnome, with a permanent look of excited discovery.",
    ],
    "Half-Orc": [
        "Towering and muscular with prominent tusks, ritual scars, and a surprisingly thoughtful expression.",
        "Built like a fortress with green-grey skin and intelligent eyes that contradict assumptions.",
        "Powerful frame in well-maintained gear, carrying themselves with disciplined control.",
    ],
    Tiefling: [
        "Striking infernal features — curved horns, a long tail, and skin in an unusual hue. Dressed with defiant style.",
        "Horned and sharp-featured with eyes that glow faintly, wearing layers of dark, elegant clothing.",
        "A lithe figure with small horns and a spaded tail, radiating an aura of otherworldly charm.",
    ],
    Dragonborn: [
        "Scaled and imposing with a powerful jaw and eyes that gleam with draconic intensity.",
        "A tall dragonborn with iridescent scales and a warrior's bearing, every movement precise.",
        "Broad and scaled with a deep, resonant voice and ceremonial markings.",
    ],
    Aasimar: [
        "Radiant features with faintly luminous skin and eyes that seem to glow with inner light.",
        "Strikingly beautiful with an otherworldly quality — hair that catches light unnaturally.",
        "A serene presence with subtle golden markings and an air of divine purpose.",
    ],
    Goblin: [
        "Small and scrappy with oversized ears, sharp teeth, and surprisingly clever eyes.",
        "A wiry goblin in patchwork gear, twitchy and alert, always watching the exits.",
        "Tiny and green-skinned with a surprisingly well-maintained outfit and a cunning expression.",
    ],
};

const dialogueTemplates: Record<string, { greeting: string[]; quest: string[]; farewell: string[] }> = {
    "Quest Giver": {
        greeting: [
            "Thank the gods you've come. I've been searching for capable adventurers, and time is running short.",
            "Ah, you must be the ones I've heard about. Your reputation precedes you — I hope it's earned.",
            "Please, come in quickly. What I'm about to ask of you is dangerous, but vital.",
        ],
        quest: [
            "The situation is dire. I need you to venture into dangerous territory and retrieve something of great importance. The details are sensitive — I'll share them only with those committed to seeing this through.",
            "There's a growing threat that the authorities refuse to acknowledge. I need independent agents — people who can act without the burden of politics. Will you help?",
            "I've exhausted every official channel. You're my last hope. The task is dangerous, the pay is fair, and the consequences of failure... well, let's focus on success.",
        ],
        farewell: [
            "Go carefully, and return safely. The reward will be worth the risk, I promise you that.",
            "May fortune favor the bold. I'll be here when you return — with payment and gratitude.",
            "Time is of the essence. Go now, and know that many lives hang in the balance.",
        ],
    },
    Ally: {
        greeting: [
            "You look like you could use an extra sword. Or bow. Or whatever it is I'm good at today.",
            "I've been waiting for someone worth fighting alongside. Maybe you'll do. Let's find out.",
            "Well met! I hear you're heading into danger. Coincidentally, so am I. Shall we be reckless together?",
        ],
        quest: [
            "I've got a personal stake in this fight. Help me with my problem, and I'll help with yours. Fair trade?",
            "There's something I need to do — something I can't manage alone. I don't ask for help easily, so you know it's serious.",
            "I've been tracking a threat for weeks. It's bigger than I expected. If we work together, we might actually survive this.",
        ],
        farewell: [
            "Fight well, and watch each other's backs. That's how we all walk out alive.",
            "You proved yourself today. I don't say that lightly. Until next time, friend.",
            "Stay sharp out there. And if you ever need my blade again, you know where to find me.",
        ],
    },
    Neutral: {
        greeting: [
            "Welcome, welcome! What can I do for you today? And please don't break anything.",
            "Hmm? Oh, a customer. Or are you here for conversation? Either way, it'll cost you.",
            "Come in, sit down. I don't care about your quest or your drama — but I might have what you need.",
        ],
        quest: [
            "Look, I'm not the adventuring type, but I've got a problem only adventurers can solve. Interested? The pay is honest.",
            "I hear things. See things. And right now, what I'm seeing concerns me. Maybe it should concern you too.",
            "I don't usually get involved, but this is affecting my livelihood. Help me sort it out, and I'll make it worth your while.",
        ],
        farewell: [
            "Good luck out there. And come back in one piece — repeat customers are my favorite kind.",
            "Mind how you go. And if anyone asks, we never had this conversation.",
            "Take care of yourselves. The world's dangerous enough without borrowing trouble.",
        ],
    },
    Antagonist: {
        greeting: [
            "So, the heroes arrive at last. I've been expecting you — though I admit I expected more of you.",
            "Well, well. You've made it this far. I'm almost impressed. Almost.",
            "Don't look so hostile. We're not so different, you and I. We just disagree on methods.",
        ],
        quest: [
            "You think you understand what's happening here, but you've only seen the surface. The truth is far more complex — and I am not the villain you've been told I am.",
            "I'll give you one chance to walk away. Not out of mercy — out of practicality. Fighting you wastes resources I'd rather spend elsewhere.",
            "Consider this: everything I've done has been necessary. The world you're trying to protect? It's broken. I'm trying to fix it. You're just too blind to see how.",
        ],
        farewell: [
            "This isn't over. It's never over. We'll meet again, and next time, I won't be so civil.",
            "Run along, hero. Enjoy your small victory. The real game is much, much larger than you realize.",
            "I respect your conviction, if not your intelligence. Perhaps in time you'll understand. Or perhaps you'll just get in my way again.",
        ],
    },
};

/* ─── Seeded Random ─── */
function seededRandom(seed: string) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) { h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0; }
    return function () { h = (h + 0x6d2b79f5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t ^= (t + Math.imul(t ^ (t >>> 7), 61 | t)); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function pick<T>(arr: T[], rand: () => number): T {
    return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(arr: T[], n: number, rand: () => number): T[] {
    const shuffled = [...arr].sort(() => rand() - 0.5);
    return shuffled.slice(0, n);
}

/* ─── Generator ─── */
function generateNPC(race: string, gender: string, role: string, seed?: string): NPC {
    const s = seed || `${Date.now()}-${Math.random()}`;
    const rand = seededRandom(s);

    const names = nameBank[race]?.[gender] || nameBank.Human.Male;
    const firstName = pick(names, rand);
    const surnames: Record<string, string[]> = {
        Human: ["Thornwood", "Ashford", "Blackwell", "Ironhold", "Stormwind", "Brightwater", "Darkhollow", "Goleli", "Hawthorne", "Redfield"],
        Elf: ["Starweaver", "Moonwhisper", "Dawnlight", "Nightbreeze", "Silverleaf", "Greenmantle", "Sunfire", "Mistwalker", "Windrunner", "Starfall"],
        "Half-Elf": ["Dawnwhisper", "Stormborne", "Moonvale", "Greenbough", "Brightwind", "Shadowmere", "Oakenheart", "Rivermist", "Thornfield", "Wildbloom"],
        Dwarf: ["Ironforge", "Stonemantle", "Embervein", "Alebeard", "Runechisel", "Deepdelver", "Goldpick", "Hammerfist", "Coppervein", "Steelshield"],
        Halfling: ["Thistledown", "Bramblefoot", "Quickfoot", "Copperkettle", "Greenhill", "Underbough", "Tealeaf", "Goodbarrel", "Hilltopple", "Thorngage"],
        Gnome: ["Cogsworth", "Gemheart", "Tinkerblast", "Bottlewick", "Sparkwhistle", "Nackle", "Beren", "Garrick", "Timbers", "Scheppen"],
        "Half-Orc": ["Ironfang", "Halfblood", "Skullsplitter", "Gentlehand", "Bonecrusher", "Stonefist", "Thunderstrike", "Ashwalker", "Warborn", "Steelblood"],
        Tiefling: ["Emberheart", "Shadowborn", "Vex", "Nighthollow", "Ashenmire", "Duskmantle", "Hellbrand", "Soulfire", "Thornblood", "Grimscar"],
        Dragonborn: ["Argentscale", "Flamescale", "Ironmaw", "Stormbreath", "Ashwalker", "Brightclaw", "Goldscale", "Thunderjaw", "Wyrmkin", "Blazecrest"],
        Aasimar: ["Dawnshield", "Nightfall", "Sunsong", "Emberwing", "Lightbringer", "Starborne", "Gracewind", "Heavensent", "Radiantfall", "Divinemark"],
        Goblin: ["the Resourceful", "Boomfizzle", "Quickfingers", "Sharpear", "Ironteeth", "the Clever", "Fastfoot", "Shinycatcher", "the Bold", "Nailbiter"],
    };
    const surname = pick(surnames[race] || surnames.Human, rand);
    const name = race === "Goblin" && rand() > 0.5 ? `${firstName} ${surname}` : `${firstName} ${surname}`;

    const cls = pick(classesByRole[role] || classesByRole.Neutral, rand);
    const personality = pickN(personalityTraits, 3, rand);
    const motivation = pick(motivations[role] || motivations.Neutral, rand);
    const secret = pick(secretTemplates, rand);
    const appearance = pick(appearanceTemplates[race] || appearanceTemplates.Human, rand);
    const cr = role === "Antagonist" ? Math.floor(rand() * 10) + 3
        : role === "Ally" ? Math.floor(rand() * 6) + 2
            : role === "Quest Giver" ? Math.floor(rand() * 5) + 1
                : Math.floor(rand() * 4) + 1;

    const dt = dialogueTemplates[role] || dialogueTemplates.Neutral;
    const dialogue = {
        greeting: pick(dt.greeting, rand),
        quest: pick(dt.quest, rand),
        farewell: pick(dt.farewell, rand),
    };

    return {
        id: `generated-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        name, race, role, class: cls, appearance, personality, motivation, secret, cr, dialogue,
        saved: false,
    };
}

/* ─── LocalStorage ─── */
const STORAGE_KEY = "dnd-saved-npcs";

function loadSavedNPCs(): NPC[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveSavedNPCs(npcs: NPC[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(npcs));
}

/* ═══════════════════════════════════════ */
/*            COMPONENT                    */
/* ═══════════════════════════════════════ */
export default function NPCsPage() {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [raceFilter, setRaceFilter] = useState("All");
    const [selectedNPC, setSelectedNPC] = useState<string | null>(null);
    const [savedNPCs, setSavedNPCs] = useState<NPC[]>([]);
    const [showGenerator, setShowGenerator] = useState(false);
    const [genRace, setGenRace] = useState("Human");
    const [genGender, setGenGender] = useState("Male");
    const [genRole, setGenRole] = useState("Ally");
    const [generatedNPC, setGeneratedNPC] = useState<NPC | null>(null);
    const [sessionToast, setSessionToast] = useState<string | null>(null);

    // Load saved NPCs on mount
    useEffect(() => {
        setSavedNPCs(loadSavedNPCs());
    }, []);

    // Combine base + saved
    const allNPCs: NPC[] = [
        ...npcsData.map((n) => ({ ...n, saved: false } as NPC)),
        ...savedNPCs.map((n) => ({ ...n, saved: true })),
    ];

    const filtered = allNPCs.filter((npc) => {
        const matchesSearch =
            npc.name.toLowerCase().includes(search.toLowerCase()) ||
            npc.personality.some((p) =>
                p.toLowerCase().includes(search.toLowerCase())
            );
        const matchesRole = roleFilter === "All" || npc.role === roleFilter;
        const matchesRace = raceFilter === "All" || npc.race === raceFilter;
        return matchesSearch && matchesRole && matchesRace;
    });

    const activeNPC = allNPCs.find((n) => n.id === selectedNPC);

    const randomNPC = () => {
        const random = allNPCs[Math.floor(Math.random() * allNPCs.length)];
        setSelectedNPC(random.id);
    };

    const handleGenerate = useCallback(() => {
        const npc = generateNPC(genRace, genGender, genRole);
        setGeneratedNPC(npc);
    }, [genRace, genGender, genRole]);

    const handleSaveGenerated = useCallback(() => {
        if (!generatedNPC) return;
        const toSave = { ...generatedNPC, saved: true };
        const updated = [...savedNPCs, toSave];
        setSavedNPCs(updated);
        saveSavedNPCs(updated);
        setGeneratedNPC(null);
        setShowGenerator(false);
        setSelectedNPC(toSave.id);
    }, [generatedNPC, savedNPCs]);

    const handleDeleteSaved = useCallback((id: string) => {
        const updated = savedNPCs.filter((n) => n.id !== id);
        setSavedNPCs(updated);
        saveSavedNPCs(updated);
        if (selectedNPC === id) setSelectedNPC(null);
    }, [savedNPCs, selectedNPC]);

    const showToast = useCallback((msg: string) => {
        setSessionToast(msg);
        setTimeout(() => setSessionToast(null), 2000);
    }, []);

    const addNPCToSession = useCallback((npc: NPC) => {
        const added = addSessionItem({
            id: npc.id,
            type: "npc",
            name: npc.name,
            detail: `${npc.race} · ${npc.role} · ${npc.class}`,
        });
        showToast(added ? `✅ ${npc.name} added to session plan` : `⚠️ ${npc.name} already in session plan`);
    }, [showToast]);

    return (
        <div className="page-content">
            <div className="container">
                {/* Toast */}
                {sessionToast && (
                    <div className={styles.toast}>{sessionToast}</div>
                )}

                <div className="page-header">
                    <h1>🧙 NPC Library</h1>
                    <p className="subtitle">
                        {allNPCs.length} characters with personalities, secrets, and
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
                        <button
                            className={`btn ${styles.generateBtn}`}
                            onClick={() => { setShowGenerator(!showGenerator); setGeneratedNPC(null); }}
                        >
                            ✨ Generate NPC
                        </button>
                    </div>
                </div>

                {/* ─── Generator Panel ─── */}
                {showGenerator && (
                    <div className={styles.generatorPanel}>
                        <div className={styles.generatorHeader}>
                            <h3>✨ NPC Generator</h3>
                            <button className={styles.generatorClose} onClick={() => setShowGenerator(false)}>✕</button>
                        </div>
                        <div className={styles.generatorForm}>
                            <div className={styles.formGroup}>
                                <label>Race</label>
                                <select className="select" value={genRace} onChange={(e) => setGenRace(e.target.value)}>
                                    {ALL_RACES.map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Gender</label>
                                <select className="select" value={genGender} onChange={(e) => setGenGender(e.target.value)}>
                                    {genders.map((g) => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Role</label>
                                <select className="select" value={genRole} onChange={(e) => setGenRole(e.target.value)}>
                                    {roles.filter((r) => r !== "All").map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <button className={`btn btn-primary ${styles.genBtn}`} onClick={handleGenerate}>
                                🎲 Generate
                            </button>
                        </div>

                        {/* Generated NPC Preview */}
                        {generatedNPC && (
                            <div className={styles.generatedPreview}>
                                <div className={styles.previewHeader}>
                                    <h4>{generatedNPC.name}</h4>
                                    <span className={`badge ${roleColors[generatedNPC.role] || "badge-gold"}`}>
                                        {generatedNPC.role}
                                    </span>
                                </div>
                                <p className={styles.npcMeta}>
                                    {generatedNPC.race} · {generatedNPC.class} · CR {generatedNPC.cr}
                                </p>
                                <p className={styles.npcDesc}>{generatedNPC.appearance}</p>
                                <div className={styles.traits}>
                                    {generatedNPC.personality.map((t) => (
                                        <span key={t} className={styles.trait}>{t}</span>
                                    ))}
                                </div>
                                <p style={{ marginTop: "12px", fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
                                    <strong>Motivation:</strong> {generatedNPC.motivation}
                                </p>
                                <div className={styles.previewActions}>
                                    <button className={`btn btn-primary`} onClick={handleSaveGenerated}>
                                        💾 Save to Library
                                    </button>
                                    <button className={`btn btn-secondary`} onClick={handleGenerate}>
                                        🔄 Reroll
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.layout}>
                    {/* NPC List */}
                    <div className={styles.grid}>
                        {filtered.map((npc) => (
                            <button
                                key={npc.id}
                                className={`${styles.npcRow} ${selectedNPC === npc.id ? styles.selected : ""}`}
                                onClick={() => setSelectedNPC(npc.id)}
                            >
                                <div className={styles.npcRowInfo}>
                                    <span className={styles.npcRowName}>{npc.name}</span>
                                    <span className={styles.npcRowMeta}>{npc.race} · {npc.class}</span>
                                </div>
                                <div className={styles.npcRowBadges}>
                                    {npc.saved && <span className={styles.savedBadge}>SAVED</span>}
                                    <span className={`badge ${roleColors[npc.role] || "badge-gold"}`}>
                                        {npc.role}
                                    </span>
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
                                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                        {activeNPC.saved && <span className={styles.savedBadge}>SAVED</span>}
                                        <span className={`badge ${roleColors[activeNPC.role] || "badge-gold"}`}>
                                            {activeNPC.role}
                                        </span>
                                    </div>
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
                                    className={styles.addSessionBtn}
                                    onClick={() => addNPCToSession(activeNPC)}
                                >
                                    📋 Add to Session Planner
                                </button>

                                <div style={{ display: "flex", gap: "8px" }}>
                                    {activeNPC.saved && (
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDeleteSaved(activeNPC.id)}
                                        >
                                            🗑️ Delete
                                        </button>
                                    )}
                                    <button
                                        className={styles.closeBtn}
                                        onClick={() => setSelectedNPC(null)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
