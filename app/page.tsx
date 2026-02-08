import Link from "next/link";
import styles from "./page.module.css";

const quickStartCards = [
  {
    icon: "📜",
    title: "Plan a Session",
    description: "Step-by-step wizard with built-in NPC & monster generators, then export a polished PDF",
    href: "/session-planner",
    color: "gold",
  },
  {
    icon: "⚔️",
    title: "Browse Story Arcs",
    description: "Pre-built campaign templates with encounters, NPCs, and story beats ready to run",
    href: "/story-arcs",
    color: "red",
  },
  {
    icon: "🧙",
    title: "NPC Library",
    description: "59 fully-detailed characters with personality, motivation, secrets, and key dialogue",
    href: "/npcs",
    color: "purple",
  },
  {
    icon: "🐉",
    title: "Bestiary",
    description: "20 monsters with full stat blocks, ability scores, tactics, and DM tips",
    href: "/bestiary",
    color: "emerald",
  },
];

const dmTips = [
  "Remember: the goal is for everyone to have fun, including you!",
  "It's okay to say 'Let me look that up' during a session. Even veteran DMs do it.",
  "Your players will ALWAYS do something unexpected. Embrace it!",
  "Not every encounter needs to be combat. Social and exploration are just as engaging.",
  "If you're not sure about a rule, make a ruling and look it up later.",
  "Session Zero is essential. Discuss expectations, themes, and boundaries before you start.",
  "Give your NPCs one memorable quirk and your players will remember them forever.",
  "When in doubt, ask your players: 'What do you want to do?'",
  "End each session with a cliffhanger or a question. It keeps players excited for next time.",
  "You don't need to prepare everything. Prepare the important moments and improvise the rest.",
];

const toolCards = [
  { icon: "🗺️", title: "Map Generator", desc: "Procedurally generated dungeon, wilderness & urban maps with room keys", href: "/maps" },
  { icon: "📖", title: "Quick Rules", desc: "Searchable rules reference for mid-session lookups", href: "/rules" },
  { icon: "🐉", title: "Bestiary + Generator", desc: "Full monster stat blocks with a random pull generator", href: "/bestiary" },
  { icon: "🧙", title: "NPC Library + Generator", desc: "59 NPCs plus a random NPC generator with dialogue", href: "/npcs" },
  { icon: "⚔️", title: "Story Arcs", desc: "Complete multi-session campaign templates", href: "/story-arcs" },
  { icon: "📜", title: "Session Planner", desc: "Plan, generate, and export your game as a PDF", href: "/session-planner" },
];

const featureHighlights = [
  {
    icon: "🎲",
    title: "NPC Generator",
    description: "Generate fully-fleshed NPCs on the fly: personality, motivation, a hidden secret, and three lines of key dialogue. Choose a role (Ally, Antagonist, Quest Giver, Neutral) and get a character ready to roleplay in seconds.",
  },
  {
    icon: "💀",
    title: "Monster Generator",
    description: "Pull a random monster from the bestiary with full stat blocks: AC, HP, ability scores, actions, tactics, and DM tips. Filter by challenge rating to match your party's level.",
  },
  {
    icon: "🗺️",
    title: "Dungeon Map Generator",
    description: "Procedurally generated maps with room numbers, corridors, terrain, and a full room key. Choose from dungeon, wilderness, or urban environments. Each map is unique and seeded for consistency.",
  },
  {
    icon: "📄",
    title: "PDF Session Export",
    description: "Plan your session step by step, save your favourite NPCs and monsters, link maps, then export everything as a beautifully formatted PDF, complete with rendered map images.",
  },
];

export default function Home() {
  const randomTip = dmTips[Math.floor(Math.random() * dmTips.length)];

  return (
    <div className="page-content">
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>
            <svg viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
              {/* d20 icosahedron shape */}
              <defs>
                <linearGradient id="d20grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d4a574" />
                  <stop offset="50%" stopColor="#b8860b" />
                  <stop offset="100%" stopColor="#8b6914" />
                </linearGradient>
                <filter id="d20glow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {/* Outer shape */}
              <polygon points="50,2 95,30 95,70 50,98 5,70 5,30" fill="url(#d20grad)" stroke="#ffd700" strokeWidth="1.5" filter="url(#d20glow)" />
              {/* Inner facets */}
              <line x1="50" y1="2" x2="50" y2="98" stroke="#ffd700" strokeWidth="0.5" opacity="0.5" />
              <line x1="5" y1="30" x2="95" y2="70" stroke="#ffd700" strokeWidth="0.5" opacity="0.5" />
              <line x1="95" y1="30" x2="5" y2="70" stroke="#ffd700" strokeWidth="0.5" opacity="0.5" />
              <line x1="50" y1="2" x2="5" y2="70" stroke="#ffd700" strokeWidth="0.5" opacity="0.4" />
              <line x1="50" y1="2" x2="95" y2="70" stroke="#ffd700" strokeWidth="0.5" opacity="0.4" />
              <line x1="50" y1="98" x2="5" y2="30" stroke="#ffd700" strokeWidth="0.5" opacity="0.4" />
              <line x1="50" y1="98" x2="95" y2="30" stroke="#ffd700" strokeWidth="0.5" opacity="0.4" />
              {/* Number 20 */}
              <text x="50" y="56" textAnchor="middle" fill="#1a0a2e" fontSize="24" fontWeight="bold" fontFamily="serif">20</text>
            </svg>
          </div>
          <h1 className={styles.heroTitle}>Your Adventure Begins Here</h1>
          <p className={styles.heroSubtitle}>
            DM&apos;s Tome is a free, all-in-one toolkit for Dungeons &amp; Dragons Dungeon Masters.
            Whether you&apos;re prepping your first session or building a full campaign, everything you
            need is here: NPC &amp; monster generators, procedural dungeon maps, pre-built story arcs,
            quick rules reference, and a session planner that exports to PDF.
          </p>
          <div className={styles.heroCta}>
            <Link href="/session-planner" className="btn btn-primary">
              Plan Your Session
            </Link>
            <Link href="/rules" className="btn btn-secondary">
              Learn the Rules
            </Link>
          </div>
        </div>
      </section>

      <div className="container">
        {/* DM Tip */}
        <section className={styles.tipSection}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>💡</span>
            <div>
              <span className={styles.tipLabel}>DM Tip</span>
              <p className={styles.tipText}>{randomTip}</p>
            </div>
          </div>
        </section>

        {/* What is DM's Tome */}
        <section className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>What is DM&apos;s Tome?</h2>
          <p className={styles.aboutText}>
            Running a D&amp;D game can feel overwhelming, especially the first few times. DM&apos;s Tome
            puts every tool you need in one place so you can focus on telling great stories instead of
            drowning in prep work. Browse a library of ready-to-use NPCs and monsters, generate new
            ones on the fly with built-in generators, explore procedurally-created dungeon maps, follow
            pre-built story arcs, and plan your entire session with a step-by-step wizard that exports
            a polished PDF you can bring to the table. No accounts, no sign-ups, no cost. Just open
            it and start building your adventure.
          </p>
        </section>

        {/* Quick Start Cards */}
        <section className={styles.quickStart}>
          <h2 className={styles.sectionTitle}>Quick Start</h2>
          <div className={styles.quickStartGrid}>
            {quickStartCards.map((card) => (
              <Link key={card.href} href={card.href} className={`${styles.quickStartCard} ${styles[card.color]}`}>
                <span className={styles.cardIcon}>{card.icon}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <span className={styles.cardArrow}>→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Feature Highlights */}
        <section className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Built-In Generators &amp; Tools</h2>
          <div className={styles.featuresGrid}>
            {featureHighlights.map((feature) => (
              <div key={feature.title} className={styles.featureCard}>
                <span className={styles.featureIcon}>{feature.icon}</span>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* All Tools */}
        <section className={styles.toolsSection}>
          <h2 className={styles.sectionTitle}>Your DM Toolkit</h2>
          <div className={styles.toolsGrid}>
            {toolCards.map((tool) => (
              <Link key={tool.href} href={tool.href} className={styles.toolCard}>
                <span className={styles.toolIcon}>{tool.icon}</span>
                <div>
                  <h4>{tool.title}</h4>
                  <p>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* What's Inside */}
        <section className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>What&apos;s Inside the Tome</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>59</span>
              <span className={styles.statLabel}>Unique NPCs</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>20</span>
              <span className={styles.statLabel}>Monster Stat Blocks</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>∞</span>
              <span className={styles.statLabel}>Generated Maps</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>4</span>
              <span className={styles.statLabel}>Campaign Templates</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>3</span>
              <span className={styles.statLabel}>Built-In Generators</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>PDF</span>
              <span className={styles.statLabel}>Session Export</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
