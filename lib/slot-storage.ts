/**
 * Slot-based storage utilities for production designer flows
 * Manages multiple save slots with metadata (title, description, timestamps)
 */

import type { Node, Edge } from "@xyflow/react"
import type { RecipeNodeData } from "./types"

export interface SlotInfo {
    index: number
    title: string
    description: string
    lastModified: string // ISO 8601 timestamp
    isEmpty: boolean
}

export interface FlowData {
    nodes: Node<RecipeNodeData>[]
    edges: Edge[]
    viewport: {
        x: number
        y: number
        zoom: number
    }
}

const SLOT_COUNT = 10
const SLOT_KEY_PREFIX = "lrl-designer-slot-"
const METADATA_KEY = "lrl-designer-slot-metadata"
const ACTIVE_SLOT_KEY = "lrl-designer-current-slot"
const OLD_STORAGE_KEY = "lrl-designer-flow"

/**
 * Migrates old single-slot storage to slot-based system
 * Only runs once on first load with new system
 */
export function migrateOldStorage(): void {
    try {
        const oldData = localStorage.getItem(OLD_STORAGE_KEY)
        if (!oldData) {
            return // No migration needed
        }

        // Check if already migrated
        const existingSlot0 = localStorage.getItem(`${SLOT_KEY_PREFIX}0`)
        if (existingSlot0) {
            return // Already migrated
        }

        // Migrate to slot 0
        localStorage.setItem(`${SLOT_KEY_PREFIX}0`, oldData)

        // Create metadata for slot 0
        const metadata: SlotInfo[] = Array.from({ length: SLOT_COUNT }, (_, i) => ({
            index: i,
            title: i === 0 ? "Default Design" : "",
            description: "",
            lastModified: i === 0 ? new Date().toISOString() : "",
            isEmpty: i !== 0,
        }))

        localStorage.setItem(METADATA_KEY, JSON.stringify(metadata))

        // Set slot 0 as active
        localStorage.setItem(ACTIVE_SLOT_KEY, "0")

        // Remove old key
        localStorage.removeItem(OLD_STORAGE_KEY)

        console.log("[SlotStorage] Migrated old storage to slot 0")
    } catch (error) {
        console.error("[SlotStorage] Migration failed:", error)
    }
}

/**
 * Gets all slot metadata
 * Initializes empty metadata if none exists
 */
export function getSlotMetadata(): SlotInfo[] {
    try {
        const metadata = localStorage.getItem(METADATA_KEY)
        if (!metadata) {
            // Initialize empty metadata
            const emptyMetadata: SlotInfo[] = Array.from({ length: SLOT_COUNT }, (_, i) => ({
                index: i,
                title: "",
                description: "",
                lastModified: "",
                isEmpty: true,
            }))
            localStorage.setItem(METADATA_KEY, JSON.stringify(emptyMetadata))
            return emptyMetadata
        }
        return JSON.parse(metadata)
    } catch (error) {
        console.error("[SlotStorage] Failed to get metadata:", error)
        return Array.from({ length: SLOT_COUNT }, (_, i) => ({
            index: i,
            title: "",
            description: "",
            lastModified: "",
            isEmpty: true,
        }))
    }
}

/**
 * Updates metadata for all slots
 */
export function updateSlotMetadata(metadata: SlotInfo[]): void {
    try {
        localStorage.setItem(METADATA_KEY, JSON.stringify(metadata))
    } catch (error) {
        console.error("[SlotStorage] Failed to update metadata:", error)
        throw new Error("Failed to save metadata. Storage may be full.")
    }
}

/**
 * Saves flow data to a specific slot with metadata
 */
export function saveFlowToSlot(
    slotIndex: number,
    flowData: FlowData,
    title: string,
    description: string = "",
): void {
    if (slotIndex < 0 || slotIndex >= SLOT_COUNT) {
        throw new Error(`Invalid slot index: ${slotIndex}`)
    }

    if (!title || title.trim() === "") {
        throw new Error("Title is required")
    }

    if (title.length > 50) {
        throw new Error("Title must be 50 characters or less")
    }

    if (description.length > 200) {
        throw new Error("Description must be 200 characters or less")
    }

    try {
        // Save flow data
        const flowJson = JSON.stringify(flowData)
        localStorage.setItem(`${SLOT_KEY_PREFIX}${slotIndex}`, flowJson)

        // Update metadata
        const metadata = getSlotMetadata()
        metadata[slotIndex] = {
            index: slotIndex,
            title: title.trim(),
            description: description.trim(),
            lastModified: new Date().toISOString(),
            isEmpty: false,
        }
        updateSlotMetadata(metadata)

        console.log(`[SlotStorage] Saved to slot ${slotIndex}: "${title}"`)
    } catch (error) {
        console.error(`[SlotStorage] Failed to save to slot ${slotIndex}:`, error)
        if (error instanceof Error && error.name === "QuotaExceededError") {
            throw new Error("Storage quota exceeded. Try deleting unused slots.")
        }
        throw new Error("Failed to save flow")
    }
}

/**
 * Loads flow data from a specific slot
 */
export function loadFlowFromSlot(slotIndex: number): FlowData | null {
    if (slotIndex < 0 || slotIndex >= SLOT_COUNT) {
        throw new Error(`Invalid slot index: ${slotIndex}`)
    }

    try {
        const flowJson = localStorage.getItem(`${SLOT_KEY_PREFIX}${slotIndex}`)
        if (!flowJson) {
            return null
        }

        const flowData = JSON.parse(flowJson) as FlowData
        console.log(`[SlotStorage] Loaded from slot ${slotIndex}`)
        return flowData
    } catch (error) {
        console.error(`[SlotStorage] Failed to load from slot ${slotIndex}:`, error)
        throw new Error("Failed to load flow")
    }
}

/**
 * Deletes a slot (flow data and metadata)
 */
export function deleteSlot(slotIndex: number): void {
    if (slotIndex < 0 || slotIndex >= SLOT_COUNT) {
        throw new Error(`Invalid slot index: ${slotIndex}`)
    }

    try {
        // Remove flow data
        localStorage.removeItem(`${SLOT_KEY_PREFIX}${slotIndex}`)

        // Update metadata to mark as empty
        const metadata = getSlotMetadata()
        metadata[slotIndex] = {
            index: slotIndex,
            title: "",
            description: "",
            lastModified: "",
            isEmpty: true,
        }
        updateSlotMetadata(metadata)

        // If deleted slot was active, reset to slot 0
        const currentActive = getCurrentActiveSlot()
        if (currentActive === slotIndex) {
            setCurrentActiveSlot(0)
        }

        console.log(`[SlotStorage] Deleted slot ${slotIndex}`)
    } catch (error) {
        console.error(`[SlotStorage] Failed to delete slot ${slotIndex}:`, error)
        throw new Error("Failed to delete slot")
    }
}

/**
 * Edits metadata (title and description) for a slot without changing flow data
 */
export function editSlotMetadata(slotIndex: number, title: string, description: string = ""): void {
    if (slotIndex < 0 || slotIndex >= SLOT_COUNT) {
        throw new Error(`Invalid slot index: ${slotIndex}`)
    }

    if (!title || title.trim() === "") {
        throw new Error("Title is required")
    }

    if (title.length > 50) {
        throw new Error("Title must be 50 characters or less")
    }

    if (description.length > 200) {
        throw new Error("Description must be 200 characters or less")
    }

    try {
        const metadata = getSlotMetadata()

        // Verify slot is not empty
        if (metadata[slotIndex].isEmpty) {
            throw new Error("Cannot edit metadata for empty slot")
        }

        // Update only metadata
        metadata[slotIndex] = {
            ...metadata[slotIndex],
            title: title.trim(),
            description: description.trim(),
            lastModified: new Date().toISOString(),
        }
        updateSlotMetadata(metadata)

        console.log(`[SlotStorage] Updated metadata for slot ${slotIndex}: "${title}"`)
    } catch (error) {
        console.error(`[SlotStorage] Failed to edit metadata for slot ${slotIndex}:`, error)
        throw error
    }
}

/**
 * Gets the current active slot index
 */
export function getCurrentActiveSlot(): number {
    try {
        const active = localStorage.getItem(ACTIVE_SLOT_KEY)
        return active ? parseInt(active, 10) : 0
    } catch (error) {
        console.error("[SlotStorage] Failed to get active slot:", error)
        return 0
    }
}

/**
 * Sets the current active slot index
 */
export function setCurrentActiveSlot(slotIndex: number): void {
    if (slotIndex < 0 || slotIndex >= SLOT_COUNT) {
        throw new Error(`Invalid slot index: ${slotIndex}`)
    }

    try {
        localStorage.setItem(ACTIVE_SLOT_KEY, slotIndex.toString())
        console.log(`[SlotStorage] Set active slot to ${slotIndex}`)
    } catch (error) {
        console.error("[SlotStorage] Failed to set active slot:", error)
        throw new Error("Failed to set active slot")
    }
}

