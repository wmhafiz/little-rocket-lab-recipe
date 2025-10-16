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
}
