export interface Ingredient {
  item: string
  quantity: string
  quantityPerMin: string
}

export interface CraftRecipe {
  type: string
  name: string
  outputPerMin: string
  icon: string
  ingredients: Ingredient[]
}

export interface RecipeNodeData {
  recipe: CraftRecipe
  label: string
  selected?: boolean
  onDelete?: (nodeId: string) => void
  onDuplicate?: (nodeId: string) => void
  optimalProduction?: OptimalProductionData
  iconOnlyMode?: boolean
  [key: string]: unknown
}

export type ProductionStatus = "optimal" | "excess" | "deficit" | "disconnected" | "cycle"

export interface OptimalProductionData {
  requiredPerMin: number
  status: ProductionStatus
  consumers?: Array<{
    nodeId: string
    nodeName: string
    requiredAmount: number
  }>
}

export type OptimalProductionMap = Map<string, OptimalProductionData>

export interface DesignerSettings {
  showResourceIconNodes: boolean
  showMachineryIconNodes: boolean
  autoIconOnlyMode: boolean
  iconOnlyZoomThreshold: number
  useDedicatedProductionLines: boolean
  dedicatedLineConsumers: {
    gear: boolean
    bearing: boolean
    ironPlate: boolean
    heatsink: boolean
    copperWire: boolean
  }
}

// List of recipe names that can have duplicate nodes
export const DUPLICATABLE_NODE_TYPES = [
  "Coal",
  "Copper Ore",
  "Copper Bar",
  "Iron Ore",
  "Iron Bar",
  "Iron Plate",
  "Gear",
  "Bearing",
  "Heatsink",
  "Copper Wire",
] as const

export type DuplicatableNodeType = (typeof DUPLICATABLE_NODE_TYPES)[number]
