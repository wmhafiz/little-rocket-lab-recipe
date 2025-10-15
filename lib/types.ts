export interface CraftRecipe {
  type: string
  name: string
  outputPerMin: string
  ingredients: Array<{
    item: string
    quantity: string
    quantityPerMin: string
  }>
}
