import jsPDF from "jspdf";
import monstersData from "@/data/monsters.json";
import npcsData from "@/data/npcs.json";
import { SessionItem } from "@/lib/sessionStorage";
import { GeneratedNPC } from "@/data/npcGenerator";
import { renderMapToDataURLs, type MapRenderInput } from "@/lib/mapRenderer";

/* ─── Helpers ─── */
function crLabel(cr: number): string {
    if (cr === 0.125) return "1/8";
    if (cr === 0.25) return "1/4";
    if (cr === 0.5) return "1/2";
    return String(cr);
}

function calcMod(score: number): string {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : String(mod);
}

interface SessionPlan {
    sessionNumber: string;
    summary: string;
    goal: string;
    openingScene: string;
    storyBeats: string[];
    plotTwist: string;
    cliffhanger: string;
    npcs: string[];
    encounters: string[];
    socialChallenges: string[];
    locations: string[];
    mapNotes: string;
    musicMood: string;
    propsHandouts: string[];
    rulesReview: string;
    notes: string;
}

interface MapData {
    id: string;
    name: string;
    environment: string;
    description: string;
    gridSize: string;
    difficulty: string;
    keyFeatures: string[];
    suggestedEncounters: string[];
    tacticalNotes: string;
    lootSuggestions: string[];
    readAloudText: string;
}

type LinkedMaps = Record<number, MapData>;

/* ─── PDF Generation ─── */
export function exportSessionPDF(
    plan: SessionPlan,
    sessionItems: SessionItem[],
    generatedNPCs: GeneratedNPC[] = [],
    linkedMaps: LinkedMaps = {},
) {
    const pdf = new jsPDF({ unit: "mm", format: "letter" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pageW - margin * 2;
    let y = margin;

    const npcItems = sessionItems.filter((i) => i.type === "npc");
    const monsterItems = sessionItems.filter((i) => i.type === "monster");

    /* ── Drawing Helpers ── */
    function checkPage(needed: number = 16) {
        if (y + needed > pageH - margin) {
            pdf.addPage();
            y = margin;
            drawPageBorder();
        }
    }

    function drawPageBorder() {
        pdf.setDrawColor(180, 140, 80);
        pdf.setLineWidth(0.8);
        pdf.rect(8, 8, pageW - 16, pageH - 16);
        pdf.setDrawColor(200, 170, 110);
        pdf.setLineWidth(0.3);
        pdf.rect(10, 10, pageW - 20, pageH - 20);
    }

    function sectionTitle(text: string) {
        checkPage(20);
        y += 4;
        pdf.setFillColor(40, 30, 20);
        pdf.rect(margin, y, contentW, 9, "F");
        pdf.setDrawColor(180, 140, 80);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, margin + contentW, y);
        pdf.line(margin, y + 9, margin + contentW, y + 9);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(220, 185, 120);
        pdf.text(text.toUpperCase(), margin + 4, y + 6.5);
        y += 13;
    }

    function subHeading(text: string) {
        checkPage(12);
        y += 2;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(180, 140, 80);
        pdf.text(text, margin, y);
        y += 5;
    }

    function bodyText(text: string, indent: number = 0) {
        if (!text) return;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(60, 50, 40);
        const lines = pdf.splitTextToSize(text, contentW - indent);
        for (const line of lines) {
            checkPage(5);
            pdf.text(line, margin + indent, y);
            y += 4.5;
        }
    }

    function labeledText(label: string, text: string, indent: number = 0) {
        if (!text) return;
        checkPage(5);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(60, 50, 40);
        const labelW = pdf.getTextWidth(label + " ");
        pdf.text(label, margin + indent, y);
        pdf.setFont("helvetica", "normal");
        const rest = pdf.splitTextToSize(text, contentW - indent - labelW);
        pdf.text(rest[0], margin + indent + labelW, y);
        y += 4.5;
        for (let i = 1; i < rest.length; i++) {
            checkPage(5);
            pdf.text(rest[i], margin + indent + labelW, y);
            y += 4.5;
        }
    }

    function boldDivider() {
        checkPage(6);
        y += 2;
        pdf.setDrawColor(180, 140, 80);
        pdf.setLineWidth(0.8);
        pdf.line(margin, y, margin + contentW, y);
        y += 5;
    }

    function thinDivider() {
        checkPage(6);
        y += 1;
        pdf.setDrawColor(180, 140, 80);
        pdf.setLineWidth(0.3);
        pdf.line(margin, y, margin + contentW, y);
        y += 3;
    }

    function bulletItem(text: string) {
        checkPage(5);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(60, 50, 40);
        const bullet = String.fromCharCode(8226); // •
        pdf.text(bullet, margin + 2, y);
        const lines = pdf.splitTextToSize(text, contentW - 8);
        for (const line of lines) {
            checkPage(5);
            pdf.text(line, margin + 7, y);
            y += 4.5;
        }
    }

    function dialogueBlock(label: string, text: string) {
        checkPage(8);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(60, 50, 40);
        pdf.text(label + ":", margin + 6, y);
        y += 4;
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(8);
        pdf.setTextColor(80, 60, 40);
        const lines = pdf.splitTextToSize('"' + text + '"', contentW - 12);
        for (const line of lines) {
            checkPage(4);
            pdf.text(line, margin + 6, y);
            y += 3.8;
        }
        y += 2;
    }

    /* ── Cover / Title Page ── */
    drawPageBorder();

    y = 50;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(28);
    pdf.setTextColor(40, 30, 20);
    pdf.text("SESSION PLAN", pageW / 2, y, { align: "center" });
    y += 12;

    if (plan.sessionNumber) {
        pdf.setFontSize(18);
        pdf.setTextColor(180, 140, 80);
        pdf.text("Session " + plan.sessionNumber, pageW / 2, y, { align: "center" });
        y += 10;
    }

    pdf.setDrawColor(180, 140, 80);
    pdf.setLineWidth(0.8);
    pdf.line(margin + 30, y, pageW - margin - 30, y);
    y += 10;

    if (plan.summary) {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(11);
        pdf.setTextColor(80, 60, 40);
        const summaryLines = pdf.splitTextToSize(plan.summary, contentW - 30);
        for (const line of summaryLines) {
            pdf.text(line, pageW / 2, y, { align: "center" });
            y += 6;
        }
    }

    // Table of contents
    y += 15;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 80, 60);
    const tocItems = [
        plan.storyBeats.filter(Boolean).length > 0 ? plan.storyBeats.filter(Boolean).length + " Story Beats" : null,
        (npcItems.length + generatedNPCs.length) > 0 ? (npcItems.length + generatedNPCs.length) + " NPCs" : null,
        monsterItems.length > 0 ? monsterItems.length + " Monsters" : null,
        plan.encounters.filter(Boolean).length > 0 ? plan.encounters.filter(Boolean).length + " Encounters" : null,
        plan.locations.filter(Boolean).length > 0 ? plan.locations.filter(Boolean).length + " Locations" : null,
        Object.keys(linkedMaps).length > 0 ? Object.keys(linkedMaps).length + " Map Reference Sheets" : null,
    ].filter(Boolean);
    if (tocItems.length > 0) {
        pdf.text("Contents: " + tocItems.join(" / "), pageW / 2, y, { align: "center" });
    }

    /* ── Page 2+: Session Content ── */
    pdf.addPage();
    y = margin;
    drawPageBorder();

    // Opening Scene
    if (plan.openingScene) {
        sectionTitle("Opening Scene -- Read Aloud");
        checkPage(10);
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(9);
        pdf.setTextColor(80, 50, 20);
        const readLines = pdf.splitTextToSize(plan.openingScene, contentW - 12);
        const boxH = readLines.length * 4.5 + 6;
        checkPage(boxH + 4);
        pdf.setFillColor(250, 245, 230);
        pdf.setDrawColor(180, 140, 80);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, y - 2, contentW, boxH, 2, 2, "FD");
        y += 2;
        for (const line of readLines) {
            pdf.text(line, margin + 6, y);
            y += 4.5;
        }
        y += 4;
    }

    // Session Goal
    if (plan.goal) {
        sectionTitle("Session Goal");
        bodyText(plan.goal);
        y += 2;
    }

    // Story Beats
    const beats = plan.storyBeats.filter(Boolean);
    if (beats.length > 0) {
        sectionTitle("Story Beats");
        beats.forEach((beat, i) => {
            checkPage(8);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(9);
            pdf.setTextColor(180, 140, 80);
            pdf.text("Beat " + (i + 1) + ":", margin + 2, y);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(60, 50, 40);
            const beatLines = pdf.splitTextToSize(beat, contentW - 22);
            pdf.text(beatLines[0], margin + 22, y);
            y += 4.5;
            for (let j = 1; j < beatLines.length; j++) {
                checkPage(5);
                pdf.text(beatLines[j], margin + 22, y);
                y += 4.5;
            }
        });
        if (plan.plotTwist) {
            y += 2;
            labeledText("Plot Twist:", plan.plotTwist);
        }
        if (plan.cliffhanger) {
            labeledText("Cliffhanger:", plan.cliffhanger);
        }
        y += 2;
    }

    /* ── NPCs Section ── */
    const manualNPCs = plan.npcs.filter(Boolean);
    if (manualNPCs.length > 0 || npcItems.length > 0 || generatedNPCs.length > 0) {
        sectionTitle("NPCs & Characters");
        manualNPCs.forEach((n) => bulletItem(n));

        // Generated NPCs
        generatedNPCs.forEach((npc) => {
            checkPage(30);
            y += 3;

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(11);
            pdf.setTextColor(40, 30, 20);
            pdf.text(npc.name, margin + 4, y + 6);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(120, 90, 60);
            pdf.text(npc.race + " / " + npc.class + " / " + npc.role, margin + 4, y + 11);
            y += 16;

            labeledText("Personality:", npc.personality.join(", "), 4);
            labeledText("Motivation:", npc.motivation, 4);
            labeledText("Secret:", npc.secret, 4);

            if (npc.dialogue) {
                y += 2;
                subHeading("  Key Dialogue");
                dialogueBlock("Greeting", npc.dialogue.greeting);
                dialogueBlock("Quest", npc.dialogue.quest);
                dialogueBlock("Farewell", npc.dialogue.farewell);
            }

            boldDivider();
        });

        // Library NPCs
        npcItems.forEach((item) => {
            const npc = (npcsData as { id: string; name: string; race: string; role: string; class: string; appearance: string; personality: string[]; motivation: string; secret: string; cr: number; dialogue: { greeting: string; quest: string; farewell: string } }[]).find((n) => n.id === item.id);
            if (!npc) return;

            checkPage(30);
            y += 3;

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(11);
            pdf.setTextColor(40, 30, 20);
            pdf.text(npc.name, margin + 4, y + 6);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(120, 90, 60);
            pdf.text(npc.race + " / " + npc.class + " / " + npc.role + " / CR " + npc.cr, margin + 4, y + 11);
            y += 16;

            labeledText("Appearance:", npc.appearance, 4);
            labeledText("Personality:", npc.personality.join(", "), 4);
            labeledText("Motivation:", npc.motivation, 4);
            labeledText("Secret:", npc.secret, 4);

            if (npc.dialogue) {
                y += 2;
                subHeading("  Key Dialogue");
                dialogueBlock("Greeting", npc.dialogue.greeting);
                dialogueBlock("Quest", npc.dialogue.quest);
                dialogueBlock("Farewell", npc.dialogue.farewell);
            }

            boldDivider();
        });
    }

    /* ── Encounters / Bestiary Section ── */
    const manualEncounters = plan.encounters.filter(Boolean);
    if (manualEncounters.length > 0 || monsterItems.length > 0) {
        sectionTitle("Encounters & Bestiary");
        manualEncounters.forEach((e) => bulletItem(e));

        monsterItems.forEach((item) => {
            type MonsterEntry = (typeof monstersData)[number];
            const mon = (monstersData as MonsterEntry[]).find((m) => m.id === item.id);
            if (!mon) return;

            checkPage(40);
            y += 4;

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(13);
            pdf.setTextColor(122, 32, 13);
            pdf.text(mon.name, margin + 2, y);
            y += 5;

            pdf.setFont("helvetica", "italic");
            pdf.setFontSize(9);
            pdf.setTextColor(60, 50, 40);
            pdf.text(mon.size + " " + mon.type + ", " + mon.alignment, margin + 2, y);
            y += 5;

            thinDivider();

            labeledText("Armor Class:", mon.ac + (mon.acType ? " (" + mon.acType + ")" : ""));
            labeledText("Hit Points:", mon.hp + " (" + mon.hitDice + ")");
            labeledText("Speed:", mon.speed);

            thinDivider();

            // Ability scores
            const abilities = mon.abilities as Record<string, number>;
            const abilKeys = ["str", "dex", "con", "int", "wis", "cha"];
            const colW = contentW / 6;
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(8);
            pdf.setTextColor(122, 32, 13);
            abilKeys.forEach((key, i) => {
                pdf.text(key.toUpperCase(), margin + i * colW + colW / 2, y, { align: "center" });
            });
            y += 4;
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(60, 50, 40);
            abilKeys.forEach((key, i) => {
                const val = abilities[key];
                pdf.text(val + " (" + calcMod(val) + ")", margin + i * colW + colW / 2, y, { align: "center" });
            });
            y += 5;

            thinDivider();

            if (mon.savingThrows) labeledText("Saving Throws:", mon.savingThrows);
            if (mon.skills) labeledText("Skills:", mon.skills);
            if ((mon as { vulnerabilities?: string }).vulnerabilities) labeledText("Damage Vulnerabilities:", (mon as { vulnerabilities: string }).vulnerabilities);
            if ((mon as { resistances?: string }).resistances) labeledText("Damage Resistances:", (mon as { resistances: string }).resistances);
            if ((mon as { immunities?: string }).immunities) labeledText("Damage Immunities:", (mon as { immunities: string }).immunities);
            if ((mon as { conditionImmunities?: string }).conditionImmunities) labeledText("Condition Immunities:", (mon as { conditionImmunities: string }).conditionImmunities);
            labeledText("Senses:", mon.senses);
            labeledText("Languages:", mon.languages);
            labeledText("Challenge:", crLabel(mon.cr) + " (" + mon.xp + " XP)");

            thinDivider();

            if (mon.traits && mon.traits.length > 0) {
                mon.traits.forEach((t) => {
                    checkPage(8);
                    pdf.setFont("helvetica", "bolditalic");
                    pdf.setFontSize(9);
                    pdf.setTextColor(60, 50, 40);
                    const nameW = pdf.getTextWidth(t.name + ". ");
                    pdf.text(t.name + ".", margin + 2, y);
                    pdf.setFont("helvetica", "normal");
                    const descLines = pdf.splitTextToSize(t.desc, contentW - nameW - 4);
                    pdf.text(descLines[0], margin + 2 + nameW, y);
                    y += 4.5;
                    for (let i = 1; i < descLines.length; i++) {
                        checkPage(5);
                        pdf.text(descLines[i], margin + 4, y);
                        y += 4.5;
                    }
                });
                thinDivider();
            }

            subHeading("Actions");
            mon.actions.forEach((a) => {
                checkPage(8);
                pdf.setFont("helvetica", "bolditalic");
                pdf.setFontSize(9);
                pdf.setTextColor(60, 50, 40);
                const nameW = pdf.getTextWidth(a.name + ". ");
                pdf.text(a.name + ".", margin + 2, y);
                pdf.setFont("helvetica", "normal");
                const descLines = pdf.splitTextToSize(a.desc, contentW - nameW - 4);
                pdf.text(descLines[0], margin + 2 + nameW, y);
                y += 4.5;
                for (let i = 1; i < descLines.length; i++) {
                    checkPage(5);
                    pdf.text(descLines[i], margin + 4, y);
                    y += 4.5;
                }
            });

            if (mon.legendaryActions && mon.legendaryActions.length > 0) {
                thinDivider();
                subHeading("Legendary Actions");
                mon.legendaryActions.forEach((la) => {
                    checkPage(8);
                    pdf.setFont("helvetica", "bolditalic");
                    pdf.setFontSize(9);
                    pdf.setTextColor(60, 50, 40);
                    const nameW = pdf.getTextWidth(la.name + ". ");
                    pdf.text(la.name + ".", margin + 2, y);
                    pdf.setFont("helvetica", "normal");
                    const descLines = pdf.splitTextToSize(la.desc, contentW - nameW - 4);
                    pdf.text(descLines[0], margin + 2 + nameW, y);
                    y += 4.5;
                    for (let i = 1; i < descLines.length; i++) {
                        checkPage(5);
                        pdf.text(descLines[i], margin + 4, y);
                        y += 4.5;
                    }
                });
            }

            if (mon.tactics) {
                thinDivider();
                labeledText("Tactics:", mon.tactics);
            }
            if (mon.dmTips) {
                labeledText("DM Tips:", mon.dmTips);
            }

            boldDivider();
        });
    }

    // Social Challenges
    const socialChallenges = plan.socialChallenges.filter(Boolean);
    if (socialChallenges.length > 0) {
        sectionTitle("Social Challenges");
        socialChallenges.forEach((sc) => bulletItem(sc));
        y += 2;
    }

    /* ── Locations ── */
    const locs = plan.locations.filter(Boolean);
    if (locs.length > 0) {
        sectionTitle("Locations");
        locs.forEach((l, i) => {
            bulletItem(l);
            if (linkedMaps[i]) {
                checkPage(6);
                pdf.setFont("helvetica", "italic");
                pdf.setFontSize(8);
                pdf.setTextColor(120, 90, 60);
                pdf.text("    [Map Reference: " + linkedMaps[i].name + " - see appendix]", margin + 7, y);
                y += 4.5;
            }
        });
        if (plan.mapNotes) {
            y += 2;
            labeledText("Map Notes:", plan.mapNotes);
        }
        y += 2;
    }

    /* ── Prep Section ── */
    const propsArr = plan.propsHandouts.filter(Boolean);
    if (plan.musicMood || propsArr.length > 0 || plan.rulesReview) {
        sectionTitle("Preparation");
        if (plan.musicMood) labeledText("Music / Mood:", plan.musicMood);
        if (propsArr.length > 0) {
            subHeading("Props & Handouts");
            propsArr.forEach((p) => bulletItem(p));
        }
        if (plan.rulesReview) labeledText("Rules to Review:", plan.rulesReview);
        y += 2;
    }

    /* ── Additional Notes ── */
    if (plan.notes) {
        sectionTitle("Additional Notes");
        bodyText(plan.notes);
    }

    /* ── FULL-PAGE MAP REFERENCE SHEETS ── */
    const uniqueMaps = new Map<string, MapData>();
    for (const map of Object.values(linkedMaps)) {
        uniqueMaps.set(map.id, map);
    }

    uniqueMaps.forEach((map) => {
        /* ── PAGE 1: FULL-PAGE MAP IMAGE ── */
        try {
            const renderInput: MapRenderInput = {
                id: map.id,
                name: map.name,
                environment: map.environment,
                gridSize: map.gridSize,
                difficulty: map.difficulty,
                keyFeatures: map.keyFeatures || [],
            };
            const dataURLs = renderMapToDataURLs(renderInput);

            for (let fi = 0; fi < dataURLs.length; fi++) {
                pdf.addPage();
                y = margin;
                drawPageBorder();

                // Title bar
                pdf.setFillColor(40, 30, 20);
                pdf.rect(margin, y, contentW, 14, "F");
                pdf.setDrawColor(180, 140, 80);
                pdf.setLineWidth(0.5);
                pdf.line(margin, y, margin + contentW, y);
                pdf.line(margin, y + 14, margin + contentW, y + 14);
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(16);
                pdf.setTextColor(220, 185, 120);
                const floorLabel = dataURLs.length > 1 ? ` — Floor ${fi + 1}` : "";
                pdf.text("MAP: " + map.name.toUpperCase() + floorLabel, margin + 4, y + 10);
                y += 18;

                // Embed the rendered map image
                const imgData = dataURLs[fi];
                // Calculate dimensions to fit within content area while keeping aspect ratio
                const maxImgW = contentW;
                const maxImgH = pageH - y - margin - 10;
                // The canvas is roughly 4:3 aspect
                const imgAspect = 1.25; // width / height (rough)
                let imgW = maxImgW;
                let imgH = imgW / imgAspect;
                if (imgH > maxImgH) {
                    imgH = maxImgH;
                    imgW = imgH * imgAspect;
                }
                const imgX = margin + (contentW - imgW) / 2;
                pdf.addImage(imgData, "PNG", imgX, y, imgW, imgH);
                y += imgH + 4;

                // Small attribution line
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(7);
                pdf.setTextColor(150, 130, 100);
                pdf.text("1 square = 5 ft  |  " + map.environment + "  |  " + map.gridSize + "  |  " + map.difficulty, pageW / 2, y, { align: "center" });
            }
        } catch (e) {
            // If canvas rendering fails (e.g. SSR), skip the image page
            console.warn("Map image rendering failed for", map.name, e);
        }

        /* ── PAGE 2: TEXT REFERENCE SHEET ── */
        pdf.addPage();
        y = margin;
        drawPageBorder();

        // Large title header
        pdf.setFillColor(40, 30, 20);
        pdf.rect(margin, y, contentW, 14, "F");
        pdf.setDrawColor(180, 140, 80);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, margin + contentW, y);
        pdf.line(margin, y + 14, margin + contentW, y + 14);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(220, 185, 120);
        pdf.text("MAP REFERENCE", margin + 4, y + 10);
        y += 18;

        // Map name
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.setTextColor(40, 30, 20);
        pdf.text(map.name, margin + 2, y);
        y += 8;

        // Environment / Grid / Difficulty row
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(120, 90, 60);
        pdf.text(map.environment + "  |  Grid: " + map.gridSize + "  |  Difficulty: " + map.difficulty, margin + 2, y);
        y += 6;

        thinDivider();

        // Description
        subHeading("Description");
        bodyText(map.description);
        y += 3;

        // Read-Aloud Text (boxed)
        if (map.readAloudText) {
            subHeading("Read Aloud");
            pdf.setFont("helvetica", "italic");
            pdf.setFontSize(9);
            pdf.setTextColor(80, 50, 20);
            const readLines = pdf.splitTextToSize(map.readAloudText, contentW - 12);
            const boxH = readLines.length * 4.5 + 6;
            checkPage(boxH + 4);
            pdf.setFillColor(250, 245, 230);
            pdf.setDrawColor(180, 140, 80);
            pdf.setLineWidth(0.5);
            pdf.roundedRect(margin, y - 2, contentW, boxH, 2, 2, "FD");
            y += 2;
            for (const line of readLines) {
                pdf.text(line, margin + 6, y);
                y += 4.5;
            }
            y += 4;
        }

        thinDivider();

        // Key Features
        if (map.keyFeatures && map.keyFeatures.length > 0) {
            subHeading("Key Features");
            map.keyFeatures.forEach((f) => bulletItem(f));
            y += 2;
        }

        // Suggested Encounters
        if (map.suggestedEncounters && map.suggestedEncounters.length > 0) {
            subHeading("Suggested Encounters");
            map.suggestedEncounters.forEach((e) => bulletItem(e));
            y += 2;
        }

        // Tactical Notes
        if (map.tacticalNotes) {
            subHeading("Tactical Notes");
            bodyText(map.tacticalNotes);
            y += 2;
        }

        // Loot Suggestions
        if (map.lootSuggestions && map.lootSuggestions.length > 0) {
            subHeading("Loot & Treasure");
            map.lootSuggestions.forEach((l) => bulletItem(l));
            y += 2;
        }

        boldDivider();
    });

    /* ── Footer on every page ── */
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(150, 130, 100);
        pdf.text("DM's Tome -- Session " + (plan.sessionNumber || "?") + " -- Page " + i + " of " + pageCount, pageW / 2, pageH - 6, { align: "center" });
    }

    /* ── Save ── */
    pdf.save("session-" + (plan.sessionNumber || "plan") + ".pdf");
}
