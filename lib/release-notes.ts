import type { ReleaseNote } from "./types"

/**
 * Release notes for the Little Rocket Lab Designer
 * Each entry represents a version with user-friendly descriptions of changes
 */
export const releaseNotes: ReleaseNote[] = [
    {
        version: "1.0.0",
        date: "2025-10-25",
        changes: [
            "Node Duplication: Easily duplicate nodes for resources like Coal, Iron Ore, and Copper Ore",
            "Dedicated Production Lines: Option to create separate production lines for commonly shared components like Gears and Bearings",
            "Auto Build: Automatically build complete production chains by filling in missing ingredients",
            "State Management Upgrade: Migrated to Zustand for better performance and maintainability",
        ],
    },
    {
        version: "0.5.0",
        date: "2025-10-24",
        changes: [
            "Icon View: Compact icon-only view for resource and machinery nodes that auto-activates when zoomed out",
            "Production Indicators: Visual indicators show optimal production rates for each node in your chain",
            "Settings Panel: Customize your experience with options for icon nodes, zoom thresholds, and production line behavior",

        ],
    },
    {
        version: "0.4.0",
        date: "2025-10-23",
        changes: [
            "Calculate the optimal quantity requirements for input nodes to satisfy downstream production chains.",
            "Auto Layout: Organize your production nodes with automatic horizontal or vertical layout",
        ],
    },
    {
        version: "0.3.0",
        date: "2025-10-20",
        changes: [
            "Mobile Support: Fully responsive design works great on mobile devices with a dedicated menu",
            "Resource and machinery nodes are displayed as compact icon-only nodes to reduce visual clutter",
            "Save and Restore: Save your production designs and restore them later",
            "Multiple Save Slots: Manage up to 10 different production designs with custom names and descriptions",
        ],
    },
    {
        version: "0.2.0",
        date: "2025-10-20",
        changes: [
            "Added icons",
            "Dark Mode: Toggle between light and dark themes for comfortable viewing",
            "Auto Layout: Organize your production nodes with automatic horizontal or vertical layout",
        ],
    },
    {
        version: "0.1.0",
        date: "2025-10-16",
        changes: [
            "First version, basic functionality",
        ],
    },
]

/**
 * Get the latest release note
 */
export function getLatestRelease(): ReleaseNote | undefined {
    return releaseNotes[0]
}

/**
 * Get all release notes
 */
export function getAllReleases(): ReleaseNote[] {
    return releaseNotes
}

/**
 * Get the last update date from the latest release
 */
export function getLastUpdateDate(): string {
    const latest = getLatestRelease()
    if (!latest) return "Unknown"

    // Format date as "Month DD, YYYY"
    const date = new Date(latest.date)
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

