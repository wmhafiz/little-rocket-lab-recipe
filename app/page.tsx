import { fetchCraftingData } from "@/lib/crafting-data"
import { ProductionDesignerView } from "@/components/production-designer-view"

export default async function Home() {
  const recipes = await fetchCraftingData()

  return (
    <main className="h-screen w-screen overflow-hidden">
      <ProductionDesignerView recipes={recipes} />
    </main>
  )
}
