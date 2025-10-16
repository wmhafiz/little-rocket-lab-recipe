import type { CraftRecipe } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

interface RecipeCardProps {
  recipe: CraftRecipe
  highlightMaterials?: string[]
}

export function RecipeCard({ recipe, highlightMaterials = [] }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="bg-gradient-to-br from-primary/15 to-accent/15 dark:from-primary/25 dark:to-accent/25 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-balance text-foreground">{recipe.name}</CardTitle>
            <Badge variant="secondary" className="mt-2">
              {recipe.type}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Output</div>
            <div className="text-2xl font-bold text-primary">{recipe.outputPerMin}</div>
            <div className="text-xs text-muted-foreground">per min</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Required Materials</h4>
          <div className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => {
              const isHighlighted = highlightMaterials.includes(ingredient.item)
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isHighlighted
                      ? "bg-accent/25 dark:bg-accent/30 border border-accent text-accent-foreground"
                      : "bg-muted/50 dark:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${isHighlighted ? "bg-accent dark:bg-accent" : "bg-muted-foreground"}`}
                    />
                    <span className={`font-medium ${isHighlighted ? "text-foreground" : "text-foreground"}`}>
                      {ingredient.item}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <div className="font-bold text-foreground">{ingredient.quantity}</div>
                      <div className="text-xs text-muted-foreground">qty</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="text-right">
                      <div className="font-bold text-primary">{ingredient.quantityPerMin}</div>
                      <div className="text-xs text-muted-foreground">per min</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
