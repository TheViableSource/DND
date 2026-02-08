/* ─── Session Planner NPC Generator ─── */

const firstNames: Record<string, string[]> = {
    Human: ["Aldric", "Brenna", "Cedric", "Elara", "Gareth", "Helena", "Jareth", "Kara", "Lorcan", "Mira", "Nolan", "Sylva", "Theron", "Vera", "Willem"],
    Elf: ["Aelindra", "Caelynn", "Daeris", "Elyndra", "Faenor", "Galathil", "Ithilwen", "Lirael", "Maelis", "Naerys", "Orinath", "Quelenna", "Raelan", "Sylvara", "Thalion"],
    Dwarf: ["Balin", "Dagny", "Dural", "Greta", "Grumbar", "Helga", "Kildrak", "Mogra", "Rurik", "Sigrun", "Thoradin", "Ulfhild", "Vondal", "Yurga", "Zarnak"],
    Halfling: ["Bramble", "Cade", "Delia", "Eldon", "Finnan", "Ivy", "Jory", "Lidda", "Milo", "Nissa", "Osborn", "Pip", "Rosie", "Seraphina", "Wendel"],
    "Half-Elf": ["Aric", "Brielle", "Darion", "Elowen", "Faelan", "Giselle", "Ivor", "Lyria", "Miriel", "Niall", "Ravenna", "Soren", "Talisa", "Varen", "Zariel"],
    "Half-Orc": ["Borka", "Drog", "Fenrath", "Grukk", "Ilka", "Karg", "Luthak", "Mogra", "Narg", "Orla", "Ragash", "Shala", "Tusk", "Urzog", "Varka"],
    Tiefling: ["Amnon", "Bryseis", "Criella", "Damakos", "Euphoria", "Ghesh", "Iridos", "Kallista", "Lerissa", "Mordai", "Nemeia", "Orianna", "Pelaios", "Rieta", "Zariel"],
    Dragonborn: ["Arjhan", "Balasar", "Donaar", "Farideh", "Ghesh", "Heskan", "Kriv", "Medrash", "Nala", "Pandjed", "Rhogar", "Sora", "Torinn", "Vishara", "Yorin"],
    Gnome: ["Bimble", "Calx", "Dimble", "Ellywick", "Fizzle", "Gimble", "Kelwick", "Lilli", "Namfoodle", "Oda", "Pebble", "Quink", "Scheppen", "Tink", "Warryn"],
    Aasimar: ["Arael", "Ceriel", "Dawneth", "Elyon", "Galiel", "Haziel", "Imara", "Jophiel", "Kariel", "Lumiel", "Radiel", "Sariel", "Tamiel", "Uriel", "Zahriel"],
};

const lastNames: Record<string, string[]> = {
    Human: ["Ashford", "Blackwood", "Crowley", "Dunmore", "Everhart", "Greystone", "Hawthorne", "Ironwood", "Kingsley", "Lockwood", "Nightingale", "Ravenscroft", "Stormwind", "Thornwood", "Winterbourne"],
    Elf: ["Amastacia", "Brightmoon", "Galanodel", "Holimion", "Ilphelkiir", "Liadon", "Meliamne", "Naïlo", "Siannodel", "Starweaver", "Sylvaranth", "Willowshade", "Xiloscient", "Moonwhisper", "Dawnstrider"],
    Dwarf: ["Battlehammer", "Boulderhelm", "Deepdelver", "Fireforge", "Goldanvil", "Ironfist", "Mithrilbeard", "Rockhammer", "Stonebreaker", "Thundershield", "Ungart", "Anvilthorn", "Copperkettle", "Granitepeak", "Oakenshield"],
    Halfling: ["Bramblefoot", "Goodbarrel", "Greenleaf", "Hilltopple", "Leagallow", "Merryweather", "Nimblefingers", "Stoutbridge", "Tealeaf", "Thorngage", "Tosscobble", "Underbough", "Warmwater", "Willowemere", "Bigheart"],
    "Half-Elf": ["Brightwater", "Duskwalker", "Evenstar", "Greyfell", "Moonblade", "Nightwhisper", "Ravensong", "Silverwind", "Starfall", "Stormrider", "Thornheart", "Wildmere", "Dawncaller", "Frostleaf", "Ashborne"],
    "Half-Orc": ["Bloodfist", "Crushbone", "Deathgrip", "Goretusk", "Ironjaw", "Skullsplitter", "Thunderfang", "Warbringer", "Bonecrusher", "the Fierce", "Darktooth", "Grimjaw", "Ashbane", "Steelclaw", "Stormrage"],
    Tiefling: ["Ashmore", "Duskborn", "Emberheart", "Glasya", "Infernus", "Noctis", "Shadowmere", "Thornblood", "Voidwalker", "Demonsbane", "Hellstrom", "Nightfire", "Soulforge", "the Branded", "Grimshaw"],
    Dragonborn: ["Clethtinthiallor", "Daardendrian", "Delmirev", "Drachedandion", "Kimbatuul", "Linxakasendalor", "Myastan", "Nemmonis", "Norixius", "Ophinshtalajiir", "Prexijandilin", "Shestendeliath", "Turnuroth", "Verthisathurgiesh", "Yarjerit"],
    Gnome: ["Beren", "Daergel", "Folkor", "Garrick", "Nackle", "Ningel", "Raulnor", "Scheppen", "Timbers", "Turen", "Zook", "Fizzlebang", "Sparkwhistle", "Cogsworth", "Tinkertop"],
    Aasimar: ["Brightborn", "Dawnbringer", "Gracewind", "Heavensent", "Lightblade", "Radiance", "Solaris", "Starborn", "Sunweaver", "the Blessed", "Divineheart", "Glorywing", "Holyfire", "Purelight", "Wisdomkeeper"],
};

const classesByRole: Record<string, string[]> = {
    Ally: ["Fighter", "Ranger", "Cleric", "Bard", "Monk", "Druid", "Paladin", "Artificer", "Healer", "Scout", "Blacksmith", "Herbalist", "Guide"],
    Antagonist: ["Warlock", "Necromancer", "Assassin", "Crime Lord", "Cultist", "Dark Knight", "Bandit Captain", "Tyrant", "Mad Wizard", "Corrupt Noble", "Spy", "Demon Worshiper"],
    "Quest Giver": ["Noble", "Mayor", "Sage", "Merchant", "Guild Master", "Scholar", "Innkeeper", "Priest", "Commander", "Oracle", "Elder", "Diplomat"],
    Neutral: ["Merchant", "Innkeeper", "Wanderer", "Hermit", "Artisan", "Farmer", "Sailor", "Barkeep", "Fortune Teller", "Traveling Performer", "Alchemist", "Beast Tamer"],
};

const personalitiesByRole: Record<string, string[][]> = {
    Ally: [
        ["Loyal", "Brave", "Protective"],
        ["Warm-hearted", "Generous", "Quick to laugh"],
        ["Cautious", "Strategic", "Reliable"],
        ["Enthusiastic", "Reckless", "Gold-hearted"],
        ["Quiet", "Observant", "Deadly when provoked"],
        ["Compassionate", "Wise beyond years", "Self-sacrificing"],
        ["Gruff exterior", "Deeply caring", "Hates injustice"],
        ["Optimistic", "Resourceful", "Never gives up"],
    ],
    Antagonist: [
        ["Cunning", "Ruthless", "Charismatic"],
        ["Paranoid", "Brilliant", "Cruel"],
        ["Cold", "Calculating", "Patient"],
        ["Megalomaniac", "Theatrical", "Vain"],
        ["Sadistic", "Intelligent", "Unpredictable"],
        ["Charming on the surface", "Manipulative", "Completely amoral"],
        ["Fanatical", "Unshakeable conviction", "Sees themselves as righteous"],
        ["Eerily calm", "Methodical", "Enjoys watching others suffer"],
    ],
    "Quest Giver": [
        ["Desperate", "Honest", "Slightly paranoid"],
        ["Commanding", "Fair", "Burdened by responsibility"],
        ["Mysterious", "Knowledgeable", "Speaks in riddles"],
        ["Friendly", "Gossipy", "Knows everyone's secrets"],
        ["Stern", "Principled", "Secretly compassionate"],
        ["Eccentric", "Brilliant", "Easily distracted"],
        ["Weary", "Reluctant leader", "Haunted by the past"],
        ["Formal", "Precise", "Expects the best from everyone"],
    ],
    Neutral: [
        ["Wary of strangers", "Fair dealer", "Practical"],
        ["Jovial", "Talkative", "Loves a good story"],
        ["Grumpy", "Set in their ways", "Secretly kind"],
        ["Curious", "Easily impressed", "Naive"],
        ["Shrewd", "Opportunistic", "Not malicious"],
        ["World-weary", "Philosophical", "Has seen everything"],
        ["Shy", "Talented", "Underestimated by everyone"],
        ["Loud", "Boisterous", "Life of the party"],
    ],
};

const motivationsByRole: Record<string, string[]> = {
    Ally: [
        "Repay a life debt and protect those who once saved them",
        "Seek redemption for a past failure that cost innocent lives",
        "Find and protect their lost family members",
        "Prove their worth after being exiled from their homeland",
        "Fulfill a sacred oath sworn to a dying mentor",
        "Build a safe haven for refugees fleeing the conflict",
        "Uncover the truth about their mysterious parentage",
        "Master their craft to become the greatest in their field",
    ],
    Antagonist: [
        "Gain immortality through forbidden magic at any cost",
        "Avenge a loved one's death by destroying the system that killed them",
        "Seize absolute power to 'fix' the broken world",
        "Complete a dark ritual that will reshape reality itself",
        "Prove their superiority over those who once mocked them",
        "Serve a dark patron's inscrutable goals in exchange for power",
        "Amass enough wealth and influence to topple the kingdom",
        "Unleash an ancient evil they believe will cleanse the world",
    ],
    "Quest Giver": [
        "Protect their community from an emerging existential threat",
        "Recover an artifact stolen from their order before it's misused",
        "Find adventurers capable of solving a problem beyond their abilities",
        "Fulfill a prophecy they've spent their entire life preparing for",
        "Prevent a war that will engulf the entire region",
        "Uncover corruption within their own organization",
        "Secure resources to rebuild after a devastating catastrophe",
        "Complete life's work before a terminal illness takes them",
    ],
    Neutral: [
        "Simply survive and make an honest living in dangerous times",
        "Save enough money to start a new life somewhere safer",
        "Find a rare ingredient or item for a personal project",
        "Pass along a message or item to someone the party might encounter",
        "Maintain neutrality in a conflict that pressures them to pick a side",
        "Uncover the fate of a friend who vanished under mysterious circumstances",
        "Pursue a hobby or passion that occasionally intersects with adventure",
        "Keep their head down and avoid drawing attention from powerful forces",
    ],
};

const secretsByRole: Record<string, string[]> = {
    Ally: [
        "They're actually under a curse that will eventually turn them against the party",
        "They're reporting the party's movements to a third party — for what they believe is a good reason",
        "They possess a hidden power they're terrified of unleashing",
        "They're the last survivor of a destroyed order and powerful enemies are hunting them",
        "They committed a crime in their past that would destroy their reputation if revealed",
        "They're not who they claim to be — their identity is stolen from a dead person",
    ],
    Antagonist: [
        "They were once a hero who was corrupted by a cursed artifact",
        "They're being controlled or blackmailed by an even more powerful entity",
        "Their 'evil' plan is actually a misguided attempt to prevent something worse",
        "They know the party personally — from a past the party doesn't remember",
        "They're dying, and their villainy is a desperate bid to survive",
        "They have a hidden weakness: someone they still love and would do anything to protect",
    ],
    "Quest Giver": [
        "They caused the problem they're asking the party to solve",
        "The reward they're offering was stolen from someone else",
        "They're testing the party for a much larger, more dangerous mission",
        "They know far more about the situation than they're revealing",
        "They're actually a disguised member of a powerful secret society",
        "They've sent others on this quest before — none have returned",
    ],
    Neutral: [
        "They're a retired adventurer with powerful gear hidden away",
        "They witnessed something crucial but are too scared to speak up",
        "They're an informant for the local thieves' guild",
        "They have a magical ability they keep hidden from everyone",
        "They know the location of a valuable treasure but can't retrieve it alone",
        "They're in massive debt to a dangerous crime lord",
    ],
};

const dialogueTemplates: Record<string, { greeting: string[]; quest: string[]; farewell: string[] }> = {
    Ally: {
        greeting: [
            "Finally, someone who looks like they can handle themselves. I've been waiting for help.",
            "You must be the ones they told me about. I'm glad you're here — we don't have much time.",
            "Well met, friends. I've heard tales of your deeds. Perhaps we can help each other.",
        ],
        quest: [
            "I can't do this alone. I've tried — believe me. But together, we might have a chance.",
            "There's something dark stirring, and I need people I can trust at my back. Are you in?",
            "I have information that could change everything, but I need your protection to act on it.",
        ],
        farewell: [
            "Watch your backs out there. I'll hold down things here and keep my ear to the ground.",
            "May fortune favor us both. I'll be here when you return — no matter what.",
            "Stay safe. And remember — if things go sideways, you can count on me.",
        ],
    },
    Antagonist: {
        greeting: [
            "Ah, the famous adventurers. I've been expecting you. Please, sit — let's be civilized about this.",
            "You're persistent, I'll give you that. Most would have turned back by now.",
            "How delightful. I do so enjoy company. Tell me — did you come to talk, or to die?",
        ],
        quest: [
            "You think you understand what's happening here? You don't understand the half of it.",
            "I could destroy you where you stand, but I'm curious — what do you think you'll accomplish?",
            "Consider this: we want the same thing. We just disagree on methods. Perhaps we can... negotiate.",
        ],
        farewell: [
            "Run along, little heroes. Next time we meet, I won't be so... generous.",
            "This isn't over. Not by a long shot. Enjoy your small victory while it lasts.",
            "Remember my face. You'll be seeing it again in your nightmares.",
        ],
    },
    "Quest Giver": {
        greeting: [
            "Thank the gods you're here. I've been waiting for someone brave enough to help.",
            "Adventurers! Perfect timing. I have a proposition that could benefit us both.",
            "Please, come in. I need to speak with you about a matter of some urgency.",
        ],
        quest: [
            "The situation is dire. People are counting on us, and we're running out of options.",
            "I need you to do something for me — something I can't trust to just anyone.",
            "This task won't be easy, and I won't pretend otherwise. But the reward will be worth the risk.",
        ],
        farewell: [
            "Go with care. And if you find anything unusual... bring it to me first.",
            "I'll prepare things on my end. Come back when it's done — we'll settle up then.",
            "May the gods guide your path. The fate of many rests on your shoulders now.",
        ],
    },
    Neutral: {
        greeting: [
            "What can I do for you? I'm a busy person, so make it quick.",
            "Strangers, eh? We don't get many of your sort around here. What brings you?",
            "Welcome, welcome! Always nice to see new faces. Can I interest you in anything?",
        ],
        quest: [
            "I don't want any trouble, but I might know something that could help you. For a price.",
            "I overheard something the other night. Could be nothing, could be everything. You decide.",
            "Look, I mind my own business usually, but this affects everyone. Even me.",
        ],
        farewell: [
            "Good luck out there. Don't mention my name to anyone — I have a reputation to maintain.",
            "Stop by again sometime. I'll keep my ears open for anything useful.",
            "Try not to get yourselves killed. Bad for business when my best customers disappear.",
        ],
    },
};

const races = ["Human", "Elf", "Dwarf", "Halfling", "Half-Elf", "Half-Orc", "Tiefling", "Dragonborn", "Gnome", "Aasimar"];

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

const appearanceTemplates = [
    "A weathered figure with sharp eyes and calloused hands, carrying themselves with quiet confidence.",
    "Lean and wiry, with an intense gaze that seems to see right through you. A faded scar runs along one cheek.",
    "Tall and imposing, dressed in practical traveling clothes. Their voice carries natural authority.",
    "A compact figure with keen, watchful eyes and an easy smile that doesn't quite reach them.",
    "Broad-shouldered with sun-darkened skin, they move with the deliberate grace of someone used to danger.",
    "Slight of build but radiating an unmistakable aura of power. Their robes are immaculate.",
    "Grizzled and battle-scarred, with silver streaking their hair. They walk with a slight limp.",
    "Youthful but serious, with ink-stained fingers and an ever-present leather journal at their hip.",
    "Imposing presence, draped in rich fabrics and adorned with subtle but expensive jewelry.",
    "Wiry and restless, always fidgeting with something. Their eyes dart constantly, missing nothing.",
    "Stocky and strong, with a booming voice and a hearty laugh. Smells faintly of wood smoke.",
    "Elegant and poised, with an aristocratic bearing. Speaks softly but commands attention effortlessly.",
];

export interface GeneratedNPC {
    id: string;
    name: string;
    race: string;
    role: string;
    class: string;
    appearance: string;
    personality: string[];
    motivation: string;
    secret: string;
    dialogue: { greeting: string; quest: string; farewell: string };
}

export function generateNPC(role: string): GeneratedNPC {
    const race = pick(races);
    const raceFirstNames = firstNames[race] || firstNames.Human;
    const raceLastNames = lastNames[race] || lastNames.Human;
    const name = `${pick(raceFirstNames)} ${pick(raceLastNames)}`;
    const cls = pick(classesByRole[role] || classesByRole.Neutral);
    const personality = pick(personalitiesByRole[role] || personalitiesByRole.Neutral);
    const motivation = pick(motivationsByRole[role] || motivationsByRole.Neutral);
    const secret = pick(secretsByRole[role] || secretsByRole.Neutral);
    const dlg = dialogueTemplates[role] || dialogueTemplates.Neutral;

    return {
        id: `gen-npc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        race,
        role,
        class: cls,
        appearance: pick(appearanceTemplates),
        personality,
        motivation,
        secret,
        dialogue: {
            greeting: pick(dlg.greeting),
            quest: pick(dlg.quest),
            farewell: pick(dlg.farewell),
        },
    };
}

export const NPC_ROLES = ["Ally", "Antagonist", "Quest Giver", "Neutral"] as const;
