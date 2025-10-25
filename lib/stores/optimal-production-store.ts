/**
 * OptimalProductionStore - Manages production calculations
 * 
 * Responsibilities:
 * - Store optimal production calculations map
 * - Calculate production requirements based on nodes and edges
 * - Update calculations reactively when graph changes
 * 
 * No persistence - calculated state
 */

import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { OptimalProductionMap } from "@/lib/types"

interface OptimalProductionState {
    optimalProduction: OptimalProductionMap
}

interface OptimalProductionActions {
    setOptimalProduction: (production: OptimalProductionMap) => void
    clearOptimalProduction: () => void
    getNodeProduction: (nodeId: string) => ReturnType<OptimalProductionMap['get']>
}

type OptimalProductionStore = OptimalProductionState & OptimalProductionActions

export const useOptimalProductionStore = create<OptimalProductionStore>()(
    devtools(
        (set, get) => ({
            // Initial state
            optimalProduction: new Map(),

            // Actions
            setOptimalProduction: (production) => {
                set({ optimalProduction: production })
            },

            clearOptimalProduction: () => {
                set({ optimalProduction: new Map() })
            },

            getNodeProduction: (nodeId) => {
                return get().optimalProduction.get(nodeId)
            },
        }),
        { name: "OptimalProductionStore" }
    )
)

