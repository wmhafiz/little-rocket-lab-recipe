/**
 * SettingsStore - Manages designer settings with localStorage persistence
 * 
 * Responsibilities:
 * - Designer settings (icon modes, thresholds, production lines)
 * - Settings persistence via Zustand persist middleware
 * - Update and reset settings
 * 
 * Replaces: lib/settings-storage.ts functions
 */

import { create } from "zustand"
import { devtools, persist, createJSONStorage } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import type { DesignerSettings } from "@/lib/types"

const DEFAULT_SETTINGS: DesignerSettings = {
    showResourceIconNodes: true,
    showMachineryIconNodes: true,
    autoIconOnlyMode: true,
    iconOnlyZoomThreshold: 0.75,
    useDedicatedProductionLines: true,
    dedicatedLineConsumers: {
        gear: true,
        bearing: true,
        ironPlate: true,
        heatsink: true,
        copperWire: true,
    },
}

interface SettingsState {
    settings: DesignerSettings
}

interface SettingsActions {
    updateSettings: (settings: Partial<DesignerSettings>) => void
    resetSettings: () => void
    updateShowResourceIconNodes: (value: boolean) => void
    updateShowMachineryIconNodes: (value: boolean) => void
    updateAutoIconOnlyMode: (value: boolean) => void
    updateIconOnlyZoomThreshold: (value: number) => void
    updateUseDedicatedProductionLines: (value: boolean) => void
    updateDedicatedLineConsumer: (consumer: keyof DesignerSettings['dedicatedLineConsumers'], value: boolean) => void
}

type SettingsStore = SettingsState & SettingsActions

export const useSettingsStore = create<SettingsStore>()(
    devtools(
        persist(
            immer((set) => ({
                // Initial state
                settings: DEFAULT_SETTINGS,

                // Actions
                updateSettings: (newSettings) =>
                    set((state) => {
                        state.settings = { ...state.settings, ...newSettings }
                    }),

                resetSettings: () =>
                    set((state) => {
                        state.settings = { ...DEFAULT_SETTINGS }
                    }),

                updateShowResourceIconNodes: (value) =>
                    set((state) => {
                        state.settings.showResourceIconNodes = value
                    }),

                updateShowMachineryIconNodes: (value) =>
                    set((state) => {
                        state.settings.showMachineryIconNodes = value
                    }),

                updateAutoIconOnlyMode: (value) =>
                    set((state) => {
                        state.settings.autoIconOnlyMode = value
                    }),

                updateIconOnlyZoomThreshold: (value) =>
                    set((state) => {
                        state.settings.iconOnlyZoomThreshold = value
                    }),

                updateUseDedicatedProductionLines: (value) =>
                    set((state) => {
                        state.settings.useDedicatedProductionLines = value
                    }),

                updateDedicatedLineConsumer: (consumer, value) =>
                    set((state) => {
                        state.settings.dedicatedLineConsumers[consumer] = value
                    }),
            })),
            {
                name: "lrl-designer-settings",
                storage: createJSONStorage(() => localStorage),
            }
        ),
        { name: "SettingsStore" }
    )
)

export { DEFAULT_SETTINGS }

