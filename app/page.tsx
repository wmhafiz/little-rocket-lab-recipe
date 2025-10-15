import { fetchCraftingData, getAllMaterials, getAllOutputs } from "@/lib/crafting-data"
import { CraftingVisualizerClient } from "@/components/crafting-visualizer-client"

export default async function Home() {
  const recipes = await fetchCraftingData()
  const materials = getAllMaterials(recipes)
  const outputs = getAllOutputs(recipes)

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
              Little Rocket Lab
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Explore crafting recipes and discover what you can build with your materials
            </p>
          </header>

          <CraftingVisualizerClient recipes={recipes} materials={materials} outputs={outputs} />
        </div>
      </div>
    </main>
  )
}
