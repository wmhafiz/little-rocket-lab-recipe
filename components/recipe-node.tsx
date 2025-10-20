"use client"

import { memo } from "react"
import { Handle, Position, NodeToolbar, type NodeProps } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Trash2, AlertTriangle } from "lucide-react"
import type { RecipeNodeData } from "@/lib/types"
import Image from "next/image"

export const RecipeNode = memo(({ data, id }: NodeProps) => {
  const typedData = data as RecipeNodeData
  const { recipe, onDelete, optimalProduction } = typedData

  // Helper to get status color classes
  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal":
        return "bg-green-500 text-white hover:bg-green-600"
      case "deficit":
        return "bg-red-500 text-white hover:bg-red-600"
      case "excess":
        return "bg-yellow-500 text-white hover:bg-yellow-600"
      case "cycle":
        return "bg-orange-500 text-white hover:bg-orange-600"
      default:
        return "bg-gray-500 text-white hover:bg-gray-600"
    }
  }

  // Calculate number of nodes needed
  const calculateNodesNeeded = () => {
    if (!optimalProduction || optimalProduction.status === "disconnected") {
      return null
    }

    const outputRate = parseFloat(recipe.outputPerMin)
    if (isNaN(outputRate) || outputRate <= 0) {
      return null
    }

    return Math.ceil(optimalProduction.requiredPerMin / outputRate)
  }

  // Format tooltip content
  const getTooltipContent = () => {
    if (!optimalProduction || optimalProduction.status === "disconnected") {
      return "No downstream consumers"
    }

    if (optimalProduction.status === "cycle") {
      return "⚠️ Cycle detected. Production requirements cannot be calculated for circular dependencies."
    }

    const outputRate = parseFloat(recipe.outputPerMin)
    const hasValidOutput = !isNaN(outputRate) && outputRate > 0
    const nodesNeeded = calculateNodesNeeded()

    const lines = [
      `Required: ${optimalProduction.requiredPerMin.toFixed(1)}/min`,
      hasValidOutput ? `Output per node: ${outputRate}/min` : "Output: N/A",
    ]

    // Add nodes needed
    if (nodesNeeded !== null) {
      if (nodesNeeded === 1) {
        lines.push("Status: ✓ 1 node is optimal")
      } else {
        lines.push(`Nodes needed: ${nodesNeeded}`)
        lines.push(`(Total output: ${(nodesNeeded * outputRate).toFixed(1)}/min)`)
      }
    }

    // Add consumer breakdown if available
    if (optimalProduction.consumers && optimalProduction.consumers.length > 0) {
      lines.push("")
      lines.push("Consumers:")
      optimalProduction.consumers.forEach(consumer => {
        lines.push(`  • ${consumer.nodeName}: ${consumer.requiredAmount.toFixed(1)}/min`)
      })
    }

    return lines.join("\n")
  }

  return (
    <>
      <NodeToolbar
        isVisible={typedData.selected}
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

      <Card className="min-w-[280px] shadow-lg border-2 relative">
        {/* Production Indicator Badge */}
        {optimalProduction && optimalProduction.status !== "disconnected" && (
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <div className="absolute -top-2 -right-2 z-10">
                {optimalProduction.status === "cycle" ? (
                  <Badge className={getStatusColor("cycle")} variant="default">
                    <AlertTriangle className="w-3 h-3" />
                  </Badge>
                ) : (
                  <Badge className={`${getStatusColor(optimalProduction.status)} text-xs px-2 py-0.5 font-semibold`} variant="default">
                    {calculateNodesNeeded() || optimalProduction.requiredPerMin.toFixed(0)}
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs whitespace-pre-line text-xs">
              {getTooltipContent()}
            </TooltipContent>
          </Tooltip>
        )}

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
