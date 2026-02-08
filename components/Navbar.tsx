"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

const navLinks = [
    { href: "/", label: "Dashboard", icon: "🏰" },
    { href: "/session-planner", label: "Session Planner", icon: "📜" },
    { href: "/npcs", label: "NPCs", icon: "🧙" },
    { href: "/bestiary", label: "Bestiary", icon: "🐉" },
    { href: "/maps", label: "Maps", icon: "🗺️" },
    { href: "/story-arcs", label: "Story Arcs", icon: "⚔️" },
    { href: "/rules", label: "Quick Rules", icon: "📖" },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    return (
        <nav className={styles.navbar}>
            <div className={styles.inner}>
                <Link href="/" className={styles.brand}>
                    <span className={styles.brandIcon}>
                        <svg viewBox="0 0 100 100" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="navD20" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#d4a574" />
                                    <stop offset="50%" stopColor="#b8860b" />
                                    <stop offset="100%" stopColor="#8b6914" />
                                </linearGradient>
                            </defs>
                            <polygon points="50,2 95,30 95,70 50,98 5,70 5,30" fill="url(#navD20)" stroke="#ffd700" strokeWidth="2" />
                            <line x1="50" y1="2" x2="50" y2="98" stroke="#ffd700" strokeWidth="0.7" opacity="0.5" />
                            <line x1="5" y1="30" x2="95" y2="70" stroke="#ffd700" strokeWidth="0.7" opacity="0.5" />
                            <line x1="95" y1="30" x2="5" y2="70" stroke="#ffd700" strokeWidth="0.7" opacity="0.5" />
                            <text x="50" y="58" textAnchor="middle" fill="#1a0a2e" fontSize="28" fontWeight="bold" fontFamily="serif">20</text>
                        </svg>
                    </span>
                    <span className={styles.brandText}>DM&apos;s Tome</span>
                </Link>

                <div className={`${styles.navLinks} ${mobileOpen ? styles.open : ""}`}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.navLink} ${pathname === link.href ? styles.active : ""
                                }`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <span className={styles.linkIcon}>{link.icon}</span>
                            <span className={styles.linkLabel}>{link.label}</span>
                        </Link>
                    ))}
                </div>

                <button
                    className={styles.hamburger}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle navigation"
                    aria-expanded={mobileOpen}
                >
                    <span className={`${styles.bar} ${mobileOpen ? styles.open : ""}`} />
                    <span className={`${styles.bar} ${mobileOpen ? styles.open : ""}`} />
                    <span className={`${styles.bar} ${mobileOpen ? styles.open : ""}`} />
                </button>
            </div>
        </nav>
    );
}
