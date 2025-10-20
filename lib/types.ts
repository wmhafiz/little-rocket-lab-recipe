export interface CraftRecipe {
  type: string
  name: string
  outputPerMin: string
  icon: string
  ingredients: Array<{
    item: string
    quantity: string
    quantityPerMin: string
  }>
}

export interface RecipeNodeData {
  recipe: CraftRecipe
  label: string
  selected?: boolean
  onDelete?: (nodeId: string) => void
  optimalProduction?: OptimalProductionData
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
