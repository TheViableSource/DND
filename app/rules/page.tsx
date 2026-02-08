"use client";

import { useState } from "react";
import rulesData from "@/data/rules.json";
import styles from "./page.module.css";

export default function RulesPage() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState(rulesData.categories[0]?.id || "");

    const currentCategory = rulesData.categories.find((c) => c.id === activeCategory);

    const filteredRules = currentCategory?.rules.filter(
        (r) =>
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.content.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const allRulesFiltered = search
        ? rulesData.categories.flatMap((cat) =>
            cat.rules
                .filter(
                    (r) =>
                        r.title.toLowerCase().includes(search.toLowerCase()) ||
                        r.content.toLowerCase().includes(search.toLowerCase())
                )
                .map((r) => ({ ...r, category: cat.name, icon: cat.icon }))
        )
        : [];

    return (
        <div className="page-content">
            <div className="container">
                <div className="page-header">
                    <h1>📖 Quick Reference Rules</h1>
                    <p className="subtitle">
                        Condensed rules organized for fast mid-session lookups. Every rule
                        includes an example.
                    </p>
                </div>

                {/* Search */}
                <div className="search-bar" style={{ marginBottom: "var(--space-xl)" }}>
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="input"
                        placeholder="Search all rules... (e.g., 'initiative', 'spell slots', 'cover')"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: "44px" }}
                    />
                </div>

                {/* Search Results (when searching) */}
                {search ? (
                    <div className={styles.searchResults}>
                        <p className={styles.resultCount}>{allRulesFiltered.length} results for &quot;{search}&quot;</p>
                        {allRulesFiltered.map((rule, i) => (
                            <div key={i} className={styles.ruleCard}>
                                <div className={styles.ruleMeta}>
                                    <span>{rule.icon} {rule.category}</span>
                                </div>
                                <h3>{rule.title}</h3>
                                <p className={styles.ruleContent}>{rule.content}</p>
                                <div className={styles.ruleExample}>
                                    <span className={styles.exampleLabel}>Example</span>
                                    <p>{rule.example}</p>
                                </div>
                            </div>
                        ))}
                        {allRulesFiltered.length === 0 && (
                            <p className={styles.noResults}>No rules matched your search. Try a different keyword.</p>
                        )}
                    </div>
                ) : (
                    /* Category View */
                    <div className={styles.layout}>
                        {/* Category Sidebar */}
                        <div className={styles.sidebar}>
                            {rulesData.categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    className={`${styles.catBtn} ${activeCategory === cat.id ? styles.activeCat : ""}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.name}</span>
                                    <span className={styles.ruleCount}>{cat.rules.length}</span>
                                </button>
                            ))}
                        </div>

                        {/* Rules Content */}
                        <div className={styles.content}>
                            {currentCategory && (
                                <>
                                    <h2 className={styles.categoryTitle}>
                                        {currentCategory.icon} {currentCategory.name}
                                    </h2>
                                    <div className={styles.rulesGrid}>
                                        {filteredRules.map((rule, i) => (
                                            <div key={i} className={styles.ruleCard}>
                                                <h3>{rule.title}</h3>
                                                <p className={styles.ruleContent}>{rule.content}</p>
                                                <div className={styles.ruleExample}>
                                                    <span className={styles.exampleLabel}>Example</span>
                                                    <p>{rule.example}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
