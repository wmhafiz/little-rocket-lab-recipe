"use client"

import { useState } from "react"
import type { CraftRecipe } from "@/lib/types"
import { RecipeCard } from "./recipe-card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { findRecipesByOutput } from "@/lib/crafting-data"

interface FindRecipeViewProps {
  recipes: CraftRecipe[]
  outputs: string[]
}

export function FindRecipeView({ recipes, outputs }: FindRecipeViewProps) {
  const [selectedOutput, setSelectedOutput] = useState<string>("")
  const [foundRecipes, setFoundRecipes] = useState<CraftRecipe[]>([])

  const handleOutputChange = (value: string) => {
    setSelectedOutput(value)
    const foundRecipes = findRecipesByOutput(recipes, value)
    setFoundRecipes(foundRecipes)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="output-select" className="text-base font-semibold">
            Select Desired Output
          </Label>
          <Select value={selectedOutput} onValueChange={handleOutputChange}>
            <SelectTrigger id="output-select" className="w-full max-w-md">
              <SelectValue placeholder="Choose an item to craft..." />
            </SelectTrigger>
            <SelectContent>
              {outputs.map((output) => (
                <SelectItem key={output} value={output}>
                  {output}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {foundRecipes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-balance">
            {foundRecipes.length === 1 ? "Recipe Found" : `${foundRecipes.length} Recipes Found`}
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {foundRecipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} />
            ))}
          </div>
        </div>
      )}

      {selectedOutput && foundRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No recipes found for this output.</p>
        </div>
      )}
    </div>
  )
}
