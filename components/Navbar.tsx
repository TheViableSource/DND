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
                    <span className={styles.brandIcon}>🎲</span>
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
