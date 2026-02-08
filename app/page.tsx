import Link from "next/link";
import styles from "./page.module.css";

const quickStartCards = [
  {
    icon: "📜",
    title: "Plan a Session",
    description: "Step-by-step wizard to plan your next game night",
    href: "/session-planner",
    color: "gold",
  },
  {
    icon: "⚔️",
    title: "Browse Story Arcs",
    description: "Pre-built campaign templates ready to run",
    href: "/story-arcs",
    color: "red",
  },
  {
    icon: "🧙",
    title: "Meet Your NPCs",
    description: "20 characters with dialogue scripts ready to go",
    href: "/npcs",
    color: "purple",
  },
  {
    icon: "🐉",
    title: "Build an Encounter",
    description: "Find monsters and balance combat for your party",
    href: "/bestiary",
    color: "emerald",
  },
];

const dmTips = [
  "Remember: the goal is for everyone to have fun — including you!",
  "It's okay to say 'Let me look that up' during a session. Even veteran DMs do it.",
  "Your players will ALWAYS do something unexpected. Embrace it!",
  "Not every encounter needs to be combat. Social and exploration are just as engaging.",
  "If you're not sure about a rule, make a ruling and look it up later.",
  "Session Zero is essential — discuss expectations, themes, and boundaries before you start.",
  "Give your NPCs one memorable quirk and your players will remember them forever.",
  "When in doubt, ask your players: 'What do you want to do?'",
  "End each session with a cliffhanger or a question — it keeps players excited for next time.",
  "You don't need to prepare everything. Prepare the important moments and improvise the rest.",
];

const toolCards = [
  { icon: "🗺️", title: "Map Gallery", desc: "Scene-appropriate maps with tactical notes", href: "/maps" },
  { icon: "📖", title: "Quick Rules", desc: "Searchable rules for mid-session lookups", href: "/rules" },
  { icon: "🐉", title: "Bestiary", desc: "Monster stats with 'How to Run' tips", href: "/bestiary" },
  { icon: "🧙", title: "NPC Library", desc: "Characters with copy-paste dialogue", href: "/npcs" },
  { icon: "⚔️", title: "Story Arcs", desc: "Complete campaign templates", href: "/story-arcs" },
  { icon: "📜", title: "Session Planner", desc: "Plan your game step by step", href: "/session-planner" },
];

export default function Home() {
  const randomTip = dmTips[Math.floor(Math.random() * dmTips.length)];

  return (
    <div className="page-content">
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>🎲</div>
          <h1 className={styles.heroTitle}>Your Adventure Begins Here</h1>
          <p className={styles.heroSubtitle}>
            Everything a new Dungeon Master needs to run an epic D&amp;D campaign.
            Pre-built stories, NPC scripts, monster stats, maps, and more.
          </p>
          <div className={styles.heroCta}>
            <Link href="/story-arcs" className="btn btn-primary">
              Start a Campaign
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
              <span className={styles.statNumber}>20</span>
              <span className={styles.statLabel}>Unique NPCs</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>20</span>
              <span className={styles.statLabel}>Monster Stat Blocks</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>12</span>
              <span className={styles.statLabel}>Battle Maps</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>4</span>
              <span className={styles.statLabel}>Campaign Templates</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>30+</span>
              <span className={styles.statLabel}>Quick Reference Rules</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>∞</span>
              <span className={styles.statLabel}>Adventures Waiting</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
