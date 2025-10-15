import type { CraftRecipe } from "./types"

export async function fetchCraftingData(): Promise<CraftRecipe[]> {
  const response = await fetch(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Little%20Rocket%20Lab%20-%20Crafts-xoKBcOMtJcdCLQju5ODyZdqDZ0R4Ts.csv",
  )
  const csvText = await response.text()

  const lines = csvText.split("\n")
  const headers = lines[0].split(",")

  const recipes: CraftRecipe[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split(",")

    const ingredients: Array<{ item: string; quantity: string; quantityPerMin: string }> = []

    // Parse up to 4 ingredients
    for (let j = 1; j <= 4; j++) {
      const itemIndex = headers.indexOf(`Item ${j}`)
      const qtyIndex = headers.indexOf(`Qty ${j}`)
      const qtyPerMinIndex = headers.indexOf(`Qty${j}/min`)

      if (itemIndex !== -1 && values[itemIndex] && values[itemIndex].trim()) {
        ingredients.push({
          item: values[itemIndex].trim(),
          quantity: values[qtyIndex]?.trim() || "0",
          quantityPerMin: values[qtyPerMinIndex]?.trim() || "0",
        })
      }
    }

    if (ingredients.length > 0) {
      recipes.push({
        type: values[0]?.trim() || "",
        name: values[1]?.trim() || "",
        outputPerMin: values[2]?.trim() || "0",
        ingredients,
      })
    }
  }

  return recipes
}

export function getAllMaterials(recipes: CraftRecipe[]): string[] {
  const materials = new Set<string>()

  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      materials.add(ingredient.item)
    })
  })

  return Array.from(materials).sort()
}

export function getAllOutputs(recipes: CraftRecipe[]): string[] {
  return recipes.map((recipe) => recipe.name).sort()
}

export function findRecipesByOutput(recipes: CraftRecipe[], output: string): CraftRecipe[] {
  return recipes.filter((recipe) => recipe.name === output)
}

export function findRecipesByMaterials(recipes: CraftRecipe[], materials: string[]): CraftRecipe[] {
  if (materials.length === 0) return []

  return recipes.filter((recipe) => {
    return recipe.ingredients.some((ingredient) => materials.includes(ingredient.item))
  })
}
