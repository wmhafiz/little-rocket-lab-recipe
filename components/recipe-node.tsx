"use client"

import { memo } from "react"
import { Handle, Position, NodeToolbar, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { RecipeNodeData } from "@/lib/types"
import Image from "next/image"

export const RecipeNode = memo(({ data, id }: NodeProps<RecipeNodeData>) => {
  const { recipe, onDelete } = data

  return (
    <>
      <NodeToolbar
        isVisible={data.selected}
        position={Position.Top}
        offset={10}
        className="flex gap-1 bg-background border border-border rounded-lg shadow-lg p-1"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete?.(id)}
          className="h-8 gap-2 hover:bg-destructive hover:text-destructive-foreground"
          title="Delete node"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </NodeToolbar>

      <Card className="min-w-[280px] shadow-lg border-2">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0 rounded-md overflow-hidden bg-secondary/50">
              <Image
                src={recipe.icon || "/placeholder.svg"}
                alt={recipe.name}
                fill
                className="object-contain p-1"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-balance leading-tight">{recipe.name}</h3>
              <Badge variant="secondary" className="text-xs mt-1">
                {recipe.type}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Inputs:</div>
            <div className="space-y-1">
              {recipe.ingredients.map((ingredient, idx) => (
                <div key={idx} className="relative">
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={`input-${idx}`}
                    className="!w-3 !h-3 !bg-primary !border-2 !border-background dark:!border-card !top-1/2 !-translate-y-1/2"
                  />
                  <div className="flex items-center gap-2 text-xs bg-secondary text-secondary-foreground rounded px-2 py-1 pl-4 font-medium">
                    <div className="relative w-4 h-4 shrink-0">
                      <Image
                        src={`/recipes/${ingredient.item}.png`}
                        alt={ingredient.item}
                        fill
                        className="object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                    <span className="flex-1">
                      {ingredient.item} × {ingredient.quantity}
                      <span className="text-muted-foreground ml-1">({ingredient.quantityPerMin}/min)</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Output:</div>
            <div className="relative">
              <Handle
                type="source"
                position={Position.Right}
                id="output"
                className="!w-3 !h-3 !bg-accent !border-2 !border-background dark:!border-card !top-1/2 !-translate-y-1/2"
              />
              <div className="text-xs bg-accent text-accent-foreground rounded px-2 py-1 pr-4 font-medium">
                {recipe.name}
                <span className="ml-1 opacity-80">({recipe.outputPerMin}/min)</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  )
})

RecipeNode.displayName = "RecipeNode"
