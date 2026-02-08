/* Shared utility for session planner localStorage integration */

export interface SessionItem {
    id: string;
    type: "npc" | "monster" | "map" | "story-arc";
    name: string;
    detail: string;
    addedAt: number;
}

const SESSION_ITEMS_KEY = "dnd-session-items";

export function getSessionItems(): SessionItem[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(SESSION_ITEMS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function addSessionItem(item: Omit<SessionItem, "addedAt">): boolean {
    const items = getSessionItems();
    // Prevent duplicates by id + type
    if (items.some((i) => i.id === item.id && i.type === item.type)) return false;
    items.push({ ...item, addedAt: Date.now() });
    localStorage.setItem(SESSION_ITEMS_KEY, JSON.stringify(items));
    // Dispatch storage event for cross-component reactivity
    window.dispatchEvent(new Event("session-items-updated"));
    return true;
}

export function removeSessionItem(id: string, type: string) {
    const items = getSessionItems().filter((i) => !(i.id === id && i.type === type));
    localStorage.setItem(SESSION_ITEMS_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("session-items-updated"));
}

export function clearSessionItems() {
    localStorage.setItem(SESSION_ITEMS_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event("session-items-updated"));
}
