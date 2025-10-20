"use client"

import { memo } from "react"
import { Handle, Position, NodeToolbar, type NodeProps } from "@xyflow/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Trash2, AlertTriangle } from "lucide-react"
import type { RecipeNodeData } from "@/lib/types"
import Image from "next/image"

/**
 * ResourceIconNode - Compact icon-only node for raw material resources
 * Displays only an output handle (right side) since resources have no inputs
 */
export const ResourceIconNode = memo(({ data, id }: NodeProps) => {
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
                    <Trash2 className="h-4 w-4" />
                    Delete
                </Button>
            </NodeToolbar>

            <div
                className="relative w-16 h-16 rounded-lg border-2 border-border bg-background shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                title={`${recipe.name}${recipe.outputPerMin !== "N/A" ? ` (${recipe.outputPerMin}/min)` : ""}`}
            >
                {/* Resource Icon */}
                <div className="absolute inset-2">
                    <Image
                        src={recipe.icon || "/placeholder.svg"}
                        alt={recipe.name}
                        fill
                        className="object-contain"
                        onError={(e) => {
                            e.currentTarget.style.display = "none"
                        }}
                    />
                </div>

                {/* Production Indicator Badge */}
                {optimalProduction && optimalProduction.status !== "disconnected" && (
                    <Tooltip delayDuration={500}>
                        <TooltipTrigger asChild>
                            <div className="absolute -top-1 -right-1 z-10">
                                {optimalProduction.status === "cycle" ? (
                                    <Badge className={getStatusColor("cycle")} variant="default">
                                        <AlertTriangle className="w-2.5 h-2.5" />
                                    </Badge>
                                ) : (
                                    <Badge className={`${getStatusColor(optimalProduction.status)} text-[10px] px-1.5 py-0.5 font-semibold`} variant="default">
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

                {/* Output Handle (right side) */}
                <Handle
                    type="source"
                    position={Position.Right}
                    id="output"
                    className="!w-3 !h-3 !bg-accent !border-2 !border-background dark:!border-card !top-1/2 !-translate-y-1/2"
                />
            </div>
        </>
    )
})

ResourceIconNode.displayName = "ResourceIconNode"

