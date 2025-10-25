/**
 * FlowStore - Manages ReactFlow instance and flow utilities
 * 
 * Responsibilities:
 * - Store ReactFlow instance reference
 * - Layout management (horizontal/vertical)
 * - Canvas clearing utilities
 * - Viewport utilities (fitView, setViewport)
 */

import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface FlowState {
    rfInstance: any | null
}

interface FlowActions {
    setRfInstance: (instance: any) => void
    getRfInstance: () => any | null
}

type FlowStore = FlowState & FlowActions

export const useFlowStore = create<FlowStore>()(
    devtools(
        (set, get) => ({
            // State
            rfInstance: null,

            // Actions
            setRfInstance: (instance) => {
                set({ rfInstance: instance })
            },

            getRfInstance: () => {
                return get().rfInstance
            },
        }),
        { name: "FlowStore" }
    )
)

