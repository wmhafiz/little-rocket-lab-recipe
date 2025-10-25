/**
 * SlotStore - Manages multi-slot save/restore system with localStorage persistence
 * 
 * Responsibilities:
 * - Slot metadata management (title, description, timestamps)
 * - Flow save/restore operations
 * - Slot switching and deletion
 * - Migration from old storage format
 * - Backward-compatible localStorage persistence
 * 
 * Replaces: lib/slot-storage.ts functions
 */

import { create } from "zustand"
import { devtools, persist, createJSONStorage, type StateStorage } from "zustand/middleware"
import type { Node, Edge } from "@xyflow/react"
import type { RecipeNodeData } from "@/lib/types"

const SLOT_COUNT = 10
const SLOT_KEY_PREFIX = "lrl-designer-slot-"
const METADATA_KEY = "lrl-designer-slot-metadata"
const ACTIVE_SLOT_KEY = "lrl-designer-current-slot"
const OLD_STORAGE_KEY = "lrl-designer-flow"

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

interface SlotState {
    currentSlot: number
    slots: SlotInfo[]
}

interface SlotActions {
    // Slot management
    setCurrentSlot: (slotIndex: number) => void
    refreshSlots: () => void

    // Flow operations
    saveFlow: (slotIndex: number, flowData: FlowData, title: string, description?: string) => void
    loadFlow: (slotIndex: number) => FlowData | null
    deleteSlot: (slotIndex: number) => void
    editSlotMetadata: (slotIndex: number, title: string, description?: string) => void

    // Migration
    migrateOldStorage: () => void
}

type SlotStore = SlotState & SlotActions

/**
 * Custom storage adapter for backward compatibility
 * Reads/writes slots to individual localStorage keys
 * Handles SSR by checking for browser environment
 */
const slotStorageAdapter: StateStorage = {
    getItem: (name) => {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
            return null
        }

        try {
            const metadata = localStorage.getItem(METADATA_KEY)
            const currentSlot = localStorage.getItem(ACTIVE_SLOT_KEY)

            if (!metadata) {
                // Initialize empty metadata
                const emptyMetadata: SlotInfo[] = Array.from({ length: SLOT_COUNT }, (_, i) => ({
                    index: i,
                    title: "",
                    description: "",
                    lastModified: "",
                    isEmpty: true,
                }))

                const state: SlotState = {
                    currentSlot: currentSlot ? parseInt(currentSlot, 10) : 0,
                    slots: emptyMetadata,
                }

                return JSON.stringify({ state })
            }

            const state: SlotState = {
                currentSlot: currentSlot ? parseInt(currentSlot, 10) : 0,
                slots: JSON.parse(metadata),
            }

            return JSON.stringify({ state })
        } catch (error) {
            console.error("[SlotStore] Failed to get item:", error)
            return null
        }
    },

    setItem: (name, value) => {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
            return
        }

        try {
            const { state } = JSON.parse(value) as { state: SlotState }
            localStorage.setItem(METADATA_KEY, JSON.stringify(state.slots))
            localStorage.setItem(ACTIVE_SLOT_KEY, state.currentSlot.toString())
        } catch (error) {
            console.error("[SlotStore] Failed to set item:", error)
        }
    },

    removeItem: (name) => {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
            return
        }

        try {
            localStorage.removeItem(METADATA_KEY)
            localStorage.removeItem(ACTIVE_SLOT_KEY)
        } catch (error) {
            console.error("[SlotStore] Failed to remove item:", error)
        }
    },
}

/**
 * Gets all slot metadata from localStorage
 */
function getSlotMetadataFromStorage(): SlotInfo[] {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
        return Array.from({ length: SLOT_COUNT }, (_, i) => ({
            index: i,
            title: "",
            description: "",
            lastModified: "",
            isEmpty: true,
        }))
    }

    try {
        const metadata = localStorage.getItem(METADATA_KEY)
        if (!metadata) {
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
        console.error("[SlotStore] Failed to get metadata:", error)
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
 * Gets current active slot from localStorage
 */
function getCurrentActiveSlotFromStorage(): number {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
        return 0
    }

    try {
        const active = localStorage.getItem(ACTIVE_SLOT_KEY)
        return active ? parseInt(active, 10) : 0
    } catch (error) {
        console.error("[SlotStore] Failed to get active slot:", error)
        return 0
    }
}

export const useSlotStore = create<SlotStore>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                currentSlot: 0,
                slots: Array.from({ length: SLOT_COUNT }, (_, i) => ({
                    index: i,
                    title: "",
                    description: "",
                    lastModified: "",
                    isEmpty: true,
                })),

                // Actions
                setCurrentSlot: (slotIndex) => {
                    if (slotIndex < 0 || slotIndex >= SLOT_COUNT) {
                        throw new Error(`Invalid slot index: ${slotIndex}`)
                    }

                    // Check if we're in a browser environment
                    if (typeof window === 'undefined') {
                        return
                    }

                    try {
                        localStorage.setItem(ACTIVE_SLOT_KEY, slotIndex.toString())
                        set({ currentSlot: slotIndex })
                        console.log(`[SlotStore] Set active slot to ${slotIndex}`)
                    } catch (error) {
                        console.error("[SlotStore] Failed to set active slot:", error)
                        throw new Error("Failed to set active slot")
                    }
                },

                refreshSlots: () => {
                    const slots = getSlotMetadataFromStorage()
                    const currentSlot = getCurrentActiveSlotFromStorage()
                    set({ slots, currentSlot })
                },

                saveFlow: (slotIndex, flowData, title, description = "") => {
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

                    // Check if we're in a browser environment
                    if (typeof window === 'undefined') {
                        return
                    }

                    try {
                        // Save flow data to individual slot key
                        const flowJson = JSON.stringify(flowData)
                        localStorage.setItem(`${SLOT_KEY_PREFIX}${slotIndex}`, flowJson)

                        // Update metadata
                        const metadata = getSlotMetadataFromStorage()
                        metadata[slotIndex] = {
                            index: slotIndex,
                            title: title.trim(),
                            description: description.trim(),
                            lastModified: new Date().toISOString(),
                            isEmpty: false,
                        }
                        localStorage.setItem(METADATA_KEY, JSON.stringify(metadata))

                        // Update store state
                        set({ slots: metadata })

                        console.log(`[SlotStore] Saved to slot ${slotIndex}: "${title}"`)
                    } catch (error) {
                        console.error(`[SlotStore] Failed to save to slot ${slotIndex}:`, error)
                        if (error instanceof Error && error.name === "QuotaExceededError") {
                            throw new Error("Storage quota exceeded. Try deleting unused slots.")
                        }
                        throw new Error("Failed to save flow")
                    }
                },

                loadFlow: (slotIndex) => {
                    if (slotIndex < 0 || slotIndex >= SLOT_COUNT) {
                        throw new Error(`Invalid slot index: ${slotIndex}`)
                    }

                    // Check if we're in a browser environment
                    if (typeof window === 'undefined') {
                        return null
                    }

                    try {
                        const flowJson = localStorage.getItem(`${SLOT_KEY_PREFIX}${slotIndex}`)
                        if (!flowJson) {
                            return null
                        }

                        const flowData = JSON.parse(flowJson) as FlowData
                        console.log(`[SlotStore] Loaded from slot ${slotIndex}`)
                        return flowData
                    } catch (error) {
                        console.error(`[SlotStore] Failed to load from slot ${slotIndex}:`, error)
                        throw new Error("Failed to load flow")
                    }
                },

                deleteSlot: (slotIndex) => {
                    if (slotIndex < 0 || slotIndex >= SLOT_COUNT) {
                        throw new Error(`Invalid slot index: ${slotIndex}`)
                    }

                    // Check if we're in a browser environment
                    if (typeof window === 'undefined') {
                        return
                    }

                    try {
                        // Remove flow data
                        localStorage.removeItem(`${SLOT_KEY_PREFIX}${slotIndex}`)

                        // Update metadata to mark as empty
                        const metadata = getSlotMetadataFromStorage()
                        metadata[slotIndex] = {
                            index: slotIndex,
                            title: "",
                            description: "",
                            lastModified: "",
                            isEmpty: true,
                        }
                        localStorage.setItem(METADATA_KEY, JSON.stringify(metadata))

                        // Update store state
                        set({ slots: metadata })

                        // If deleted slot was active, reset to slot 0
                        const currentSlot = get().currentSlot
                        if (currentSlot === slotIndex) {
                            get().setCurrentSlot(0)
                        }

                        console.log(`[SlotStore] Deleted slot ${slotIndex}`)
                    } catch (error) {
                        console.error(`[SlotStore] Failed to delete slot ${slotIndex}:`, error)
                        throw new Error("Failed to delete slot")
                    }
                },

                editSlotMetadata: (slotIndex, title, description = "") => {
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

                    // Check if we're in a browser environment
                    if (typeof window === 'undefined') {
                        return
                    }

                    try {
                        const metadata = getSlotMetadataFromStorage()

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
                        localStorage.setItem(METADATA_KEY, JSON.stringify(metadata))

                        // Update store state
                        set({ slots: metadata })

                        console.log(`[SlotStore] Updated metadata for slot ${slotIndex}: "${title}"`)
                    } catch (error) {
                        console.error(`[SlotStore] Failed to edit metadata for slot ${slotIndex}:`, error)
                        throw error
                    }
                },

                migrateOldStorage: () => {
                    // Check if we're in a browser environment
                    if (typeof window === 'undefined') {
                        return
                    }

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

                        // Update store state
                        set({ slots: metadata, currentSlot: 0 })

                        console.log("[SlotStore] Migrated old storage to slot 0")
                    } catch (error) {
                        console.error("[SlotStore] Migration failed:", error)
                    }
                },
            }),
            {
                name: "lrl-designer-slots",
                storage: createJSONStorage(() => slotStorageAdapter),
            }
        ),
        { name: "SlotStore" }
    )
)

