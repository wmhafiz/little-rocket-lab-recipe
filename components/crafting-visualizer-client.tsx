"use client"

import { useState } from "react"
import type { CraftRecipe } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FindRecipeView } from "./find-recipe-view"
import { FindCraftView } from "./find-craft-view"
import { Beaker, Package } from "lucide-react"

interface CraftingVisualizerClientProps {
  recipes: CraftRecipe[]
  materials: string[]
  outputs: string[]
}

export function CraftingVisualizerClient({ recipes, materials, outputs }: CraftingVisualizerClientProps) {
  const [activeTab, setActiveTab] = useState("recipe")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-auto p-1">
        <TabsTrigger value="recipe" className="gap-2 py-3">
          <Package className="w-4 h-4" />
          <span className="font-semibold">Find Recipe</span>
        </TabsTrigger>
        <TabsTrigger value="craft" className="gap-2 py-3">
          <Beaker className="w-4 h-4" />
          <span className="font-semibold">Find Craft</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-8">
        <TabsContent value="recipe" className="mt-0">
          <FindRecipeView recipes={recipes} outputs={outputs} />
        </TabsContent>

        <TabsContent value="craft" className="mt-0">
          <FindCraftView recipes={recipes} materials={materials} />
        </TabsContent>
      </div>
    </Tabs>
  )
}
