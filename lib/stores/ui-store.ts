/**
 * UIStore - Manages UI state (panels, dialogs, search, filters)
 * 
 * Responsibilities:
 * - Search term and category filter
 * - Panel visibility (sidebar)
 * - Dialog states (save, load, settings)
 * - Mobile menu state
 * 
 * No persistence - session-only state
 */

import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface UIState {
    // Search and filters
    searchTerm: string
    selectedCategory: string | null

    // Panel visibility
    isPanelOpen: boolean

    // Dialog states
    showSaveAsDialog: boolean
    showLoadDialog: boolean
    showSettingsDialog: boolean

    // Mobile menu
    showMobileMenu: boolean
}

interface UIActions {
    // Search and filter actions
    setSearchTerm: (term: string) => void
    setSelectedCategory: (category: string | null) => void
    clearFilters: () => void

    // Panel actions
    togglePanel: () => void
    setIsPanelOpen: (isOpen: boolean) => void

    // Dialog actions
    openSaveAsDialog: () => void
    closeSaveAsDialog: () => void
    openLoadDialog: () => void
    closeLoadDialog: () => void
    openSettingsDialog: () => void
    closeSettingsDialog: () => void

    // Mobile menu actions
    openMobileMenu: () => void
    closeMobileMenu: () => void
    toggleMobileMenu: () => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>()(
    devtools(
        (set) => ({
            // Initial state
            searchTerm: "",
            selectedCategory: null,
            isPanelOpen: true,
            showSaveAsDialog: false,
            showLoadDialog: false,
            showSettingsDialog: false,
            showMobileMenu: false,

            // Search and filter actions
            setSearchTerm: (term) => set({ searchTerm: term }),
            setSelectedCategory: (category) => set({ selectedCategory: category }),
            clearFilters: () => set({ searchTerm: "", selectedCategory: null }),

            // Panel actions
            togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
            setIsPanelOpen: (isOpen) => set({ isPanelOpen: isOpen }),

            // Dialog actions
            openSaveAsDialog: () => set({ showSaveAsDialog: true }),
            closeSaveAsDialog: () => set({ showSaveAsDialog: false }),
            openLoadDialog: () => set({ showLoadDialog: true }),
            closeLoadDialog: () => set({ showLoadDialog: false }),
            openSettingsDialog: () => set({ showSettingsDialog: true }),
            closeSettingsDialog: () => set({ showSettingsDialog: false }),

            // Mobile menu actions
            openMobileMenu: () => set({ showMobileMenu: true }),
            closeMobileMenu: () => set({ showMobileMenu: false }),
            toggleMobileMenu: () => set((state) => ({ showMobileMenu: !state.showMobileMenu })),
        }),
        { name: "UIStore" }
    )
)

