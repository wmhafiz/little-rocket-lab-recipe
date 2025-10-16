"use client"

import { useState } from "react"
import type { CraftRecipe } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FindRecipeView } from "./find-recipe-view"
import { FindCraftView } from "./find-craft-view"
import { ProductionDesignerView } from "./production-designer-view"
import { ThemeToggle } from "./theme-toggle"
import { Beaker, Package, Network } from "lucide-react"

interface CraftingVisualizerClientProps {
  recipes: CraftRecipe[]
  materials: string[]
  outputs: string[]
}

export function CraftingVisualizerClient({ recipes, materials, outputs }: CraftingVisualizerClientProps) {
  const [activeTab, setActiveTab] = useState("recipe")

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 px-4">
        <h1 className="text-3xl font-bold text-foreground">Crafting Visualizer</h1>
        <ThemeToggle />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-auto p-1">
          <TabsTrigger value="recipe" className="gap-2 py-3">
            <Package className="w-4 h-4" />
            <span className="font-semibold">Find Recipe</span>
          </TabsTrigger>
          <TabsTrigger value="craft" className="gap-2 py-3">
            <Beaker className="w-4 h-4" />
            <span className="font-semibold">Find Craft</span>
          </TabsTrigger>
          <TabsTrigger value="designer" className="gap-2 py-3">
            <Network className="w-4 h-4" />
            <span className="font-semibold">Designer</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="recipe" className="mt-0">
            <FindRecipeView recipes={recipes} outputs={outputs} />
          </TabsContent>

          <TabsContent value="craft" className="mt-0">
            <FindCraftView recipes={recipes} materials={materials} />
          </TabsContent>

          <TabsContent value="designer" className="mt-0">
            <ProductionDesignerView recipes={recipes} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
