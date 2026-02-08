/* ─── Session Planner Random Content Tables ─── */
/* Combines curated entries with procedural template generation for near-unlimited variety */

/* Pick a random item from an array */
export function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/* ─── Building Blocks for Procedural Generation ─── */

const villains = ["a necromancer", "a vampire lord", "a corrupt noble", "a bandit king", "a demon cultist", "a rogue wizard", "a dark elf assassin", "a tyrannical warlord", "an ancient lich", "a hag coven", "a psionic devourer", "a serpentfolk priestess", "a death knight", "an aboleth"];
const mcguffins = ["a legendary sword", "a dragon egg", "a cursed amulet", "an ancient scroll", "a lost crown", "a divine relic", "a corrupted gemstone", "a forbidden tome", "a sealed phylactery", "a celestial compass", "a planar key", "an enchanted mirror", "a soulstone", "a dwarven war hammer"];
const locations_pool = ["the abandoned mines", "a haunted forest", "the capital city", "the mountain pass", "an ancient temple", "the coastal cliffs", "a frozen wasteland", "the underdark tunnels", "a floating island", "the desert ruins", "a volcanic island", "the feywild crossing", "a sunken city", "the shadowfell border"];
const creatures = ["goblins", "wolves", "undead", "bandits", "trolls", "orcs", "giant spiders", "wraiths", "elementals", "wyverns", "gnolls", "kobolds", "harpies", "merfolk", "ettercaps", "gargoyles"];
const moods = ["eerie", "tense", "festive", "somber", "chaotic", "mystical", "foreboding", "peaceful", "desperate", "triumphant"];
const npcs_pool = ["a desperate innkeeper", "a mysterious stranger", "a wounded soldier", "a cunning merchant", "a frightened child", "an eccentric wizard", "a battle-scarred veteran", "a temple priest", "a street urchin", "a traveling bard", "a retired adventurer", "a hooded figure", "a ghost", "a fairy messenger"];
const events = ["a kidnapping", "an invasion", "a natural disaster", "a political coup", "a plague outbreak", "an assassination attempt", "a magical anomaly", "a prison break", "a divine omen", "a territorial dispute", "a tournament", "a betrayal within the ranks", "an unexplained disappearance", "a celestial event"];
const twistModifiers = ["is actually an illusion created by", "has been orchestrated by", "was predicted by", "is closely tied to the party's past because of", "is a cover for", "is being used to distract from", "was started by", "connects to an ancient prophecy about", "is the final step in a plan by"];

/* ─── Summaries (curated + procedural) ─── */
const curatedSummaries = [
    "The party discovers a hidden entrance to an ancient dwarven forge beneath the city",
    "A mysterious plague sweeps through town and the party must find the source",
    "An old ally sends a desperate plea for help — their village is under siege",
    "A portal to the Feywild opens in the market square, causing widespread chaos",
    "The party is hired to escort a dangerous prisoner across hostile territory",
    "A dragon's hoard has been discovered, and every faction wants a piece",
    "Strange nightmares plague the town — something hunts in dreams",
    "The party stumbles upon a cult performing a ritual in the sewers",
    "A beloved NPC has gone missing and foul play is suspected",
    "An ancient artifact surfaces at auction, drawing dangerous attention",
    "The dead walk in the cemetery — a necromancer has taken root nearby",
    "A noble challenges the party to clear their family's cursed manor",
    "War is coming — the party must secure an alliance before the army arrives",
    "A heist gone wrong forces the party to improvise their escape",
    "Fey creatures emerge from the forest, demanding the return of a stolen relic",
    "The party's base of operations is attacked while they're away",
    "A traveling merchant sells a map to a legendary lost city",
    "The king's advisor is revealed to be a shapeshifter — but which one?",
    "Earthquakes reveal tunnels beneath the city filled with aberrations",
    "A festival turns deadly when assassins strike during the celebration",
    "Refugees arrive at the gates with tales of a monster that razed their village",
    "An infamous pirate offers a truce and a treasure map — with strings attached",
    "A wizard's experiment goes wrong, merging two planes of existence in the area",
    "The party wakes up in a pocket dimension with no memory of how they arrived",
    "A renowned hero is accused of a crime, and the party must prove their innocence",
    "The local thieves' guild declares war on the city guard — both sides want the party's help",
    "A massive sinkhole swallows a city block, revealing buried ruins below",
    "An oracle predicts the party's death — and everything starts lining up",
    "A rival adventuring party steals the party's quest reward and disappears",
    "The party discovers their employer is a disguised fiend seeking mortal agents",
];

function generateProcSummary(): string {
    const templates = [
        () => `The party must stop ${pick(villains)} from obtaining ${pick(mcguffins)} hidden in ${pick(locations_pool)}`,
        () => `${pick(npcs_pool).charAt(0).toUpperCase() + pick(npcs_pool).slice(1)} approaches the party with urgent news about ${pick(events)} in ${pick(locations_pool)}`,
        () => `While traveling through ${pick(locations_pool)}, the party encounters ${pick(creatures)} guarding ${pick(mcguffins)}`,
        () => `${pick(events).charAt(0).toUpperCase() + pick(events).slice(1)} disrupts the region, and ${pick(villains)} is suspected of being behind it`,
        () => `The party is drawn into ${pick(events)} when they discover ${pick(mcguffins)} was stolen from ${pick(locations_pool)}`,
        () => `A ${pick(moods)} atmosphere settles over ${pick(locations_pool)} as ${pick(creatures)} begin acting strangely`,
    ];
    return pick(templates)();
}

export const randomSummaries = curatedSummaries;
export function getRandomSummary(): string {
    return Math.random() < 0.5 ? pick(curatedSummaries) : generateProcSummary();
}

/* ─── Goals (curated + procedural) ─── */
const curatedGoals = [
    "Discover the identity of the mysterious benefactor pulling strings behind the scenes",
    "Retrieve the stolen artifact before it can be used to open the sealed gate",
    "Survive the ambush and interrogate a captured enemy for intel",
    "Negotiate a truce between two warring factions before the region burns",
    "Clear out the dungeon and claim the magical item hidden in the final chamber",
    "Escort the VIP safely through the dangerous mountain pass",
    "Uncover the mole within the organization who's been leaking information",
    "Perform the ritual to seal the rift before more creatures pour through",
    "Win the tournament to earn the trust of the local commander",
    "Map the unexplored cave network and report back to the guild",
    "Rescue the hostages before the kidnappers' deadline expires",
    "Convince the dragon to leave the settlement peacefully — or fight it",
    "Solve the three riddles to unlock the vault and claim the reward",
    "Defeat the bandit leader and liberate the occupied village",
    "Gather ingredients for a powerful potion the party desperately needs",
    "Infiltrate the enemy stronghold and sabotage their defenses from within",
    "Survive the night in the cursed location and discover what haunts it",
    "Forge an alliance with the reclusive faction before the enemy does",
    "Track the creature to its lair and eliminate it before it strikes again",
    "Break the curse affecting the town by finding the source of the dark magic",
    "Deliver the sealed message to the contact in the next city before the deadline",
    "Discover why the local wildlife has turned hostile and restore balance",
    "Retrieve the prisoner from the dungeon without alerting the guards",
    "Find and close the portal before more extraplanar creatures come through",
    "Investigate the disappearances in the district and bring the responsible party to justice",
];

function generateProcGoal(): string {
    const templates = [
        () => `Find ${pick(mcguffins)} before ${pick(villains)} can use it to trigger ${pick(events)}`,
        () => `Protect ${pick(npcs_pool)} from ${pick(creatures)} while traveling through ${pick(locations_pool)}`,
        () => `Investigate ${pick(events)} in ${pick(locations_pool)} and determine if ${pick(villains)} is involved`,
        () => `Reach ${pick(locations_pool)} and secure ${pick(mcguffins)} before anyone else can claim it`,
        () => `Survive the encounter with ${pick(creatures)} and gather evidence of ${pick(villains)}'s involvement`,
    ];
    return pick(templates)();
}

export const randomGoals = curatedGoals;
export function getRandomGoal(): string {
    return Math.random() < 0.5 ? pick(curatedGoals) : generateProcGoal();
}

/* ─── Opening Scenes ─── */
export const randomOpeningScenes = [
    "You awaken to the sound of alarm bells. Through the window, you see orange flames licking at the eastern quarter of the city. Smoke curls into a blood-red sky as shouts echo through the streets below.",
    "The tavern falls silent as the door swings open. A figure stumbles in, armor dented and covered in mud, and collapses at your feet. With their last breath, they press a sealed letter into your hands.",
    "Rain hammers the cobblestones as your wagon rumbles to a halt. The bridge ahead has collapsed into the swollen river below. Lightning reveals shapes moving in the treeline on either side of the road.",
    "The festival is in full swing — music, laughter, the smell of roasting meat. But something feels wrong. You notice hooded figures moving through the crowd, positioning themselves at every exit.",
    "Dawn breaks over the battlefield. The enemy camp is quiet — too quiet. As you creep forward through the morning mist, you realize the tents are empty. They knew you were coming.",
    "The market square bustles with its usual chaos, but today there's an unusual addition: a cage in the center, draped in black cloth. Whatever's inside growls and rattles the bars. A crowd is gathering.",
    "The ship lurches violently as another wave crashes over the deck. Through the spray, you glimpse it — an island that shouldn't exist, wreathed in unnatural fog, its shores glowing with pale blue light.",
    "You descend the final staircase and emerge into a vast underground chamber. Bioluminescent moss casts everything in eerie green light. In the center, an enormous stone door covered in ancient runes hums with power.",
    "The council chamber is tense. The queen slams her fist on the table — 'Three villages burned. Three! And not a single survivor to tell us what happened.' She turns to you. 'You're my last option.'",
    "The road through the forest has grown unnaturally dark despite it being midday. The trees here are twisted, their bark black as coal. Your horses refuse to go further, snorting and stamping nervously.",
    "You open your eyes and find yourselves in a place that shouldn't exist — a library that stretches infinitely in every direction, its shelves filled with books that whisper your names.",
    "The prison door creaks open. The prisoner inside looks up and smiles knowingly. 'Took you long enough. Now, shall I tell you why you're really here?'",
    "A long caravan snakes through the desert heat. The merchant leading it suddenly stops, pointing at the horizon. 'That city... it wasn't there yesterday.'",
    "You find yourselves standing at the edge of an enormous crater. At its center, something pulses with arcane energy. The map you were given shows this place as nothing but empty grassland.",
    "The clock tower strikes thirteen. Everyone in the village freezes mid-motion — everyone except you. In the sudden silence, you hear footsteps approaching from every direction.",
    "Snow falls gently as you approach the abandoned monastery. Through the frost-covered windows, candlelight flickers. Someone — or something — has taken up residence.",
    "The auction house is packed with the wealthiest and most dangerous people in the realm. The item up for bid: a sealed box that hums with dark energy. Multiple armed factions are ready to fight for it.",
    "You're underwater. You don't know how you got here. Crystal-clear water stretches in every direction, and far below, you can see the spires of a sunken city. You can breathe, somehow.",
    "The bounty board has been stripped bare — every notice torn down except one, pinned with a silver dagger. It reads simply: 'Find me before I find you.' It's addressed to your party by name.",
    "Thunder echoes through the mountain pass as you crest the ridge. Below, two armies face each other across a narrow valley. They haven't noticed you yet — but they will soon.",
];

function generateProcScene(): string {
    const openings = [
        "The air grows heavy as you approach. Something is wrong — you can feel it in your bones.",
        "A sudden crack of thunder rattles the windows. Everyone in the room turns to look at the door.",
        "You've been traveling for days. As you round the bend, the landscape changes completely.",
        "The silence is deafening. Where there should be birdsong and wind, there is nothing.",
        "A child runs toward you, breathless and wide-eyed. 'You have to come! Quick! Something happened at the...'",
        "Lantern light flickers across weathered faces as the locals exchange nervous glances at your arrival.",
    ];
    const middles = [
        `Before you stretches ${pick(locations_pool)}, but it's changed — ${pick(creatures)} now patrol where merchants once walked.`,
        `In the distance, a pillar of ${pick(["smoke", "light", "darkness", "green fire", "purple energy"])} rises into the sky. It wasn't there an hour ago.`,
        `The ground trembles beneath your feet. Something enormous moves below the surface.`,
        `A scream pierces the air — then another, and another, from every direction.`,
        `Written in what appears to be blood on the wall: a message addressed to your party by name.`,
        `A ${pick(moods)} energy permeates everything. Even your equipment feels different here.`,
    ];
    return pick(openings) + " " + pick(middles);
}

export function getRandomOpeningScene(): string {
    return Math.random() < 0.4 ? generateProcScene() : pick(randomOpeningScenes);
}

/* ─── Story Beats (curated + procedural) ─── */
const curatedStoryBeats = [
    "The party discovers a crucial clue that changes their understanding of the situation",
    "An unexpected ally appears and offers help — but at a price",
    "A trap or ambush forces the party to fight or flee",
    "The party reaches a point of no return — they must commit to a path",
    "A moral dilemma forces the party to choose between two bad options",
    "Key information is revealed through a dying NPC's last words",
    "The party's actions have unintended consequences that complicate things",
    "A ticking clock is introduced — they must act before time runs out",
    "A betrayal is revealed — someone they trusted is working against them",
    "The party discovers the villain's true motivation isn't what they thought",
    "An environmental hazard (collapse, flood, fire) forces a dramatic escape",
    "The party must split up to accomplish two objectives simultaneously",
    "A powerful item or weapon is discovered but comes with a dangerous cost",
    "Reinforcements arrive for the enemy, raising the stakes dramatically",
    "A peaceful resolution becomes possible if the party is clever enough",
    "The real threat is revealed to be much larger than initially suspected",
    "A chase sequence through a dangerous environment",
    "The party must solve a puzzle or riddle to progress",
    "An old enemy resurfaces at the worst possible moment",
    "A sacrifice must be made to achieve the objective",
    "The party finds evidence that links two seemingly unrelated events",
    "An NPC the party dismissed as unimportant turns out to be key to everything",
    "The party witnesses something they were never meant to see",
    "A temporary alliance with an enemy is necessary to survive a greater threat",
    "The environment itself becomes an adversary (extreme weather, unstable terrain, etc.)",
    "The party must convince a hostile group to stand down through diplomacy or deception",
    "A flashback or vision reveals critical backstory about the conflict",
    "The party gains access to a restricted area and discovers a terrible truth",
    "An innocent person is caught in the crossfire and the party must choose: save them or pursue the objective",
    "The villain appears in person for the first time, dramatically outclassing the party",
];

function generateProcBeat(): string {
    const templates = [
        () => `The party encounters ${pick(npcs_pool)} who reveals that ${pick(events)} is connected to ${pick(villains)}`,
        () => `${pick(creatures).charAt(0).toUpperCase() + pick(creatures).slice(1)} block the path, but they seem to be fleeing from something worse`,
        () => `A secret passage in ${pick(locations_pool)} leads to ${pick(mcguffins)} — but it's trapped`,
        () => `${pick(npcs_pool).charAt(0).toUpperCase() + pick(npcs_pool).slice(1)} betrays the party and flees with critical information`,
        () => `The party finds ${pick(mcguffins)} but discovers it's not what they expected — it's ${pick(["cursed", "sentient", "broken in half", "a fake", "already activated", "linked to their souls"])}`,
        () => `A ${pick(moods)} confrontation with ${pick(villains)} forces the party to make an impossible choice`,
        () => `The party learns that ${pick(npcs_pool)} is actually working for ${pick(villains)}`,
        () => `${pick(creatures).charAt(0).toUpperCase() + pick(creatures).slice(1)} attack during a critical negotiation, throwing everything into chaos`,
    ];
    return pick(templates)();
}

export const randomStoryBeats = curatedStoryBeats;
export function getRandomStoryBeat(): string {
    return Math.random() < 0.45 ? pick(curatedStoryBeats) : generateProcBeat();
}

/* ─── Plot Twists (curated + procedural) ─── */
const curatedPlotTwists = [
    "The quest giver is actually the villain, and has been using the party all along",
    "The monster they've been hunting is actually protecting something important",
    "The 'dead' NPC is alive and has been manipulating events from hiding",
    "The treasure they're seeking is actually a prison for something terrible",
    "The rival adventuring party is working for the same benefactor",
    "The curse affecting the land is actually a ward keeping something worse at bay",
    "The friendly NPC has been replaced by a doppelganger",
    "The ancient prophecy has been mistranslated — the real meaning changes everything",
    "The villain is a future version of one of the party members",
    "The dungeon they're exploring is actually a living creature",
    "The war between factions is being manufactured by a third party",
    "The magical artifact is sentient and has its own agenda",
    "The ally who died earlier faked their death to go undercover",
    "The 'abandoned' ruins are actually a thriving civilization hidden by illusion magic",
    "The party has been in a shared dream this entire time — but the danger is still real",
    "The villain's lieutenant is secretly trying to overthrow them and wants the party's help",
    "The cure for the plague is also the key component needed for the villain's ritual",
    "The 'random' encounters have been orchestrated by someone watching the party",
    "The party's patron deity is not what they claim to be",
    "Two NPCs the party trusts are actually the same person using disguises",
    "The map they've been following was deliberately planted to lead them into a trap",
    "The organization protecting the realm has been infiltrated at the highest levels",
];

function generateProcTwist(): string {
    const templates = [
        () => `${pick(npcs_pool).charAt(0).toUpperCase() + pick(npcs_pool).slice(1)} ${pick(twistModifiers)} ${pick(villains)}`,
        () => `${pick(mcguffins).charAt(0).toUpperCase() + pick(mcguffins).slice(1)} ${pick(twistModifiers)} a much larger threat`,
        () => `The ${pick(events)} ${pick(twistModifiers)} ${pick(villains)} working from the shadows`,
        () => `What the party thought was ${pick(mcguffins)} is actually ${pick(["a decoy", "a weapon of mass destruction", "the key to a prison holding an ancient evil", "the villain's phylactery", "alive and watching them"])}`,
    ];
    return pick(templates)();
}

export const randomPlotTwists = curatedPlotTwists;
export function getRandomPlotTwist(): string {
    return Math.random() < 0.45 ? pick(curatedPlotTwists) : generateProcTwist();
}

/* ─── Cliffhangers ─── */
export const randomCliffhangers = [
    "As the dust settles, a massive shadow falls over the party. Something enormous is descending from the sky.",
    "The letter they found contains only three words: 'They know everything.'",
    "The ground beneath them begins to crack and glow with infernal energy.",
    "A horn sounds in the distance — the army they were warned about has arrived early.",
    "The NPC they just saved smiles and says, 'Thank you for bringing me exactly what I needed.'",
    "The portal closes behind them. They're trapped on the other side.",
    "As they celebrate their victory, one party member notices blood dripping from their nose — the curse is spreading.",
    "The map leads to a second location — where the REAL treasure (or danger) awaits.",
    "A familiar voice calls out from the darkness: it's someone who should be dead.",
    "The stars begin to go out, one by one.",
    "They return to town to find it completely abandoned — as if everyone left in a hurry.",
    "The artifact begins to pulse and something inside it stirs.",
    "A messenger arrives: the party's home base has been attacked. Casualties unknown.",
    "The villain appears via sending stone: 'I have something — someone — of yours. Come find me.'",
    "The door slams shut and won't budge. Then the walls start moving inward.",
    "The party's reflection in the mirror doesn't match — their reflections turn and walk away.",
    "A dragon's roar echoes across the valley, followed by a second roar. And then a third.",
    "The dead body they left behind is gone. Only bloody footprints leading away remain.",
    "The sky turns blood red. A voice booms: 'The pact is broken. You have seven days.'",
    "The friendly NPC removes their disguise — they're the villain the party's been hunting.",
    "As the sun sets, every shadow in the room begins to move independently.",
    "The wound from the battle begins glowing — whatever struck them left something behind.",
    "A child approaches and hands them a drawing. It depicts the party's death in perfect detail.",
    "The fortune teller's final card flips: The Tower. 'Run,' she whispers. 'Run now.'",
];

/* ─── Encounters (curated + procedural) ─── */
const curatedEncounters = [
    "4 Goblins and a Hobgoblin Captain ambush from behind cover in a narrow canyon",
    "A pack of 6 Wolves led by a Dire Wolf stalks the party through dense forest",
    "2 Ogres blocking a bridge, demanding a 'toll' of 50 gold each",
    "A Mimic disguised as a treasure chest in an otherwise empty room",
    "3 Bandits and their Bandit Captain set up a fake merchant cart as bait",
    "A Gelatinous Cube slowly advancing through a narrow dungeon corridor",
    "An Owlbear defending its nest — attacks anyone who gets within 100 feet",
    "2 Gargoyles that animate and attack when someone takes the gem from the pedestal",
    "A swarm of 8 Skeletons rising from the floor of a crypt",
    "A Young Green Dragon who offers to let the party pass — if they entertain it",
    "3 Phase Spiders descending from the ceiling in a web-filled cavern",
    "A Shambling Mound blocking the path in a swamp, drawn by the party's torchlight",
    "2 Wights commanding 6 Zombies in defense of a ruined temple",
    "A Basilisk encountered in a cavern littered with stone statues of past victims",
    "An Invisible Stalker sent to assassinate a specific party member",
    "A Nothic lurking in the shadows, offering secrets in exchange for feeding on fear",
    "3 Phase Panthers hunting in a misty valley — their illusory displacement makes them hard to hit",
    "A trapped Water Weird in a fountain that attacks anyone who approaches",
    "5 Gnolls with a Gnoll Fang of Yeenoghu performing a ritual in a clearing",
    "A Revenant stalking a specific NPC — it won't stop until its target is dead",
    "2 Manticores circling above, demanding a party member as 'payment' for safe passage",
    "An Ankheg bursting from the ground beneath the party's campsite",
    "A Roper disguised as a stalagmite in a narrow cave passage",
    "4 Shadows emerging from the darkness when the party's light source weakens",
    "A Fire Elemental raging through a collapsing building — rescue the survivors inside",
    "3 Bugbears and 6 Goblins in a fortified cave, using chokepoints and traps",
    "A young Roc nesting on the mountain path — its parent circles overhead",
    "2 Chain Devils guarding a prisoner who holds vital information",
];

function generateProcEncounter(): string {
    const counts = ["2", "3", "4", "5", "6", "8", "1d4+1", "2d4", "1d6+2"];
    const envs = ["in a narrow corridor", "at a river crossing", "in a dense forest clearing", "on a crumbling bridge", "at an abandoned camp", "inside a ruined building", "at the entrance to a cave", "along a cliffside path", "near a cursed well", "in a fog-shrouded field"];
    const complications = ["with a hostage nearby", "while a storm rages", "with difficult terrain (rubble)", "during an earthquake", "as fire spreads through the area", "with limited visibility (fog/darkness)", "while the floor is collapsing", "as reinforcements approach from behind", "with civilians caught in the crossfire", "near a volatile magical device"];
    return `${pick(counts)} ${pick(creatures)} ${pick(envs)}${Math.random() < 0.5 ? ` — ${pick(complications)}` : ""}`;
}

export const randomEncounters = curatedEncounters;
export function getRandomEncounter(): string {
    return Math.random() < 0.5 ? pick(curatedEncounters) : generateProcEncounter();
}

/* ─── Social Challenges (curated + procedural) ─── */
const curatedSocialChallenges = [
    "Convince the suspicious guard captain to grant access to the restricted district",
    "Negotiate with a merchant who has the last healing potion — and knows it",
    "Talk down a mob of frightened villagers who want to burn 'the witch'",
    "Persuade a paranoid wizard to share their research without revealing your true purpose",
    "Navigate a noble's dinner party while secretly gathering intelligence",
    "Mediate a dispute between two rival guild leaders threatening to go to war",
    "Interrogate a captured spy who's willing to talk — but only in riddles",
    "Gain the trust of a reclusive hermit who's the only one with the information you need",
    "Calm an enraged troll who claims someone stole his 'shinies'",
    "Convince a celestial being that the party is worthy of divine aid",
    "Negotiate the release of prisoners from a bandit camp without combat",
    "Win a debate at the king's court to secure funding for the quest",
    "Talk a suicidal guard off a ledge while extracting information about his corrupt commander",
    "Bluff your way past a checkpoint using stolen credentials and a lot of nerve",
    "Negotiate safe passage through hostile territory by offering something the enemy values more than combat",
    "Convince a traumatized witness to testify against a powerful noble",
    "Win a drinking contest with the local champion to earn the respect of the town",
    "Persuade a stubborn dwarf king to break a centuries-old tradition for the greater good",
    "De-escalate a standoff between city guard and a cornered fugitive who claims innocence",
    "Navigate a fey court's bizarre etiquette without offending the archfey",
    "Convince a dying villain to reveal the location of their hidden lair",
    "Broker a trade deal between two cultures that despise each other",
];

function generateProcSocial(): string {
    const actions = ["Convince", "Persuade", "Negotiate with", "Win over", "Bluff past", "De-escalate a conflict with", "Charm", "Intimidate", "Outwit", "Earn the trust of"];
    const targets = ["the suspicious guard captain", "a rival faction leader", "an ancient dragon", "a paranoid noble", "a grieving widow", "the leader of the resistance", "a powerful merchant guilder", "the high priest", "a captured enemy spy", "the bounty hunter on your trail", "a stubborn bureaucrat", "an offended archfey"];
    const objectives = ["to gain access to restricted information", "to secure safe passage for the party", "to acquire a key resource or item", "to learn the villain's weakness", "to prevent a war from breaking out", "to earn their help against the coming threat", "to clear the party's name of false charges", "to forge an alliance against a common enemy", "to learn the location of a hidden site", "to buy time for the party's plan to work"];
    return `${pick(actions)} ${pick(targets)} ${pick(objectives)}`;
}

export const randomSocialChallenges = curatedSocialChallenges;
export function getRandomSocialChallenge(): string {
    return Math.random() < 0.45 ? pick(curatedSocialChallenges) : generateProcSocial();
}

/* ─── Locations ─── */
export interface RandomLocation {
    name: string;
    description: string;
    environment: "Dungeon" | "Wilderness" | "Urban" | "Special";
}

const locationAdjectives = ["Forgotten", "Cursed", "Ancient", "Burning", "Frozen", "Hidden", "Sunken", "Floating", "Ruined", "Haunted", "Sacred", "Corrupted", "Shimmering", "Hollow", "Crimson"];
const locationNouns_dungeon = ["Crypt", "Catacombs", "Mine", "Vault", "Forge", "Laboratory", "Prison", "Sanctum", "Chamber", "Passage"];
const locationNouns_wilderness = ["Grove", "Canyon", "Falls", "Ridge", "Bog", "Clearing", "Valley", "Peak", "Ruins", "Crossing"];
const locationNouns_urban = ["Market", "Tower", "Manor", "Tavern", "District", "Cathedral", "Workshop", "Arena", "Docks", "Quarter"];
const locationDescs_dungeon = ["where the walls weep with dark moisture", "filled with the echo of chains and forgotten screams", "guarded by ancient magical wards", "littered with the remains of previous adventurers", "where torches light themselves as you approach"];
const locationDescs_wilderness = ["where the trees grow in unnatural patterns", "shrouded in a perpetual mist that muffles sound", "teeming with displaced wildlife fleeing something deeper in", "marked by massive claw gouges in the earth", "where the season seems different from everywhere else"];
const locationDescs_urban = ["where the buildings lean together like conspirators", "alive with whispered deals and furtive glances", "recently damaged by a mysterious explosion", "under quarantine by the city guard", "where every surface is covered in strange graffiti"];

export const randomLocations: RandomLocation[] = [
    { name: "The Whispering Crypts", description: "A labyrinthine burial ground where the dead murmur secrets", environment: "Dungeon" },
    { name: "Thornhaven Market", description: "A bustling crossroads bazaar where anything can be bought for the right price", environment: "Urban" },
    { name: "The Shattered Bridge", description: "A crumbling stone bridge over a miles-deep chasm, wind howling through the gaps", environment: "Wilderness" },
    { name: "Ironforge Depths", description: "An abandoned dwarven foundry where the furnaces still burn with magical flame", environment: "Dungeon" },
    { name: "The Verdant Maze", description: "A hedge labyrinth in overgrown noble gardens, hiding fey creatures", environment: "Wilderness" },
    { name: "Ravenmoor Swamp", description: "A treacherous bog where will-o'-wisps lead travelers astray", environment: "Wilderness" },
    { name: "The Crystal Sanctum", description: "A cave of natural crystals that amplify magic and sound", environment: "Dungeon" },
    { name: "Blackthorn Keep", description: "A ruined fortress on a cliff, now home to bandits and worse", environment: "Dungeon" },
    { name: "The Floating Market", description: "A collection of boats and rafts forming a mobile trading post on a river", environment: "Urban" },
    { name: "Sunken Library", description: "A partially flooded wizard's tower with waterlogged tomes and lurking water creatures", environment: "Special" },
    { name: "The Bone Fields", description: "An ancient battlefield where weapons and armor litter the ground between skeletal remains", environment: "Wilderness" },
    { name: "Moonwell Grove", description: "A sacred forest clearing with a pool that glows silver under moonlight", environment: "Wilderness" },
    { name: "The Gilded Throne Room", description: "An opulent palace hall with marble pillars, golden fixtures, and hidden passages", environment: "Urban" },
    { name: "Dragon's Teeth Caverns", description: "Jagged stalactite-filled caves that echo with deep rumbling from below", environment: "Special" },
];

export function getRandomLocation(): RandomLocation {
    if (Math.random() < 0.5) {
        return pick(randomLocations);
    }
    // Procedural location
    const envRoll = Math.random();
    let env: "Dungeon" | "Wilderness" | "Urban" | "Special";
    let nouns: string[];
    let descs: string[];
    if (envRoll < 0.33) { env = "Dungeon"; nouns = locationNouns_dungeon; descs = locationDescs_dungeon; }
    else if (envRoll < 0.66) { env = "Wilderness"; nouns = locationNouns_wilderness; descs = locationDescs_wilderness; }
    else { env = "Urban"; nouns = locationNouns_urban; descs = locationDescs_urban; }
    return {
        name: `The ${pick(locationAdjectives)} ${pick(nouns)}`,
        description: pick(descs),
        environment: env,
    };
}

/* ─── Music / Mood ─── */
export const randomMusicMoods = [
    "Tense exploration — low strings, occasional dissonant notes, echoing drips",
    "Tavern revelry — lively fiddle, clapping, mugs clinking, bawdy singing",
    "Epic battle — thunderous drums, brass fanfare, choir crescendo",
    "Mysterious ritual — chanting, deep bells, ethereal whispers",
    "Forest travel — birdsong, gentle wind, rustic flute melody",
    "Dungeon crawl — distant rumbling, chains rattling, occasional screams",
    "Royal court — elegant harp, stately strings, quiet formality",
    "Storm at sea — crashing waves, howling wind, creaking wood",
    "Underground cavern — echoing water drops, deep resonant hums, silence",
    "Victory celebration — triumphant horns, cheering crowds, uplifting melody",
    "Haunted manor — creaking floorboards, whispered voices, distant music box",
    "Desert crossing — dry wind, distant drumming, shimmering heat-haze ambiance",
    "Fey wildlands — tinkling bells, ethereal singing, kaleidoscopic tones",
    "Underdark descent — total silence broken by alien sounds, deep bass drones",
    "Chase sequence — frantic percussion, rising tempo, breathless strings",
    "Sad farewell — solo cello, gentle rain, bittersweet melody",
    "Ancient library — turning pages, distant whispers, occasional magical hum",
    "Volcanic forge — bubbling lava, hammer strikes, intense heat-warped sounds",
];

/* ─── Props / Handouts ─── */
export const randomPropsHandouts = [
    "A weathered letter sealed with an unfamiliar wax crest (handwritten prop)",
    "A hand-drawn map with an 'X marks the spot' and cryptic notes in the margins",
    "A wanted poster featuring one of the party members with an alarming bounty",
    "A page torn from a journal describing horrific experiments",
    "An invitation to a noble's masquerade ball, edged in gold leaf",
    "A crude sketch of the dungeon layout 'found on a dead goblin scout'",
    "A merchant's receipt listing suspicious magical components",
    "A set of puzzle tiles the party must physically arrange to solve",
    "A prophecy written in verse that hints at future events",
    "A token or coin from a secret organization — who does it belong to?",
    "A family portrait with all the faces scratched out except one",
    "A coded message that must be deciphered using a cipher the party has (or must find)",
    "A contract signed in blood — the party recognizes one of the names",
    "A newspaper clipping from a future date describing events that haven't happened yet",
    "A collection of pressed flowers — each one corresponds to a victim",
    "An old locket containing a miniature portrait of someone the party knows",
    "A diplomatic immunity badge from a nation that no longer exists",
    "A set of cards with symbols — each one unlocks a different door in the dungeon",
];
