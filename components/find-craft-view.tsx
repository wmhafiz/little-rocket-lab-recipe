"use client"

import { useState } from "react"
import type { CraftRecipe } from "@/lib/types"
import { RecipeCard } from "./recipe-card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { findRecipesByMaterials } from "@/lib/crafting-data"

interface FindCraftViewProps {
  recipes: CraftRecipe[]
  materials: string[]
}

export function FindCraftView({ recipes, materials }: FindCraftViewProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [currentMaterial, setCurrentMaterial] = useState<string>("")
  const [foundRecipes, setFoundRecipes] = useState<CraftRecipe[]>([])

  const handleAddMaterial = (value: string) => {
    if (value && !selectedMaterials.includes(value)) {
      const newMaterials = [...selectedMaterials, value]
      setSelectedMaterials(newMaterials)
      setCurrentMaterial("")

      const foundRecipes = findRecipesByMaterials(recipes, newMaterials)
      setFoundRecipes(foundRecipes)
    }
  }

  const handleRemoveMaterial = (material: string) => {
    const newMaterials = selectedMaterials.filter((m) => m !== material)
    setSelectedMaterials(newMaterials)

    if (newMaterials.length > 0) {
      const foundRecipes = findRecipesByMaterials(recipes, newMaterials)
      setFoundRecipes(foundRecipes)
    } else {
      setFoundRecipes([])
    }
  }

  const availableMaterials = materials.filter((m) => !selectedMaterials.includes(m))

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="material-select" className="text-base font-semibold">
            Select Available Materials
          </Label>
          <Select value={currentMaterial} onValueChange={handleAddMaterial}>
            <SelectTrigger id="material-select" className="w-full max-w-md">
              <SelectValue placeholder="Choose materials you have..." />
            </SelectTrigger>
            <SelectContent>
              {availableMaterials.map((material) => (
                <SelectItem key={material} value={material}>
                  {material}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedMaterials.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Selected Materials</Label>
            <div className="flex flex-wrap gap-2">
              {selectedMaterials.map((material) => (
                <Badge key={material} variant="secondary" className="pl-3 pr-2 py-2 text-sm gap-2">
                  {material}
                  <button
                    onClick={() => handleRemoveMaterial(material)}
                    className="hover:bg-muted rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {foundRecipes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-balance">
            {foundRecipes.length === 1 ? "Possible Craft" : `${foundRecipes.length} Possible Crafts`}
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {foundRecipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} highlightMaterials={selectedMaterials} />
            ))}
          </div>
        </div>
      )}

      {selectedMaterials.length > 0 && foundRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No recipes found using these materials.</p>
        </div>
      )}
    </div>
  )
}
